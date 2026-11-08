// Chrome headless pelo protocolo de depuracao (CDP), para as ferramentas: prints, estudio sem
// tela e testes de entrada. Sobe o servidor local numa porta propria e um Chrome com perfil
// temporario; o SDK da Poki e desviado para um endereco morto (o jogo segue sem anuncio).
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { servir } from './servir.mjs';

export const espera = (/** @type {number} */ ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {{ porta: number, portaDep: number, largura?: number, altura?: number }} o
 */
export async function abrirChrome({ porta, portaDep, largura = 1100, altura = 900 }) {
  const fechar = await servir(porta);
  const perfil = mkdtempSync(join(tmpdir(), 'b7-cdp-'));
  const chrome = spawn('google-chrome', ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--autoplay-policy=no-user-gesture-required', '--host-resolver-rules=MAP game-cdn.poki.com 127.0.0.1:9',
    `--remote-debugging-port=${portaDep}`, `--user-data-dir=${perfil}`, `--window-size=${largura},${altura}`, 'about:blank'], { stdio: 'ignore' });
  let alvo = null;
  for (let i = 0; i < 60 && !alvo; i++) {
    await espera(200);
    try {
      alvo = (await (await fetch(`http://127.0.0.1:${portaDep}/json`)).json()).find((/** @type {any} */ x) => x.type === 'page');
    } catch { /* subindo */ }
  }
  if (!alvo) throw new Error('Chrome nao respondeu');
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  let seq = 0;
  const pend = new Map();
  /** @type {string[]} */
  const erros = [];
  ws.addEventListener('message', (ev) => {
    const m = JSON.parse(String(ev.data));
    if (m.id && pend.has(m.id)) {
      pend.get(m.id)(m);
      pend.delete(m.id);
    } else if (m.method === 'Runtime.exceptionThrown') {
      const d = m.params.exceptionDetails;
      erros.push(`${d.exception ? d.exception.description : d.text} (${d.url || ''}:${d.lineNumber})`);
    } else if (m.method === 'Runtime.consoleAPICalled' && m.params.type === 'error') {
      erros.push(m.params.args.map((/** @type {any} */ a) => a.value || a.description).join(' '));
    }
  });
  /** @param {string} method @param {object} [params] @returns {Promise<any>} */
  const cdp = (method, params = {}) => new Promise((r) => {
    const id = ++seq;
    pend.set(id, r);
    ws.send(JSON.stringify({ id, method, params }));
  });
  await cdp('Page.enable');
  await cdp('Runtime.enable');
  /** @param {string} expr */
  const avaliar = async (expr) => {
    const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(`${expr}: ${r.result.exceptionDetails.exception?.description || r.result.exceptionDetails.text}`);
    return r.result?.result?.value;
  };
  /** @param {number} w @param {number} h @param {number} [dpr] @param {boolean} [mobile] */
  const tela = async (w, h, dpr = 1, mobile = false) => {
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: dpr, mobile });
    if (mobile) await cdp('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
    await espera(250);
  };
  /** @returns {Promise<Buffer>} */
  const foto = async () => Buffer.from((await cdp('Page.captureScreenshot', { format: 'png' })).result.data, 'base64');
  /** @param {string} url */
  const ir = async (url) => {
    await cdp('Page.navigate', { url: url.startsWith('http') ? url : `http://127.0.0.1:${porta}${url}` });
  };
  /** Espera a expressao ficar verdadeira. @param {string} expr @param {number} [ms] */
  const ate = async (expr, ms = 12000) => {
    for (let t = 0; t < ms; t += 150) {
      try {
        if (await avaliar(expr)) return true;
      } catch { /* a pagina ainda carrega */ }
      await espera(150);
    }
    return false;
  };
  const sair = async () => {
    ws.close();
    chrome.kill('SIGKILL');
    await espera(600);
    try {
      rmSync(perfil, { recursive: true, force: true });
    } catch { /* o Chrome ainda solta arquivos */ }
    await fechar();
  };
  return { cdp, avaliar, tela, foto, ir, ate, sair, erros };
}

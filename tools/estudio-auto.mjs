// Roda o estudio sem tela: para cada entrada de arte/bruto/, abre tools/estudio.html?id=<id>&auto=1
// num Chrome headless, espera o titulo virar "OK ..." ou "ERRO ..." e relata.
// Uso: node tools/estudio-auto.mjs [id ...]   (sem ids: todas as entradas com variantes)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { servir, RAIZ } from './servir.mjs';

const PORTA = 5409;
const PORTA_DEP = 9409;

const todos = readdirSync(join(RAIZ, 'arte/bruto'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && readdirSync(join(RAIZ, 'arte/bruto', d.name)).some((f) => /^v\d/.test(f)))
  .map((d) => d.name);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : todos;

const fechar = await servir(PORTA);
const perfil = mkdtempSync(join(tmpdir(), 'b7-estudio-'));
const chrome = spawn('google-chrome', ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  `--remote-debugging-port=${PORTA_DEP}`, `--user-data-dir=${perfil}`, '--window-size=1400,900', 'about:blank'], { stdio: 'ignore' });

const espera = (ms) => new Promise((r) => setTimeout(r, ms));
let alvo = null;
for (let i = 0; i < 50 && !alvo; i++) {
  await espera(200);
  try {
    const l = await (await fetch(`http://127.0.0.1:${PORTA_DEP}/json`)).json();
    alvo = l.find((x) => x.type === 'page');
  } catch { /* ainda subindo */ }
}
if (!alvo) throw new Error('Chrome nao respondeu');
const ws = new WebSocket(alvo.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0;
const pendentes = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(String(ev.data));
  if (m.id && pendentes.has(m.id)) {
    pendentes.get(m.id)(m);
    pendentes.delete(m.id);
  }
});
const cdp = (method, params = {}) => new Promise((r) => {
  const id = ++seq;
  pendentes.set(id, r);
  ws.send(JSON.stringify({ id, method, params }));
});

let falhas = 0;
for (const id of ids) {
  if (!existsSync(join(RAIZ, 'arte/bruto', id))) {
    process.stdout.write(`${id}: sem entrada\n`);
    falhas++;
    continue;
  }
  await cdp('Page.navigate', { url: `http://127.0.0.1:${PORTA}/tools/estudio.html?id=${id}&auto=1` });
  let titulo = '';
  for (let i = 0; i < 300; i++) {
    await espera(400);
    const r = await cdp('Runtime.evaluate', { expression: 'document.title' });
    titulo = String(r.result?.result?.value || '');
    if (/^(OK|ERRO)/.test(titulo)) break;
  }
  if (!titulo.startsWith('OK')) falhas++;
  process.stdout.write(`${id}: ${titulo || 'sem resposta'}\n`);
}
ws.close();
chrome.kill('SIGKILL');
await new Promise((r) => setTimeout(r, 600));
try {
  rmSync(perfil, { recursive: true, force: true });
} catch { /* o Chrome ainda solta arquivos */ }
await fechar();
process.exit(falhas ? 1 : 0);

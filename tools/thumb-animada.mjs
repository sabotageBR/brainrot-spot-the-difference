// Thumb animada da Poki: MP4 1080x1080, 60 fps, 5,8 s, sem som, gravado do proprio jogo quadro a quadro.
// Regras (developers.poki.com/guide/your-game-page): 1:1, 1080 ou mais, 50 fps ou mais, 4 a 6 s, mudo,
// .mp4 ate 100 MB, 2 a 3 cenas, comecar da arte estatica, foco no jogo, sem UI que nao importa, sem cursor.
//
// Roteiro (cena praia-01, a fase 1, 3 erros, a figurinha e o Tralalero que esta na arte):
//   0,00-0,55  a arte estatica (grok-N-1256.png) se aproxima da lupa
//   0,55-1,10  a lente vira janela para o jogo e a camera mergulha nela
//   1,30-2,50  tres erros achados com a caneta (o combo sobe), confete
//   3,40-5,10  a figurinha vira no painel, com as estrelas (titulo, dados e botao escondidos; a carta
//              cresce de 170 para 230 px CSS para ler no tamanho pequeno do portal)
//   5,10-5,60  a arte volta num circulo que abre da lupa; 5,60-5,80 ela parada, igual ao primeiro quadro
//              (o laco do video nao salta)
//
// O relogio da pagina vira manual antes de gravar (performance.now, Date.now, setTimeout,
// setInterval, requestAnimationFrame e as animacoes CSS pela Web Animations API), entao cada quadro
// sai no tempo exato, sem depender da velocidade da maquina. Os PNG vao direto para o ffmpeg (sem disco).
// Uso: node tools/thumb-animada.mjs [opcao=1]   Saida: marketing/thumb/grok-N-animada-1080.mp4
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { RAIZ } from './servir.mjs';
import { abrirChrome } from './cdp.mjs';

const opcao = process.argv[2] || '1';
/** Centro e raio da lente da lupa em cada opcao, em fracao do lado (medidos nas imagens de 628). */
const LENTE = {
  1: { x: 0.568, y: 0.263, r: 0.13 },
  2: { x: 0.487, y: 0.288, r: 0.125 },
  3: { x: 0.252, y: 0.298, r: 0.12 },
  4: { x: 0.396, y: 0.282, r: 0.14 },
}[opcao];
const capa = `marketing/thumb/grok-${opcao}-1256.png`;
if (!LENTE || !existsSync(join(RAIZ, capa))) {
  process.stdout.write(`sem a opcao ${opcao} (rode antes node tools/thumb.mjs)\n`);
  process.exit(1);
}
const saida = join(RAIZ, `marketing/thumb/grok-${opcao}-animada-1080.mp4`);
const LADO = 540; // px CSS; com dpr 2 o quadro sai em 1080x1080
const FPS = 60;
const DURACAO = 5.8;
const TOQUES = [1.3, 1.9, 2.5];

// ---------- relogio manual, injetado antes de qualquer script da pagina ----------
const RELOGIO = `(() => {
  const P = performance;
  const rnow = P.now.bind(P);
  const rST = window.setTimeout.bind(window);
  const rCT = window.clearTimeout.bind(window);
  const rRAF = window.requestAnimationFrame.bind(window);
  const d0 = Date.now() - rnow();
  let manual = false;
  let T = 0;
  let seq = 1;
  const timers = new Map();
  let rafs = new Map();
  const now = () => (manual ? T : rnow());
  Object.defineProperty(P, 'now', { value: now, configurable: true });
  Date.now = () => Math.round(d0 + now());
  const rodar = (fn, args) => {
    try { fn(...args); } catch (e) { rST(() => { throw e; }, 0); }
  };
  const disparar = (id, t) => {
    if (t.cada === null) timers.delete(id);
    else {
      t.at += Math.max(1, t.cada);
      if (!manual) armar(id);
    }
    rodar(t.fn, t.args);
  };
  const armar = (id) => {
    const t = timers.get(id);
    if (!t) return;
    t.real = rST(() => {
      const u = timers.get(id);
      if (!manual && u) disparar(id, u);
    }, Math.max(0, t.at - rnow()));
  };
  const agendar = (cada) => (fn, ms = 0, ...args) => {
    const f = typeof fn === 'function' ? fn : new Function(String(fn));
    const id = seq++;
    const d = Math.max(0, Number(ms) || 0);
    timers.set(id, { at: now() + d, fn: f, args, cada: cada ? d : null, real: null });
    if (!manual) armar(id);
    return id;
  };
  const limpar = (id) => {
    const t = timers.get(id);
    if (t && t.real !== null) rCT(t.real);
    timers.delete(id);
  };
  window.setTimeout = agendar(false);
  window.setInterval = agendar(true);
  window.clearTimeout = limpar;
  window.clearInterval = limpar;
  window.requestAnimationFrame = (fn) => {
    const id = seq++;
    rafs.set(id, fn);
    if (!manual) rRAF(() => { if (!manual && rafs.delete(id)) rodar(fn, [now()]); });
    return id;
  };
  window.cancelAnimationFrame = (id) => { rafs.delete(id); };
  window.__tempo = {
    manual() {
      T = rnow();
      manual = true;
      for (const t of timers.values()) if (t.real !== null) rCT(t.real);
    },
    passo(dt) {
      const fim = T + dt;
      for (;;) {
        let prox = null;
        let pid = 0;
        for (const [id, t] of timers) if (t.at <= fim && (!prox || t.at < prox.at)) { prox = t; pid = id; }
        if (!prox) break;
        T = Math.max(T, prox.at);
        disparar(pid, prox);
      }
      T = fim;
      const lista = rafs;
      rafs = new Map();
      for (const fn of lista.values()) rodar(fn, [T]);
      for (const a of document.getAnimations()) {
        if (a.__t0 === undefined) { a.__t0 = T; a.pause(); }
        a.currentTime = T - a.__t0;
      }
    },
  };
})();`;

// ---------- o quadro: a capa por cima do jogo, os toques na hora certa, e o relogio anda ----------
const QUADRO = `(() => {
  const L = ${JSON.stringify(LENTE)};
  const S = ${LADO};
  const TOQUES = ${JSON.stringify(TOQUES)};
  const lisa = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  const entra = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * k);
  const faixa = (t, a, b) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  window.__quadro = (t, dt) => {
    const el = document.getElementById('capaB7');
    let esc = 1;
    let furo = 0;
    let roda = 0;
    let op = 1;
    if (t < 0.55) esc = 1 + 0.05 * lisa(faixa(t, 0, 0.55));
    else if (t < 1.1) {
      // a lente vira janela (0,55-0,75) e a camera mergulha nela (0,70-1,10)
      furo = L.r * S * 0.93 * lisa(faixa(t, 0.55, 0.75));
      esc = 1.05 + 8 * entra(faixa(t, 0.7, 1.1));
    } else if (t < 5.1) op = 0;
    else if (t < 5.6) {
      // a arte volta num circulo que abre do centro da lupa ate o canto mais longe
      const longe = Math.hypot(Math.max(L.x, 1 - L.x) * S, Math.max(L.y, 1 - L.y) * S) + 4;
      roda = Math.max(0.5, longe * lisa(faixa(t, 5.1, 5.6)));
    }
    el.style.opacity = String(op);
    el.style.transform = 'scale(' + esc + ')';
    const centro = 'circle at ' + (L.x * S) + 'px ' + (L.y * S) + 'px, ';
    let m = 'none';
    if (furo > 0) m = 'radial-gradient(' + centro + 'transparent ' + furo + 'px, #000 ' + (furo + 1.5) + 'px)';
    else if (roda > 0) m = 'radial-gradient(' + centro + '#000 ' + roda + 'px, transparent ' + (roda + 1.5) + 'px)';
    el.style.maskImage = m;
    el.style.webkitMaskImage = m;
    for (let i = 0; i < TOQUES.length; i++) {
      if (t >= TOQUES[i] && !window.__tocados[i]) {
        window.__tocados[i] = true;
        __b7.tocarErro(window.__ordem[i]);
      }
    }
    __tempo.passo(dt);
  };
})();`;

const c = await abrirChrome({ porta: 5409, portaDep: 9409, largura: LADO, altura: LADO });
await c.cdp('Page.addScriptToEvaluateOnNewDocument', { source: RELOGIO });
await c.tela(LADO, LADO, 2);
await c.ir('/?novo&semanuncio&lang=en&cena=praia-01');
if (!(await c.ate('!!(window.__b7 && __b7.J.fase === "jogando")'))) throw new Error('o jogo nao chegou a jogar');

// preparo: mudo, sem a mao do tutorial, sem a UI, imagens do tamanho do quadro, a capa carregada
await c.avaliar(`(async () => {
  __b7.audio.definirMudo(true);
  __b7.palco.mao(null);
  const css = document.createElement('style');
  css.textContent = '#topo,#base,.aviso,.faixa,#painelTitulo,#painelDados,#painelBotoes{display:none!important}'
    + '.cartao{width:auto;padding:14px 30px 10px}.carta{width:230px}.carta b{font-size:20px}.carta .rar{font-size:13px}.carta .novo{font-size:15px}'
    + '#capaB7{position:fixed;inset:0;z-index:100;pointer-events:none;background:url(/${capa}) center/cover no-repeat;'
    + 'transform-origin:${LENTE.x * 100}% ${LENTE.y * 100}%}';
  document.head.appendChild(css);
  const el = document.createElement('div');
  el.id = 'capaB7';
  document.body.appendChild(el);
  const img = new Image();
  img.src = '/${capa}';
  await img.decode();
  // o layout reserva o topo e a base para a UI: sem ela, as imagens usam a altura toda
  const h = ${LADO};
  const topo = Math.round(Math.max(46, Math.min(70, h * 0.09)));
  const base = Math.round(Math.max(58, Math.min(86, h * 0.12)));
  __b7.palco.redimensionar(${LADO}, h, 2, { topo: -topo, base: -base });
  await document.fonts.ready;
  // os erros do mais visivel ao menos visivel
  window.__ordem = __b7.J.p.cena.erros.map((e, i) => ({ i, vis: e.vis })).sort((a, b) => b.vis - a.vis).map((x) => x.i);
  window.__tocados = [];
  return true;
})()`);
await c.avaliar(QUADRO);
await c.avaliar('__tempo.manual()');

const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', '-an', saida],
{ stdio: ['pipe', 'inherit', 'inherit'] });
const fimFF = new Promise((ok) => ff.on('close', ok));
const total = Math.round(DURACAO * FPS);
const dt = 1000 / FPS;
for (let f = 0; f < total; f++) {
  await c.avaliar(`__quadro(${f / FPS}, ${dt})`);
  const png = await c.foto();
  if (!ff.stdin.write(png)) await new Promise((ok) => ff.stdin.once('drain', ok));
  if (f % 60 === 0) process.stdout.write(`  quadro ${f}/${total}\n`);
}
ff.stdin.end();
const cod = await fimFF;
const erros = c.erros.slice();
await c.sair();
if (cod !== 0) {
  process.stdout.write('ffmpeg falhou\n');
  process.exit(1);
}
process.stdout.write(`thumb animada -> ${relative(RAIZ, saida)} (${total} quadros, ${FPS} fps)\n`);
process.stdout.write(erros.length ? `ERROS NO CONSOLE:\n${erros.join('\n')}\n` : 'console limpo\n');

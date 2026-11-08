// Estudio de diferencas (navegador). Transforma a imagem A do Grok e as variantes editadas
// numa cena do jogo: alinha, detecta as manchas, escolhe 7, recorta os remendos com borda
// suave e grava pelo POST /__estudio (tools/estudio.mjs).
//
// Modo automatico para o terminal: ?id=praia-02&auto=1 analisa, escolhe os erros e salva; o titulo
// da pagina vira "OK ..." ou "ERRO ..." (tools/estudio-auto.mjs le o titulo).
// Quantos erros: o roteiro manda (3 e 5 nas duas primeiras cenas, 10 no chefe, 7 no resto).
import * as N from './estudio-nucleo.js';
import { BRAINROTS } from '../src/jogo/catalogo.js';
import { cenaRoteiro, errosDaCena } from '../arte/roteiro.js';

const W = 1024;
const H = 768;
/** Erros que a cena aberta precisa ter. */
const alvo = () => {
  const c = cenaRoteiro(E.id);
  return c ? errosDaCena(c) : 7;
};
const CORES = ['#ffb000', '#00c2ff', '#7cff3a', '#ff6bf2', '#ff5a36'];

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const tela = /** @type {HTMLCanvasElement} */ ($('tela'));
const ctx = /** @type {CanvasRenderingContext2D} */ (tela.getContext('2d'));
const q = new URLSearchParams(location.search);
/** mudancas pedidas ao Grok, pelo registro (para a conta do laboratorio) */
let pedidasNoRegistro = 0;

/**
 * @typedef {N.Mancha & { fonte: number, chave: string, manual?: boolean }} Cand
 */
const E = {
  id: '',
  /** @type {HTMLCanvasElement|null} */ a: null,
  /** @type {Uint8ClampedArray|null} */ pa: null,
  /** variantes alinhadas: canvas, pixels, rotulos, transformacao */
  /** @type {{ nome: string, cv: HTMLCanvasElement, px: Uint8ClampedArray, rot: Int32Array|null, al: any }[]} */ vars: [],
  /** @type {Cand[]} */ cands: [],
  /** @type {Set<string>} */ esc: new Set(),
  /** @type {{ id: string, caixa: N.Caixa }[]} */ pers: [],
  /** pontos (px de 1024) que a escolha automatica evita: efeito colateral feio anotado no registro */
  /** @type {[number, number][]} */ evitar: [],
  persAtivo: -1,
  ver: 'b',
  piscar: false,
  manual: false,
  /** @type {HTMLCanvasElement|null} */ b: null,
};

/** @param {string} t */
const estado = (t) => {
  $('estado').textContent = t;
};

/** @param {string} url @returns {Promise<HTMLImageElement>} */
const imagem = (url) => new Promise((ok, falha) => {
  const i = new Image();
  i.onload = () => ok(i);
  i.onerror = () => falha(new Error(url));
  i.src = url;
});

/** Normaliza para 1024x768 (corte central em 4:3 se a proporcao for outra). */
function normalizar(/** @type {HTMLImageElement} */ img) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  const c = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
  c.imageSmoothingQuality = 'high';
  const r = img.width / img.height;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (r > W / H) {
    sw = img.height * (W / H);
    sx = (img.width - sw) / 2;
  } else if (r < W / H) {
    sh = img.width / (W / H);
    sy = (img.height - sh) / 2;
  }
  c.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  return cv;
}

const pixels = (/** @type {HTMLCanvasElement} */ cv) => /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d')).getImageData(0, 0, W, H).data;

function canvasDe(/** @type {Uint8ClampedArray} */ px) {
  const cv = document.createElement('canvas');
  cv.width = W;
  cv.height = H;
  /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d')).putImageData(new ImageData(new Uint8ClampedArray(px), W, H), 0, 0);
  return cv;
}

// ---------- carga ----------
async function listar() {
  const lista = await (await fetch('/__bruto')).json();
  const sel = $('selCena');
  sel.innerHTML = lista.map((x) => `<option value="${x.id}">${x.id} (${x.arquivos.filter((f) => /^v\d/.test(f)).length} var.)</option>`).join('');
  return lista;
}

/** @param {any[]} lista @param {string} id */
async function carregar(lista, id) {
  const ent = lista.find((x) => x.id === id);
  if (!ent) throw new Error(`sem entrada ${id}`);
  E.id = id;
  E.cands = [];
  E.esc = new Set();
  E.vars = [];
  const base = `/arte/bruto/${id}/`;
  const arqA = ent.arquivos.find((f) => /^a\.(jpe?g|png|webp)$/i.test(f));
  if (!arqA) throw new Error('sem a.*');
  E.a = normalizar(await imagem(base + arqA));
  E.pa = pixels(E.a);
  for (const f of ent.arquivos.filter((x) => /^v\d+\.(jpe?g|png|webp)$/i.test(x))) {
    const cv = normalizar(await imagem(base + f));
    E.vars.push({ nome: f.replace(/\..*$/, ''), cv, px: pixels(cv), rot: null, al: null });
  }
  pedidasNoRegistro = 0;
  E.pers = [];
  E.evitar = [];
  if (ent.arquivos.includes('registro.json')) {
    try {
      const reg = await (await fetch(`${base}registro.json`)).json();
      pedidasNoRegistro = (reg.edicoes || []).reduce((n, e) => n + (e.mudancas || []).length, 0);
      // caixas dos personagens anotadas na producao, em px da imagem do Grok
      const larg = (reg.base && reg.base.tam && reg.base.tam[0]) || 1600;
      const k = W / larg;
      E.pers = Object.entries(reg.caixas || {}).map(([id, [x, y, w, h]]) => ({ id, caixa: { x: x * k, y: y * k, w: w * k, h: h * k } }));
      // "evitar": [[x, y], ...] em px da imagem do Grok, sobre mudancas que nao devem virar erro
      E.evitar = (reg.evitar || []).map(([x, y]) => /** @type {[number, number]} */ ([x * k, y * k]));
    } catch { /* ignora */ }
  }
  if (ent.arquivos.includes('personagens.json')) {
    try {
      E.pers = await (await fetch(`${base}personagens.json`)).json();
    } catch { /* ignora */ }
  }
  $('selVer').innerHTML = ['<option value="a">A</option>', '<option value="b">B (montada)</option>', ...E.vars.map((v, i) => `<option value="v${i}">${v.nome}</option>`)].join('');
  $('selVer').value = 'a';
  E.ver = 'a';
  montarB();
  desenharListas();
  estado(`${id}: A + ${E.vars.length} variantes`);
}

// ---------- analise ----------
async function analisar() {
  if (!E.pa) return;
  E.cands = [];
  const gA = N.cinza(E.pa, W * H);
  for (let k = 0; k < E.vars.length; k++) {
    const v = E.vars[k];
    estado(`alinhando ${v.nome}...`);
    await new Promise((r) => requestAnimationFrame(() => r(0)));
    v.al = N.alinhar(gA, N.cinza(v.px, W * H), W, H);
    v.px = N.transformar(v.px, E.pa, W, H, v.al);
    v.cv = canvasDe(v.px);
    const r = N.detectar(E.pa, v.px, W, H);
    v.rot = r.rot;
    for (const m of r.manchas) E.cands.push({ ...m, fonte: k, chave: `${k}:${m.id}` });
  }
  E.cands.sort((x, y) => y.vis - x.vis);
  montarB();
  desenharListas();
  estado(`${E.cands.length} candidatas`);
}

function auto() {
  const livres = E.cands.filter((c) => !E.evitar.some(([x, y]) => x >= c.x && x <= c.x + c.w && y >= c.y && y <= c.y + c.h));
  const esc = N.escolherAuto(livres, alvo(), W, H, E.pers.map((p) => p.caixa));
  E.esc = new Set(esc.map((c) => c.chave));
  montarB();
  desenharListas();
}

// ---------- remendos ----------
/** @param {Cand} c */
function remendo(c) {
  const v = E.vars[c.fonte];
  const caixa = N.caixaRemendo(c, W, H);
  const alfa = c.manual || !v.rot ? alfaRetangulo(c, caixa) : N.alfaRemendo(v.rot, c.ids, W, H, caixa);
  const cv = document.createElement('canvas');
  cv.width = caixa.w;
  cv.height = caixa.h;
  const cc = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
  const img = cc.createImageData(caixa.w, caixa.h);
  for (let y = 0; y < caixa.h; y++) {
    for (let x = 0; x < caixa.w; x++) {
      const o = ((caixa.y + y) * W + caixa.x + x) * 4;
      const p = (y * caixa.w + x) * 4;
      img.data[p] = v.px[o];
      img.data[p + 1] = v.px[o + 1];
      img.data[p + 2] = v.px[o + 2];
      img.data[p + 3] = Math.round(Math.min(1, alfa[y * caixa.w + x]) * 255);
    }
  }
  cc.putImageData(img, 0, 0);
  return { cv, caixa };
}

/** Alfa de retangulo com borda suave (remendo manual). @param {N.Caixa} r @param {N.Caixa} caixa */
function alfaRetangulo(r, caixa) {
  const a = new Float32Array(caixa.w * caixa.h);
  const suave = 8;
  for (let y = 0; y < caixa.h; y++) {
    for (let x = 0; x < caixa.w; x++) {
      const gx = caixa.x + x;
      const gy = caixa.y + y;
      const dx = Math.min(gx - r.x, r.x + r.w - gx);
      const dy = Math.min(gy - r.y, r.y + r.h - gy);
      a[y * caixa.w + x] = Math.max(0, Math.min(1, (Math.min(dx, dy) + suave / 2) / suave));
    }
  }
  return a;
}

const escolhidas = () => E.cands.filter((c) => E.esc.has(c.chave));

function montarB() {
  if (!E.a) return;
  const b = document.createElement('canvas');
  b.width = W;
  b.height = H;
  const c = /** @type {CanvasRenderingContext2D} */ (b.getContext('2d'));
  c.drawImage(E.a, 0, 0);
  for (const k of escolhidas()) {
    const r = remendo(k);
    c.drawImage(r.cv, r.caixa.x, r.caixa.y);
  }
  E.b = b;
}

// ---------- desenho ----------
function desenhar() {
  if (!E.a) return;
  let fonte = E.a;
  if (E.ver === 'b' && E.b) fonte = E.b;
  else if (E.ver.startsWith('v')) fonte = E.vars[Number(E.ver.slice(1))].cv;
  if (E.piscar && E.b) fonte = Math.floor(performance.now() / 550) % 2 ? E.b : E.a;
  ctx.drawImage(fonte, 0, 0);
  ctx.lineWidth = 2;
  for (const c of E.cands) {
    if (E.esc.has(c.chave)) continue;
    ctx.setLineDash([5, 4]);
    ctx.strokeStyle = CORES[c.fonte % CORES.length];
    ctx.strokeRect(c.x + 0.5, c.y + 0.5, c.w, c.h);
  }
  ctx.setLineDash([]);
  escolhidas().forEach((c, i) => {
    const e = N.elipseDe(c);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(e.cx, e.cy, e.rx, e.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#ff2d6f';
    ctx.stroke();
    ctx.font = 'bold 20px system-ui';
    ctx.fillStyle = '#ff2d6f';
    ctx.fillText(String(i + 1), e.cx + e.rx - 6, e.cy - e.ry + 6);
  });
  E.pers.forEach((p, i) => {
    ctx.strokeStyle = i === E.persAtivo ? '#2f7bff' : 'rgba(47,123,255,.6)';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.caixa.x, p.caixa.y, p.caixa.w, p.caixa.h);
    ctx.fillStyle = '#2f7bff';
    ctx.font = 'bold 13px system-ui';
    ctx.fillText(p.id, p.caixa.x + 4, p.caixa.y + 15);
  });
  if (arrasto && arrasto.r) {
    ctx.strokeStyle = '#fff';
    ctx.setLineDash([4, 4]);
    ctx.strokeRect(arrasto.r.x, arrasto.r.y, arrasto.r.w, arrasto.r.h);
    ctx.setLineDash([]);
  }
}
function quadro() {
  desenhar();
  requestAnimationFrame(quadro);
}

/** Miniatura A | V da candidata. @param {Cand} c */
function miniatura(c) {
  const cv = document.createElement('canvas');
  const caixa = N.caixaRemendo(c, W, H, 16);
  const esc = Math.min(1, 120 / Math.max(caixa.w, caixa.h));
  cv.width = Math.round(caixa.w * esc) * 2 + 4;
  cv.height = Math.round(caixa.h * esc);
  const cc = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
  if (E.a) cc.drawImage(E.a, caixa.x, caixa.y, caixa.w, caixa.h, 0, 0, caixa.w * esc, caixa.h * esc);
  cc.drawImage(E.vars[c.fonte].cv, caixa.x, caixa.y, caixa.w, caixa.h, caixa.w * esc + 4, 0, caixa.w * esc, caixa.h * esc);
  return cv;
}

function desenharListas() {
  const esc = escolhidas();
  $('contaEsc').textContent = String(esc.length);
  const linha = (/** @type {Cand} */ c, /** @type {number} */ n) => {
    const d = document.createElement('div');
    d.className = `cand${E.esc.has(c.chave) ? ' esc' : ''}`;
    d.innerHTML = `<b style="color:${CORES[c.fonte % CORES.length]}">${n}</b><span></span><small>${E.vars[c.fonte].nome}<br>vis ${c.vis.toFixed(2)}</small>`;
    /** @type {HTMLElement} */ (d.querySelector('span')).appendChild(miniatura(c));
    d.onclick = () => alternar(c);
    return d;
  };
  $('listaEsc').replaceChildren(...esc.map((c, i) => linha(c, i + 1)));
  $('listaCand').replaceChildren(...E.cands.map((c, i) => linha(c, i + 1)));
  $('listaPers').replaceChildren(...E.pers.map((p, i) => {
    const d = document.createElement('div');
    d.className = `pers${i === E.persAtivo ? ' ativo' : ''}`;
    d.innerHTML = `<button>${p.id}</button><small>${p.caixa.x},${p.caixa.y} ${p.caixa.w}x${p.caixa.h}</small><button title="tirar">x</button>`;
    const [b1, b2] = d.querySelectorAll('button');
    b1.onclick = () => {
      E.persAtivo = i === E.persAtivo ? -1 : i;
      E.manual = false;
      $('bManual').classList.remove('ligado');
      desenharListas();
    };
    b2.onclick = () => {
      E.pers.splice(i, 1);
      E.persAtivo = -1;
      desenharListas();
    };
    return d;
  }));
}

/** @param {Cand} c */
function alternar(c) {
  if (E.esc.has(c.chave)) E.esc.delete(c.chave);
  else E.esc.add(c.chave);
  montarB();
  desenharListas();
}

// ---------- mouse na imagem ----------
/** @type {{ x0: number, y0: number, r: N.Caixa|null }|null} */
let arrasto = null;
const pontoImg = (/** @type {MouseEvent} */ e) => {
  const r = tela.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
};
tela.addEventListener('pointerdown', (e) => {
  const p = pontoImg(e);
  arrasto = { x0: p.x, y0: p.y, r: null };
});
tela.addEventListener('pointermove', (e) => {
  if (!arrasto) return;
  const p = pontoImg(e);
  arrasto.r = { x: Math.round(Math.min(p.x, arrasto.x0)), y: Math.round(Math.min(p.y, arrasto.y0)), w: Math.round(Math.abs(p.x - arrasto.x0)), h: Math.round(Math.abs(p.y - arrasto.y0)) };
});
tela.addEventListener('pointerup', (e) => {
  const a = arrasto;
  arrasto = null;
  if (!a) return;
  const p = pontoImg(e);
  if (a.r && a.r.w > 8 && a.r.h > 8) {
    if (E.persAtivo >= 0) {
      E.pers[E.persAtivo].caixa = a.r;
      desenharListas();
      return;
    }
    if (E.manual) {
      const k = E.ver.startsWith('v') ? Number(E.ver.slice(1)) : 0;
      if (!E.vars[k]) return;
      // visibilidade do retangulo pela diferenca media dentro dele
      const d = N.mapaDiferenca(E.pa || new Uint8ClampedArray(), E.vars[k].px, W, H, 1);
      let soma = 0;
      for (let y = a.r.y; y < a.r.y + a.r.h; y++) for (let x = a.r.x; x < a.r.x + a.r.w; x++) soma += d[y * W + x];
      const m = { id: -1, ids: [], ...a.r, area: a.r.w * a.r.h, media: soma / (a.r.w * a.r.h), vis: 0 };
      m.vis = N.visibilidade(m, W, H);
      const c = { ...m, fonte: k, chave: `m${Date.now()}`, manual: true };
      E.cands.unshift(c);
      E.esc.add(c.chave);
      montarB();
      desenharListas();
    }
    return;
  }
  // clique: alterna a menor candidata sob o ponto
  const sob = E.cands.filter((c) => p.x >= c.x && p.x <= c.x + c.w && p.y >= c.y && p.y <= c.y + c.h).sort((x, y) => x.area - y.area);
  if (sob[0]) alternar(sob[0]);
});

// ---------- salvar ----------
async function folha() {
  const cv = document.createElement('canvas');
  cv.width = W * 2 + 16;
  cv.height = H;
  const c = /** @type {CanvasRenderingContext2D} */ (cv.getContext('2d'));
  c.fillStyle = '#fff';
  c.fillRect(0, 0, cv.width, cv.height);
  if (E.a) c.drawImage(E.a, 0, 0);
  if (E.b) c.drawImage(E.b, W + 16, 0);
  escolhidas().forEach((k, i) => {
    const e = N.elipseDe(k);
    for (const ox of [0, W + 16]) {
      c.lineWidth = 5;
      c.strokeStyle = '#fff';
      c.beginPath();
      c.ellipse(e.cx + ox, e.cy, e.rx, e.ry, 0, 0, Math.PI * 2);
      c.stroke();
      c.lineWidth = 3;
      c.strokeStyle = '#ff2d6f';
      c.stroke();
      c.font = 'bold 26px system-ui';
      c.fillStyle = '#ff2d6f';
      c.strokeStyle = '#fff';
      c.lineWidth = 4;
      c.strokeText(String(i + 1), e.cx + ox + e.rx - 8, e.cy - e.ry + 8);
      c.fillText(String(i + 1), e.cx + ox + e.rx - 8, e.cy - e.ry + 8);
    }
  });
  return cv.toDataURL('image/png');
}

async function salvar() {
  if (!E.a) return { ok: false, erros: ['nada carregado'] };
  const esc = escolhidas();
  const pedido = {
    id: E.id,
    tam: [W, H],
    // 0,75: ~145 KB por cena (0,86 dava ~215 KB); B sai de A, entao o artefato e igual nas duas
    a: E.a.toDataURL('image/webp', 0.75),
    erros: esc.map((c) => {
      const r = remendo(c);
      return { elipse: N.elipseDe(c), remendo: r.caixa, vis: c.vis, imagem: r.cv.toDataURL('image/webp', 0.9), fonte: `${E.vars[c.fonte].nome}${c.manual ? ' (manual)' : ''}` };
    }),
    personagens: E.pers,
    alinhamentos: E.vars.map((v) => ({ variante: v.nome, ...v.al })),
    candidatas: E.cands.length,
    pedidas: pedidasNoRegistro,
    folha: await folha(),
  };
  const resp = await fetch('/__estudio', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(pedido) });
  const r = await resp.json();
  estado(r.ok ? `salvo: ${r.arquivos.length} arquivos` : `ERRO: ${r.erros.join('; ')}`);
  return r;
}

// ---------- ligar ----------
$('selNovoPers').innerHTML = BRAINROTS.map((b) => `<option value="${b.id}">${b.nome}</option>`).join('');
$('bAddPers').onclick = () => {
  E.pers.push({ id: $('selNovoPers').value, caixa: { x: 400, y: 300, w: 200, h: 200 } });
  E.persAtivo = E.pers.length - 1;
  desenharListas();
};
$('bAnalisar').onclick = () => analisar();
$('bAuto').onclick = () => auto();
$('selVer').onchange = () => {
  E.ver = $('selVer').value;
};
$('bPiscar').onclick = () => {
  E.piscar = !E.piscar;
  $('bPiscar').classList.toggle('ligado', E.piscar);
};
$('bManual').onclick = () => {
  E.manual = !E.manual;
  E.persAtivo = -1;
  $('bManual').classList.toggle('ligado', E.manual);
  estado(E.manual ? 'remendo manual: escolha a variante em "Ver" e arraste um retangulo' : '');
};
$('bSalvar').onclick = () => salvar();

const lista = await listar();
$('selCena').onchange = () => carregar(lista, $('selCena').value).catch((e) => estado(`ERRO: ${e.message}`));
const inicial = q.get('id') || (lista[0] && lista[0].id);
if (inicial) {
  $('selCena').value = inicial;
  try {
    await carregar(lista, inicial);
    if (q.has('auto')) {
      await analisar();
      auto();
      const r = await salvar();
      document.title = r.ok ? `OK ${escolhidas().length} ${E.cands.length}` : `ERRO ${r.erros.join('; ')}`;
    }
  } catch (e) {
    estado(`ERRO: ${/** @type {Error} */ (e).message}`);
    document.title = `ERRO ${/** @type {Error} */ (e).message}`;
  }
}
requestAnimationFrame(quadro);

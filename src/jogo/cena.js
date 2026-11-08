// Formato da cena e acerto do toque. Logica pura: sem DOM, relogio nem sorteio.
//
// Uma cena e a imagem A (a.webp) e uma lista de erros. A imagem B nao existe em arquivo:
// o jogo compoe B desenhando A e, por cima, o remendo de cada erro (render/compor.js).
// Por isso B so difere de A dentro dos remendos, e a elipse de cada erro cobre a mudanca.
// Coordenadas sempre em px da imagem (tam), nunca da tela.

/**
 * @typedef {{ cx: number, cy: number, rx: number, ry: number }} Elipse
 * @typedef {{ x: number, y: number, w: number, h: number }} Caixa
 * @typedef {{ arq: string, x: number, y: number, w: number, h: number }} Remendo
 * @typedef {{ id: string, elipse: Elipse, remendo: Remendo, vis: number }} Erro
 * @typedef {Object} Cena
 * @property {string} id         "<mundo>-<nn>" (praia-01), tambem o nome da pasta em src/arte/cenas/
 * @property {number} mundo      1..10 (jogo/catalogo.js)
 * @property {number} k          1..10 dentro do mundo; 10 e o chefe
 * @property {string} prot       o brainrot protagonista: a figurinha do fim da cena
 * @property {[number, number]} tam
 * @property {string} imagem     arquivo da imagem A, relativo a pasta da cena
 * @property {Erro[]} erros
 * @property {{ id: string, caixa: Caixa }[]} [personagens]  caixa de cada brainrot em A (figurinha)
 */

/** Raio minimo de um erro, em fracao da largura da imagem. */
export const RAIO_MIN = 0.014;
/** Visibilidade minima (0..1, medida pelo estudio: area x contraste). */
export const VIS_MIN = 0.05;
/** Margem minima entre a elipse e a borda, em fracao da largura. */
export const MARGEM = 0.01;
/** Tolerancia do toque: dedo de 22 px CSS, mas nunca menos que 2% nem mais que 7% da largura. */
export const DEDO_CSS = 22;

/**
 * Tolerancia do toque em px da imagem.
 * @param {number} pxPorCss  quantos px da imagem cabem num px CSS na tela, ja com o zoom
 * @param {number} largura   largura da imagem em px
 */
export function toleranciaImg(pxPorCss, largura) {
  return Math.min(0.07 * largura, Math.max(DEDO_CSS * pxPorCss, 0.02 * largura));
}

/**
 * Distancia normalizada do ponto ate a elipse dilatada por tol: <= 1 esta dentro.
 * @param {Elipse} e @param {number} x @param {number} y @param {number} tol
 */
export function distElipse(e, x, y, tol) {
  const dx = (x - e.cx) / (e.rx + tol);
  const dy = (y - e.cy) / (e.ry + tol);
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * O que o toque acertou: o erro ainda nao achado mais proximo, um ja achado, ou nada.
 * Um toque em erro ja achado nunca conta como erro do jogador.
 * @param {Cena} cena @param {number} x @param {number} y @param {number} tol
 * @param {Set<string>|Map<string, any>} achados
 * @returns {{ tipo: 'acerto'|'ja'|'nada', id?: string }}
 */
export function acertar(cena, x, y, tol, achados) {
  let melhor = null;
  let melhorD = Infinity;
  let ja = null;
  for (const e of cena.erros) {
    const d = distElipse(e.elipse, x, y, tol);
    if (d > 1) continue;
    if (achados.has(e.id)) {
      if (!ja) ja = e.id;
      continue;
    }
    if (d < melhorD) {
      melhorD = d;
      melhor = e.id;
    }
  }
  if (melhor) return { tipo: 'acerto', id: melhor };
  if (ja) return { tipo: 'ja', id: ja };
  return { tipo: 'nada' };
}

/** @param {Caixa} a @param {Caixa} b */
export const sobrepoe = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/**
 * Problemas da cena (lista vazia = valida). Confere formato, numero de erros, tamanho,
 * margem, sobreposicao e visibilidade.
 * @param {any} c
 * @param {{ minErros?: number, maxErros?: number }} [o]
 * @returns {string[]}
 */
export function validarCena(c, { minErros = 3, maxErros = 12 } = {}) {
  const p = [];
  if (!c || typeof c !== 'object') return ['cena vazia'];
  if (typeof c.id !== 'string' || !/^[a-z0-9-]+$/.test(c.id)) p.push('id invalido');
  if (!Array.isArray(c.tam) || c.tam.length !== 2 || !(c.tam[0] > 0) || !(c.tam[1] > 0)) return [...p, 'tam invalido'];
  if (typeof c.imagem !== 'string' || !c.imagem) p.push('sem imagem');
  if (!Array.isArray(c.erros)) return [...p, 'sem erros'];
  const [W, H] = c.tam;
  if (c.erros.length < minErros || c.erros.length > maxErros) p.push(`${c.erros.length} erros (esperado ${minErros}..${maxErros})`);
  const ids = new Set();
  const remendos = [];
  for (const e of c.erros) {
    const nome = `erro ${e && e.id}`;
    if (!e || typeof e.id !== 'string' || ids.has(e.id)) {
      p.push(`${nome}: id repetido ou invalido`);
      continue;
    }
    ids.add(e.id);
    const el = e.elipse;
    if (!el || !(el.rx > 0) || !(el.ry > 0)) {
      p.push(`${nome}: elipse invalida`);
      continue;
    }
    if (Math.min(el.rx, el.ry) < RAIO_MIN * W) p.push(`${nome}: pequeno demais`);
    // o centro fica dentro da imagem com folga; a elipse pode passar da borda (o toque nao)
    const m = MARGEM * W;
    if (el.cx < m || el.cy < m || el.cx > W - m || el.cy > H - m) p.push(`${nome}: encosta na borda`);
    const r = e.remendo;
    if (!r || typeof r.arq !== 'string' || !(r.w > 0) || !(r.h > 0)) p.push(`${nome}: remendo invalido`);
    else {
      if (r.x < 0 || r.y < 0 || r.x + r.w > W || r.y + r.h > H) p.push(`${nome}: remendo fora da imagem`);
      remendos.push({ id: e.id, c: r });
    }
    if (!(typeof e.vis === 'number' && e.vis >= VIS_MIN)) p.push(`${nome}: visibilidade baixa (${e.vis})`);
  }
  // o centro de um erro nao pode cair dentro da elipse de outro: cada toque no meio de
  // uma mudanca tem que acertar a propria (o acerto escolhe a elipse mais proxima)
  for (let i = 0; i < c.erros.length; i++) {
    for (let j = 0; j < c.erros.length; j++) {
      if (i === j) continue;
      const a = c.erros[i].elipse;
      const b = c.erros[j].elipse;
      if (a && b && distElipse(b, a.cx, a.cy, 0) <= 1) p.push(`erros ${c.erros[i].id} e ${c.erros[j].id} se sobrepoem`);
    }
  }
  if (typeof c.prot !== 'string' || !c.prot) p.push('sem protagonista');
  for (const f of c.personagens || []) {
    const k = f && f.caixa;
    if (!k || !(k.w > 0) || !(k.h > 0) || k.x < 0 || k.y < 0 || k.x + k.w > W || k.y + k.h > H) p.push(`personagem ${f && f.id}: caixa invalida`);
  }
  return p;
}

/**
 * Nota de dificuldade da cena (0 facil .. 1 dificil), pela visibilidade media dos erros.
 * @param {Cena} c
 */
export function dificuldade(c) {
  if (!c.erros.length) return 0;
  const media = c.erros.reduce((s, e) => s + Math.min(1, e.vis), 0) / c.erros.length;
  return Math.max(0, Math.min(1, 1 - media));
}

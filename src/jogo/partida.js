// Estado de uma cena em jogo. Logica pura: o instante t (ms do relogio do jogo) vem de fora.
//
// Eventos de tocar(): acerto, ja (erro ja achado: nao pune), erro, travado (antispam) e fim.
// Antispam: ERROS_SPAM toques errados em JANELA_SPAM ms travam o toque por TRAVA_MS.
// Nao ha derrota (modelo zen): a cena so acaba quando todos os erros foram achados.

import { acertar } from './cena.js';
import { REGRAS, estrelasDe } from './regras.js';
import { criarRng, hashTexto } from '../core/rng.js';

export const ERROS_SPAM = 3;
export const JANELA_SPAM = 2000;
export const TRAVA_MS = 1500;

/**
 * @typedef {import('./cena.js').Cena} Cena
 * @typedef {{ t: number, porDica: boolean }} Achado
 * @typedef {Object} Partida
 * @property {Cena} cena
 * @property {Map<string, Achado>} achados
 * @property {number} inicio
 * @property {number} erros
 * @property {number} dicas        dicas usadas
 * @property {number} dicasLivres  dicas gratis que restam na cena
 * @property {number} combo
 * @property {number} ultimoAcerto
 * @property {number[]} errosRecentes
 * @property {number} travadoAte
 * @property {number} piscasLivres
 * @property {number} piscas       vezes que o pisca foi usado
 * @property {boolean} achouEscondido
 * @property {null|'vitoria'} fim
 * @property {number} fimEm
 */

/** @param {Cena} cena @param {number} t @returns {Partida} */
export function criarPartida(cena, t) {
  return {
    cena,
    achados: new Map(),
    inicio: t,
    erros: 0,
    dicas: 0,
    dicasLivres: REGRAS.dicasGratis,
    combo: 0,
    ultimoAcerto: -Infinity,
    errosRecentes: [],
    travadoAte: 0,
    piscasLivres: REGRAS.piscasGratis,
    piscas: 0,
    achouEscondido: false,
    fim: null,
    fimEm: 0,
  };
}

/** @param {Partida} p @param {number} t */
export const gastoMs = (p, t) => (p.fim ? p.fimEm : t) - p.inicio;

/** @param {Partida} p */
export const faltam = (p) => p.cena.erros.length - p.achados.size;

/** @param {Partida} p @param {number} t */
function conferirFim(p, t) {
  if (!faltam(p)) {
    p.fim = 'vitoria';
    p.fimEm = t;
  }
}

/**
 * Toque no ponto (x, y) da imagem, em px da imagem.
 * @param {Partida} p @param {number} x @param {number} y @param {number} tol @param {number} t
 */
export function tocar(p, x, y, tol, t) {
  if (p.fim) return { tipo: /** @type {const} */ ('fim') };
  if (t < p.travadoAte) return { tipo: /** @type {const} */ ('travado') };
  const r = acertar(p.cena, x, y, tol, p.achados);
  if (r.tipo === 'ja') return { tipo: /** @type {const} */ ('ja'), id: /** @type {string} */ (r.id) };
  if (r.tipo === 'acerto') {
    const id = /** @type {string} */ (r.id);
    p.achados.set(id, { t, porDica: false });
    p.combo = t - p.ultimoAcerto <= REGRAS.janelaCombo ? p.combo + 1 : 1;
    p.ultimoAcerto = t;
    p.errosRecentes = [];
    conferirFim(p, t);
    return { tipo: /** @type {const} */ ('acerto'), id, combo: p.combo, fim: p.fim };
  }
  // erro do jogador: so tira estrela
  p.erros += 1;
  p.combo = 0;
  p.errosRecentes = [...p.errosRecentes.filter((e) => t - e < JANELA_SPAM), t];
  let antispam = false;
  if (p.errosRecentes.length >= ERROS_SPAM) {
    antispam = true;
    p.travadoAte = t + TRAVA_MS;
    p.errosRecentes = [];
  }
  return { tipo: /** @type {const} */ ('erro'), antispam };
}

/**
 * Qual erro a dica revela: o mais dificil (menor visibilidade) ainda nao achado.
 * @param {Partida} p
 */
export function alvoDaDica(p) {
  let alvo = null;
  for (const e of p.cena.erros) {
    if (p.achados.has(e.id)) continue;
    if (!alvo || e.vis < alvo.vis) alvo = e;
  }
  return alvo;
}

/**
 * Usa uma dica: a gratis da cena, ou uma que veio de fora (pago: presente do dia ou video).
 * Revela um erro, que conta como achado.
 * @param {Partida} p @param {number} t @param {boolean} [pago]
 * @returns {string|null} id revelado
 */
export function usarDica(p, t, pago = false) {
  if (p.fim) return null;
  if (!pago && p.dicasLivres <= 0) return null;
  const alvo = alvoDaDica(p);
  if (!alvo) return null;
  if (!pago) p.dicasLivres -= 1;
  p.dicas += 1;
  p.combo = 0;
  p.achados.set(alvo.id, { t, porDica: true });
  conferirFim(p, t);
  return alvo.id;
}

/**
 * Usa o pisca: a carga gratis da cena, ou uma paga pelo video.
 * @param {Partida} p @param {boolean} [pago] @returns {boolean}
 */
export function usarPisca(p, pago = false) {
  if (p.fim) return false;
  if (!pago) {
    if (p.piscasLivres <= 0) return false;
    p.piscasLivres -= 1;
  }
  p.piscas += 1;
  return true;
}

/** @param {Partida} p @param {number} t @returns {import('./regras.js').Resumo} */
export function resumo(p, t) {
  return { total: p.cena.erros.length, erros: p.erros, dicas: p.dicas, gastoMs: gastoMs(p, t) };
}

/** @param {Partida} p @param {number} t @returns {number} 0 antes do fim, 1..3 na vitoria */
export function estrelas(p, t) {
  if (p.fim !== 'vitoria') return 0;
  return Math.max(1, Math.min(3, estrelasDe(resumo(p, t))));
}

/**
 * Onde fica o brainrot dourado escondido: sorteio com semente pelo id da cena,
 * longe dos erros e das bordas. Mesmo lugar em A e B, e sempre o mesmo na cena.
 * @param {Cena} cena
 * @returns {{ cx: number, cy: number, r: number }}
 */
export function lugarEscondido(cena) {
  const [W, H] = cena.tam;
  const r = 0.022 * W;
  const rng = criarRng(hashTexto(`escondido:${cena.id}`));
  let melhor = { cx: W / 2, cy: H / 2, r };
  let melhorFolga = -Infinity;
  for (let i = 0; i < 40; i++) {
    const cx = W * (0.08 + 0.84 * rng());
    const cy = H * (0.1 + 0.8 * rng());
    let folga = Infinity;
    for (const e of cena.erros) {
      const d = Math.hypot(cx - e.elipse.cx, cy - e.elipse.cy) - Math.max(e.elipse.rx, e.elipse.ry) - r;
      folga = Math.min(folga, d);
    }
    if (folga > melhorFolga) {
      melhorFolga = folga;
      melhor = { cx, cy, r };
    }
    if (folga > 0.08 * W) break;
  }
  return melhor;
}

/**
 * Toque no escondido (nunca e erro).
 * @param {Partida} p @param {number} x @param {number} y @param {number} tol
 */
export function tocarEscondido(p, x, y, tol) {
  if (p.achouEscondido || p.fim) return false;
  const e = lugarEscondido(p.cena);
  if (Math.hypot(x - e.cx, y - e.cy) > e.r + tol * 0.6) return false;
  p.achouEscondido = true;
  return true;
}

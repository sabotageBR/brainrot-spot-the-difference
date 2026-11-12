// Progresso do jogador entre as cenas: qual e a proxima, o mapa dos mundos, a figurinha
// ganha e o presente do dia. Logica pura: o save e o dia de hoje vem de fora.

import { brainrot } from './catalogo.js';

/** Cenas por mundo no jogo completo (10 mundos x 10). */
export const POR_MUNDO = 10;
export const MUNDOS_NO_MAPA = 10;

/**
 * @typedef {import('./cena.js').Cena} Cena
 * @typedef {{ cena: string, dourada?: boolean, vezes?: number }} Figurinha
 * @typedef {Object} Save
 * @property {Record<string, number>} feitas      id da cena -> melhores estrelas
 * @property {string[]} douradas                 cenas em que o dourado foi achado
 * @property {Record<string, Figurinha>} colecao id do brainrot -> figurinha
 * @property {{ ultimo: string, seq: number }} dia
 * @property {number} banco                      dicas guardadas (presente do dia)
 */

/** Numero do nivel mostrado ao jogador: a posicao no jogo completo. @param {Cena} c */
export const numeroDoNivel = (c) => (c.mundo - 1) * POR_MUNDO + c.k;

/**
 * A cena para jogar agora: a primeira da ordem de jogo que ainda nao foi feita.
 * Terminou tudo: null.
 * @param {Cena[]} lista @param {Record<string, number>} feitas
 */
export function proximaCena(lista, feitas) {
  return lista.find((c) => !(c.id in feitas)) || null;
}

/**
 * O mapa: os 10 mundos com 10 nos cada. A cena que ainda nao existe aparece "em breve".
 * Pode jogar a cena feita (atras do dourado) e a atual.
 * @param {Cena[]} lista @param {Save} save @param {string|null} atual id da cena em jogo
 */
export function mapaDoJogo(lista, save, atual) {
  const proxima = proximaCena(lista, save.feitas);
  const porPos = new Map(lista.map((c) => [numeroDoNivel(c), c]));
  const douradas = new Set(save.douradas);
  const mundos = [];
  for (let m = 1; m <= MUNDOS_NO_MAPA; m++) {
    const nos = [];
    for (let k = 1; k <= POR_MUNDO; k++) {
      const n = (m - 1) * POR_MUNDO + k;
      const c = porPos.get(n);
      /** @type {'feito'|'atual'|'bloqueado'|'embreve'} */
      let estado = 'embreve';
      if (c) estado = c.id in save.feitas ? 'feito' : proxima && c.id === proxima.id ? 'atual' : 'bloqueado';
      nos.push({ n, id: c ? c.id : '', estado, estrelas: c ? save.feitas[c.id] || 0 : 0, ouro: !!c && douradas.has(c.id), aqui: !!c && c.id === atual });
    }
    const aberto = nos.some((x) => x.estado === 'feito' || x.estado === 'atual');
    mundos.push({ mundo: m, aberto, nos });
  }
  return mundos;
}

/**
 * Figurinha do fim da cena: a do protagonista. A dourada vem do brainrot dourado achado
 * nesta cena e nunca se perde.
 * @param {Record<string, Figurinha>} colecao @param {Cena} cena @param {boolean} achouDourado
 * @returns {{ colecao: Record<string, Figurinha>, id: string, nova: boolean, dourada: boolean, virouDourada: boolean }}
 */
export function ganharFigurinha(colecao, cena, achouDourado) {
  const id = cena.prot;
  const antes = colecao[id];
  const dourada = achouDourado || !!(antes && antes.dourada);
  const f = {
    // a figurinha guarda a cena de onde o recorte sai: a primeira, ou a do dourado
    cena: antes && !(achouDourado && !antes.dourada) ? antes.cena : cena.id,
    dourada,
    vezes: ((antes && antes.vezes) || 0) + 1,
  };
  return { colecao: { ...colecao, [id]: f }, id, nova: !antes, dourada, virouDourada: dourada && !(antes && antes.dourada) };
}

/** Fases vencidas para abrir o bau (PFT da 0.3.0: uma meta curta para os primeiros minutos). */
export const FASES_POR_BAU = 3;

/**
 * Uma fase vencida enche uma marca do bau; a ultima abre e as marcas voltam a zero.
 * @param {number} marcas @returns {{ marcas: number, abre: boolean }}
 */
export function encherBau(marcas) {
  const m = Math.max(0, marcas) + 1;
  return m >= FASES_POR_BAU ? { marcas: 0, abre: true } : { marcas: m, abre: false };
}

/** Fases de distancia para o bonus nao gastar a figurinha nova de uma fase proxima. */
export const BONUS_LONGE = 20;
const PESO_RAR = { S: 2, A: 1, B: 0 };

/**
 * A figurinha bonus do bau: um coadjuvante (com caixa de figurinha) das cenas jogadas que o
 * jogador ainda nao tem. Primeiro os que so viram premio a BONUS_LONGE fases ou mais (ou
 * nunca), para nao gastar as figurinhas novas logo adiante; entre eles, o mais famoso (o bonus
 * tem de empolgar); empate, o premio mais distante. Sem nenhum, null.
 * @param {Record<string, Figurinha>} colecao @param {Cena[]} jogadas @param {Cena[]} lista
 * @returns {{ id: string, cena: string }|null}
 */
export function figurinhaDoBau(colecao, jogadas, lista) {
  const pos = (/** @type {string} */ cid) => lista.findIndex((c) => c.id === cid);
  const agora = Math.max(-1, ...jogadas.map((c) => pos(c.id)));
  const quando = (/** @type {string} */ id) => {
    const i = lista.findIndex((c) => c.prot === id);
    return i < 0 ? Infinity : i;
  };
  /** @type {{ id: string, cena: string, nota: number[] }|null} */
  let melhor = null;
  for (const c of jogadas) {
    for (const p of c.personagens || []) {
      if (colecao[p.id] || p.id === c.prot) continue;
      const q = quando(p.id);
      const b = brainrot(p.id);
      const nota = [q - agora >= BONUS_LONGE ? 1 : 0, b ? PESO_RAR[b.raridade] : 0, q === Infinity ? 1e9 : q];
      if (!melhor || maior(nota, melhor.nota)) melhor = { id: p.id, cena: c.id, nota };
    }
  }
  return melhor ? { id: melhor.id, cena: melhor.cena } : null;
}

/** Comparacao lexicografica. @param {number[]} a @param {number[]} b */
function maior(a, b) {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

/**
 * Guarda a figurinha bonus na colecao (o recorte sai da cena onde ela apareceu).
 * @param {Record<string, Figurinha>} colecao @param {{ id: string, cena: string }} b
 */
export function ganharBonus(colecao, b) {
  if (colecao[b.id]) return colecao;
  return { ...colecao, [b.id]: { cena: b.cena, dourada: false, vezes: 1 } };
}

/** Dias desde 1970 de uma data 'AAAA-MM-DD' (sem fuso: so o calendario). @param {string} d */
function diasDe(d) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return NaN;
  return Math.round(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])) / 86400000);
}

/** Dicas do presente pelo dia da sequencia (do 7o em diante, 3). */
export const PRESENTES = [1, 1, 2, 2, 2, 2, 3];

/**
 * O presente do dia: a primeira visita de cada dia ganha dicas, mais na sequencia de dias seguidos.
 * @param {{ ultimo: string, seq: number }} dia @param {string} hoje 'AAAA-MM-DD'
 * @returns {{ dia: { ultimo: string, seq: number }, dicas: number }}
 */
export function presenteDoDia(dia, hoje) {
  if (dia.ultimo === hoje) return { dia, dicas: 0 };
  const seguido = diasDe(hoje) - diasDe(dia.ultimo) === 1;
  const seq = seguido ? dia.seq + 1 : 1;
  return { dia: { ultimo: hoje, seq }, dicas: PRESENTES[Math.min(seq, PRESENTES.length) - 1] };
}

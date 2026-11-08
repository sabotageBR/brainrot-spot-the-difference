// Progresso do jogador entre as cenas: qual e a proxima, o mapa dos mundos, a figurinha
// ganha e o presente do dia. Logica pura: o save e o dia de hoje vem de fora.

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

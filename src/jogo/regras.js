// As regras do jogo: o modelo M2 (Colecao zen) com o pisca do M4 como poder, escolha do dono
// no laboratorio (2026-11-08). Logica pura: so numeros.
//
// Sem prazo e sem derrota. Errar e usar dica so tiram estrela; toda cena termina com a
// figurinha do protagonista e tem um brainrot dourado escondido.

/**
 * @typedef {Object} Resumo
 * @property {number} total    erros da cena
 * @property {number} erros    toques errados
 * @property {number} dicas    erros revelados por dica
 * @property {number} gastoMs  tempo jogado
 */

export const REGRAS = {
  /** dicas gratis por cena (depois: as do presente do dia, depois o video) */
  dicasGratis: 1,
  /** cargas gratis do pisca por cena (depois: o video) */
  piscasGratis: 1,
  /** o pisca alterna A e B sozinho por este tempo */
  piscaMs: 3000,
  /** ms entre acertos para o combo continuar */
  janelaCombo: 4000,
};

/**
 * Estrelas da cena (1..3): o erro tira estrela, nunca a cena; a dica pesa como dois erros.
 * A folga cresce com o tamanho da cena (o chefe tem 10 erros).
 * @param {Resumo} r
 */
export function estrelasDe({ total, erros, dicas }) {
  const peso = erros + 2 * dicas;
  const folga = total >= 10 ? 1 : 0;
  return peso <= 2 + folga ? 3 : peso <= 5 + 2 * folga ? 2 : 1;
}

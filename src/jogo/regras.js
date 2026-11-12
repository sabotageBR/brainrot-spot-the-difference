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
  /**
   * Ajuda automatica por ocio (PFT da 0.2.0: o jogador empaca no ultimo erro e sai sem pedir
   * dica). ms sem progresso ate cada estagio: 1 pulso do botao, 2 zona (holofote), 3 mao.
   * Por faixa de nivel: nas primeiras fases a ajuda chega mais cedo.
   */
  ajuda: [
    { ate: 3, ms: [5000, 10000, 18000] },
    { ate: 10, ms: [10000, 20000, 35000] },
    { ate: Infinity, ms: [15000, 30000, 50000] },
  ],
};

/** Estagios da ajuda automatica. */
export const AJUDA = { nada: 0, pulso: 1, zona: 2, mao: 3 };

/**
 * Estagio da ajuda (0..3) depois de ociosoMs sem progresso no nivel; min e o piso (a trava
 * "Calma!" pula direto para a zona).
 * @param {number} nivel @param {number} ociosoMs @param {number} [min]
 */
export function estagioAjuda(nivel, ociosoMs, min = 0) {
  const faixa = REGRAS.ajuda.find((f) => nivel <= f.ate) || REGRAS.ajuda[REGRAS.ajuda.length - 1];
  let e = 0;
  faixa.ms.forEach((ms, i) => {
    if (ociosoMs >= ms) e = i + 1;
  });
  return Math.max(min, e);
}

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

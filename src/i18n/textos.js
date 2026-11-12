// Textos do jogo (EN padrao, PT e ES). Quase tudo e icone; isto e o pouco que sobra.
// Os nomes dos brainrots nao se traduzem (ficam no catalogo).
// {n} e trocado pelo numero.

const T = {
  en: {
    idioma: 'en',
    nivel: 'Level', calma: 'Easy!', vitoria: 'Well done!', proximo: 'Next', erros: 'Misses', tempoGasto: 'Time',
    novo: 'New!', dourado: 'Golden!', album: 'Album', mapa: 'Map', mundo: 'World {n}', chefe: 'Boss level: 10 differences!',
    raro: { S: 'Legendary', A: 'Epic', B: 'Rare' }, vezes: 'x{n}', virouDourada: 'Golden sticker!',
    presente: 'Daily gift', diaN: 'Day {n} in a row', dicasGanhas: '+{n} hints', pegar: 'Collect',
    fim: 'You found them all!', fimSub: 'New scenes are on the way. Replay scenes on the map to find the golden brainrots.',
    semCena: 'Could not load the scene', tenteDeNovo: 'Try again', escondidoDica: 'A golden brainrot hides in every scene!',
    acheN: 'Find the {n} differences!', proximaFig: 'Next brainrot',
    bauAberto: 'Chest opened!', bonus: 'Bonus', dicaGanha: '+1 hint',
  },
  pt: {
    idioma: 'pt',
    nivel: 'Nível', calma: 'Calma!', vitoria: 'Mandou bem!', proximo: 'Próximo', erros: 'Erros', tempoGasto: 'Tempo',
    novo: 'Nova!', dourado: 'Dourado!', album: 'Álbum', mapa: 'Mapa', mundo: 'Mundo {n}', chefe: 'Fase chefe: 10 erros!',
    raro: { S: 'Lendária', A: 'Épica', B: 'Rara' }, vezes: 'x{n}', virouDourada: 'Figurinha dourada!',
    presente: 'Presente do dia', diaN: '{n}º dia seguido', dicasGanhas: '+{n} dicas', pegar: 'Pegar',
    fim: 'Você achou tudo!', fimSub: 'Novas cenas estão chegando. Jogue as cenas de novo no mapa para achar os brainrots dourados.',
    semCena: 'Não deu para carregar a cena', tenteDeNovo: 'Tentar de novo', escondidoDica: 'Toda cena esconde um brainrot dourado!',
    acheN: 'Ache as {n} diferenças!', proximaFig: 'Próximo brainrot',
    bauAberto: 'Baú aberto!', bonus: 'Bônus', dicaGanha: '+1 dica',
  },
  es: {
    idioma: 'es',
    nivel: 'Nivel', calma: '¡Calma!', vitoria: '¡Muy bien!', proximo: 'Siguiente', erros: 'Fallos', tempoGasto: 'Tiempo',
    novo: '¡Nueva!', dourado: '¡Dorado!', album: 'Álbum', mapa: 'Mapa', mundo: 'Mundo {n}', chefe: 'Nivel jefe: ¡10 diferencias!',
    raro: { S: 'Legendaria', A: 'Épica', B: 'Rara' }, vezes: 'x{n}', virouDourada: '¡Cromo dorado!',
    presente: 'Regalo del día', diaN: '{n}.º día seguido', dicasGanhas: '+{n} pistas', pegar: 'Recoger',
    fim: '¡Lo encontraste todo!', fimSub: 'Llegan escenas nuevas. Repite escenas en el mapa para encontrar los brainrots dorados.',
    semCena: 'No se pudo cargar la escena', tenteDeNovo: 'Reintentar', escondidoDica: '¡Cada escena esconde un brainrot dorado!',
    acheN: '¡Encuentra las {n} diferencias!', proximaFig: 'Siguiente brainrot',
    bauAberto: '¡Cofre abierto!', bonus: 'Bonus', dicaGanha: '+1 pista',
  },
};

/** @typedef {typeof T.en} Textos */

/** @param {string} lang @returns {'en'|'pt'|'es'} */
export function idiomaDe(lang) {
  const base = String(lang || '').toLowerCase().slice(0, 2);
  return base === 'pt' || base === 'es' ? base : 'en';
}

/** @param {string} lang @returns {Textos} */
export const textos = (lang) => T[idiomaDe(lang)];

/** Troca o {n} do texto. @param {string} t @param {number|string} n */
export const comN = (t, n) => t.replace('{n}', String(n));

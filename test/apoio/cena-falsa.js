// Cena sintetica para os testes da logica (n erros espalhados numa imagem 1024x768).
/** @param {number} [n] @returns {import('../../src/jogo/cena.js').Cena} */
export function cenaFalsa(n = 7) {
  const erros = [];
  for (let i = 0; i < n; i++) {
    const cx = 120 + (i % 4) * 240;
    const cy = 160 + Math.floor(i / 4) * 400;
    erros.push({
      id: `d${i + 1}`,
      elipse: { cx, cy, rx: 40, ry: 30 },
      remendo: { arq: `d${i + 1}.webp`, x: cx - 50, y: cy - 40, w: 100, h: 80 },
      vis: 0.2 + i * 0.1,
    });
  }
  return { id: 'teste-01', mundo: 1, k: 1, prot: 'tralalero', tam: [1024, 768], imagem: 'a.webp', erros, personagens: [] };
}

// Carrega a imagem A da cena e monta a B: A com os remendos por cima (um canvas so).
// B nao vem em arquivo: o download cai quase pela metade e B so difere de A nos remendos.

/** @param {string} url @returns {Promise<HTMLImageElement>} */
export function carregarImagem(url) {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => ok(img);
    img.onerror = () => falha(new Error(`imagem: ${url}`));
    img.src = url;
  });
}

/**
 * @param {string} pasta  url da pasta da cena, com a barra no fim
 * @param {import('../jogo/cena.js').Cena} cena
 * @returns {Promise<{ a: HTMLCanvasElement, b: HTMLCanvasElement }>}
 */
export async function montarCena(pasta, cena) {
  const [W, H] = cena.tam;
  const [imgA, ...remendos] = await Promise.all([
    carregarImagem(pasta + cena.imagem),
    ...cena.erros.map((e) => carregarImagem(pasta + e.remendo.arq)),
  ]);
  const a = document.createElement('canvas');
  a.width = W;
  a.height = H;
  a.getContext('2d')?.drawImage(imgA, 0, 0, W, H);
  const b = document.createElement('canvas');
  b.width = W;
  b.height = H;
  const cb = b.getContext('2d');
  if (cb) {
    cb.drawImage(a, 0, 0);
    cena.erros.forEach((e, i) => cb.drawImage(remendos[i], e.remendo.x, e.remendo.y, e.remendo.w, e.remendo.h));
  }
  return { a, b };
}

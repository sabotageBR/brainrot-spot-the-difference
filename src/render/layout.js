// Geometria da tela (pura): onde ficam o topo, a base e as vistas das imagens, em px CSS.
// As duas vistas ficam lado a lado ou empilhadas, o que der a maior imagem. Assim o celular
// em pe empilha, a paisagem poe lado a lado, e os tamanhos 16:9 do portal caem no certo.

/** @typedef {{ x: number, y: number, w: number, h: number }} Ret */

/**
 * @param {{ w: number, h: number, aspecto?: number, seguro?: { topo: number, base: number } }} o
 * @returns {{ topo: Ret, base: Ret, vistas: Ret[], empilhado: boolean, gap: number }}
 */
export function calcularLayout({ w, h, aspecto = 4 / 3, seguro = { topo: 0, base: 0 } }) {
  const gap = Math.round(Math.max(6, Math.min(16, Math.min(w, h) * 0.02)));
  const hTopo = Math.round(Math.max(46, Math.min(70, h * 0.09))) + seguro.topo;
  const hBase = Math.round(Math.max(58, Math.min(86, h * 0.12))) + seguro.base;
  const topo = { x: 0, y: 0, w, h: hTopo };
  const base = { x: 0, y: h - hBase, w, h: hBase };
  const area = { x: gap, y: hTopo, w: Math.max(10, w - 2 * gap), h: Math.max(10, h - hTopo - hBase) };

  /** Maior retangulo de proporcao aspecto dentro de (aw, ah). */
  const caber = (aw, ah) => (aw / ah > aspecto ? { w: ah * aspecto, h: ah } : { w: aw, h: aw / aspecto });

  const lado = caber((area.w - gap) / 2, area.h);
  const pilha = caber(area.w, (area.h - gap) / 2);
  const empilhado = pilha.w > lado.w;
  const r = empilhado ? pilha : lado;
  let vistas;
  if (empilhado) {
    const y0 = area.y + (area.h - (2 * r.h + gap)) / 2;
    const x0 = area.x + (area.w - r.w) / 2;
    vistas = [{ x: x0, y: y0, w: r.w, h: r.h }, { x: x0, y: y0 + r.h + gap, w: r.w, h: r.h }];
  } else {
    const x0 = area.x + (area.w - (2 * r.w + gap)) / 2;
    const y0 = area.y + (area.h - r.h) / 2;
    vistas = [{ x: x0, y: y0, w: r.w, h: r.h }, { x: x0 + r.w + gap, y: y0, w: r.w, h: r.h }];
  }
  return { topo, base, vistas, empilhado, gap };
}

/**
 * Camera compartilhada pelas vistas: zoom z (1..ZOOM_MAX) e o centro (cx, cy) em px da imagem.
 * @typedef {{ z: number, cx: number, cy: number }} Camera
 */
export const ZOOM_MAX = 4;

/**
 * Escala da imagem na vista com zoom 1: a imagem cobre a vista (nas vistas 4:3, o mesmo que caber).
 * @param {{ w: number, h: number }} v @param {number} W @param {number} H
 */
export const escalaBase = (v, W, H) => Math.max(v.w / W, v.h / H);

/**
 * Prende a camera para a vista nunca mostrar fora da imagem.
 * @param {Camera} c @param {number} W @param {number} H @param {{ w: number, h: number }} [v] a vista (padrao: do tamanho da imagem)
 * @returns {Camera}
 */
export function prenderCamera(c, W, H, v = { w: W, h: H }) {
  const z = Math.max(1, Math.min(ZOOM_MAX, c.z));
  const esc = escalaBase(v, W, H) * z;
  const meiaW = Math.min(W / 2, v.w / (2 * esc));
  const meiaH = Math.min(H / 2, v.h / (2 * esc));
  return { z, cx: Math.max(meiaW, Math.min(W - meiaW, c.cx)), cy: Math.max(meiaH, Math.min(H - meiaH, c.cy)) };
}

/**
 * Ponto da tela (px CSS) -> ponto da imagem, dentro da vista v.
 * @param {Ret} v @param {Camera} c @param {number} W @param {number} H @param {number} x @param {number} y
 */
export function telaParaImagem(v, c, W, H, x, y) {
  const esc = escalaBase(v, W, H) * c.z;
  return { x: c.cx + (x - (v.x + v.w / 2)) / esc, y: c.cy + (y - (v.y + v.h / 2)) / esc };
}

/**
 * Ponto da imagem -> tela (px CSS), na vista v.
 * @param {Ret} v @param {Camera} c @param {number} W @param {number} H @param {number} x @param {number} y
 */
export function imagemParaTela(v, c, W, H, x, y) {
  const esc = escalaBase(v, W, H) * c.z;
  return { x: v.x + v.w / 2 + (x - c.cx) * esc, y: v.y + v.h / 2 + (y - c.cy) * esc };
}

/** @param {Ret} r @param {number} x @param {number} y */
export const dentro = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

/**
 * Zoom em torno de um ponto da tela: o ponto da imagem sob o dedo fica parado.
 * @param {Ret} v @param {Camera} c @param {number} W @param {number} H @param {number} x @param {number} y @param {number} fator
 * @returns {Camera}
 */
export function zoomEm(v, c, W, H, x, y, fator) {
  const antes = telaParaImagem(v, c, W, H, x, y);
  const z = Math.max(1, Math.min(ZOOM_MAX, c.z * fator));
  const esc = escalaBase(v, W, H) * z;
  const cx = antes.x - (x - (v.x + v.w / 2)) / esc;
  const cy = antes.y - (y - (v.y + v.h / 2)) / esc;
  return prenderCamera({ z, cx, cy }, W, H, v);
}

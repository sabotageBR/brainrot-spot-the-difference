// Nucleo do estudio com imagens sinteticas: o fantasma fino some, a mancha solida fica.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectar, alinhar, cinza, transformar, escolherAuto, fundir, elipseDe } from '../tools/estudio-nucleo.js';

const W = 256;
const H = 192;

/** Imagem com listras e alguns quadrados (detalhe para o alinhamento). */
function base() {
  const p = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const o = (y * W + x) * 4;
      const v = ((x >> 3) + (y >> 4)) % 2 ? 200 : 60;
      p[o] = v;
      p[o + 1] = (x * 3) % 256;
      p[o + 2] = (y * 5) % 256;
      p[o + 3] = 255;
    }
  }
  return p;
}
/** @param {Uint8ClampedArray} p */
function quadrado(p, x0, y0, l, cor) {
  for (let y = y0; y < y0 + l; y++) for (let x = x0; x < x0 + l; x++) p.set(cor, (y * W + x) * 4);
}

test('acha a mancha solida e ignora o fantasma de 1 px nos contornos', () => {
  const a = base();
  const v = new Uint8ClampedArray(a);
  quadrado(v, 100, 60, 24, [255, 0, 255, 255]);
  // fantasma: uma linha de 1 px muito diferente
  for (let x = 10; x < 240; x++) v.set([255, 255, 255, 255], (150 * W + x) * 4);
  const r = detectar(a, v, W, H, { areaMin: 0.002 });
  assert.equal(r.manchas.length, 1);
  const m = r.manchas[0];
  assert.ok(Math.abs(m.x + m.w / 2 - 112) <= 3 && Math.abs(m.y + m.h / 2 - 72) <= 3);
});

test('dois pedacos com a mesma troca de cor viram uma diferenca; trocas diferentes, nao', () => {
  const ma = { id: 1, ids: [1], x: 10, y: 10, w: 20, h: 20, area: 400, media: 100, vis: 0, delta: [100, -50, 0] };
  const mb = { id: 2, ids: [2], x: 40, y: 12, w: 20, h: 20, area: 400, media: 100, vis: 0, delta: [95, -45, 5] };
  const mc = { id: 3, ids: [3], x: 40, y: 12, w: 20, h: 20, area: 400, media: 100, vis: 0, delta: [-80, 90, 0] };
  assert.equal(fundir([ma, mb], 50, W).length, 1);
  assert.equal(fundir([ma, mc], 50, W).length, 2);
});

test('alinhamento recupera um deslocamento de alguns px', () => {
  const a = base();
  quadrado(a, 40, 40, 30, [250, 250, 0, 255]);
  quadrado(a, 160, 110, 30, [0, 250, 250, 255]);
  // variante = A deslocada 4 px para a direita e 2 para baixo
  const v = new Uint8ClampedArray(a.length);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const sx = Math.min(W - 1, Math.max(0, x - 4));
      const sy = Math.min(H - 1, Math.max(0, y - 2));
      v.set(a.subarray((sy * W + sx) * 4, (sy * W + sx) * 4 + 4), (y * W + x) * 4);
    }
  }
  const al = alinhar(cinza(a, W * H), cinza(v, W * H), W, H);
  // a variante esta deslocada (+4, +2): para trazer de volta, d = (-4, -2)
  assert.ok(Math.abs(al.dx + 4) <= 1 && Math.abs(al.dy + 2) <= 1, JSON.stringify(al));
  const vt = transformar(v, a, W, H, al);
  assert.ok(detectar(a, vt, W, H, { areaMin: 0.002 }).manchas.length === 0);
});

test('escolha automatica nao poe duas no mesmo lugar e respeita o limite', () => {
  const c = (x, y, vis) => ({ id: x, ids: [x], x, y, w: 30, h: 30, area: 900, media: 120, vis });
  const cands = [c(100, 100, 0.9), c(105, 104, 0.8), c(400, 300, 0.7), c(700, 500, 0.6)];
  const e = escolherAuto(cands, 7, 1024, 768);
  assert.equal(e.length, 3);
  for (const x of e) assert.ok(elipseDe(x).rx > 15);
});

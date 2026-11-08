import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularLayout, telaParaImagem, imagemParaTela, zoomEm, prenderCamera } from '../src/render/layout.js';

test('celular em pe empilha; paisagem e os tamanhos da Poki poem lado a lado', () => {
  assert.equal(calcularLayout({ w: 390, h: 844 }).empilhado, true);
  for (const [w, h] of [[640, 360], [836, 470], [1031, 580], [844, 390]]) {
    const l = calcularLayout({ w, h });
    assert.equal(l.empilhado, false, `${w}x${h}`);
    for (const v of l.vistas) {
      assert.ok(v.x >= 0 && v.y >= l.topo.h - 0.5 && v.x + v.w <= w && v.y + v.h <= l.base.y + 0.5, `${w}x${h}`);
      assert.ok(Math.abs(v.w / v.h - 4 / 3) < 1e-6);
    }
  }
});

test('as vistas nao se sobrepoem e tem o mesmo tamanho', () => {
  const l = calcularLayout({ w: 1031, h: 580 });
  const [a, b] = l.vistas;
  assert.equal(a.w, b.w);
  assert.ok(a.x + a.w <= b.x);
  const p = calcularLayout({ w: 390, h: 844 });
  assert.ok(p.vistas[0].y + p.vistas[0].h <= p.vistas[1].y);
});

test('tela <-> imagem ida e volta, e o zoom segura o ponto sob o dedo', () => {
  const v = { x: 10, y: 20, w: 400, h: 300 };
  const c = { z: 2, cx: 500, cy: 400 };
  const p = telaParaImagem(v, c, 1024, 768, 123, 234);
  const q = imagemParaTela(v, c, 1024, 768, p.x, p.y);
  assert.ok(Math.abs(q.x - 123) < 1e-9 && Math.abs(q.y - 234) < 1e-9);
  const c1 = prenderCamera({ z: 1, cx: 512, cy: 384 }, 1024, 768);
  const antes = telaParaImagem(v, c1, 1024, 768, 200, 150);
  const c2 = zoomEm(v, c1, 1024, 768, 200, 150, 2);
  const depois = telaParaImagem(v, c2, 1024, 768, 200, 150);
  assert.ok(Math.abs(antes.x - depois.x) < 1e-6 && Math.abs(antes.y - depois.y) < 1e-6);
});

test('a camera nao sai da imagem', () => {
  const c = prenderCamera({ z: 2, cx: 0, cy: 9999 }, 1024, 768);
  assert.deepEqual(c, { z: 2, cx: 256, cy: 576 });
  assert.equal(prenderCamera({ z: 0.3, cx: 0, cy: 0 }, 1024, 768).z, 1);
});

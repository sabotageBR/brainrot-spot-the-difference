import { test } from 'node:test';
import assert from 'node:assert/strict';
import { acertar, validarCena, toleranciaImg, dificuldade } from '../src/jogo/cena.js';
import { cenaFalsa } from './apoio/cena-falsa.js';

test('acerto dentro da elipse, ja achado nao pune, fora e nada', () => {
  const c = cenaFalsa();
  assert.deepEqual(acertar(c, 120, 160, 0, new Set()), { tipo: 'acerto', id: 'd1' });
  assert.deepEqual(acertar(c, 120, 160, 0, new Set(['d1'])), { tipo: 'ja', id: 'd1' });
  assert.deepEqual(acertar(c, 600, 400, 0, new Set()), { tipo: 'nada' });
});

test('a tolerancia dilata a elipse', () => {
  const c = cenaFalsa();
  // 50 px a direita do centro: fora da elipse (rx 40), dentro com tolerancia 12
  assert.equal(acertar(c, 170, 160, 0, new Set()).tipo, 'nada');
  assert.equal(acertar(c, 170, 160, 12, new Set()).tipo, 'acerto');
});

test('tolerancia: dedo de 22 px CSS, entre 2% e 7% da largura', () => {
  assert.equal(toleranciaImg(1, 1000), 22);
  assert.equal(toleranciaImg(0.1, 1000), 20);
  assert.equal(toleranciaImg(10, 1000), 70);
});

test('a cena falsa e valida; os defeitos aparecem', () => {
  assert.deepEqual(validarCena(cenaFalsa()), []);
  const c = cenaFalsa();
  c.erros[1].elipse = { ...c.erros[0].elipse };
  assert.ok(validarCena(c).some((p) => /sobrepoem/.test(p)));
  const d = cenaFalsa();
  d.erros[0].elipse = { cx: 5, cy: 5, rx: 20, ry: 20 };
  assert.ok(validarCena(d).some((p) => /borda/.test(p)));
  const e = cenaFalsa();
  e.erros[0].vis = 0.01;
  assert.ok(validarCena(e).some((p) => /visibilidade/.test(p)));
  assert.ok(validarCena(cenaFalsa(2)).some((p) => /2 erros/.test(p)));
});

test('dificuldade cai com a visibilidade', () => {
  const c = cenaFalsa();
  const facil = { ...c, erros: c.erros.map((e) => ({ ...e, vis: 0.9 })) };
  const dificil = { ...c, erros: c.erros.map((e) => ({ ...e, vis: 0.1 })) };
  assert.ok(dificuldade(facil) < dificuldade(dificil));
});

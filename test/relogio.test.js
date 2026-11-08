// O relogio do jogo: a pausa para o tempo e a agenda inteira, e a volta nao salta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarRelogio } from '../src/core/relogio.js';
import { criarRelogioFalso } from './apoio/relogio-falso.js';

function montar() {
  const f = criarRelogioFalso(1000);
  return { f, r: criarRelogio({ ler: f.agora, agendar: f.agendar, cancelar: f.cancelar }) };
}

test('sem pausa, agora e o tempo real e depois e um timer', () => {
  const { f, r } = montar();
  let disparou = 0;
  r.depois(100, () => { disparou++; });
  assert.equal(r.agora(), 1000);
  f.avancar(99);
  assert.equal(disparou, 0);
  f.avancar(1);
  assert.equal(disparou, 1);
});

test('pausado, o tempo para e a agenda nao dispara', () => {
  const { f, r } = montar();
  let disparou = 0;
  r.depois(100, () => { disparou++; });
  f.avancar(40);
  r.pausar(true);
  const t = r.agora();
  f.avancar(5000);
  assert.equal(r.agora(), t);
  assert.equal(disparou, 0);
  assert.equal(f.timersPendentes(), 0);
});

test('a volta nao salta e so falta o que faltava', () => {
  const { f, r } = montar();
  let disparou = 0;
  r.depois(100, () => { disparou++; });
  f.avancar(40);
  r.pausar(true);
  f.avancar(5000);
  r.pausar(false);
  assert.equal(r.agora(), 1040);
  f.avancar(59);
  assert.equal(disparou, 0);
  f.avancar(1);
  assert.equal(disparou, 1);
});

test('agendar durante a pausa so conta na volta', () => {
  const { f, r } = montar();
  let disparou = 0;
  r.pausar(true);
  r.depois(50, () => { disparou++; });
  f.avancar(1000);
  assert.equal(disparou, 0);
  r.pausar(false);
  f.avancar(50);
  assert.equal(disparou, 1);
});

test('pausar duas vezes nao soma tempo nem duplica a agenda', () => {
  const { f, r } = montar();
  let disparou = 0;
  r.depois(100, () => { disparou++; });
  r.pausar(true);
  f.avancar(10);
  r.pausar(true);
  f.avancar(10);
  r.pausar(false);
  r.pausar(false);
  assert.equal(r.agora(), 1000);
  f.avancar(100);
  assert.equal(disparou, 1);
});

test('duas pausas seguidas descontam as duas', () => {
  const { f, r } = montar();
  r.pausar(true);
  f.avancar(300);
  r.pausar(false);
  f.avancar(10);
  r.pausar(true);
  f.avancar(700);
  r.pausar(false);
  assert.equal(r.agora(), 1010);
});

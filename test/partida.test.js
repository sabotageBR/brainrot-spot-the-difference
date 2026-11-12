import { test } from 'node:test';
import assert from 'node:assert/strict';
import { criarPartida, tocar, usarDica, usarPisca, estrelas, lugarEscondido, tocarEscondido, TRAVA_MS, estagio, alvoDaAjuda, alvoDaDica } from '../src/jogo/partida.js';
import { estrelasDe, estagioAjuda, AJUDA } from '../src/jogo/regras.js';
import { cenaFalsa } from './apoio/cena-falsa.js';

const centro = (c, i) => [c.erros[i].elipse.cx, c.erros[i].elipse.cy];

test('achar os 7 vence; o combo sobe dentro da janela', () => {
  const c = cenaFalsa();
  const p = criarPartida(c, 0);
  let ev;
  for (let i = 0; i < 7; i++) ev = tocar(p, ...centro(c, i), 0, 1000 + i * 500);
  assert.equal(ev.tipo, 'acerto');
  assert.equal(ev.combo, 7);
  assert.equal(p.fim, 'vitoria');
  assert.equal(estrelas(p, 5000), 3);
  assert.equal(tocar(p, 600, 400, 0, 6000).tipo, 'fim');
});

test('toque em erro ja achado nao pune', () => {
  const c = cenaFalsa();
  const p = criarPartida(c, 0);
  tocar(p, ...centro(c, 0), 0, 100);
  assert.equal(tocar(p, ...centro(c, 0), 0, 200).tipo, 'ja');
  assert.equal(p.erros, 0);
});

test('antispam: 3 erros em 2 s travam o toque', () => {
  const c = cenaFalsa();
  const p = criarPartida(c, 0);
  tocar(p, 600, 400, 0, 100);
  tocar(p, 600, 400, 0, 300);
  const ev = tocar(p, 600, 400, 0, 500);
  assert.equal(ev.tipo, 'erro');
  assert.equal(ev.antispam, true);
  assert.equal(tocar(p, ...centro(c, 0), 0, 500 + TRAVA_MS - 1).tipo, 'travado');
  assert.equal(tocar(p, ...centro(c, 0), 0, 500 + TRAVA_MS).tipo, 'acerto');
});

test('erros e dicas tiram estrela, nunca a cena', () => {
  const c = cenaFalsa();
  const p = criarPartida(c, 0);
  for (let k = 0; k < 6; k++) tocar(p, 600, 400, 0, k * 3000);
  for (let i = 0; i < 7; i++) tocar(p, ...centro(c, i), 0, 30000 + i);
  assert.equal(p.fim, 'vitoria');
  assert.equal(estrelas(p, 40000), 1);
});

test('estrelas: a dica pesa dois erros; o chefe tem mais folga', () => {
  assert.equal(estrelasDe({ total: 7, erros: 2, dicas: 0, gastoMs: 0 }), 3);
  assert.equal(estrelasDe({ total: 7, erros: 1, dicas: 1, gastoMs: 0 }), 2);
  assert.equal(estrelasDe({ total: 7, erros: 6, dicas: 0, gastoMs: 0 }), 1);
  assert.equal(estrelasDe({ total: 10, erros: 3, dicas: 0, gastoMs: 0 }), 3);
  assert.equal(estrelasDe({ total: 10, erros: 7, dicas: 0, gastoMs: 0 }), 2);
});

test('dica revela o erro mais dificil e gasta a gratis; a de fora nao gasta', () => {
  const c = cenaFalsa();
  const p = criarPartida(c, 0);
  assert.equal(usarDica(p, 100), 'd1');
  assert.equal(p.dicasLivres, 0);
  assert.equal(usarDica(p, 200), null);
  assert.equal(usarDica(p, 300, true), 'd2');
  assert.equal(p.dicas, 2);
});

test('pisca: uma carga gratis por cena; depois so pago', () => {
  const p = criarPartida(cenaFalsa(), 0);
  assert.equal(usarPisca(p, 0), true);
  assert.equal(usarPisca(p, 0), false);
  assert.equal(usarPisca(p, 0, true), true);
  assert.equal(p.piscas, 2);
});

test('ajuda automatica: os limiares por faixa de nivel', () => {
  assert.equal(estagioAjuda(1, 4999), AJUDA.nada);
  assert.equal(estagioAjuda(1, 5000), AJUDA.pulso);
  assert.equal(estagioAjuda(3, 10000), AJUDA.zona);
  assert.equal(estagioAjuda(3, 18000), AJUDA.mao);
  assert.equal(estagioAjuda(4, 18000), AJUDA.pulso);
  assert.equal(estagioAjuda(10, 35000), AJUDA.mao);
  assert.equal(estagioAjuda(11, 29999), AJUDA.pulso);
  assert.equal(estagioAjuda(55, 50000), AJUDA.mao);
  assert.equal(estagioAjuda(55, 0, AJUDA.zona), AJUDA.zona);
});

test('ajuda automatica: acerto e dica zeram, a trava pula para a zona, o pisca empurra', () => {
  const c = cenaFalsa();
  const p = criarPartida(c, 0);
  assert.equal(estagio(p, 4000, 1), AJUDA.nada);
  assert.equal(estagio(p, 12000, 1), AJUDA.zona);
  tocar(p, ...centro(c, 0), 0, 12000);
  assert.equal(estagio(p, 12500, 1), AJUDA.nada);
  // tres erros rapidos: a trava poe a zona na hora
  for (let i = 0; i < 3; i++) tocar(p, 5, 5, 0, 13000 + i * 100);
  assert.equal(estagio(p, 13300, 1), AJUDA.zona);
  assert.equal(estagio(p, 13300 + 18000, 1), AJUDA.mao);
  // o alvo da ajuda e o mesmo da dica; a dica zera
  assert.equal(alvoDaAjuda(p), alvoDaDica(p));
  usarDica(p, 40000);
  assert.equal(estagio(p, 40100, 1), AJUDA.nada);
  // o pisca conta como progresso ate acabar
  usarPisca(p, 50000);
  assert.equal(estagio(p, 50000 + 3000 + 4999, 1), AJUDA.nada);
  assert.equal(estagio(p, 50000 + 3000 + 5000, 1), AJUDA.pulso);
});

test('escondido: mesmo lugar sempre, longe dos erros, uma vez so', () => {
  const c = cenaFalsa();
  const a = lugarEscondido(c);
  assert.deepEqual(lugarEscondido(c), a);
  for (const e of c.erros) assert.ok(Math.hypot(a.cx - e.elipse.cx, a.cy - e.elipse.cy) > e.elipse.rx + a.r);
  const p = criarPartida(c, 0);
  assert.equal(tocarEscondido(p, a.cx, a.cy, 10), true);
  assert.equal(tocarEscondido(p, a.cx, a.cy, 10), false);
  assert.equal(p.erros, 0);
});

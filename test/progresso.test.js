import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proximaCena, mapaDoJogo, ganharFigurinha, presenteDoDia, numeroDoNivel, encherBau, FASES_POR_BAU, figurinhaDoBau, ganharBonus } from '../src/jogo/progresso.js';
import { cenaFalsa } from './apoio/cena-falsa.js';

const cena = (id, mundo, k, prot) => ({ ...cenaFalsa(), id, mundo, k, prot });
const LISTA = [cena('praia-01', 1, 1, 'tralalero'), cena('praia-02', 1, 2, 'trippi-troppi'), cena('cafe-01', 2, 1, 'ballerina')];
const vazio = () => ({ feitas: {}, douradas: [], colecao: {}, dia: { ultimo: '', seq: 0 }, banco: 0 });

test('a proxima cena e a primeira nao feita; no fim, nenhuma', () => {
  assert.equal(proximaCena(LISTA, {}).id, 'praia-01');
  assert.equal(proximaCena(LISTA, { 'praia-01': 3 }).id, 'praia-02');
  assert.equal(proximaCena(LISTA, { 'praia-01': 3, 'praia-02': 1, 'cafe-01': 2 }), null);
  assert.equal(numeroDoNivel(LISTA[2]), 11);
});

test('mapa: 10 mundos x 10; feito, atual, bloqueado e em breve', () => {
  const s = { ...vazio(), feitas: { 'praia-01': 2 }, douradas: ['praia-01'] };
  const m = mapaDoJogo(LISTA, s, 'praia-02');
  assert.equal(m.length, 10);
  assert.equal(m[0].nos.length, 10);
  assert.deepEqual(m[0].nos[0], { n: 1, id: 'praia-01', estado: 'feito', estrelas: 2, ouro: true, aqui: false });
  assert.equal(m[0].nos[1].estado, 'atual');
  assert.equal(m[0].nos[1].aqui, true);
  assert.equal(m[0].nos[2].estado, 'embreve');
  assert.equal(m[1].nos[0].estado, 'bloqueado');
  assert.equal(m[0].aberto, true);
  assert.equal(m[1].aberto, false);
});

test('figurinha: nova na primeira vez; o dourado a deixa dourada para sempre', () => {
  const c = LISTA[0];
  const a = ganharFigurinha({}, c, false);
  assert.equal(a.nova, true);
  assert.equal(a.dourada, false);
  const b = ganharFigurinha(a.colecao, c, true);
  assert.equal(b.nova, false);
  assert.equal(b.virouDourada, true);
  assert.equal(b.colecao.tralalero.vezes, 2);
  const d = ganharFigurinha(b.colecao, c, false);
  assert.equal(d.dourada, true);
  assert.equal(d.virouDourada, false);
});

test('presente do dia: uma vez por dia, cresce na sequencia, zera se pular um dia', () => {
  let r = presenteDoDia({ ultimo: '', seq: 0 }, '2026-11-08');
  assert.deepEqual(r, { dia: { ultimo: '2026-11-08', seq: 1 }, dicas: 1 });
  assert.equal(presenteDoDia(r.dia, '2026-11-08').dicas, 0);
  r = presenteDoDia(r.dia, '2026-11-09');
  assert.equal(r.dia.seq, 2);
  r = presenteDoDia({ ultimo: '2026-11-30', seq: 2 }, '2026-12-01');
  assert.equal(r.dia.seq, 3);
  assert.equal(r.dicas, 2);
  assert.equal(presenteDoDia({ ultimo: '2026-11-08', seq: 9 }, '2026-11-09').dicas, 3);
  assert.equal(presenteDoDia({ ultimo: '2026-11-06', seq: 5 }, '2026-11-08').dia.seq, 1);
});

test('bau: abre na terceira fase vencida e as marcas voltam a zero', () => {
  assert.equal(FASES_POR_BAU, 3);
  assert.deepEqual(encherBau(0), { marcas: 1, abre: false });
  assert.deepEqual(encherBau(1), { marcas: 2, abre: false });
  assert.deepEqual(encherBau(2), { marcas: 0, abre: true });
});

test('bau: o bonus e um coadjuvante novo; longe de virar premio e famoso primeiro', () => {
  const caixa = { x: 0, y: 0, w: 10, h: 10 };
  const com = (c, ...ids) => ({ ...c, personagens: ids.map((id) => ({ id, caixa })) });
  const a = com(cena('praia-01', 1, 1, 'tralalero'), 'tralalero', 'ballerina', 'lirili', 'bananita');
  const b = com(cena('praia-02', 1, 2, 'trippi-troppi'), 'trippi-troppi', 'patapim');
  // ballerina e premio na fase 3 (perto): fica para la; patapim (S) e bananita (B) nunca sao premio
  const lista = [a, b, cena('praia-03', 1, 3, 'ballerina'), cena('praia-04', 1, 4, 'lirili')];
  assert.deepEqual(figurinhaDoBau({}, [a, b], lista), { id: 'patapim', cena: 'praia-02' });
  assert.deepEqual(figurinhaDoBau({ patapim: { cena: 'x' } }, [a, b], lista), { id: 'bananita', cena: 'praia-01' });
  // so sobram os de premio perto, os dois lendarios: vai o premio mais distante
  assert.deepEqual(figurinhaDoBau({ patapim: { cena: 'x' }, bananita: { cena: 'x' } }, [a, b], lista), { id: 'lirili', cena: 'praia-01' });
  // o protagonista da cena nunca e bonus; com tudo na colecao, nada
  const tudo = { ballerina: { cena: 'x' }, lirili: { cena: 'x' }, patapim: { cena: 'x' }, bananita: { cena: 'x' } };
  assert.equal(figurinhaDoBau(tudo, [a, b], lista), null);
  const col = ganharBonus({}, { id: 'patapim', cena: 'praia-02' });
  assert.deepEqual(col.patapim, { cena: 'praia-02', dourada: false, vezes: 1 });
  assert.equal(ganharBonus(col, { id: 'patapim', cena: 'praia-01' }), col);
});

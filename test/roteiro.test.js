// O roteiro da arte (arte/roteiro.js): 100 cenas, todo brainrot do catalogo vira figurinha,
// varios personagens em toda cena (pedido do dono) e prompts curtos (o Grok tem limite).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CENAS_ROTEIRO, APARENCIA, GENTE_MIN, ELENCO_DO_DONO, errosDaCena, edicoesDaCena, mudancasPorEdicao, promptDaCena } from '../arte/roteiro.js';
import { BRAINROTS, MUNDOS } from '../src/jogo/catalogo.js';

test('10 mundos x 10 cenas, ids unicos no formato <mundo>-<nn>', () => {
  assert.equal(CENAS_ROTEIRO.length, 100);
  assert.equal(new Set(CENAS_ROTEIRO.map((c) => c.id)).size, 100);
  for (const c of CENAS_ROTEIRO) {
    assert.equal(c.id, `${MUNDOS[c.mundo - 1].id}-${String(c.k).padStart(2, '0')}`);
  }
});

test('todo brainrot do catalogo tem aparencia e e protagonista de alguma cena', () => {
  const prots = new Set(CENAS_ROTEIRO.map((c) => c.prot));
  for (const b of BRAINROTS) {
    assert.ok(APARENCIA[b.id], b.id);
    assert.ok(prots.has(b.id), `${b.id} nunca e protagonista`);
  }
});

test('varios personagens por cena, sem repetir, com o protagonista no meio', () => {
  for (const c of CENAS_ROTEIRO) {
    const ids = c.gente.map(([g]) => g);
    assert.equal(new Set(ids).size, ids.length, c.id);
    assert.ok(ids.includes(c.prot), c.id);
    for (const g of ids) assert.ok(APARENCIA[g], `${c.id}: ${g}`);
    if (!c.bruto) assert.ok(ids.length >= GENTE_MIN, `${c.id}: ${ids.length} personagens`);
  }
});

test('curva de erros e candidatas suficientes; prompts objetivos', () => {
  assert.equal(errosDaCena(CENAS_ROTEIRO[0]), 3);
  assert.equal(errosDaCena(CENAS_ROTEIRO[1]), 5);
  for (const c of CENAS_ROTEIRO) {
    assert.ok(edicoesDaCena(c) * mudancasPorEdicao(c) >= errosDaCena(c) + 4, c.id);
    assert.ok(promptDaCena(c).length <= 1500, `${c.id}: prompt com ${promptDaCena(c).length}`);
  }
});

test('pedidos do dono: sem repetir na cena seguinte, 1 tubarao no maximo, sem fundo do mar', () => {
  const tubaroes = ['tralalero', 'tralalita', 'tralaleritos'];
  CENAS_ROTEIRO.forEach((c, i) => {
    const ids = c.gente.map(([g]) => g);
    assert.ok(ids.filter((g) => tubaroes.includes(g)).length <= 1, `${c.id}: mais de um tubarao`);
    assert.ok(!/underwater|sea floor|seabed|coral reef/i.test(`${c.lugar} ${c.objetos}`), `${c.id}: fundo do mar`);
    if (i) {
      const antes = new Set(CENAS_ROTEIRO[i - 1].gente.map(([g]) => g));
      assert.deepEqual(ids.filter((g) => antes.has(g)), [], `${c.id}: repete da cena anterior`);
    }
  });
});

test('o elenco minimo do dono vira figurinha logo no comeco; ate o album encher, cada cena da uma nova', () => {
  const prots = CENAS_ROTEIRO.map((c) => c.prot);
  for (const id of ELENCO_DO_DONO) {
    assert.ok(BRAINROTS.some((b) => b.id === id), id);
    assert.ok(prots.indexOf(id) >= 0 && prots.indexOf(id) < 30, `${id}: protagonista tarde (${prots.indexOf(id)})`);
  }
  // a regra de nao repetir as cenas anteriores pode adiar uma ou outra figurinha nova
  const primeiras = prots.slice(0, BRAINROTS.length);
  assert.ok(new Set(primeiras).size >= BRAINROTS.length - 3, `${new Set(primeiras).size} figurinhas novas nas primeiras ${BRAINROTS.length} cenas`);
});

test('lugares variados: a maioria em ambiente fechado, no maximo 3 ao ar livre seguidos', () => {
  const fechado = /^inside |interior|kitchen|backstage|room|hall|shop|station|library|store|supermarket|mine|cave|cabin|factory|tent|diner|chamber|greenhouse|bathhouse|bus|observatory|headquarters|warehouse|saloon/i;
  let seguidos = 0;
  let livre = 0;
  for (const c of CENAS_ROTEIRO) {
    if (fechado.test(c.lugar)) seguidos = 0;
    else {
      livre += 1;
      seguidos += 1;
      assert.ok(seguidos <= 3, `${c.id}: ${seguidos} ao ar livre seguidos`);
    }
  }
  assert.ok(livre <= 40, `${livre} cenas ao ar livre`);
});

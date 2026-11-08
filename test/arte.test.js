// As cenas geradas pelo estudio: manifesto valido e na ordem do roteiro, arquivos presentes,
// o numero de erros que o roteiro pede e o protagonista do catalogo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CENAS } from '../src/arte/cenas/manifesto.js';
import { validarCena } from '../src/jogo/cena.js';
import { brainrot } from '../src/jogo/catalogo.js';
import { CENAS_ROTEIRO, cenaRoteiro, errosDaCena } from '../arte/roteiro.js';

const raiz = fileURLToPath(new URL('..', import.meta.url));

test('toda cena do manifesto e valida e tem os erros que o roteiro pede', () => {
  for (const c of CENAS) {
    assert.deepEqual(validarCena(c), [], c.id);
    const r = cenaRoteiro(c.id);
    assert.ok(r, `${c.id}: fora do roteiro`);
    assert.equal(c.erros.length, errosDaCena(r), c.id);
    assert.equal(c.mundo, r.mundo, c.id);
    assert.equal(c.k, r.k, c.id);
    assert.equal(c.prot, r.prot, c.id);
  }
});

test('o manifesto segue a ordem de jogo do roteiro', () => {
  const ordem = CENAS.map((c) => CENAS_ROTEIRO.findIndex((r) => r.id === c.id));
  assert.deepEqual(ordem, [...ordem].sort((a, b) => a - b));
});

test('os arquivos de cada cena existem e sao pequenos', () => {
  for (const c of CENAS) {
    const pasta = join(raiz, 'src/arte/cenas', c.id);
    const a = join(pasta, c.imagem);
    assert.ok(existsSync(a), a);
    assert.ok(statSync(a).size < 400 * 1024, `${c.id}: base com ${statSync(a).size} bytes`);
    for (const e of c.erros) assert.ok(existsSync(join(pasta, e.remendo.arq)), `${c.id}/${e.remendo.arq}`);
  }
});

test('personagens das figurinhas existem no catalogo e cabem na imagem', () => {
  for (const c of CENAS) {
    assert.ok(brainrot(c.prot), `${c.id}: ${c.prot}`);
    for (const f of c.personagens || []) {
      assert.ok(brainrot(f.id), `${c.id}: ${f.id}`);
      assert.ok(f.caixa.x >= 0 && f.caixa.y >= 0 && f.caixa.x + f.caixa.w <= c.tam[0] && f.caixa.y + f.caixa.h <= c.tam[1], `${c.id}: ${f.id}`);
    }
  }
});

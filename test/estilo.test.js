// Fronteiras do codigo que os portais e o projeto cobram (ver CLAUDE.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = fileURLToPath(new URL('..', import.meta.url));
/** @param {string} dir @returns {string[]} */
const arquivos = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? arquivos(p) : [p];
});
const src = arquivos(join(raiz, 'src')).filter((p) => /\.(js|css)$/.test(p));
const ler = (p) => readFileSync(p, 'utf8');
const rel = (p) => relative(raiz, p);

test('sem console.log/info/debug no jogo', () => {
  for (const p of src) assert.ok(!/console\.(log|info|debug)\s*\(/.test(ler(p)), rel(p));
});

test('so src/core/portal.js importa o SDK da Poki, e so src/main.js importa o portal', () => {
  for (const p of src) {
    if (rel(p) !== 'src/core/portal.js' && rel(p) !== 'src/core/poki.js') assert.ok(!/core\/poki\.js|\.\/poki\.js/.test(ler(p)), rel(p));
    if (!['src/main.js', 'src/core/portal.js', 'src/core/poki.js'].includes(rel(p))) assert.ok(!/core\/portal\.js|\.\/portal\.js/.test(ler(p)), rel(p));
  }
});

test('a marca da Poki so fica no wrapper: a build copia o src/ inteiro para os portais', () => {
  for (const p of src) {
    if (rel(p) === 'src/core/poki.js' || rel(p) === 'src/core/portal.js') continue;
    assert.ok(!/poki/i.test(ler(p)), rel(p));
    assert.ok(!/poki/i.test(rel(p)), rel(p));
  }
});

test('um relogio so: so core/relogio.js le o tempo e agenda', () => {
  /** Tira os comentarios de linha e de bloco para olhar so o codigo. */
  const codigo = (/** @type {string} */ t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
  for (const p of src) {
    if (['src/core/relogio.js', 'src/core/poki.js', 'src/main.js'].includes(rel(p))) continue;
    if (rel(p) === 'src/core/audio.js') {
      // o unico timer do audio e o que suspende o contexto depois do mudo do anuncio
      assert.equal((codigo(ler(p)).match(/setTimeout\(/g) || []).length, 1, rel(p));
      assert.ok(!/performance\.now|Date\.now|new Date\b/.test(codigo(ler(p))), rel(p));
      continue;
    }
    assert.ok(!/performance\.now|Date\.now|new Date\b|setTimeout|setInterval/.test(codigo(ler(p))), rel(p));
  }
  assert.ok(!/performance\.now|Date\.now|new Date\b|setTimeout|setInterval/.test(codigo(ler(join(raiz, 'src/main.js')))), 'src/main.js');
});

test('so o armazenamento toca o localStorage', () => {
  for (const p of src) {
    if (rel(p) === 'src/core/armazenamento.js') continue;
    assert.ok(!/localStorage/.test(ler(p)), rel(p));
  }
});

test('so a depuracao le a URL', () => {
  for (const p of src) {
    if (rel(p) === 'src/core/depuracao.js') continue;
    assert.ok(!/location\.(search|hash)|URLSearchParams/.test(ler(p)), rel(p));
  }
});

test('logica pura nao usa Math.random, DOM nem relogio', () => {
  for (const p of src.filter((x) => /src\/jogo\//.test(x))) {
    const t = ler(p);
    assert.ok(!/Math\.random|document\.|window\.|Date\.now|performance\.now|setTimeout/.test(t), rel(p));
  }
});

test('unica URL externa e a do SDK da Poki', () => {
  const permitida = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';
  for (const p of [...src, join(raiz, 'index.html')]) {
    const urls = ler(p).match(/https?:\/\/[^\s"'`)<>]+/g) || [];
    for (const u of urls) assert.equal(u, permitida, `${rel(p)}: ${u}`);
  }
  assert.ok(ler(join(raiz, 'index.html')).includes(permitida));
});

test('o banco de testes do SDK fica num bloco destacavel da depuracao', () => {
  const t = ler(join(raiz, 'src/core/depuracao.js'));
  const bloco = /\n {2}\/\/ banco de testes[^\n]*\n[^\n]*__brainrot7Teste;\n[^\n]*\n[^\n]*\n {2}\}\n/;
  assert.ok(bloco.test(t));
  assert.ok(!/__brainrot7Teste/.test(t.replace(bloco, '\n')));
});

test('index.html pede viewport-fit=cover', () => {
  assert.ok(/viewport-fit=cover/.test(ler(join(raiz, 'index.html'))));
});

// Monta a build da Poki: copia so o jogo para dist/, confere e zipa em
// dist-poki/brainrot-spot-the-difference-<versao>.zip (index.html na raiz do zip).
// Carga inicial = tudo menos as cenas, mais a primeira cena (as outras baixam uma a uma).
// Uso: node tools/empacotar.mjs
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, extname, sep } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { RAIZ } from './servir.mjs';

const versao = JSON.parse(readFileSync(join(RAIZ, 'package.json'), 'utf8')).version;
const NOME = `brainrot-spot-the-difference-${versao}`;
const dist = join(RAIZ, 'dist');
const saida = join(RAIZ, 'dist-poki');
const zip = join(saida, `${NOME}.zip`);
const PERMITIDA = 'https://game-cdn.poki.com/scripts/v2/poki-sdk.js';
const MB = 1024 * 1024;

/** @param {string} d @returns {string[]} */
const listar = (d) => readdirSync(d).flatMap((n) => {
  const p = join(d, n);
  return statSync(p).isDirectory() ? listar(p) : [p];
});

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
for (const item of ['index.html', 'LICENCAS.txt', 'src']) cpSync(join(RAIZ, item), join(dist, item), { recursive: true });

const { CENAS } = await import(new URL('../src/arte/cenas/manifesto.js', import.meta.url).href);
const primeira = CENAS[0] ? `src${sep}arte${sep}cenas${sep}${CENAS[0].id}${sep}` : '';
const falhas = [];
const avisos = [];
const arquivos = listar(dist);
const html = readFileSync(join(dist, 'index.html'), 'utf8');
if (!/viewport-fit=cover/.test(html)) falhas.push('index.html sem viewport-fit=cover');
if (!html.includes(PERMITIDA)) falhas.push('index.html sem o SDK da Poki');
if (!CENAS.length) falhas.push('nenhuma cena no manifesto');
let bruto = 0;
let gz = 0;
let inicial = 0;
for (const p of arquivos) {
  const r = relative(dist, p);
  const dados = readFileSync(p);
  bruto += dados.length;
  const g = /\.(webp|png|jpe?g|woff2)$/.test(p) ? dados.length : gzipSync(dados, { level: 9 }).length;
  gz += g;
  const daCena = r.startsWith(`src${sep}arte${sep}cenas${sep}`) && !r.endsWith('manifesto.js');
  if (!daCena || (primeira && r.startsWith(primeira))) inicial += g;
  if (extname(p) === '.map') falhas.push(`mapa de fonte na build: ${r}`);
  if (/\.(html|js|css)$/.test(p)) {
    const t = dados.toString('utf8');
    for (const u of t.match(/https?:\/\/[^\s"'`)<>]+/g) || []) if (u !== PERMITIDA) falhas.push(`URL externa em ${r}: ${u}`);
    if (/console\.(log|info|debug)\s*\(/.test(t)) falhas.push(`console.log em ${r}`);
  }
}
// guia de engine da Poki: ate 5 MB de carga inicial e 8 MB no total (docs/pesquisa/poki.md)
if (inicial > 5 * MB) falhas.push(`carga inicial acima de 5 MB (${(inicial / MB).toFixed(2)} MB)`);
if (gz > 8 * MB) avisos.push(`total de ${(gz / MB).toFixed(1)} MB passa dos 8 MB do guia (as cenas baixam uma a uma; conferir no Poki Inspector)`);
if (falhas.length) {
  process.stdout.write(`FALHOU:\n  ${falhas.join('\n  ')}\n`);
  process.exit(1);
}

mkdirSync(saida, { recursive: true });
rmSync(zip, { force: true });
const z = spawnSync('zip', ['-qr', '-X', zip, '.'], { cwd: dist, encoding: 'utf8' });
if (z.status !== 0) {
  process.stdout.write(`zip falhou: ${z.stderr}\n`);
  process.exit(1);
}
const teste = spawnSync('unzip', ['-tq', zip], { encoding: 'utf8' });
const lista = spawnSync('unzip', ['-Z1', zip], { encoding: 'utf8' }).stdout.trim().split('\n');
if (teste.status !== 0 || !lista.includes('index.html')) {
  process.stdout.write('zip invalido ou sem index.html na raiz\n');
  process.exit(1);
}
const sha = createHash('sha256').update(readFileSync(zip)).digest('hex');
const tam = statSync(zip).size;
writeFileSync(join(saida, `${NOME}.sha256`), `${sha}  ${NOME}.zip\n`);
process.stdout.write(`build ok: ${arquivos.length} arquivos, ${CENAS.length} cenas, ${(bruto / MB).toFixed(2)} MB (${(gz / MB).toFixed(2)} MB comprimido)\n`);
process.stdout.write(`carga inicial: ${(inicial / MB).toFixed(2)} MB (jogo + primeira cena)\n`);
process.stdout.write(`${relative(RAIZ, zip)}: ${(tam / MB).toFixed(2)} MB, sha256 ${sha}\n`);
for (const a of avisos) process.stdout.write(`aviso: ${a}\n`);
process.stdout.write('aviso: personagens com nome real (risco de IP aceito pelo dono, ver CLAUDE.md)\n');
if (!existsSync(zip)) process.exit(1);

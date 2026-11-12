// Alinha a figurinha (o protagonista) das cenas ja geradas com o roteiro, sem tocar na arte:
// so o campo "prot" de src/arte/cenas/<id>/cena.json muda, e o manifesto e regerado.
// Serve para a troca de premios depois da arte pronta (campo "figurinha" do arte/roteiro.js).
// Uso: node tools/figurinhas.mjs [--seco]
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './servir.mjs';
import { gerarManifesto } from './estudio.mjs';
import { cenaRoteiro } from '../arte/roteiro.js';

const seco = process.argv.includes('--seco');
const pasta = join(RAIZ, 'src/arte/cenas');
const ids = (await readdir(pasta, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
let trocas = 0;
for (const id of ids) {
  const arq = join(pasta, id, 'cena.json');
  const rot = cenaRoteiro(id);
  if (!rot || !existsSync(arq)) continue;
  const cena = JSON.parse(await readFile(arq, 'utf8'));
  if (cena.prot === rot.prot) continue;
  if (!(cena.personagens || []).some((/** @type {{ id: string }} */ p) => p.id === rot.prot)) {
    process.stdout.write(`${id}: ${rot.prot} sem caixa de figurinha na cena (fica ${cena.prot})\n`);
    process.exitCode = 1;
    continue;
  }
  process.stdout.write(`${id}: ${cena.prot} -> ${rot.prot}\n`);
  trocas += 1;
  if (!seco) await writeFile(arq, `${JSON.stringify({ ...cena, prot: rot.prot }, null, 1)}\n`);
}
if (!seco && trocas) process.stdout.write(`manifesto: ${await gerarManifesto()} cenas\n`);
process.stdout.write(`${trocas} figurinha(s) ${seco ? 'a trocar' : 'trocada(s)'}\n`);

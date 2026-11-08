// Linha de comando do roteiro da arte (arte/roteiro.js): prompts para o Grok e o que falta.
// Uso:
//   node tools/roteiro.mjs <id>             prompt da cena, edicoes e erros (JSON)
//   node tools/roteiro.mjs retrato <id>     prompt do retrato da figurinha
//   node tools/roteiro.mjs falta [mundo]    cenas sem arte bruta completa, na ordem de jogo
//   node tools/roteiro.mjs retratos         retratos que faltam
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './servir.mjs';
import { CENAS_ROTEIRO, APARENCIA, cenaRoteiro, promptDaCena, promptDoRetrato, errosDaCena, edicoesDaCena, mudancasPorEdicao } from '../arte/roteiro.js';

const BRUTO = join(RAIZ, 'arte/bruto');

/** A pasta tem a base, as N variantes e o registro? @param {import('../arte/roteiro.js').CenaRoteiro} c */
export function brutoCompleto(c) {
  const pasta = join(BRUTO, c.id);
  if (!existsSync(pasta)) return false;
  const arqs = readdirSync(pasta);
  const tem = (nome) => arqs.some((a) => a.startsWith(`${nome}.`));
  if (!tem('a') || !arqs.includes('registro.json')) return false;
  for (let i = 1; i <= edicoesDaCena(c); i++) if (!tem(`v${i}`)) return false;
  return true;
}

const [cmd, arg] = process.argv.slice(2);
if (cmd === 'retrato') {
  if (!APARENCIA[arg]) throw new Error(`brainrot desconhecido: ${arg}`);
  process.stdout.write(`${JSON.stringify({ id: arg, arquivo: `arte/bruto/retratos/${arg}.jpg`, proporcao: '1:1', prompt: promptDoRetrato(arg) }, null, 1)}\n`);
} else if (cmd === 'retratos') {
  const falta = Object.keys(APARENCIA).filter((id) => !readdirSync(join(BRUTO, 'retratos')).some((a) => a.startsWith(`${id}.`)));
  process.stdout.write(`${falta.length} retratos faltando: ${falta.join(' ')}\n`);
} else if (cmd === 'falta') {
  const lista = CENAS_ROTEIRO.filter((c) => (!arg || String(c.mundo) === arg) && !brutoCompleto(c));
  process.stdout.write(`${lista.length} cenas sem arte bruta completa:\n${lista.map((c) => `${c.id} (${edicoesDaCena(c)} edicoes)`).join('\n')}\n`);
} else if (cmd && cenaRoteiro(cmd)) {
  const c = /** @type {any} */ (cenaRoteiro(cmd));
  process.stdout.write(`${JSON.stringify({
    id: c.id, pasta: `arte/bruto/${c.id}/`, proporcao: '4:3', edicoes: edicoesDaCena(c), mudancas_por_edicao: mudancasPorEdicao(c), erros_no_jogo: errosDaCena(c),
    protagonista: c.prot, personagens: c.gente.map(([g]) => g), prompt: promptDaCena(c),
  }, null, 1)}\n`);
} else {
  process.stdout.write('uso: node tools/roteiro.mjs <id> | retrato <id> | falta [mundo] | retratos\n');
  process.exitCode = 1;
}

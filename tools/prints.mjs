// Prints do jogo nos tamanhos do portal e no celular, jogando pelos ganchos (__b7).
// Grava em docs/prints/ (fora da build) e relata os erros do console.
//   inicio-1031.png   primeira cena, mao do tutorial (1031x580)
//   jogando-1031.png  dois erros achados e um toque errado
//   jogando-640.png   o menor tamanho 16:9 (640x360)
//   jogando-retrato.png  celular em pe (390x844, dpr 2)
//   fim-1031.png / fim-retrato.png  painel do fim, com a figurinha
//   mapa-retrato.png / album-retrato.png
// Uso: node tools/prints.mjs [id da cena]   (padrao: a primeira do manifesto)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './servir.mjs';
import { abrirChrome, espera } from './cdp.mjs';

const SAIDA = join(RAIZ, 'docs/prints');
mkdirSync(SAIDA, { recursive: true });
const cena = process.argv[2] || '';
const c = await abrirChrome({ porta: 5407, portaDep: 9407 });
const gravar = async (nome) => {
  writeFileSync(join(SAIDA, nome), await c.foto());
  process.stdout.write(`  ${nome}\n`);
};
const jogando = '!!(window.__b7 && __b7.J.fase === "jogando")';
const url = (extra = '') => `/?novo&semanuncio&lang=pt${cena ? `&cena=${cena}` : ''}${extra}`;

await c.tela(1031, 580);
await c.ir(url());
if (!(await c.ate(jogando))) throw new Error('o jogo nao chegou a jogar');
await espera(700);
await gravar('inicio-1031.png');
await c.avaliar('__b7.tocarErro(0)');
await espera(300);
await c.avaliar('__b7.tocarErro(1)');
await espera(300);
await c.avaliar('__b7.errar()');
await espera(500);
await gravar('jogando-1031.png');
await c.tela(640, 360);
await espera(300);
await gravar('jogando-640.png');
await c.tela(390, 844, 2, true);
await espera(400);
await gravar('jogando-retrato.png');
await c.avaliar('__b7.acharDourado()');
const total = await c.avaliar('__b7.J.p.cena.erros.length');
for (let i = 2; i < total; i++) {
  await c.avaliar(`__b7.tocarErro(${i})`);
  await espera(150);
}
await c.ate('!document.getElementById("painel").hidden', 5000);
await espera(1500);
await gravar('fim-retrato.png');
await c.tela(1031, 580);
await espera(400);
await gravar('fim-1031.png');
await c.tela(390, 844, 2, true);
await c.avaliar('document.getElementById("bMapa").click()');
await espera(500);
await gravar('mapa-retrato.png');
await c.avaliar('document.getElementById("mapa").hidden = true; document.getElementById("bAlbum").click()');
await espera(800);
await gravar('album-retrato.png');
process.stdout.write(c.erros.length ? `ERROS NO CONSOLE:\n${c.erros.join('\n')}\n` : 'console limpo\n');
await c.sair();

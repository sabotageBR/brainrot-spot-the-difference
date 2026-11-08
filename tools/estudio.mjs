// Gravacao do estudio (POST /__estudio): escreve a cena em src/arte/cenas/<id>/,
// regenera o manifesto, guarda a folha de conferencia e o registro de origem.
// O navegador ja codificou tudo (WebP da base e dos remendos com alfa); aqui so se confere e grava.
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ } from './servir.mjs';
import { validarCena } from '../src/jogo/cena.js';
import { brainrot } from '../src/jogo/catalogo.js';
import { CENAS_ROTEIRO, cenaRoteiro, errosDaCena } from '../arte/roteiro.js';

const PASTA_CENAS = join(RAIZ, 'src/arte/cenas');

/** @param {string} url @param {string} tipo */
function bytesDe(url, tipo) {
  const m = /^data:([^;]+);base64,(.*)$/.exec(String(url || ''));
  if (!m) throw new Error('imagem sem data URL');
  if (m[1] !== tipo) throw new Error(`esperado ${tipo}, veio ${m[1]}`);
  return Buffer.from(m[2], 'base64');
}

/** Regrava o manifesto com as cenas de src/arte/cenas/<id>/cena.json, na ordem de jogo do roteiro. */
export async function gerarManifesto() {
  const ordem = new Map(CENAS_ROTEIRO.map((c, i) => [c.id, i]));
  const ids = existsSync(PASTA_CENAS)
    ? (await readdir(PASTA_CENAS, { withFileTypes: true })).filter((d) => d.isDirectory() && ordem.has(d.name)).map((d) => d.name)
    : [];
  ids.sort((a, b) => /** @type {number} */ (ordem.get(a)) - /** @type {number} */ (ordem.get(b)));
  const cenas = [];
  for (const id of ids) {
    const arq = join(PASTA_CENAS, id, 'cena.json');
    if (!existsSync(arq)) continue;
    cenas.push(JSON.parse(await readFile(arq, 'utf8')));
  }
  const corpo = [
    '// GERADO por tools/estudio.mjs (npm run servir + tools/estudio.html). Nao edite a mao.',
    `export const CENAS = ${JSON.stringify(cenas, null, 1)};`,
    '',
  ].join('\n');
  await writeFile(join(PASTA_CENAS, 'manifesto.js'), corpo);
  return cenas.length;
}

/**
 * @param {any} p pedido do estudio
 * @returns {Promise<{ ok: boolean, erros: string[], arquivos?: string[] }>}
 */
export async function salvarCena(p) {
  const id = String(p && p.id || '');
  const rot = cenaRoteiro(id);
  if (!rot) return { ok: false, erros: [`cena fora do roteiro: ${id}`] };
  /** @type {import('../src/jogo/cena.js').Cena} */
  const cena = {
    id,
    mundo: rot.mundo,
    k: rot.k,
    prot: rot.prot,
    tam: [Number(p.tam[0]), Number(p.tam[1])],
    imagem: 'a.webp',
    erros: (p.erros || []).map((e, i) => ({
      id: `d${i + 1}`,
      elipse: { cx: Math.round(e.elipse.cx), cy: Math.round(e.elipse.cy), rx: Math.round(e.elipse.rx), ry: Math.round(e.elipse.ry) },
      remendo: { arq: `d${i + 1}.webp`, x: Math.round(e.remendo.x), y: Math.round(e.remendo.y), w: Math.round(e.remendo.w), h: Math.round(e.remendo.h) },
      vis: Math.round(Number(e.vis) * 1000) / 1000,
    })),
    // caixa de cada brainrot na imagem A, presa na imagem (a figurinha do album e recortada daqui)
    personagens: (p.personagens || []).filter((f) => brainrot(String(f.id))).map((f) => {
      const x = Math.max(0, Math.round(f.caixa.x));
      const y = Math.max(0, Math.round(f.caixa.y));
      return { id: String(f.id), caixa: { x, y, w: Math.min(Math.round(f.caixa.w), Number(p.tam[0]) - x), h: Math.min(Math.round(f.caixa.h), Number(p.tam[1]) - y) } };
    }),
  };
  const erros = validarCena(cena);
  if (!brainrot(cena.prot)) erros.push(`protagonista fora do catalogo: ${cena.prot}`);
  const quer = errosDaCena(rot);
  if (cena.erros.length !== quer) erros.push(`${cena.erros.length} erros, o roteiro pede ${quer}`);
  if (erros.length) return { ok: false, erros };

  const pasta = join(PASTA_CENAS, id);
  await rm(pasta, { recursive: true, force: true });
  await mkdir(pasta, { recursive: true });
  const arquivos = [];
  await writeFile(join(pasta, 'a.webp'), bytesDe(p.a, 'image/webp'));
  arquivos.push(`src/arte/cenas/${id}/a.webp`);
  for (let i = 0; i < cena.erros.length; i++) {
    await writeFile(join(pasta, `d${i + 1}.webp`), bytesDe(p.erros[i].imagem, 'image/webp'));
    arquivos.push(`src/arte/cenas/${id}/d${i + 1}.webp`);
  }
  await writeFile(join(pasta, 'cena.json'), `${JSON.stringify(cena, null, 1)}\n`);
  arquivos.push(`src/arte/cenas/${id}/cena.json`);

  // folha de conferencia (A | B com os erros numerados): fica fora da build
  if (p.folha) {
    await mkdir(join(RAIZ, 'docs/cenas'), { recursive: true });
    await writeFile(join(RAIZ, `docs/cenas/${id}.png`), bytesDe(p.folha, 'image/png'));
    arquivos.push(`docs/cenas/${id}.png`);
  }

  // registro de origem: o que veio do Grok e o que o estudio fez (a Poki pode pedir)
  const arqOrigem = join(RAIZ, 'arte/origem.json');
  const origem = existsSync(arqOrigem) ? JSON.parse(await readFile(arqOrigem, 'utf8')) : {};
  let registro = null;
  try {
    registro = JSON.parse(await readFile(join(RAIZ, `arte/bruto/${id}/registro.json`), 'utf8'));
  } catch { /* ignora */ }
  origem[id] = {
    grok: registro,
    estudio: {
      data: new Date().toISOString().slice(0, 10),
      tam: cena.tam,
      remendos: (p.erros || []).map((e, i) => ({ id: `d${i + 1}`, fonte: e.fonte, vis: cena.erros[i].vis })),
      alinhamentos: p.alinhamentos || null,
      candidatas: Number(p.candidatas) || 0,
      pedidas: Number(p.pedidas) || 0,
      edicoes: 'base reduzida para 1024x768 e recodificada em WebP (sem EXIF); B montada com remendos de borda suave recortados das variantes alinhadas',
    },
  };
  await writeFile(arqOrigem, `${JSON.stringify(origem, null, 1)}\n`);
  const n = await gerarManifesto();
  return { ok: true, erros: [], arquivos: [...arquivos, `src/arte/cenas/manifesto.js (${n} cenas)`] };
}

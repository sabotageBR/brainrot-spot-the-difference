// Gera a thumb da Poki em 1256 e 628 px a partir das imagens do Grok em marketing/thumb/grok-*.jpg
// (prompt em docs/arte/thumb.md). Saida: marketing/thumb/<nome>-<tamanho>.png
// Uso: node tools/thumb.mjs [nomes...]   (padrao: todas as grok-* da pasta)
import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { servir, RAIZ } from './servir.mjs';

function chrome(args, ms) {
  return new Promise((ok) => {
    const p = spawn('google-chrome', args, { stdio: 'ignore' });
    const t = setTimeout(() => p.kill('SIGKILL'), ms);
    p.on('close', () => { clearTimeout(t); ok(); });
  });
}

const dir = join(RAIZ, 'marketing/thumb');
if (!existsSync(dir)) {
  process.stdout.write('sem marketing/thumb/\n');
  process.exit(1);
}
const todas = readdirSync(dir).filter((f) => /^grok-.*\.(jpe?g|png|webp)$/i.test(f));
const pedidas = process.argv.slice(2);
const fontes = pedidas.length ? todas.filter((f) => pedidas.some((p) => f.startsWith(p))) : todas;
const porta = 5408;
const fechar = await servir(porta);
for (const f of fontes) {
  const nome = f.replace(/\.[^.]+$/, '');
  for (const s of [1256, 628]) {
    const perfil = mkdtempSync(join(tmpdir(), 'b7-thumb-'));
    const arq = join(dir, `${nome}-${s}.png`);
    await chrome(['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
      `--user-data-dir=${perfil}`, `--window-size=${s},${s}`, '--virtual-time-budget=3000', `--screenshot=${arq}`,
      `http://127.0.0.1:${porta}/tools/thumb.html?src=/marketing/thumb/${f}&s=${s}`], 90000);
    rmSync(perfil, { recursive: true, force: true });
    process.stdout.write(`thumb ${nome} ${s} -> marketing/thumb/${nome}-${s}.png\n`);
  }
}
await fechar();

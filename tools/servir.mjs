// Servidor estatico minimo (sem dependencias) para o jogo, o laboratorio e o estudio.
// Uso direto: node tools/servir.mjs [porta]  (padrao 5400, so 127.0.0.1)
// Unica escrita: POST /__estudio, da pagina tools/estudio.html (grava a cena em src/arte/cenas/).
// GET /__bruto lista as entradas do Grok em arte/bruto/; POST /__decisao grava a escolha do laboratorio;
// POST /__curadoria grava a aprovacao do dono em arte/curadoria.json.
import { createServer } from 'node:http';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = fileURLToPath(new URL('..', import.meta.url));
export const PORTA_PADRAO = 5400;
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.woff2': 'font/woff2', '.webp': 'image/webp', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.md': 'text/plain; charset=utf-8',
};

/** Teto do POST do estudio (a base e os remendos vao inteiros, em base64). */
const LIMITE_ESTUDIO = 80 * 1024 * 1024;

/** @param {import('node:http').IncomingMessage} req */
async function lerCorpo(req) {
  const partes = [];
  let tam = 0;
  for await (const d of req) {
    tam += d.length;
    if (tam > LIMITE_ESTUDIO) throw new Error('pedido grande demais');
    partes.push(d);
  }
  return JSON.parse(Buffer.concat(partes).toString('utf8'));
}

/** @param {number} porta @returns {Promise<() => Promise<void>>} fecha o servidor */
export function servir(porta) {
  const srv = createServer(async (req, res) => {
    if (req.method === 'POST' && req.url === '/__estudio') {
      try {
        // sem cache: a ferramenta pode mudar com o servidor no ar
        const { salvarCena } = await import(`./estudio.mjs?v=${Date.now()}`);
        const r = await salvarCena(await lerCorpo(req));
        res.writeHead(r.ok ? 200 : 400, { 'content-type': 'application/json' });
        res.end(JSON.stringify(r));
      } catch (e) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: false, erros: [String(/** @type {Error} */ (e).message || e)] }));
      }
      return;
    }
    // escolha do laboratorio (modelos/laboratorio.html): grava docs/decisao.md
    if (req.method === 'POST' && req.url === '/__decisao') {
      try {
        const d = await lerCorpo(req);
        const modelo = String(d.modelo || '');
        const estilo = String(d.estilo || '');
        if (!/^m[1-4]$/.test(modelo) || !/^e[1-3]$/.test(estilo)) throw new Error('escolha invalida');
        const nota = String(d.nota || '').slice(0, 2000);
        await mkdir(join(RAIZ, 'docs'), { recursive: true });
        const quando = new Date().toISOString().replace('T', ' ').slice(0, 16);
        await writeFile(join(RAIZ, 'docs/decisao.md'), `# Escolha do laboratorio\n\n- Quando: ${quando}\n- Modelo: **${modelo}**\n- Estilo: **${estilo}**\n${nota ? `- Nota do dono: ${nota}\n` : ''}\n\`\`\`json\n${JSON.stringify({ modelo, estilo, nota }, null, 1)}\n\`\`\`\n`);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: false, erro: String(/** @type {Error} */ (e).message || e) }));
      }
      return;
    }
    // curadoria do dono (tools/curadoria.html): aprova ou pede para refazer uma cena
    if (req.method === 'POST' && req.url === '/__curadoria') {
      try {
        const d = await lerCorpo(req);
        const id = String(d.id || '');
        const status = String(d.status || '');
        if (!/^[a-z]+-\d{2}$/.test(id) || !['aprovada', 'refazer', ''].includes(status)) throw new Error('pedido invalido');
        const arq = join(RAIZ, 'arte/curadoria.json');
        let tudo = {};
        try {
          tudo = JSON.parse(await readFile(arq, 'utf8'));
        } catch { /* primeiro registro */ }
        if (status) tudo[id] = { status, nota: String(d.nota || '').slice(0, 2000), data: new Date().toISOString().slice(0, 16).replace('T', ' ') };
        else delete tudo[id];
        await writeFile(arq, `${JSON.stringify(tudo, null, 1)}\n`);
        res.writeHead(200, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ ok: false, erro: String(/** @type {Error} */ (e).message || e) }));
      }
      return;
    }
    // lista das entradas do Grok (arte/bruto/<id>/), para o estudio
    if (req.method === 'GET' && req.url === '/__bruto') {
      try {
        const base = join(RAIZ, 'arte/bruto');
        const ids = (await readdir(base, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name).sort();
        const lista = await Promise.all(ids.map(async (id) => ({ id, arquivos: (await readdir(join(base, id))).sort() })));
        res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-store' });
        res.end(JSON.stringify(lista));
      } catch (e) {
        res.writeHead(500, { 'content-type': 'application/json' });
        res.end(JSON.stringify({ erro: String(/** @type {Error} */ (e).message || e) }));
      }
      return;
    }
    try {
      const caminho = decodeURIComponent(new URL(req.url || '/', 'http://x').pathname);
      let arq = normalize(join(RAIZ, caminho));
      if (!arq.startsWith(resolve(RAIZ))) throw new Error('fora');
      if ((await stat(arq)).isDirectory()) arq = join(arq, 'index.html');
      const corpo = await readFile(arq);
      res.writeHead(200, { 'content-type': TIPOS[extname(arq).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
      res.end(corpo);
    } catch {
      res.writeHead(404);
      res.end('404');
    }
  });
  return new Promise((ok, falha) => {
    srv.once('error', falha);
    srv.listen(porta, '127.0.0.1', () => ok(() => new Promise((r) => srv.close(() => r()))));
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const porta = Number(process.argv[2]) || PORTA_PADRAO;
  await servir(porta);
  process.stdout.write(`Jogo em          http://127.0.0.1:${porta}/\n`);
  process.stdout.write(`Laboratorio em   http://127.0.0.1:${porta}/modelos/laboratorio.html\n`);
  process.stdout.write(`Estudio em       http://127.0.0.1:${porta}/tools/estudio.html\n`);
  process.stdout.write(`Curadoria em     http://127.0.0.1:${porta}/tools/curadoria.html\n`);
}

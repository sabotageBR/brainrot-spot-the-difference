// Liga tudo: portal, relogio, audio, palco, HUD, entrada, regras e progresso.
// O jogo e o modelo M2 (Colecao zen) com o pisca como poder, no estilo E2 (escolha do dono).
//
// Estado em J. J.fase: carregando -> jogando -> fim -> (anuncio) -> carregando...
// J.gen sobe a cada iniciarCena: todo callback assincrono guarda a geracao e desiste se mudou.
// Abre direto na cena da vez (sem menu): a primeira de todas tem a mao do tutorial.

import { portal } from './core/portal.js';
import { criarRelogio } from './core/relogio.js';
import { criarAudio } from './core/audio.js';
import { criarArmazem } from './core/armazenamento.js';
import { lerDepuracao } from './core/depuracao.js';
import { REGRAS } from './jogo/regras.js';
import { toleranciaImg } from './jogo/cena.js';
import { criarPartida, tocar, usarDica, usarPisca, estrelas, resumo, lugarEscondido, tocarEscondido } from './jogo/partida.js';
import { proximaCena, mapaDoJogo, ganharFigurinha, presenteDoDia, numeroDoNivel } from './jogo/progresso.js';
import { brainrot, mundo, vogaisDoCanto } from './jogo/catalogo.js';
import { CENAS } from './arte/cenas/manifesto.js';
import { montarCena, carregarImagem } from './render/compor.js';
import { criarPalco } from './render/palco.js';
import { criarHud, relogioTexto } from './ui/hud.js';
import { ligarEntrada } from './ui/entrada.js';
import { textos, comN } from './i18n/textos.js';

const VERSAO_SAVE = 2;
/** Cenas da sessao antes do primeiro intervalo comercial. */
const NIVEIS_SEM_INTERVALO = 3;
/** O pisca-poder troca A e B neste passo. */
const PISCA_PASSO = 380;
const COR_PRESENTE = '#5b3df5';

/** @typedef {import('./jogo/cena.js').Cena} Cena */

const dep = lerDepuracao();
const relogio = criarRelogio();
const agora = () => relogio.agora();
const audio = criarAudio();
const armazem = criarArmazem();
let lang = dep.lang;
try {
  lang = lang || navigator.language;
} catch { /* ignora */ }
const tx = textos(lang);
const hud = criarHud(tx);
const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('palco'));
const palco = criarPalco(canvas);

/** As cenas na ordem de jogo (o estudio grava o manifesto ja ordenado). @type {Cena[]} */
const LISTA = /** @type {any} */ (CENAS);

// ---------- save ----------
const CHAVE = 'save';
const saveVazio = () => ({
  v: VERSAO_SAVE,
  /** @type {Record<string, number>} id da cena -> melhores estrelas */
  feitas: {},
  /** @type {string[]} */
  douradas: [],
  /** @type {Record<string, import('./jogo/progresso.js').Figurinha>} */
  colecao: {},
  dia: { ultimo: '', seq: 0 },
  /** dicas guardadas do presente do dia */
  banco: 0,
  /** @type {number[]} mundos cuja faixa de entrada ja passou */
  mundosVistos: [],
  tutorial: false,
  mudo: false,
});
let save = saveVazio();
if (!dep.novo) {
  const s = armazem.ler(CHAVE, null);
  if (s && s.v === VERSAO_SAVE) save = { ...saveVazio(), ...s };
}
const gravar = () => {
  if (!dep.novo) armazem.gravar(CHAVE, save);
};

// ---------- estado ----------
const J = {
  fase: 'carregando',
  gen: 0,
  /** @type {Cena|null} */
  cena: null,
  /** @type {import('./jogo/partida.js').Partida|null} */
  p: null,
  /** @type {{ a: HTMLCanvasElement, b: HTMLCanvasElement }|null} */
  imgs: null,
  carregou: false,
  niveisNaSessao: 0,
  piscaAte: 0,
  /** @type {Map<string, CanvasImageSource>} imagem A por cena (recorte das figurinhas) */
  cacheA: new Map(),
  /** @type {Map<string, Promise<{ a: HTMLCanvasElement, b: HTMLCanvasElement }>>} a cena atual e a seguinte */
  precarga: new Map(),
  contador: 0,
  /** presente do dia para mostrar quando a primeira cena abrir */
  presente: 0,
};

const pasta = (/** @type {string} */ id) => `src/arte/cenas/${id}/`;
/** Joga sozinho (ms por acerto; 0 desliga): ?auto local ou o gancho dos testes do SDK. */
let autoMs = dep.auto;

/** @param {number} ms @param {() => void} fn */
function depois(ms, fn) {
  const g = J.gen;
  relogio.depois(ms, () => {
    if (g === J.gen) fn();
  });
}

/** @param {Cena} c */
function carregar(c) {
  let pr = J.precarga.get(c.id);
  if (!pr) {
    pr = montarCena(pasta(c.id), c);
    J.precarga.set(c.id, pr);
    pr.catch(() => J.precarga.delete(c.id));
  }
  return pr;
}

/** A cena que vem depois desta (a primeira ainda nao feita, contando esta como feita). @param {Cena} c */
const seguinteDe = (c) => proximaCena(LISTA, { ...save.feitas, [c.id]: 1 });

// ---------- layout ----------
function redimensionar() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  palco.redimensionar(w, h, Math.min(2.5, window.devicePixelRatio || 1));
  const l = palco.layout;
  document.documentElement.style.setProperty('--topo-h', `${l.topo.h}px`);
  document.documentElement.style.setProperty('--base-h', `${l.base.h}px`);
}
window.addEventListener('resize', redimensionar);
redimensionar();

// ---------- cena ----------
/** @param {Cena|null} cena */
async function iniciarCena(cena) {
  J.gen += 1;
  const g = J.gen;
  J.fase = 'carregando';
  hud.fecharPainel();
  hud.aviso('');
  palco.piscar(false, agora());
  if (!cena) {
    mostrarFim();
    return;
  }
  J.cena = cena;
  let imgs;
  try {
    imgs = await carregar(cena);
  } catch {
    if (g === J.gen) falhaDeCarga(cena);
    return;
  }
  if (g !== J.gen) return;
  J.imgs = imgs;
  J.cacheA.set(cena.id, imgs.a);
  const t = agora();
  J.p = criarPartida(cena, t);
  palco.definirCena(cena, imgs);
  palco.esconder(lugarEscondido(cena));
  const primeiraVez = !save.tutorial;
  // tutorial: a mao aponta o erro mais facil na primeira cena de todas
  if (primeiraVez && !autoMs) {
    const facil = [...cena.erros].sort((a, b) => b.vis - a.vis)[0];
    palco.mao(facil.id);
  }
  if (dep.revelar) palco.revelar();
  const m = mundo(cena.mundo);
  hud.iniciarCena(numeroDoNivel(cena), cena.erros.length, m.cor, true, cena.k === 10);
  hud.progresso(J.p);
  J.piscaAte = 0;
  atualizarBotoes();
  J.fase = 'jogando';
  if (!J.carregou) {
    J.carregou = true;
    portal.gameLoadingFinished();
  }
  anunciar(cena, primeiraVez);
  portal.measure('level', String(numeroDoNivel(cena)), 'start');
  // a proxima cena ja vem baixando; o resto sai da memoria
  const prox = seguinteDe(cena);
  for (const id of [...J.precarga.keys()]) if (id !== cena.id && (!prox || id !== prox.id)) J.precarga.delete(id);
  if (prox) carregar(prox).catch(() => {});
  if (autoMs) depois(autoMs, autoJogar);
}

/** Faixas e avisos do comeco da cena: mundo novo, chefe, presente do dia, o dourado. @param {Cena} cena @param {boolean} primeiraVez */
function anunciar(cena, primeiraVez) {
  const m = mundo(cena.mundo);
  if (!save.mundosVistos.includes(cena.mundo)) {
    save.mundosVistos = [...save.mundosVistos, cena.mundo];
    gravar();
    // o mundo 1 abre com a mao do tutorial: a faixa cobriria
    if (cena.mundo > 1) {
      hud.faixa(m.nome[/** @type {'en'} */ (tx.idioma)], comN(tx.mundo, cena.mundo), m.cor);
      audio.figurinha();
      return;
    }
  }
  if (cena.k === 10) {
    hud.faixa(tx.chefe, '', '#2A2238');
    return;
  }
  if (J.presente && !primeiraVez) {
    hud.faixa(`\u{1F381} ${tx.presente}`, `${comN(tx.diaN, save.dia.seq)} · ${comN(tx.dicasGanhas, J.presente)}`, COR_PRESENTE);
    J.presente = 0;
    return;
  }
  // a segunda cena da vida conta do dourado escondido
  if (Object.keys(save.feitas).length === 1 && !(cena.id in save.feitas)) {
    hud.aviso(`✨ ${tx.escondidoDica}`);
    depois(4200, () => hud.aviso(''));
  }
}

/** @param {Cena} cena */
function falhaDeCarga(cena) {
  J.fase = 'fim';
  hud.painel({
    titulo: tx.semCena,
    estrelas: 0,
    dados: [],
    figura: null,
    botoes: [{ texto: tx.tenteDeNovo, icone: '↻', acao: () => iniciarCena(cena) }],
  });
}

/** Todas as cenas feitas: parabens e o mapa para cacar os dourados. */
function mostrarFim() {
  J.fase = 'fim';
  hud.painel({
    titulo: tx.fim,
    texto: tx.fimSub,
    estrelas: 3,
    dados: [],
    figura: null,
    botoes: [{ texto: tx.mapa, icone: '\u{1F5FA}', acao: () => abrirMapa() }],
  });
}

// ---------- botoes ----------
function atualizarBotoes() {
  const p = J.p;
  if (!p) return;
  const comVideo = portal.sdkPronto || dep.local;
  // dica: as gratis (da cena + presente do dia) com o numero; sem nenhuma, o claquete do video
  const gratis = p.dicasLivres + save.banco;
  if (gratis > 0) hud.selo('bDica', String(gratis));
  else hud.selo('bDica', comVideo ? '\u{1F3AC}' : '', true);
  hud.mostrar('bDica', gratis > 0 || comVideo);
  if (p.piscasLivres > 0) hud.selo('bPisca', String(p.piscasLivres));
  else hud.selo('bPisca', comVideo ? '\u{1F3AC}' : '', true);
  hud.mostrar('bPisca', p.piscasLivres > 0 || comVideo);
  hud.classe('bPisca', 'ativo', J.piscaAte > 0);
  hud.mostrar('bZoom', palco.zoomado);
  hud.mostrar('bAlbum', true);
  hud.mostrar('bMapa', true);
  hud.classe('bSom', 'mudo', audio.mudo);
}

/** @param {number} t */
function statusHtml(t) {
  const p = J.p;
  if (!p) return '';
  if (p.combo >= 2 && t - p.ultimoAcerto <= REGRAS.janelaCombo) return `<span class="chip combo">x${p.combo}</span>`;
  return '';
}

// ---------- loop ----------
function quadro() {
  const t = agora();
  const p = J.p;
  if (p && J.fase === 'jogando' && J.piscaAte) {
    // pisca-poder: alterna A e B sozinho por alguns segundos
    if (t >= J.piscaAte) {
      J.piscaAte = 0;
      palco.piscar(false, t);
      atualizarBotoes();
    } else palco.piscar(Math.floor((J.piscaAte - t) / PISCA_PASSO) % 2 === 0, t);
  }
  if (p) hud.status(statusHtml(t));
  palco.desenhar(t);
  requestAnimationFrame(quadro);
}

// ---------- jogar ----------
function primeiroToque() {
  audio.iniciar();
  if (J.fase === 'jogando' && !portal.jogando) portal.gameplayStart();
}

/** @param {number} x @param {number} y */
function aoToque(x, y) {
  primeiroToque();
  const p = J.p;
  if (J.fase !== 'jogando' || !p || p.fim) return;
  const a = palco.alvo(x, y);
  if (!a) return;
  const t = agora();
  const tol = toleranciaImg(palco.pxPorCss(), p.cena.tam[0]);
  if (tocarEscondido(p, a.x, a.y, tol)) {
    palco.acharEscondido(t);
    audio.dourado();
    hud.ganho(tx.dourado, x, y, '#ffc21a');
    hud.progresso(p);
    portal.measure('golden', String(numeroDoNivel(p.cena)), 'found');
    return;
  }
  const ev = tocar(p, a.x, a.y, tol, t);
  if (ev.tipo === 'acerto') {
    palco.marcar(ev.id, t, false);
    audio.acerto(ev.combo);
    hud.progresso(p);
    if (!save.tutorial) {
      save.tutorial = true;
      palco.mao(null);
      gravar();
    }
    if (ev.fim === 'vitoria') vencer();
  } else if (ev.tipo === 'erro') {
    palco.errar(a.vista, a.x, a.y, t);
    audio.erro();
    if (ev.antispam) {
      palco.travar(t, p.travadoAte, tx.calma);
      audio.tonto();
    }
  } else if (ev.tipo === 'ja') audio.toc();
}

async function pedirDica() {
  primeiroToque();
  const p = J.p;
  if (J.fase !== 'jogando' || !p || p.fim) return;
  let id = null;
  if (p.dicasLivres > 0) id = usarDica(p, agora());
  else if (save.banco > 0) {
    save.banco -= 1;
    gravar();
    id = usarDica(p, agora(), true);
  } else {
    portal.measure('button', 'hint', 'interact');
    const g = J.gen;
    const ok = await video();
    if (g !== J.gen || !ok || !J.p || J.p.fim) return;
    id = usarDica(J.p, agora(), true);
  }
  if (!id || !J.p) return;
  palco.marcar(id, agora(), true);
  audio.dica();
  hud.progresso(J.p);
  atualizarBotoes();
  if (J.p.fim === 'vitoria') vencer();
}

/** Video recompensado. No localhost sem SDK o premio sai (testes). */
async function video() {
  if (!portal.sdkPronto) return dep.local;
  relogio.pausar(true);
  const ok = await portal.rewardedBreak();
  relogio.pausar(false);
  return ok === true;
}

async function pedirPisca() {
  primeiroToque();
  const p = J.p;
  if (J.fase !== 'jogando' || !p || p.fim || J.piscaAte) return;
  if (!usarPisca(p)) {
    portal.measure('button', 'blink', 'interact');
    const g = J.gen;
    const ok = await video();
    if (g !== J.gen || !ok || !J.p || J.p.fim || !usarPisca(J.p, true)) return;
  }
  J.piscaAte = agora() + REGRAS.piscaMs;
  audio.pisca();
  atualizarBotoes();
}

// ---------- fim da cena ----------
function vencer() {
  const p = J.p;
  const cena = J.cena;
  if (!p || !cena) return;
  J.fase = 'fim';
  const t = agora();
  portal.gameplayStop();
  portal.measure('level', String(numeroDoNivel(cena)), 'complete');
  J.piscaAte = 0;
  palco.piscar(false, t);
  palco.confete(t);
  audio.vitoria();
  const n = estrelas(p, t);
  save.feitas = { ...save.feitas, [cena.id]: Math.max(save.feitas[cena.id] || 0, n) };
  if (p.achouEscondido && !save.douradas.includes(cena.id)) save.douradas = [...save.douradas, cena.id];
  const g = ganharFigurinha(save.colecao, cena, p.achouEscondido);
  save.colecao = g.colecao;
  gravar();
  const pf = (cena.personagens || []).find((x) => x.id === g.id);
  const figura = {
    id: g.id,
    img: J.imgs ? J.imgs.a : null,
    caixa: pf ? pf.caixa : { x: 0, y: 0, w: cena.tam[0], h: cena.tam[1] },
    nova: g.nova,
    dourada: g.dourada,
    vezes: save.colecao[g.id].vezes,
  };
  const r = resumo(p, t);
  /** @type {[string, string][]} */
  const dados = [[tx.tempoGasto, relogioTexto(r.gastoMs)], [tx.erros, String(r.erros)], [tx.dourado.replace(/[!¡]/g, ''), p.achouEscondido ? '✨' : '?']];
  depois(900, () => {
    audio.figurinha();
    const b = brainrot(figura.id);
    if (b) depois(450, () => audio.cantar(vogaisDoCanto(b.canto)));
    // figurinha repetida: passa sozinho em 3 s; a nova espera o jogador olhar
    const passa = !figura.nova || !!autoMs;
    hud.painel({
      titulo: g.virouDourada && !g.nova ? tx.virouDourada : tx.vitoria,
      estrelas: n,
      dados,
      figura,
      botoes: [{ texto: tx.proximo, icone: '▶', acao: () => proximo(), barra: passa }],
    });
    if (passa) {
      const c = ++J.contador;
      depois(autoMs ? 600 : 3000, () => {
        if (c === J.contador && J.fase === 'fim') proximo();
      });
    }
  });
}

async function proximo() {
  if (J.fase !== 'fim' || !J.cena) return;
  J.contador += 1;
  J.fase = 'anuncio';
  hud.fecharPainel();
  J.niveisNaSessao += 1;
  if (J.niveisNaSessao >= NIVEIS_SEM_INTERVALO && !dep.semAnuncio) {
    relogio.pausar(true);
    await portal.commercialBreak();
    relogio.pausar(false);
  }
  iniciarCena(proximaCena(LISTA, save.feitas));
}

// ---------- album e mapa ----------
async function abrirAlbum() {
  audio.iniciar();
  const ids = new Set(Object.values(save.colecao).map((c) => c.cena));
  await Promise.all([...ids].filter((id) => !J.cacheA.has(id)).map(async (id) => {
    const c = LISTA.find((x) => x.id === id);
    if (!c) return;
    try {
      J.cacheA.set(id, await carregarImagem(pasta(id) + c.imagem));
    } catch { /* ignora */ }
  }));
  hud.album(save.colecao, (bid) => {
    const reg = save.colecao[bid];
    const c = reg && LISTA.find((x) => x.id === reg.cena);
    if (!c) return null;
    const f = (c.personagens || []).find((x) => x.id === bid);
    return { img: J.cacheA.get(c.id) || null, caixa: f ? f.caixa : { x: 0, y: 0, w: c.tam[0], h: c.tam[1] } };
  }, (bid) => {
    const b = brainrot(bid);
    if (b) audio.cantar(vogaisDoCanto(b.canto));
  });
}

function abrirMapa() {
  audio.iniciar();
  hud.mapa(mapaDoJogo(LISTA, save, J.fase === 'jogando' && J.cena ? J.cena.id : null), (id) => {
    const c = LISTA.find((x) => x.id === id);
    if (!c || J.fase === 'carregando' || J.fase === 'anuncio') return;
    iniciarCena(c);
  });
}

// ---------- auto (testes) ----------
function autoJogar() {
  const p = J.p;
  if (!p || p.fim || J.fase !== 'jogando') return;
  const e = p.cena.erros.find((x) => !p.achados.has(x.id));
  if (!e) return;
  const t = agora();
  const ev = tocar(p, e.elipse.cx, e.elipse.cy, 0, t);
  if (ev.tipo === 'acerto') {
    palco.marcar(ev.id, t, false);
    audio.acerto(ev.combo);
    hud.progresso(p);
    if (ev.fim === 'vitoria') {
      vencer();
      return;
    }
  }
  if (autoMs) depois(autoMs, autoJogar);
}

// ---------- ligar ----------
ligarEntrada(canvas, {
  inicio: () => primeiroToque(),
  toque: aoToque,
  arrastar: (dx, dy) => {
    if (palco.podeArrastar) palco.arrastar(dx, dy);
  },
  pinca: (x, y, f, dx, dy) => {
    palco.zoom(x, y, f);
    palco.arrastar(dx, dy);
    atualizarBotoes();
  },
  roda: (x, y, f) => {
    palco.zoom(x, y, f);
    atualizarBotoes();
  },
});

const botao = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.getElementById(id));
botao('bDica').addEventListener('click', () => pedirDica());
botao('bPisca').addEventListener('click', () => pedirPisca());
botao('bZoom').addEventListener('click', () => {
  palco.zerarZoom();
  atualizarBotoes();
});
botao('bSom').addEventListener('click', () => {
  audio.iniciar();
  audio.definirMudo(!audio.mudo);
  save.mudo = audio.mudo;
  gravar();
  atualizarBotoes();
});
botao('bAlbum').addEventListener('click', () => abrirAlbum());
botao('bMapa').addEventListener('click', () => abrirMapa());

portal.onAdStart = () => audio.mudoParaAnuncio();
portal.onAdEnd = () => audio.voltarDoAnuncio();
document.addEventListener('visibilitychange', () => audio.pausarAba(document.hidden));
if (!portal.sdkPronto && !dep.local) document.body.classList.add('sem-anuncio');
audio.definirMudo(!!save.mudo);

// presente do dia: so para quem ja jogou antes (o primeiro dia so marca a data)
{
  const hoje = dep.dia || relogio.hoje();
  if (!Object.keys(save.feitas).length) save.dia = { ultimo: hoje, seq: Math.max(1, save.dia.seq) };
  else {
    const r = presenteDoDia(save.dia, hoje);
    save.dia = r.dia;
    if (r.dicas) {
      save.banco += r.dicas;
      J.presente = r.dicas;
    }
  }
  gravar();
}

if (dep.ganchos) {
  /** @type {any} */ (window).__b7 = {
    J, palco, audio, relogio, portal,
    get save() {
      return save;
    },
    /** Toca no centro do erro i na ultima vista, como um dedo (prints e testes). */
    tocarErro(/** @type {number} */ i) {
      const p = J.p;
      if (!p) return false;
      const e = p.cena.erros[i];
      const q = palco.paraTela(palco.layout.vistas.length - 1, e.elipse.cx, e.elipse.cy);
      aoToque(q.x, q.y);
      return true;
    },
    /** Toca num ponto vazio (erro do jogador). */
    errar() {
      const v = palco.layout.vistas[0];
      aoToque(v.x + 3, v.y + 3);
    },
    /** Toca no dourado escondido. */
    acharDourado() {
      const p = J.p;
      if (!p) return false;
      const e = lugarEscondido(p.cena);
      const q = palco.paraTela(0, e.cx, e.cy);
      aoToque(q.x, q.y);
      return true;
    },
    /** Liga o jogo sozinho (testes do SDK). @param {number} ms */
    auto(ms) {
      autoMs = ms;
      if (J.fase === 'jogando') depois(ms, autoJogar);
      else if (J.fase === 'fim') proximo();
    },
    /** @param {string} id */
    irPara(id) {
      const c = LISTA.find((x) => x.id === id);
      if (c) iniciarCena(c);
    },
  };
}

const inicial = (dep.cena && LISTA.find((c) => c.id === dep.cena)) || proximaCena(LISTA, save.feitas);
portal.init().then(() => {
  atualizarBotoes();
  if (!LISTA.length) hud.aviso(tx.semCena);
  else iniciarCena(inicial);
});
requestAnimationFrame(quadro);

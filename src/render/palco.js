// O palco: desenha as vistas das imagens A e B no canvas, com a camera compartilhada
// (zoom e arrasto valem nas duas), as marcas de caneta, os X do erro, as particulas,
// o pisca, o brainrot dourado escondido e a mao do tutorial.
// O tempo vem de fora (relogio do jogo): nada aqui le o relogio.

import { calcularLayout, prenderCamera, telaParaImagem, imagemParaTela, dentro, zoomEm, escalaBase } from './layout.js';

const COR_MARCA = '#ff2d6f';
const COR_DICA = '#ffc21a';
const MARCA_MS = 340;
const XIS_MS = 650;
const TREMOR_MS = 320;
const PISCA_MS = 110;

/**
 * @typedef {import('./layout.js').Ret} Ret
 * @typedef {import('../jogo/cena.js').Cena} Cena
 * @typedef {{ id: string, t0: number, dica: boolean }} Marca
 * @typedef {{ x: number, y: number, vx: number, vy: number, t0: number, vida: number, cor: string, tam: number, giro: number }} Particula
 */

/** @param {HTMLCanvasElement} canvas */
export function criarPalco(canvas) {
  const ctx = /** @type {CanvasRenderingContext2D} */ (canvas.getContext('2d'));
  let w = 1;
  let h = 1;
  let dpr = 1;
  /** @type {Cena|null} */
  let cena = null;
  /** @type {{ a: HTMLCanvasElement, b: HTMLCanvasElement }|null} */
  let imgs = null;
  /** @type {ReturnType<typeof calcularLayout>} */
  let lay = calcularLayout({ w, h });
  let cam = { z: 1, cx: 512, cy: 384 };
  /** @type {Marca[]} */
  let marcas = [];
  /** @type {{ vista: number, x: number, y: number, t0: number }[]} */
  let xis = [];
  /** @type {Particula[]} */
  let parts = [];
  let tremorT0 = -1e9;
  let travadoAte = 0;
  let travadoDesde = 0;
  let piscando = false;
  let piscaT0 = -1e9;
  let revelarTudo = false;
  /** @type {{ cx: number, cy: number, r: number, achado: boolean, t0: number }|null} */
  let escondido = null;
  /** @type {string|null} */
  let maoEm = null;
  let textoTrava = 'Easy!';
  let seguro = { topo: 0, base: 0 };

  const W = () => (cena ? cena.tam[0] : 1024);
  const H = () => (cena ? cena.tam[1] : 768);

  function refazerLayout() {
    lay = calcularLayout({ w, h, seguro });
    cam = prenderCamera(cam, W(), H(), lay.vistas[0]);
  }

  /** escala tela/imagem na vista v */
  const escala = (/** @type {Ret} */ v) => escalaBase(v, W(), H()) * cam.z;

  // ---------- desenho ----------

  /**
   * @param {Ret} v @param {CanvasImageSource} img @param {number} [alfa]
   */
  function desenharImagem(v, img, alfa = 1) {
    const sw = v.w / escala(v);
    const sh = v.h / escala(v);
    ctx.globalAlpha = alfa;
    ctx.drawImage(img, cam.cx - sw / 2, cam.cy - sh / 2, sw, sh, v.x, v.y, v.w, v.h);
    ctx.globalAlpha = 1;
  }

  /** @param {Ret} v @param {number} r */
  function caminhoArredondado(v, r) {
    ctx.beginPath();
    ctx.roundRect(v.x, v.y, v.w, v.h, r);
  }

  /**
   * Elipse de caneta, desenhada aos poucos (p de 0 a 1), com tremidinha de mao.
   * @param {number} x @param {number} y @param {number} rx @param {number} ry @param {number} p
   * @param {string} cor @param {number} lw @param {number} semente
   */
  function caneta(x, y, rx, ry, p, cor, lw, semente) {
    const passos = 48;
    const fim = Math.max(0.001, p) * Math.PI * 2 * 1.08;
    const a0 = -Math.PI * 0.6 + semente;
    ctx.beginPath();
    for (let i = 0; i <= passos; i++) {
      const a = a0 + (fim * i) / passos;
      const k = 1 + 0.045 * Math.sin(3 * a + semente * 5) + 0.025 * (a - a0) / (Math.PI * 2);
      const px = x + Math.cos(a) * rx * k;
      const py = y + Math.sin(a) * ry * k;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.95)';
    ctx.lineWidth = lw + 3.5;
    ctx.stroke();
    ctx.strokeStyle = cor;
    ctx.lineWidth = lw;
    ctx.stroke();
  }

  /** @param {Ret} v @param {number} t */
  function desenharMarcas(v, t) {
    if (!cena) return;
    const esc = escala(v);
    const lw = Math.max(3, Math.min(6, v.w * 0.008));
    const lista = revelarTudo ? cena.erros.map((e) => marcas.find((m) => m.id === e.id) || { id: e.id, t0: -1e9, dica: false }) : marcas;
    for (const m of lista) {
      const e = cena.erros.find((x) => x.id === m.id);
      if (!e) continue;
      const c = imagemParaTela(v, cam, W(), H(), e.elipse.cx, e.elipse.cy);
      const pad = 8 / esc + 6;
      const p = Math.min(1, (t - m.t0) / MARCA_MS);
      const pop = p < 1 ? 1 + 0.25 * (1 - p) : 1;
      const semente = (e.id.charCodeAt(e.id.length - 1) % 7) * 0.37;
      if (m.dica && t - m.t0 < 1200) {
        // brilho da dica
        const k = (t - m.t0) / 1200;
        ctx.fillStyle = `rgba(255,214,60,${0.35 * (1 - k)})`;
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, (e.elipse.rx + pad) * esc * (1 + k * 0.6), (e.elipse.ry + pad) * esc * (1 + k * 0.6), 0, 0, Math.PI * 2);
        ctx.fill();
      }
      caneta(c.x, c.y, (e.elipse.rx + pad) * esc * pop, (e.elipse.ry + pad) * esc * pop, p, m.dica ? COR_DICA : COR_MARCA, lw, semente);
    }
  }

  /** @param {Ret} v @param {number} i @param {number} t */
  function desenharXis(v, i, t) {
    for (const x of xis) {
      if (x.vista !== i) continue;
      const k = (t - x.t0) / XIS_MS;
      if (k < 0 || k >= 1) continue;
      const c = imagemParaTela(v, cam, W(), H(), x.x, x.y);
      const s = 13 * (k < 0.15 ? 0.6 + (k / 0.15) * 0.6 : 1.2 - 0.2 * k);
      ctx.globalAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      ctx.lineCap = 'round';
      for (const [cor, lw] of [['#fff', 9], ['#ff3040', 5]]) {
        ctx.strokeStyle = /** @type {string} */ (cor);
        ctx.lineWidth = /** @type {number} */ (lw);
        ctx.beginPath();
        ctx.moveTo(c.x - s, c.y - s);
        ctx.lineTo(c.x + s, c.y + s);
        ctx.moveTo(c.x + s, c.y - s);
        ctx.lineTo(c.x - s, c.y + s);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  /**
   * O brainrot dourado: um Tung Tung Tung Sahur de ouro (tronco com olhos e bastao),
   * pequeno e meio apagado no meio da cena.
   * @param {Ret} v @param {number} t
   */
  function desenharDourado(v, t) {
    if (!escondido) return;
    const e = escondido;
    const c = imagemParaTela(v, cam, W(), H(), e.cx, e.cy);
    const r = e.r * escala(v);
    const brilho = 0.5 + 0.5 * Math.sin(t / 380);
    ctx.save();
    ctx.translate(c.x, c.y);
    if (e.achado) {
      const k = Math.min(1, (t - e.t0) / 700);
      ctx.globalAlpha = 1 - k;
      ctx.scale(1 + k * 1.5, 1 + k * 1.5);
    } else ctx.globalAlpha = 0.9;
    const g = ctx.createLinearGradient(-r, -r, r, r);
    g.addColorStop(0, '#fff3b0');
    g.addColorStop(0.45, '#ffcc33');
    g.addColorStop(1, '#b8760e');
    ctx.fillStyle = g;
    ctx.strokeStyle = '#7a4a05';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.lineCap = 'round';
    // pernas e bracos finos
    for (const [x0, y0, x1, y1] of [[-0.15, 0.55, -0.22, 0.95], [0.15, 0.55, 0.22, 0.95], [-0.32, 0.05, -0.62, 0.3], [0.32, 0.05, 0.6, -0.2]]) {
      ctx.beginPath();
      ctx.moveTo(x0 * r, y0 * r);
      ctx.lineTo(x1 * r, y1 * r);
      ctx.stroke();
    }
    // o bastao na mao direita
    ctx.save();
    ctx.translate(r * 0.6, -r * 0.2);
    ctx.rotate(0.5);
    ctx.beginPath();
    ctx.roundRect(-r * 0.07, -r * 0.65, r * 0.14, r * 0.7, r * 0.07);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    // o tronco
    ctx.beginPath();
    ctx.roundRect(-r * 0.34, -r * 0.95, r * 0.68, r * 1.55, r * 0.3);
    ctx.fill();
    ctx.stroke();
    // olhos e sorriso
    ctx.fillStyle = '#fff';
    for (const dx of [-0.13, 0.13]) {
      ctx.beginPath();
      ctx.arc(dx * r, -r * 0.5, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5a3604';
    for (const dx of [-0.11, 0.15]) {
      ctx.beginPath();
      ctx.arc(dx * r, -r * 0.48, r * 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, -r * 0.28, r * 0.14, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();
    // brilho que passa
    if (!e.achado && brilho > 0.92) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(-r * 0.12, -r * 0.7, r * 0.12 * (brilho - 0.92) * 12, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** @param {Ret} v @param {number} t */
  function desenharMao(v, t) {
    if (!cena || !maoEm) return;
    const e = cena.erros.find((x) => x.id === maoEm);
    if (!e) return;
    const c = imagemParaTela(v, cam, W(), H(), e.elipse.cx, e.elipse.cy);
    const k = (t % 1100) / 1100;
    const anel = Math.max(e.elipse.rx, e.elipse.ry) * escala(v) + 6 + 18 * k;
    ctx.strokeStyle = `rgba(255,255,255,${0.9 * (1 - k)})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(c.x, c.y, anel, 0, Math.PI * 2);
    ctx.stroke();
    const bob = Math.sin((t / 1100) * Math.PI * 2) * 6;
    ctx.font = `${Math.round(Math.max(30, v.w * 0.075))}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('\u{1F446}', c.x - 10, c.y + 8 + bob);
  }

  /** @param {number} t */
  function desenharParticulas(t) {
    parts = parts.filter((p) => t - p.t0 < p.vida);
    for (const p of parts) {
      const k = (t - p.t0) / 1000;
      const x = p.x + p.vx * k;
      const y = p.y + p.vy * k + 520 * k * k;
      ctx.save();
      ctx.globalAlpha = 1 - (t - p.t0) / p.vida;
      ctx.translate(x, y);
      ctx.rotate(p.giro * k);
      ctx.fillStyle = p.cor;
      ctx.fillRect(-p.tam / 2, -p.tam / 4, p.tam, p.tam / 2);
      ctx.restore();
    }
  }

  /** @param {Ret} v @param {number} t */
  function desenharTrava(v, t) {
    if (t >= travadoAte) return;
    const k = Math.min(1, (t - travadoDesde) / 150);
    ctx.fillStyle = `rgba(20,10,40,${0.45 * k})`;
    caminhoArredondado(v, 14);
    ctx.fill();
    const s = Math.min(v.w, v.h) * 0.22;
    ctx.save();
    ctx.translate(v.x + v.w / 2, v.y + v.h / 2);
    ctx.rotate(Math.sin(t / 90) * 0.12);
    ctx.font = `${Math.round(s)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('\u{1F974}', 0, -s * 0.25);
    ctx.font = `700 ${Math.round(s * 0.32)}px Fredoka, sans-serif`;
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#2a1050';
    ctx.strokeText(textoTrava, 0, s * 0.55);
    ctx.fillStyle = '#fff';
    ctx.fillText(textoTrava, 0, s * 0.55);
    ctx.restore();
  }

  /** @param {number} t */
  function desenhar(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    if (!imgs || !cena) return;
    const tremor = t - tremorT0 < TREMOR_MS ? Math.sin((t - tremorT0) / 22) * 7 * (1 - (t - tremorT0) / TREMOR_MS) : 0;
    const kPisca = Math.max(0, Math.min(1, (t - piscaT0) / PISCA_MS));
    const fracPisca = piscando ? kPisca : 1 - kPisca;
    lay.vistas.forEach((v0, i) => {
      const v = { ...v0, x: v0.x + tremor };
      // moldura
      ctx.save();
      ctx.shadowColor = 'rgba(30,10,60,0.35)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = '#fff';
      caminhoArredondado({ x: v.x - 4, y: v.y - 4, w: v.w + 8, h: v.h + 8 }, 16);
      ctx.fill();
      ctx.restore();
      ctx.save();
      caminhoArredondado(v, 12);
      ctx.clip();
      const normal = i === 0 ? imgs.a : imgs.b;
      const trocada = i === 0 ? imgs.b : imgs.a;
      desenharImagem(v, normal);
      if (fracPisca > 0) desenharImagem(v, trocada, fracPisca);
      desenharDourado(v, t);
      desenharMarcas(v, t);
      desenharXis(v, i, t);
      if (i === lay.vistas.length - 1) desenharMao(v, t);
      desenharTrava(v, t);
      ctx.restore();
    });
    desenharParticulas(t);
  }

  // ---------- estado e entrada ----------

  /** Vista e ponto da imagem sob o ponto da tela, ou null. */
  function alvo(/** @type {number} */ x, /** @type {number} */ y) {
    for (let i = 0; i < lay.vistas.length; i++) {
      const v = lay.vistas[i];
      if (dentro(v, x, y)) return { vista: i, ...telaParaImagem(v, cam, W(), H(), x, y) };
    }
    return null;
  }

  /**
   * Particulas de festa saindo do erro, nas duas vistas.
   * @param {string} id @param {number} t @param {number} [n]
   */
  function estourar(id, t, n = 14) {
    if (!cena) return;
    const e = cena.erros.find((x) => x.id === id);
    if (!e) return;
    const cores = ['#ff2d6f', '#ffc21a', '#2ee6a6', '#4db8ff', '#b46bff', '#fff'];
    for (const v of lay.vistas) {
      const c = imagemParaTela(v, cam, W(), H(), e.elipse.cx, e.elipse.cy);
      for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2 + (k % 3) * 0.3;
        const vel = 160 + (k % 5) * 45;
        parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * vel, vy: Math.sin(a) * vel - 120, t0: t, vida: 700 + (k % 4) * 90, cor: cores[k % cores.length], tam: 7 + (k % 3) * 3, giro: (k % 2 ? 1 : -1) * (6 + k) });
      }
    }
  }

  /** Confete na tela inteira (vitoria). @param {number} t */
  function confete(t) {
    const cores = ['#ff2d6f', '#ffc21a', '#2ee6a6', '#4db8ff', '#b46bff', '#fff'];
    for (let k = 0; k < 90; k++) {
      const x = (w * ((k * 37) % 100)) / 100;
      parts.push({ x, y: -20 - (k % 9) * 14, vx: ((k % 7) - 3) * 30, vy: 60 + (k % 5) * 40, t0: t + (k % 10) * 40, vida: 2200, cor: cores[k % cores.length], tam: 8 + (k % 4) * 3, giro: (k % 2 ? 1 : -1) * (3 + (k % 6)) });
    }
  }

  return {
    desenhar,
    alvo,
    /** @param {Cena} c @param {{ a: HTMLCanvasElement, b: HTMLCanvasElement }} i */
    definirCena(c, i) {
      cena = c;
      imgs = i;
      cam = { z: 1, cx: c.tam[0] / 2, cy: c.tam[1] / 2 };
      // o layout (e a camera presa nele) vem antes de qualquer desenho
      lay = calcularLayout({ w, h, seguro });
      marcas = [];
      xis = [];
      parts = [];
      travadoAte = 0;
      piscando = false;
      piscaT0 = -1e9;
      escondido = null;
      maoEm = null;
      revelarTudo = false;
      refazerLayout();
    },
    /** @param {number} nw @param {number} nh @param {number} ndpr @param {{ topo: number, base: number }} [nseguro] */
    redimensionar(nw, nh, ndpr, nseguro) {
      w = nw;
      h = nh;
      dpr = ndpr;
      if (nseguro) seguro = nseguro;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      refazerLayout();
    },
    get layout() {
      return lay;
    },
    /** Quantos px da imagem cabem num px CSS, com o zoom (para a tolerancia do toque). */
    pxPorCss() {
      return 1 / escala(lay.vistas[0]);
    },
    /** A vista nao mostra a imagem inteira (zoom): arrastar move a camera. */
    get podeArrastar() {
      const v = lay.vistas[0];
      return v.w / escala(v) < W() - 1 || v.h / escala(v) < H() - 1;
    },
    /** Ponto da imagem -> tela na vista i (ganchos de teste). @param {number} i @param {number} x @param {number} y */
    paraTela(i, x, y) {
      return imagemParaTela(lay.vistas[i], cam, W(), H(), x, y);
    },
    /** @param {string} id @param {number} t @param {boolean} dica */
    marcar(id, t, dica) {
      if (marcas.some((m) => m.id === id)) return;
      marcas.push({ id, t0: t, dica });
      estourar(id, t, dica ? 8 : 14);
    },
    /** @param {number} vista @param {number} x @param {number} y @param {number} t */
    errar(vista, x, y, t) {
      xis.push({ vista, x, y, t0: t });
      if (xis.length > 8) xis.shift();
      tremorT0 = t;
    },
    /** @param {number} desde @param {number} ate @param {string} texto */
    travar(desde, ate, texto) {
      travadoDesde = desde;
      travadoAte = ate;
      textoTrava = texto;
    },
    /** @param {boolean} on @param {number} t */
    piscar(on, t) {
      if (on === piscando) return;
      // retoma a transicao de onde estava, sem salto
      const k = Math.max(0, Math.min(1, (t - piscaT0) / PISCA_MS));
      piscaT0 = t - (1 - k) * PISCA_MS;
      piscando = on;
    },
    get piscando() {
      return piscando;
    },
    /** @param {number} x @param {number} y @param {number} fator (px CSS) */
    zoom(x, y, fator) {
      const v = lay.vistas.find((r) => dentro(r, x, y)) || lay.vistas[0];
      cam = zoomEm(v, cam, W(), H(), x, y, fator);
    },
    /** @param {number} dx @param {number} dy (px CSS) */
    arrastar(dx, dy) {
      const esc = escala(lay.vistas[0]);
      cam = prenderCamera({ z: cam.z, cx: cam.cx - dx / esc, cy: cam.cy - dy / esc }, W(), H(), lay.vistas[0]);
    },
    zerarZoom() {
      cam = prenderCamera({ z: 1, cx: cam.cx, cy: cam.cy }, W(), H(), lay.vistas[0]);
    },
    get zoomado() {
      return cam.z > 1.01;
    },
    /** @param {{ cx: number, cy: number, r: number }|null} pos */
    esconder(pos) {
      escondido = pos ? { ...pos, achado: false, t0: 0 } : null;
    },
    /** @param {number} t */
    acharEscondido(t) {
      if (escondido) {
        escondido.achado = true;
        escondido.t0 = t;
      }
    },
    /** @param {string|null} id */
    mao(id) {
      maoEm = id;
    },
    revelar() {
      revelarTudo = true;
    },
    confete,
  };
}

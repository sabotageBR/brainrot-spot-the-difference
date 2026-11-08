// Nucleo do estudio de diferencas: processamento puro sobre RGBA (Uint8ClampedArray),
// sem DOM. Roda no navegador (tools/estudio.js) e no Node (test/estudio.test.js).
//
// O Grok redesenha a imagem inteira a cada edicao: a variante bate com A no enquadramento,
// mas todo contorno ganha um "fantasma" fino (diferenca media de 7 a 11 em 255). Por isso:
//   1. alinha a variante a A (deslocamento e escala pequenos);
//   2. borra as duas e mede a diferenca por pixel;
//   3. limiar + abertura (erode e dilata): linhas finas somem, manchas solidas ficam;
//   4. componentes conexos viram candidatas, com nota de visibilidade.

/** @typedef {{ x: number, y: number, w: number, h: number }} Caixa */
/** @typedef {{ id: number, ids: number[], x: number, y: number, w: number, h: number, area: number, media: number, vis: number, delta?: number[] }} Mancha */

/** @param {Uint8ClampedArray} rgba @param {number} n pixels */
export function cinza(rgba, n) {
  const g = new Float32Array(n);
  for (let i = 0; i < n; i++) g[i] = 0.299 * rgba[i * 4] + 0.587 * rgba[i * 4 + 1] + 0.114 * rgba[i * 4 + 2];
  return g;
}

/**
 * Reduz um mapa de cinza por fator inteiro (media dos blocos).
 * @param {Float32Array} g @param {number} w @param {number} h @param {number} f
 */
export function reduzir(g, w, h, f) {
  const rw = Math.floor(w / f);
  const rh = Math.floor(h / f);
  const out = new Float32Array(rw * rh);
  for (let y = 0; y < rh; y++) {
    for (let x = 0; x < rw; x++) {
      let s = 0;
      for (let yy = 0; yy < f; yy++) for (let xx = 0; xx < f; xx++) s += g[(y * f + yy) * w + x * f + xx];
      out[y * rw + x] = s / (f * f);
    }
  }
  return { g: out, w: rw, h: rh };
}

/**
 * Amostra bilinear de um canal de cinza no ponto (x, y); fora da imagem devolve -1.
 * @param {Float32Array} g @param {number} w @param {number} h @param {number} x @param {number} y
 */
function amostraCinza(g, w, h, x, y) {
  if (x < 0 || y < 0 || x > w - 1 || y > h - 1) return -1;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(w - 1, x0 + 1);
  const y1 = Math.min(h - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;
  const a = g[y0 * w + x0] * (1 - fx) + g[y0 * w + x1] * fx;
  const b = g[y1 * w + x0] * (1 - fx) + g[y1 * w + x1] * fx;
  return a * (1 - fy) + b * fy;
}

/**
 * Erro de alinhamento: media do |A - V(transformada)|, com teto por pixel (as mudancas
 * de verdade nao podem puxar o alinhamento). Transformacao: escala s em torno do centro e
 * deslocamento (dx, dy): pA = c + s * (pV - c) + d  =>  pV = c + (pA - c - d) / s.
 * @param {{ g: Float32Array, w: number, h: number }} A @param {{ g: Float32Array, w: number, h: number }} V
 * @param {number} dx @param {number} dy @param {number} s @param {number} [passo]
 */
export function erroAlinhamento(A, V, dx, dy, s, passo = 1) {
  const cx = A.w / 2;
  const cy = A.h / 2;
  let soma = 0;
  let n = 0;
  for (let y = 4; y < A.h - 4; y += passo) {
    for (let x = 4; x < A.w - 4; x += passo) {
      const vx = cx + (x - cx - dx) / s;
      const vy = cy + (y - cy - dy) / s;
      const v = amostraCinza(V.g, V.w, V.h, vx, vy);
      if (v < 0) continue;
      soma += Math.min(40, Math.abs(A.g[y * A.w + x] - v));
      n++;
    }
  }
  return n ? soma / n : Infinity;
}

/**
 * Melhor deslocamento e escala de V sobre A. Busca grossa em 1/4 e fina na escala cheia.
 * @param {Float32Array} gA @param {Float32Array} gV @param {number} w @param {number} h
 * @returns {{ dx: number, dy: number, s: number, erro: number }}
 */
export function alinhar(gA, gV, w, h) {
  const f = 4;
  const A4 = reduzir(gA, w, h, f);
  const V4 = reduzir(gV, w, h, f);
  let melhor = { dx: 0, dy: 0, s: 1, erro: erroAlinhamento(A4, V4, 0, 0, 1) };
  for (const s of [0.97, 0.98, 0.99, 1, 1.01, 1.02, 1.03]) {
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const e = erroAlinhamento(A4, V4, dx, dy, s, 2);
        if (e < melhor.erro) melhor = { dx, dy, s, erro: e };
      }
    }
  }
  // refina em px cheios, com meio px de passo e escala fina
  const A1 = { g: gA, w, h };
  const V1 = { g: gV, w, h };
  let fino = { dx: melhor.dx * f, dy: melhor.dy * f, s: melhor.s, erro: Infinity };
  fino.erro = erroAlinhamento(A1, V1, fino.dx, fino.dy, fino.s, 3);
  for (const ds of [-0.004, -0.002, 0, 0.002, 0.004]) {
    for (let ddy = -3; ddy <= 3; ddy += 0.5) {
      for (let ddx = -3; ddx <= 3; ddx += 0.5) {
        const c = { dx: melhor.dx * f + ddx, dy: melhor.dy * f + ddy, s: melhor.s + ds };
        const e = erroAlinhamento(A1, V1, c.dx, c.dy, c.s, 3);
        if (e < fino.erro) fino = { ...c, erro: e };
      }
    }
  }
  return fino;
}

/**
 * Aplica o alinhamento a variante (RGBA bilinear). Fora da imagem copia A.
 * @param {Uint8ClampedArray} rgbaV @param {Uint8ClampedArray} rgbaA @param {number} w @param {number} h
 * @param {{ dx: number, dy: number, s: number }} t
 */
export function transformar(rgbaV, rgbaA, w, h, t) {
  const out = new Uint8ClampedArray(w * h * 4);
  const cx = w / 2;
  const cy = h / 2;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const o = (y * w + x) * 4;
      const vx = cx + (x - cx - t.dx) / t.s;
      const vy = cy + (y - cy - t.dy) / t.s;
      if (vx < 0 || vy < 0 || vx > w - 1 || vy > h - 1) {
        out[o] = rgbaA[o];
        out[o + 1] = rgbaA[o + 1];
        out[o + 2] = rgbaA[o + 2];
        out[o + 3] = 255;
        continue;
      }
      const x0 = Math.floor(vx);
      const y0 = Math.floor(vy);
      const x1 = Math.min(w - 1, x0 + 1);
      const y1 = Math.min(h - 1, y0 + 1);
      const fx = vx - x0;
      const fy = vy - y0;
      for (let k = 0; k < 3; k++) {
        const a = rgbaV[(y0 * w + x0) * 4 + k] * (1 - fx) + rgbaV[(y0 * w + x1) * 4 + k] * fx;
        const b = rgbaV[(y1 * w + x0) * 4 + k] * (1 - fx) + rgbaV[(y1 * w + x1) * 4 + k] * fx;
        out[o + k] = a * (1 - fy) + b * fy;
      }
      out[o + 3] = 255;
    }
  }
  return out;
}

/**
 * Borrao de caixa separavel num canal (Float32), raio r.
 * @param {Float32Array} c @param {number} w @param {number} h @param {number} r
 */
export function borrar(c, w, h, r) {
  if (r <= 0) return c;
  const tmp = new Float32Array(w * h);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    let s = 0;
    for (let x = -r; x <= r; x++) s += c[y * w + Math.max(0, Math.min(w - 1, x))];
    for (let x = 0; x < w; x++) {
      tmp[y * w + x] = s / (2 * r + 1);
      s += c[y * w + Math.min(w - 1, x + r + 1)] - c[y * w + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0;
    for (let y = -r; y <= r; y++) s += tmp[Math.max(0, Math.min(h - 1, y)) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = s / (2 * r + 1);
      s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
  return out;
}

/**
 * Diferenca por pixel (0..255): o maior canal de |A - V| depois de borrar as duas.
 * @param {Uint8ClampedArray} rgbaA @param {Uint8ClampedArray} rgbaV @param {number} w @param {number} h @param {number} [r]
 */
export function mapaDiferenca(rgbaA, rgbaV, w, h, r = 2) {
  const n = w * h;
  const d = new Float32Array(n);
  const canais = [0, 1, 2].map((k) => {
    const a = new Float32Array(n);
    const v = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      a[i] = rgbaA[i * 4 + k];
      v[i] = rgbaV[i * 4 + k];
    }
    return [borrar(a, w, h, r), borrar(v, w, h, r)];
  });
  for (let i = 0; i < n; i++) {
    let m = 0;
    for (const [a, v] of canais) m = Math.max(m, Math.abs(a[i] - v[i]));
    d[i] = m;
  }
  return d;
}

/**
 * Erosao ou dilatacao quadrada de raio r numa mascara 0/1 (separavel).
 * @param {Uint8Array} m @param {number} w @param {number} h @param {number} r @param {boolean} dilatar
 */
export function morfologia(m, w, h, r, dilatar) {
  const alvo = dilatar ? 1 : 0;
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = dilatar ? 0 : 1;
      for (let k = -r; k <= r; k++) {
        const xx = x + k;
        if (xx < 0 || xx >= w) continue;
        if (m[y * w + xx] === alvo) {
          v = alvo;
          break;
        }
      }
      tmp[y * w + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = dilatar ? 0 : 1;
      for (let k = -r; k <= r; k++) {
        const yy = y + k;
        if (yy < 0 || yy >= h) continue;
        if (tmp[yy * w + x] === alvo) {
          v = alvo;
          break;
        }
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

/**
 * Componentes conexos (8 vizinhos) da mascara. Devolve o mapa de rotulos e as manchas.
 * Com as duas imagens, cada mancha leva tambem a mudanca de cor media (delta = V - A).
 * @param {Uint8Array} m @param {Float32Array} d mapa de diferenca (para a media)
 * @param {number} w @param {number} h
 * @param {Uint8ClampedArray|null} [rgbaA] @param {Uint8ClampedArray|null} [rgbaV]
 */
export function componentes(m, d, w, h, rgbaA = null, rgbaV = null) {
  const rot = new Int32Array(w * h);
  /** @type {Mancha[]} */
  const manchas = [];
  const pilha = new Int32Array(w * h);
  let prox = 0;
  for (let i = 0; i < w * h; i++) {
    if (!m[i] || rot[i]) continue;
    prox += 1;
    let topo = 0;
    pilha[topo++] = i;
    rot[i] = prox;
    let x0 = w;
    let y0 = h;
    let x1 = 0;
    let y1 = 0;
    let area = 0;
    let soma = 0;
    const dl = [0, 0, 0];
    while (topo) {
      const p = pilha[--topo];
      const px = p % w;
      const py = (p - px) / w;
      area++;
      soma += d[p];
      if (rgbaA && rgbaV) for (let k = 0; k < 3; k++) dl[k] += rgbaV[p * 4 + k] - rgbaA[p * 4 + k];
      if (px < x0) x0 = px;
      if (py < y0) y0 = py;
      if (px > x1) x1 = px;
      if (py > y1) y1 = py;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          const nx = px + ox;
          const ny = py + oy;
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
          const q = ny * w + nx;
          if (m[q] && !rot[q]) {
            rot[q] = prox;
            pilha[topo++] = q;
          }
        }
      }
    }
    manchas.push({ id: prox, ids: [prox], x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1, area, media: soma / area, vis: 0, delta: dl.map((v) => v / area) });
  }
  return { rot, manchas };
}

/**
 * Visibilidade 0..1: contraste medio x tamanho. Uma troca de cor forte num objeto de
 * 8% da largura vale perto de 1; um detalhe palido e pequeno, perto de 0.
 * @param {Mancha} m @param {number} W @param {number} H
 */
export function visibilidade(m, W, H) {
  const contraste = Math.min(1, (m.media / 255) * 2.2);
  const tamanho = Math.min(1, Math.sqrt(m.area / (W * H)) / 0.07);
  return Math.round(contraste * tamanho * 1000) / 1000;
}

/**
 * Detecta as candidatas de uma variante ja alinhada.
 * @param {Uint8ClampedArray} rgbaA @param {Uint8ClampedArray} rgbaV @param {number} w @param {number} h
 * @param {{ limiar?: number, abertura?: number, areaMin?: number, juntar?: number }} [o]
 */
export function detectar(rgbaA, rgbaV, w, h, { limiar = 42, abertura = 3, areaMin = 0.0012, juntar = 70 } = {}) {
  const d = mapaDiferenca(rgbaA, rgbaV, w, h, 2);
  const m = new Uint8Array(w * h);
  let acima = 0;
  for (let i = 0; i < w * h; i++) {
    if (d[i] >= limiar) {
      m[i] = 1;
      acima++;
    }
  }
  // abertura: some o fantasma fino dos contornos; o fechamento junta pedacos da mesma mudanca
  let a = morfologia(morfologia(m, w, h, abertura, false), w, h, abertura, true);
  a = morfologia(morfologia(a, w, h, 6, true), w, h, 6, false);
  const { rot, manchas: cruas } = componentes(a, d, w, h, rgbaA, rgbaV);
  const manchas = fundir(cruas, juntar, w);
  const minimo = areaMin * w * h;
  const boas = manchas.filter((x) => x.area >= minimo).map((x) => ({ ...x, vis: visibilidade(x, w, h) }));
  boas.sort((p, q) => q.vis - p.vis);
  return { d, rot, manchas: boas, fracaoAcima: acima / (w * h) };
}

/** Folga entre duas caixas (0 se encostam ou se cruzam). */
const folga = (/** @type {Caixa} */ a, /** @type {Caixa} */ b) => Math.max(0, Math.max(a.x, b.x) - Math.min(a.x + a.w, b.x + b.w), Math.max(a.y, b.y) - Math.min(a.y + a.h, b.y + b.h));

/** Quanto a caixa unida cresce sobre a soma das duas caixas (1 = nada de vazio). */
function inchaco(/** @type {Caixa} */ a, /** @type {Caixa} */ b) {
  const w = Math.max(a.x + a.w, b.x + b.w) - Math.min(a.x, b.x);
  const h = Math.max(a.y + a.h, b.y + b.h) - Math.min(a.y, b.y);
  return (w * h) / (a.w * a.h + b.w * b.h);
}

/**
 * Junta manchas proximas: os dois tenis trocados de cor sao uma diferenca so, nao duas.
 * Junta so quando a caixa unida nao fica cheia de vazio (INCHACO_MAX): o laco da bailarina
 * e o gato na cadeira ao lado continuam dois erros.
 * @param {Mancha[]} manchas @param {number} dist @param {number} [W] largura da imagem
 * @returns {Mancha[]}
 */
export function fundir(manchas, dist, W = 1024) {
  const INCHACO_MAX = 2.5;
  const LADO_MAX = 0.2 * W;
  /** As duas mudaram a cor do mesmo jeito (tenis azul -> vermelho com tenis azul -> vermelho)? */
  const mesmaMudanca = (/** @type {Mancha} */ a, /** @type {Mancha} */ b) => {
    if (!a.delta || !b.delta) return true;
    const pa = Math.hypot(...a.delta);
    const pb = Math.hypot(...b.delta);
    if (pa < 1 || pb < 1) return false;
    const cos = (a.delta[0] * b.delta[0] + a.delta[1] * b.delta[1] + a.delta[2] * b.delta[2]) / (pa * pb);
    return cos >= 0.8 && Math.max(pa, pb) / Math.min(pa, pb) <= 2.2;
  };
  /** @type {Mancha[]} */
  let grupos = manchas.map((m) => ({ ...m, ids: [...m.ids] }));
  for (let mudou = true; mudou;) {
    mudou = false;
    let melhor = null;
    for (let i = 0; i < grupos.length; i++) {
      for (let j = i + 1; j < grupos.length; j++) {
        const f = folga(grupos[i], grupos[j]);
        if (f > dist || inchaco(grupos[i], grupos[j]) > INCHACO_MAX || !mesmaMudanca(grupos[i], grupos[j])) continue;
        const lw = Math.max(grupos[i].x + grupos[i].w, grupos[j].x + grupos[j].w) - Math.min(grupos[i].x, grupos[j].x);
        const lh = Math.max(grupos[i].y + grupos[i].h, grupos[j].y + grupos[j].h) - Math.min(grupos[i].y, grupos[j].y);
        if (Math.max(lw, lh) > LADO_MAX) continue;
        if (!melhor || f < melhor.f) melhor = { i, j, f };
      }
    }
    if (!melhor) break;
    const a = grupos[melhor.i];
    const b = grupos[melhor.j];
    const x0 = Math.min(a.x, b.x);
    const y0 = Math.min(a.y, b.y);
    /** @type {Mancha} */
    const u = {
      id: a.id,
      ids: [...a.ids, ...b.ids],
      x: x0,
      y: y0,
      w: Math.max(a.x + a.w, b.x + b.w) - x0,
      h: Math.max(a.y + a.h, b.y + b.h) - y0,
      area: a.area + b.area,
      media: (a.media * a.area + b.media * b.area) / (a.area + b.area),
      vis: 0,
      delta: a.delta && b.delta ? a.delta.map((v, k) => (v * a.area + /** @type {number[]} */ (b.delta)[k] * b.area) / (a.area + b.area)) : undefined,
    };
    grupos = grupos.filter((_, k) => k !== melhor.i && k !== melhor.j);
    grupos.push(u);
    mudou = true;
  }
  return grupos;
}

/** Elipse que cobre a caixa da mancha, com folga para o dedo e para a borda suave. */
export function elipseDe(/** @type {Caixa} */ c) {
  return {
    cx: Math.round(c.x + c.w / 2),
    cy: Math.round(c.y + c.h / 2),
    rx: Math.round(c.w * 0.55 + 6),
    ry: Math.round(c.h * 0.55 + 6),
  };
}

/**
 * Escolha automatica: as melhores candidatas que nao se sobrepoem, nao encostam na borda,
 * nao sao gigantes e ficam espalhadas (penalidade para duas no mesmo terco da imagem).
 * @param {(Mancha & { fonte?: number })[]} cands @param {number} n @param {number} W @param {number} H
 * @param {Caixa[]} [personagens] caixas dos brainrots: mudanca neles vale mais (e o que o publico reconhece)
 */
export function escolherAuto(cands, n, W, H, personagens = []) {
  const noPersonagem = (/** @type {Mancha} */ c) => personagens.some((p) => {
    const cx = c.x + c.w / 2;
    const cy = c.y + c.h / 2;
    return cx >= p.x && cx <= p.x + p.w && cy >= p.y && cy <= p.y + p.h;
  });
  const margem = 0.015 * W;
  const ok = cands.filter((c) => {
    const e = elipseDe(c);
    if (e.cx < margem || e.cy < margem || e.cx > W - margem || e.cy > H - margem) return false;
    return c.area <= 0.05 * W * H && c.vis >= 0.05;
  });
  /** @type {typeof cands} */
  const escolhidas = [];
  const ocupado = new Map();
  const restantes = [...ok];
  while (escolhidas.length < n && restantes.length) {
    let melhorI = -1;
    let melhorNota = -Infinity;
    restantes.forEach((c, i) => {
      const e = elipseDe(c);
      // duas mudancas nao podem dividir a mesma area: caixas separadas por 8 px, e o centro
      // de uma fora da elipse da outra (mesma regra do validarCena)
      const bate = escolhidas.some((x) => {
        const f = elipseDe(x);
        const sep = Math.max(c.x - (x.x + x.w), x.x - (c.x + c.w), c.y - (x.y + x.h), x.y - (c.y + c.h));
        const dentroDe = (/** @type {any} */ p, /** @type {any} */ q) => ((p.cx - q.cx) / q.rx) ** 2 + ((p.cy - q.cy) / q.ry) ** 2 <= 1;
        return sep < 8 || dentroDe(e, f) || dentroDe(f, e);
      });
      if (bate) return;
      const celula = `${Math.min(2, Math.floor((3 * e.cx) / W))},${Math.min(2, Math.floor((3 * e.cy) / H))}`;
      const nota = c.vis - 0.18 * (ocupado.get(celula) || 0) + (noPersonagem(c) ? 0.2 : 0);
      if (nota > melhorNota) {
        melhorNota = nota;
        melhorI = i;
      }
    });
    if (melhorI < 0) break;
    const c = restantes.splice(melhorI, 1)[0];
    const e = elipseDe(c);
    const celula = `${Math.min(2, Math.floor((3 * e.cx) / W))},${Math.min(2, Math.floor((3 * e.cy) / H))}`;
    ocupado.set(celula, (ocupado.get(celula) || 0) + 1);
    escolhidas.push(c);
  }
  return escolhidas;
}

/**
 * Alfa suave do remendo: a mascara da mancha (rotulos ids) dilatada e borrada, recortada na caixa.
 * @param {Int32Array} rot @param {number[]} ids @param {number} w @param {number} h @param {Caixa} cx
 * @param {number} [dil] @param {number} [suave]
 */
export function alfaRemendo(rot, ids, w, h, cx, dil = 5, suave = 4) {
  const quais = new Set(ids);
  const m = new Uint8Array(cx.w * cx.h);
  for (let y = 0; y < cx.h; y++) for (let x = 0; x < cx.w; x++) if (quais.has(rot[(cx.y + y) * w + cx.x + x])) m[y * cx.w + x] = 1;
  const md = morfologia(m, cx.w, cx.h, dil, true);
  const f = new Float32Array(cx.w * cx.h);
  for (let i = 0; i < f.length; i++) f[i] = md[i];
  const b = borrar(f, cx.w, cx.h, suave);
  return b;
}

/**
 * Caixa do remendo: a da mancha com folga, presa na imagem.
 * @param {Caixa} c @param {number} W @param {number} H @param {number} [folga]
 */
export function caixaRemendo(c, W, H, folga = 12) {
  const x = Math.max(0, c.x - folga);
  const y = Math.max(0, c.y - folga);
  return { x, y, w: Math.min(W, c.x + c.w + folga) - x, h: Math.min(H, c.y + c.h + folga) - y };
}

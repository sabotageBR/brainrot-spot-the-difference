// Gestos no canvas: toque (palpite), arrasto (pan ou lupa), pinca e roda (zoom).
// Um toque so vale como palpite se o dedo quase nao andou e nao virou pinca: assim,
// arrastar ou dar zoom nunca gasta um erro do jogador.
// O tempo do gesto vem do proprio evento (timeStamp), nao do relogio do jogo.

const MOVE_TOQUE = 10;
const TOQUE_MAX_MS = 650;

/**
 * @param {HTMLElement} alvo
 * @param {{
 *   toque: (x: number, y: number) => void,
 *   inicio?: (x: number, y: number) => void,
 *   arrastar: (dx: number, dy: number, x0: number, y0: number) => void,
 *   pinca: (x: number, y: number, fator: number, dx: number, dy: number) => void,
 *   roda: (x: number, y: number, fator: number) => void,
 * }} cb
 */
export function ligarEntrada(alvo, cb) {
  /** @type {Map<number, { x: number, y: number, x0: number, y0: number, t0: number }>} */
  const dedos = new Map();
  let multi = false;
  let arrastando = false;
  let distAnt = 0;
  let meioAnt = { x: 0, y: 0 };

  const meio = () => {
    const l = [...dedos.values()];
    return { x: (l[0].x + l[1].x) / 2, y: (l[0].y + l[1].y) / 2 };
  };
  const dist = () => {
    const l = [...dedos.values()];
    return Math.hypot(l[0].x - l[1].x, l[0].y - l[1].y);
  };

  alvo.addEventListener('pointerdown', (e) => {
    try {
      alvo.setPointerCapture(e.pointerId);
    } catch { /* ignora */ }
    dedos.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, t0: e.timeStamp });
    if (dedos.size === 1) {
      arrastando = false;
      if (cb.inicio) cb.inicio(e.clientX, e.clientY);
    }
    if (dedos.size === 2) {
      multi = true;
      distAnt = dist();
      meioAnt = meio();
    }
  });

  alvo.addEventListener('pointermove', (e) => {
    const d = dedos.get(e.pointerId);
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    d.x = e.clientX;
    d.y = e.clientY;
    if (dedos.size >= 2) {
      const m = meio();
      const nd = dist();
      if (distAnt > 0) cb.pinca(m.x, m.y, nd / distAnt, m.x - meioAnt.x, m.y - meioAnt.y);
      distAnt = nd;
      meioAnt = m;
      return;
    }
    if (multi) return;
    if (!arrastando && Math.hypot(d.x - d.x0, d.y - d.y0) > MOVE_TOQUE) arrastando = true;
    if (arrastando) cb.arrastar(dx, dy, d.x0, d.y0);
  });

  /** @param {PointerEvent} e */
  function soltar(e) {
    const d = dedos.get(e.pointerId);
    if (!d) return;
    dedos.delete(e.pointerId);
    const foiToque = !multi && !arrastando && e.type === 'pointerup' && e.timeStamp - d.t0 < TOQUE_MAX_MS;
    if (dedos.size === 0) {
      multi = false;
      arrastando = false;
    }
    if (foiToque) cb.toque(d.x0, d.y0);
  }
  alvo.addEventListener('pointerup', soltar);
  alvo.addEventListener('pointercancel', soltar);

  alvo.addEventListener('wheel', (e) => {
    e.preventDefault();
    cb.roda(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0018));
  }, { passive: false });

  // o portal nao pode rolar a pagina por baixo do jogo
  alvo.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
}

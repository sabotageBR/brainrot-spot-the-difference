// Sons sintetizados com WebAudio: nenhum arquivo, nenhuma requisicao (porte de memecats-portais).
// A "voz" dos brainrots e uma serra filtrada por tres formantes que deslizam de
// vogal em vogal: o canto silabado do nome de cada personagem.
// O contexto so nasce no primeiro toque (politica de autoplay). O mudo do
// anuncio zera o ganho mestre ANTES de pedir o anuncio e suspende o contexto
// 80 ms depois (padrao do hexadrop: o onStart do SDK pode nao chegar).

const ESCALA_MAIOR = [0, 2, 4, 5, 7, 9, 11];
/** Oitava mais grave da nota sem fim: 660 / 8, entao a nota 1 tem o centro em 660 Hz. */
const BASE_SEM_FIM = 82.5;

/**
 * Nota k (1, 2, 3...) da escala sem fim (tom de Shepard): sete senos em
 * oitavas com volume em sino em torno de 660 Hz. Cada passo sobe um grau da
 * escala maior; as oitavas de baixo entram mudas e as de cima saem mudas,
 * entao k e k + 7 soam iguais e a subida nunca chega ao fim.
 * @param {number} k
 * @returns {[number, number][]} [hz, peso] da mais grave para a mais aguda
 */
export function notaSemFim(k) {
  const g = Math.max(0, Math.floor(k) - 1);
  const pos = ESCALA_MAIOR[g % 7] / 12;
  /** @type {[number, number][]} */
  const out = [];
  for (let i = 0; i < 7; i++) {
    const oit = i + pos;
    out.push([BASE_SEM_FIM * Math.pow(2, oit), Math.exp(-((oit - 3) ** 2) / 2)]);
  }
  return out;
}

export function criarAudio() {
  /** @type {AudioContext|null} */
  let ctx = null;
  /** @type {GainNode|null} */
  let mestre = null;
  /** @type {AudioBuffer|null} */
  let ruidoBuf = null;
  let mudo = false;
  let mudoAnuncio = false;
  let abaOculta = false;
  const VOLUME = 0.6;

  const ganhoAlvo = () => (mudo || mudoAnuncio || abaOculta ? 0 : VOLUME);

  function iniciar() {
    if (ctx) {
      if (ctx.state === 'suspended' && !mudoAnuncio) ctx.resume().catch(() => {});
      return;
    }
    try {
      const AC = window.AudioContext || /** @type {any} */ (window).webkitAudioContext;
      ctx = new AC();
      mestre = ctx.createGain();
      mestre.gain.value = ganhoAlvo();
      mestre.connect(ctx.destination);
    } catch {
      ctx = null;
    }
  }

  function aplicarGanho() {
    if (!ctx || !mestre) return;
    try {
      mestre.gain.setTargetAtTime(ganhoAlvo(), ctx.currentTime, 0.02);
    } catch { /* ignora */ }
  }

  function tom(f, dur, tipo = 'sine', vol = 0.2, f2 = 0, atraso = 0) {
    if (!ctx || !mestre || mudo || mudoAnuncio) return;
    const t = ctx.currentTime + atraso;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = /** @type {OscillatorType} */ (tipo);
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(mestre);
    o.start(t);
    o.stop(t + dur + 0.03);
  }

  function ruido(dur, freq, q, vol, atraso = 0, tipo = 'bandpass') {
    if (!ctx || !mestre || mudo || mudoAnuncio) return;
    if (!ruidoBuf) {
      ruidoBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.6), ctx.sampleRate);
      const d = ruidoBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ctx.currentTime + atraso;
    const s = ctx.createBufferSource();
    s.buffer = ruidoBuf;
    const f = ctx.createBiquadFilter();
    f.type = /** @type {BiquadFilterType} */ (tipo);
    f.frequency.value = freq;
    f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f);
    f.connect(g);
    g.connect(mestre);
    s.start(t);
    s.stop(t + dur + 0.03);
  }

  /** Formantes (Hz) das vogais, ja subidos para voz de bichinho. */
  const VOGAIS = {
    a: [1000, 1500, 3000], e: [560, 2300, 3100], i: [380, 2900, 3600], o: [620, 1050, 2900], u: [420, 900, 2700],
  };

  /**
   * Voz sintetizada: passa pelas vogais em [vogal, segundos] com o tom em [hz, segundos].
   * @param {[string, number][]} vogais
   * @param {[number, number][]} tons
   * @param {number} dur
   * @param {number} [vol]
   * @param {number} [atraso]
   */
  function voz(vogais, tons, dur, vol = 0.22, atraso = 0) {
    if (!ctx || !mestre || mudo || mudoAnuncio) return;
    const t = ctx.currentTime + atraso;
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(tons[0][0], t);
    for (const [f, ts] of tons) o.frequency.linearRampToValueAtTime(f, t + ts);
    // vibrato
    const lfo = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 6.5;
    lfoG.gain.value = tons[0][0] * 0.025;
    lfo.connect(lfoG);
    lfoG.connect(o.frequency);
    const saida = ctx.createGain();
    saida.gain.setValueAtTime(0.0001, t);
    saida.gain.exponentialRampToValueAtTime(vol, t + 0.03);
    saida.gain.setValueAtTime(vol, t + Math.max(0.04, dur - 0.08));
    saida.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    saida.connect(mestre);
    const pesos = [1, 0.7, 0.25];
    for (let k = 0; k < 3; k++) {
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = k ? 9 : 6;
      const v0 = VOGAIS[/** @type {'a'} */ (vogais[0][0])];
      f.frequency.setValueAtTime(v0[k], t);
      for (const [vg, ts] of vogais) f.frequency.linearRampToValueAtTime(VOGAIS[/** @type {'a'} */ (vg)][k], t + ts);
      const g = ctx.createGain();
      g.gain.value = pesos[k] * 2.2;
      o.connect(f);
      f.connect(g);
      g.connect(saida);
    }
    o.start(t);
    lfo.start(t);
    o.stop(t + dur + 0.05);
    lfo.stop(t + dur + 0.05);
  }

  function bumbo(atraso = 0, vol = 0.35) {
    tom(140, 0.16, 'sine', vol, 45, atraso);
  }
  function chimbal(atraso = 0, vol = 0.07) {
    ruido(0.04, 8000, 1, vol, atraso, 'highpass');
  }

  return {
    iniciar,
    get mudo() {
      return mudo;
    },
    /** true se o som esta zerado agora (mudo, anuncio ou aba oculta) */
    get calado() {
      return ganhoAlvo() === 0;
    },
    /** @param {boolean} v */
    definirMudo(v) {
      mudo = v;
      aplicarGanho();
    },
    mudoParaAnuncio() {
      mudoAnuncio = true;
      aplicarGanho();
      setTimeout(() => {
        if (mudoAnuncio && ctx && ctx.state === 'running') ctx.suspend().catch(() => {});
      }, 80);
    },
    /** @param {boolean} oculta */
    pausarAba(oculta) {
      abaOculta = oculta;
      aplicarGanho();
      if (!ctx) return;
      if (oculta) ctx.suspend().catch(() => {});
      else if (!mudoAnuncio) ctx.resume().catch(() => {});
    },
    voltarDoAnuncio() {
      mudoAnuncio = false;
      if (ctx && ctx.state === 'suspended') ctx.resume().catch(() => {});
      aplicarGanho();
    },
    /**
     * Acerto numero k da sequencia: a nota sobe um grau a cada acerto e nunca
     * chega ao fim (notaSemFim). Do 4o acerto em diante entra um brilho que cresce ate o 10o.
     * @param {number} k
     */
    acerto(k = 1) {
      ruido(0.03, 3500, 5, 0.25);
      tom(880, 0.05, 'triangle', 0.08, 1320);
      const nota = notaSemFim(k);
      for (const [f, p] of nota) if (p > 0.02) tom(f, 0.32, 'sine', 0.09 * p, 0, 0.02);
      if (k >= 4) tom(nota[4][0], 0.14, 'triangle', 0.035 * Math.min(1, (k - 3) / 7), 0, 0.04);
    },
    /** toque errado: boing */
    erro() {
      tom(320, 0.22, 'sine', 0.2, 90);
      tom(160, 0.18, 'square', 0.04, 70, 0.02);
    },
    /** toque num erro ja achado */
    toc() {
      tom(300, 0.06, 'square', 0.04, 220);
    },
    /** antispam: tonto, descendo em espiral */
    tonto() {
      for (let i = 0; i < 4; i++) tom(700 - i * 110, 0.16, 'triangle', 0.08, 520 - i * 110, i * 0.12);
      voz([['o', 0], ['u', 0.5]], [[300, 0], [180, 0.55]], 0.6, 0.14, 0.05);
    },
    dica() {
      [1046, 1318, 1568, 2093].forEach((f, i) => tom(f, 0.3, 'triangle', 0.06, 0, i * 0.06));
    },
    /** pisca: um vupt de ar */
    pisca() {
      ruido(0.18, 2400, 0.8, 0.08, 0, 'bandpass');
    },
    dourado() {
      [1318, 1568, 1976, 2637].forEach((f, i) => tom(f, 0.35, 'triangle', 0.07, 0, i * 0.07));
      [1568, 1976, 2349, 3136].forEach((f, i) => tom(f, 0.4, 'sine', 0.05, 0, 0.35 + i * 0.07));
    },
    vitoria() {
      [523, 659, 784, 1046, 1318].forEach((f, i) => tom(f, 0.26, 'triangle', 0.11, 0, i * 0.085));
      bumbo(0.42, 0.3);
      ruido(0.6, 6500, 0.7, 0.06, 0.42, 'highpass');
    },
    derrota() {
      [392, 370, 349, 294].forEach((f, i) => tom(f, i === 3 ? 0.7 : 0.28, 'sawtooth', 0.05, i === 3 ? 260 : 0, i * 0.3));
    },
    /** tique dos ultimos 10 s */
    tique() {
      tom(1200, 0.04, 'triangle', 0.07);
    },
    /** figurinha virando */
    figurinha() {
      ruido(0.25, 1400, 0.7, 0.08, 0, 'bandpass');
      [784, 988, 1175, 1568].forEach((f, i) => tom(f, 0.22, 'triangle', 0.07, 0, 0.12 + i * 0.07));
    },
    /**
     * O canto do nome do brainrot: uma silaba por vogal, numa melodia de pergunta e resposta,
     * com bumbo e chimbal por baixo (o "tralalero tralala" de cada um, sem audio do meme).
     * @param {string[][]} palavras vogais de cada silaba, por palavra
     */
    cantar(palavras) {
      const MELODIA = [392, 440, 494, 523, 494, 440, 392, 330];
      const passo = 0.17;
      let t = 0;
      let k = 0;
      palavras.forEach((sil, pi) => {
        sil.forEach((v, si) => {
          const f = MELODIA[k % MELODIA.length] * (pi % 2 ? 0.9 : 1);
          const ultima = si === sil.length - 1;
          const dur = ultima ? passo * 1.7 : passo * 0.9;
          voz([[v, 0], [v, dur]], [[f, 0], [ultima ? f * 0.94 : f, dur]], dur, 0.2, t);
          if (k % 2 === 0) bumbo(t, 0.22);
          chimbal(t + passo / 2, 0.05);
          t += ultima ? passo * 2 : passo;
          k += 1;
        });
      });
    },
  };
}

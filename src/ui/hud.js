// O HUD em DOM: placa do nivel, bolinhas de progresso, status (combo), selos dos botoes,
// painel do fim da cena, album, mapa e a faixa que anuncia o mundo e o chefe.
// Sem relogio: quem agenda (o aviso que some, o contador do proximo) e o main.js; a faixa
// some sozinha no fim da animacao do CSS.

import { BRAINROTS, MUNDOS, brainrot, mundo } from '../jogo/catalogo.js';
import { comN } from '../i18n/textos.js';

const $ = (/** @type {string} */ id) => /** @type {HTMLElement} */ (document.getElementById(id));

const COR_RAR = { S: '#ff8a00', A: '#8e5bff', B: '#2fa8ff' };

const ESTRELA = (cheia) => `<svg viewBox="0 0 24 24" class="${cheia ? 'cheia' : ''}"><path d="M12 2.6l2.9 6 6.5.8-4.8 4.5 1.2 6.5L12 17.2l-5.8 3.2 1.2-6.5L2.6 9.4l6.5-.8z" fill="${cheia ? '#ffc21a' : '#e4e1ec'}" stroke="${cheia ? '#c98a00' : '#cfcbd9'}" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

/** @param {number} ms */
export function relogioTexto(ms) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/**
 * Desenha o recorte do personagem (caixa na imagem A) num canvas quadrado, cobrindo.
 * @param {HTMLCanvasElement} cv @param {CanvasImageSource|null} img
 * @param {{ x: number, y: number, w: number, h: number }|null} caixa
 */
export function pintarFigura(cv, img, caixa) {
  const t = 220;
  cv.width = t;
  cv.height = t;
  const c = cv.getContext('2d');
  if (!c) return;
  if (!img || !caixa) {
    c.fillStyle = '#d5d8e2';
    c.fillRect(0, 0, t, t);
    c.fillStyle = '#9aa0b3';
    c.font = '700 120px Fredoka, sans-serif';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillText('?', t / 2, t / 2 + 6);
    return;
  }
  const lado = Math.max(caixa.w, caixa.h);
  const cx = caixa.x + caixa.w / 2;
  const cy = caixa.y + caixa.h / 2;
  c.drawImage(img, cx - lado / 2, cy - lado / 2, lado, lado, 0, 0, t, t);
}

/** @param {import('../i18n/textos.js').Textos} tx */
export function criarHud(tx) {
  const progresso = $('progresso');
  const status = $('status');
  const painel = $('painel');
  $('placaRotulo').textContent = tx.nivel;

  /** @type {string} */
  let ultimoStatus = '';

  return {
    /**
     * @param {number} nivel @param {number} total @param {string} cor
     * @param {boolean} [ouro] ha brainrot dourado escondido @param {boolean} [chefe] fase chefe
     */
    iniciarCena(nivel, total, cor, ouro = false, chefe = false) {
      $('placaNum').textContent = String(nivel);
      $('placa').classList.toggle('chefe', chefe);
      progresso.innerHTML = '<i></i>'.repeat(total) + (ouro ? '<i class="vaga-ouro" title="?"></i>' : '');
      document.documentElement.style.setProperty('--cor', cor);
      ultimoStatus = '';
    },
    /**
     * Faixa que atravessa a tela (mundo novo, chefe). Some sozinha no fim da animacao.
     * @param {string} titulo @param {string} [sub] @param {string} [cor]
     */
    faixa(titulo, sub = '', cor = '') {
      const f = $('faixa');
      f.hidden = true;
      f.innerHTML = '';
      const b = document.createElement('b');
      b.textContent = titulo;
      f.appendChild(b);
      if (sub) {
        const sp = document.createElement('span');
        sp.textContent = sub;
        f.appendChild(sp);
      }
      f.style.setProperty('--c', cor || 'var(--marca)');
      // reinicia a animacao
      void f.offsetWidth;
      f.hidden = false;
      f.onanimationend = () => {
        f.hidden = true;
      };
    },
    /** @param {import('../jogo/partida.js').Partida} p */
    progresso(p) {
      const bolas = progresso.children;
      p.cena.erros.forEach((e, i) => {
        const a = p.achados.get(e.id);
        const b = /** @type {HTMLElement} */ (bolas[i]);
        if (!b) return;
        // a ordem das bolinhas e a dos achados, nao a dos erros
        b.className = '';
      });
      [...p.achados.values()].sort((a, b) => a.t - b.t).forEach((a, i) => {
        const b = /** @type {HTMLElement} */ (bolas[i]);
        if (b) b.className = a.porDica ? 'dica' : 'ok';
      });
      const ouro = /** @type {HTMLElement|null} */ (progresso.querySelector('.vaga-ouro, .ouro'));
      if (ouro) ouro.className = p.achouEscondido ? 'ouro' : 'vaga-ouro';
    },
    /** @param {string} html */
    status(html) {
      if (html === ultimoStatus) return;
      ultimoStatus = html;
      status.innerHTML = html;
    },
    /**
     * Texto que sobe do ponto (ganho de pontos, +5s, -3s).
     * @param {string} texto @param {number} x @param {number} y @param {string} [cor]
     */
    ganho(texto, x, y, cor) {
      const el = document.createElement('b');
      el.className = 'ganho';
      el.textContent = texto;
      el.style.left = `${x}px`;
      el.style.top = `${y - 20}px`;
      if (cor) el.style.color = cor;
      status.appendChild(el);
      el.addEventListener('animationend', () => el.remove());
    },
    /** @param {string} id @param {string} selo @param {boolean} [video] */
    selo(id, selo, video = false) {
      const s = /** @type {HTMLElement} */ ($(id).querySelector('.selo'));
      if (!s) return;
      s.textContent = selo;
      s.classList.toggle('video', video);
    },
    /** @param {string} id @param {boolean} visivel */
    mostrar(id, visivel) {
      $(id).hidden = !visivel;
    },
    /** @param {string} id @param {string} classe @param {boolean} on */
    classe(id, classe, on) {
      $(id).classList.toggle(classe, on);
    },
    /** @param {string} texto */
    aviso(texto) {
      const a = $('aviso');
      a.textContent = texto;
      a.hidden = !texto;
    },

    /**
     * Painel do fim da cena.
     * @param {{
     *   titulo: string, estrelas: number, dados: [string, string][], texto?: string,
     *   figura?: { id: string, img: CanvasImageSource|null, caixa: any, nova: boolean, dourada: boolean, vezes?: number } | null,
     *   botoes: { texto: string, classe?: string, icone?: string, acao: () => void, barra?: boolean }[]
     * }} o
     */
    painel(o) {
      $('painelTitulo').textContent = o.titulo;
      const est = $('painelEstrelas');
      est.innerHTML = o.estrelas ? [1, 2, 3].map((k) => ESTRELA(k <= o.estrelas)).join('') : '';
      const dados = $('painelDados');
      dados.innerHTML = o.dados.map(([r, v]) => `<span>${r}<br><b>${v}</b></span>`).join('');
      if (o.texto) {
        const t = document.createElement('p');
        t.className = 'texto';
        t.textContent = o.texto;
        dados.prepend(t);
      }
      const fig = $('painelFigura');
      fig.innerHTML = '';
      fig.hidden = !o.figura;
      if (o.figura) {
        const b = brainrot(o.figura.id);
        const carta = document.createElement('div');
        carta.className = `carta${o.figura.dourada ? ' dourada' : ''}`;
        carta.style.setProperty('--rar', COR_RAR[b ? b.raridade : 'B']);
        const cv = document.createElement('canvas');
        pintarFigura(cv, o.figura.img, o.figura.caixa);
        const selo = o.figura.nova ? tx.novo : o.figura.vezes && o.figura.vezes > 1 ? comN(tx.vezes, o.figura.vezes) : '';
        carta.innerHTML = `<i class="rar">${b ? tx.raro[b.raridade] : ''}</i>${selo ? `<i class="novo">${selo}</i>` : ''}`;
        carta.prepend(cv);
        const nome = document.createElement('b');
        nome.textContent = b ? b.nome : o.figura.id;
        carta.appendChild(nome);
        fig.appendChild(carta);
      }
      const bt = $('painelBotoes');
      bt.innerHTML = '';
      for (const b of o.botoes) {
        const el = document.createElement('button');
        el.className = `acao ${b.classe || ''}`;
        el.innerHTML = `${b.icone || ''}<span></span>${b.barra ? '<i class="barra"></i>' : ''}`;
        /** @type {HTMLElement} */ (el.querySelector('span')).textContent = b.texto;
        el.addEventListener('click', b.acao);
        bt.appendChild(el);
      }
      painel.hidden = false;
    },
    fecharPainel() {
      painel.hidden = true;
    },
    get painelAberto() {
      return !painel.hidden;
    },
    /** Tira a barra do contador do botao (o jogador mexeu: o contador parou). */
    pararBarra() {
      painel.querySelectorAll('.barra').forEach((b) => b.remove());
    },

    /**
     * Album: todas as figurinhas por mundo; as bloqueadas aparecem com "?". Tocar numa
     * figurinha que ja tem chama aoTocar (o canto do nome).
     * @param {Record<string, { cena: string, dourada?: boolean }>} colecao
     * @param {(id: string) => { img: CanvasImageSource|null, caixa: any }|null} figuraDe
     * @param {(id: string) => void} [aoTocar]
     */
    album(colecao, figuraDe, aoTocar) {
      const el = $('album');
      const tem = Object.keys(colecao).length;
      const ouro = Object.values(colecao).filter((c) => c.dourada).length;
      let html = `<div class="folha"><div class="cabeca"><h2>${tx.album}</h2>${ouro ? `<span class="conta ouro">\u2728 ${ouro}</span>` : ''}<span class="conta">${tem}/${BRAINROTS.length}</span><button class="btn redondo" data-fechar aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>`;
      for (const m of MUNDOS) {
        html += `<h3 style="--c:${m.cor}"><i></i>${m.nome[/** @type {'en'} */ (tx.idioma)]}</h3><div class="grade">`;
        for (const b of BRAINROTS.filter((x) => x.mundo === m.n)) {
          const c = colecao[b.id];
          html += `<div class="carta${c ? '' : ' bloqueada'}${c && c.dourada ? ' dourada' : ''}" style="--rar:${COR_RAR[b.raridade]}" data-id="${b.id}"><canvas></canvas><b>${c ? b.nome : '???'}</b></div>`;
        }
        html += '</div>';
      }
      el.innerHTML = `${html}</div>`;
      el.querySelectorAll('.carta').forEach((carta) => {
        const id = /** @type {HTMLElement} */ (carta).dataset.id || '';
        const f = colecao[id] ? figuraDe(id) : null;
        pintarFigura(/** @type {HTMLCanvasElement} */ (carta.querySelector('canvas')), f ? f.img : null, f ? f.caixa : null);
        if (colecao[id] && aoTocar) {
          /** @type {HTMLElement} */ (carta).onclick = () => {
            carta.classList.remove('canta');
            void (/** @type {HTMLElement} */ (carta)).offsetWidth;
            carta.classList.add('canta');
            aoTocar(id);
          };
        }
      });
      el.hidden = false;
      /** @type {HTMLElement} */ (el.querySelector('[data-fechar]')).onclick = () => { el.hidden = true; };
    },

    /**
     * Mapa: os 10 mundos com 10 fases cada (progresso.mapaDoJogo). A fase feita e a atual
     * abrem pelo toque; a feita sem o dourado e a isca para jogar de novo.
     * @param {ReturnType<typeof import('../jogo/progresso.js').mapaDoJogo>} mundos
     * @param {(id: string) => void} aoEscolher
     */
    mapa(mundos, aoEscolher) {
      const el = $('mapa');
      const todos = mundos.flatMap((m) => m.nos);
      const feitas = todos.filter((x) => x.estado === 'feito').length;
      let html = `<div class="folha"><div class="cabeca"><h2>${tx.mapa}</h2><span class="conta">${feitas}/${todos.length}</span><button class="btn redondo" data-fechar aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div><div class="mundos">`;
      for (const m of mundos) {
        const mu = mundo(m.mundo);
        html += `<div class="mundo${m.aberto ? '' : ' bloqueado'}" style="--c:${mu.cor}"><b><small>${comN(tx.mundo, m.mundo)}</small>${mu.nome[/** @type {'en'} */ (tx.idioma)]}</b><div class="nos">`;
        for (const x of m.nos) {
          const abre = x.estado === 'feito' || x.estado === 'atual';
          const cls = [x.estado, x.ouro ? 'ouro' : '', x.aqui ? 'aqui' : '', x.n % 10 === 0 ? 'chefe' : ''].filter(Boolean).join(' ');
          const est = x.estado === 'feito' ? `<em>${'\u2605'.repeat(x.estrelas)}</em>` : '';
          html += `<i class="${cls}"${abre ? ` data-id="${x.id}"` : ''}>${x.n}${est}</i>`;
        }
        html += '</div></div>';
      }
      el.innerHTML = `${html}</div></div>`;
      el.hidden = false;
      /** @type {HTMLElement} */ (el.querySelector('[data-fechar]')).onclick = () => { el.hidden = true; };
      el.querySelectorAll('[data-id]').forEach((no) => {
        /** @type {HTMLElement} */ (no).onclick = () => {
          el.hidden = true;
          aoEscolher(/** @type {HTMLElement} */ (no).dataset.id || '');
        };
      });
      // abre rolado no mundo atual
      const aqui = el.querySelector('.atual, .aqui');
      if (aqui) aqui.scrollIntoView({ block: 'center' });
    },
  };
}

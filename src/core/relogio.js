// O relogio do jogo. Unico modulo que le o tempo real: cena, palco, album e toda a agenda de
// src/main.js andam por aqui, para a pausa parar o jogo inteiro de uma vez.
//
// So os portais pedem a pausa (anuncio ou foco perdido). Sem ela, agora() e performance.now() e
// depois(ms, fn) e um setTimeout. Pausado, agora() fica parado e nada da agenda dispara: os
// prazos moram no tempo do jogo, entao a volta so rearma o que faltava.

/**
 * @typedef {Object} Agendado
 * @property {number} fim instante no tempo do jogo
 * @property {() => void} fn
 * @property {any} id
 */

/**
 * @param {object} [o]
 * @param {() => number} [o.ler] o tempo real, em ms
 * @param {(fn: () => void, ms: number) => any} [o.agendar]
 * @param {(id: any) => void} [o.cancelar]
 * @param {() => Date} [o.data] a data do calendario (presente do dia)
 */
export function criarRelogio({
  ler = () => performance.now(),
  agendar = (fn, ms) => setTimeout(fn, ms),
  cancelar = (id) => clearTimeout(id),
  data = () => new Date(),
} = {}) {
  let parado = false;
  let paradoEm = 0;
  let desconto = 0;
  /** @type {Set<Agendado>} */
  const agenda = new Set();

  const agora = () => (parado ? paradoEm : ler()) - desconto;

  /** @param {Agendado} a */
  function armar(a) {
    a.id = agendar(() => {
      agenda.delete(a);
      a.fn();
    }, Math.max(0, a.fim - agora()));
  }

  return {
    agora,
    /** O dia do calendario local, 'AAAA-MM-DD' (o presente do dia e a sequencia). */
    hoje() {
      const d = data();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    get parado() {
      return parado;
    },
    /** @param {number} ms @param {() => void} fn */
    depois(ms, fn) {
      /** @type {Agendado} */
      const a = { fim: agora() + Math.max(0, ms), fn, id: null };
      agenda.add(a);
      if (!parado) armar(a);
    },
    /** @param {boolean} parar */
    pausar(parar) {
      if (parar === parado) return;
      if (parar) {
        paradoEm = ler();
        parado = true;
        for (const a of agenda) cancelar(a.id);
        return;
      }
      desconto += ler() - paradoEm;
      parado = false;
      for (const a of agenda) armar(a);
    },
  };
}

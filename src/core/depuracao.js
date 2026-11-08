// Parametros de teste na URL. So valem em file://, localhost e 127.0.0.1:
// no portal nada disso existe. Unico modulo que le a URL.
//   ?cena=cafe-03 comeca nessa cena (ids em src/arte/cenas/manifesto.js)
//   ?revelar      mostra todos os erros marcados (prints e conferencia)
//   ?auto=400     joga sozinho (um acerto a cada 400 ms) e passa de cena
//   ?semanuncio   nao pede intervalo comercial (prints e testes longos)
//   ?novo         ignora o save (comeca do zero, sem gravar)
//   ?lang=en      idioma fixo (capturas)
//   ?dia=AAAA-MM-DD finge o dia de hoje (presente do dia)

// Fora disso, so o banco de testes do SDK liga os ganchos, pelo global que
// lerDepuracao confere; nesse caso "local" continua falso, para o jogo se
// comportar como no portal (sem premio sem SDK).

const NADA = { local: false, ganchos: false, cena: '', revelar: false, auto: 0, semAnuncio: false, novo: false, lang: '', dia: '' };

export function lerDepuracao() {
  let local = false;
  try {
    local = location.protocol === 'file:' || /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  } catch {
    local = false;
  }
  // banco de testes do SDK: a build dos portais tira este bloco
  const teste = /** @type {any} */ (globalThis).__brainrot7Teste;
  if (!local && teste && typeof teste === 'object') {
    return { ...NADA, ganchos: true, novo: true };
  }
  if (!local) return { ...NADA };
  const q = new URLSearchParams(location.search);
  return {
    local: true,
    ganchos: true,
    cena: q.get('cena') || '',
    revelar: q.has('revelar'),
    auto: q.has('auto') ? Math.max(120, parseInt(q.get('auto') || '400', 10) || 400) : 0,
    semAnuncio: q.has('semanuncio'),
    novo: q.has('novo'),
    lang: q.get('lang') || '',
    dia: /^\d{4}-\d{2}-\d{2}$/.test(q.get('dia') || '') ? String(q.get('dia')) : '',
  };
}

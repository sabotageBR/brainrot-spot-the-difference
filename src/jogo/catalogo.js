// Catalogo dos brainrots e dos mundos. Logica pura (so dados).
// Nomes reais dos memes, decisao do dono (2026-11-07): ver o risco de IP no CLAUDE.md.
// Ficam fora: nomes sexuais, pessoas reais e IP de terceiros (lista em docs/pesquisa/brainrots.md).
//
// canto: as silabas do nome que a voz sintetizada canta (core/audio.js, cantar).
// raridade: S lendario, A epico, B raro (vem do nivel de fama na pesquisa).

/**
 * @typedef {{ id: string, nome: string, raridade: 'S'|'A'|'B', mundo: number, canto: string }} Brainrot
 * @typedef {{ n: number, id: string, nome: { en: string, pt: string, es: string }, cor: string }} Mundo
 */

/** @type {Mundo[]} */
export const MUNDOS = [
  { n: 1, id: 'praia', nome: { en: 'Brainrot Beach', pt: 'Praia Brainrot', es: 'Playa Brainrot' }, cor: '#2ec4f1' },
  { n: 2, id: 'cafe', nome: { en: 'Cappuccino Café', pt: 'Café Cappuccino', es: 'Café Cappuccino' }, cor: '#c98a5a' },
  { n: 3, id: 'vila', nome: { en: 'Sahur Village', pt: 'Vila Sahur', es: 'Villa Sahur' }, cor: '#e0a24e' },
  { n: 4, id: 'selva', nome: { en: 'Banana Jungle', pt: 'Selva Banana', es: 'Selva Banana' }, cor: '#5cc65a' },
  { n: 5, id: 'deserto', nome: { en: 'Cactus Desert', pt: 'Deserto Cacto', es: 'Desierto Cactus' }, cor: '#f2b94b' },
  { n: 6, id: 'ceu', nome: { en: 'Crocodile Skies', pt: 'Céu do Crocodilo', es: 'Cielo Cocodrilo' }, cor: '#7aa9ff' },
  { n: 7, id: 'espaco', nome: { en: 'Saturnita Space', pt: 'Espaço Saturnita', es: 'Espacio Saturnita' }, cor: '#8a6cf0' },
  { n: 8, id: 'ilha', nome: { en: 'Fruit Island', pt: 'Ilha das Frutas', es: 'Isla de Frutas' }, cor: '#ff7aa8' },
  { n: 9, id: 'cidade', nome: { en: 'Rot City', pt: 'Cidade Rot', es: 'Ciudad Rot' }, cor: '#9aa7b8' },
  { n: 10, id: 'castelo', nome: { en: 'Cannelloni Castle', pt: 'Castelo Cannelloni', es: 'Castillo Cannelloni' }, cor: '#e8574f' },
];

/** @type {Brainrot[]} */
export const BRAINROTS = [
  // 1 praia
  { id: 'tralalero', nome: 'Tralalero Tralala', raridade: 'S', mundo: 1, canto: 'tra-la-le-ro tra-la-la' },
  { id: 'trippi-troppi', nome: 'Trippi Troppi', raridade: 'S', mundo: 1, canto: 'trip-pi trop-pi' },
  { id: 'bananita', nome: 'Bananita Dolphinita', raridade: 'B', mundo: 1, canto: 'ba-na-ni-ta dol-fi-ni-ta' },
  { id: 'trulimero', nome: 'Trulimero Trulicina', raridade: 'S', mundo: 1, canto: 'tru-li-me-ro tru-li-ci-na' },
  { id: 'tralaleritos', nome: 'Los Tralaleritos', raridade: 'A', mundo: 1, canto: 'los tra-la-le-ri-tos' },
  { id: 'tralalita', nome: 'Tralalita Tralala', raridade: 'B', mundo: 1, canto: 'tra-la-li-ta tra-la-la' },
  { id: 'blueberrini', nome: 'Blueberrini Octopusini', raridade: 'A', mundo: 1, canto: 'blu-be-ri-ni oc-to-pu-si-ni' },
  { id: 'trippa-troppa', nome: 'Trippa Troppa', raridade: 'A', mundo: 1, canto: 'trip-pa trop-pa' },
  // 2 cafe
  { id: 'ballerina', nome: 'Ballerina Cappuccina', raridade: 'S', mundo: 2, canto: 'bal-le-ri-na cap-pu-ci-na' },
  { id: 'cappuccino-assassino', nome: 'Cappuccino Assassino', raridade: 'S', mundo: 2, canto: 'cap-pu-ci-no as-sas-si-no' },
  { id: 'espressona', nome: 'Espressona Signora', raridade: 'A', mundo: 2, canto: 'es-pres-so-na si-nho-ra' },
  { id: 'crabracadabra', nome: 'Chef Crabracadabra', raridade: 'B', mundo: 2, canto: 'chef cra-bra-ca-da-bra' },
  { id: 'bambini-crossini', nome: 'Bambini Crossini', raridade: 'B', mundo: 2, canto: 'bam-bi-ni cros-si-ni' },
  { id: 'crocodilo-fromagioso', nome: 'Crocodilo Fromagioso', raridade: 'A', mundo: 2, canto: 'cro-co-di-lo fro-ma-gio-so' },
  // 3 vila
  { id: 'tung-tung', nome: 'Tung Tung Tung Sahur', raridade: 'S', mundo: 3, canto: 'tung tung tung sa-hur' },
  { id: 'ta-ta-sahur', nome: 'Ta Ta Ta Ta Sahur', raridade: 'A', mundo: 3, canto: 'ta ta ta ta sa-hur' },
  { id: 'boneca-ambalabu', nome: 'Boneca Ambalabu', raridade: 'S', mundo: 3, canto: 'bo-ne-ca am-ba-la-bu' },
  // 4 selva
  { id: 'patapim', nome: 'Brr Brr Patapim', raridade: 'S', mundo: 4, canto: 'brr brr pa-ta-pim' },
  { id: 'chimpanzini', nome: 'Chimpanzini Bananini', raridade: 'S', mundo: 4, canto: 'chim-pan-zi-ni ba-na-ni-ni' },
  { id: 'orangutini', nome: 'Orangutini Ananassini', raridade: 'A', mundo: 4, canto: 'o-ran-gu-ti-ni a-na-nas-si-ni' },
  { id: 'tigrrullini', nome: 'Tigrrullini Watermellini', raridade: 'A', mundo: 4, canto: 'ti-gru-li-ni wa-ter-me-li-ni' },
  { id: 'pandaccini', nome: 'Pandaccini Bananini', raridade: 'B', mundo: 4, canto: 'pan-da-ci-ni ba-na-ni-ni' },
  { id: 'tigrulli', nome: 'Tigrulli Grapefrutunni', raridade: 'A', mundo: 4, canto: 'ti-gru-li gra-pe-fru-tu-ni' },
  { id: 'gattino-bananino', nome: 'Gattino Bananino', raridade: 'B', mundo: 4, canto: 'gat-ti-no ba-na-ni-no' },
  // 5 deserto
  { id: 'lirili', nome: 'Lirilì Larilà', raridade: 'S', mundo: 5, canto: 'li-ri-li la-ri-la' },
  { id: 'cacto-hipopotamo', nome: 'Il Cacto Hipopotamo', raridade: 'A', mundo: 5, canto: 'il cac-to hi-po-po-ta-mo' },
  { id: 'frigo-camelo', nome: 'Frigo Camelo', raridade: 'A', mundo: 5, canto: 'fri-go ca-me-lo' },
  { id: 'rhino-toasterino', nome: 'Rhino Toasterino', raridade: 'A', mundo: 5, canto: 'ri-no tos-te-ri-no' },
  // 6 ceu
  { id: 'bombardiro', nome: 'Bombardiro Crocodilo', raridade: 'S', mundo: 6, canto: 'bom-bar-di-ro cro-co-di-lo' },
  { id: 'bombombini', nome: 'Bombombini Gusini', raridade: 'A', mundo: 6, canto: 'bom-bom-bi-ni gu-si-ni' },
  { id: 'golubiro', nome: 'Shpioniro Golubiro', raridade: 'A', mundo: 6, canto: 'shpi-o-ni-ro go-lu-bi-ro' },
  { id: 'piccione-macchina', nome: 'Piccione Macchina', raridade: 'B', mundo: 6, canto: 'pic-cio-ne mac-chi-na' },
  { id: 'trenostruzzo', nome: 'Trenostruzzo Turbo 3000', raridade: 'B', mundo: 6, canto: 'tre-no-strut-zo tur-bo' },
  { id: 'frulli-frulla', nome: 'Frulli Frulla', raridade: 'B', mundo: 6, canto: 'frul-li frul-la' },
  // 7 espaco
  { id: 'saturnita', nome: 'La Vaca Saturno Saturnita', raridade: 'S', mundo: 7, canto: 'la va-ca sa-tur-ni-ta' },
  { id: 'girafa-celestre', nome: 'Girafa Celestre', raridade: 'S', mundo: 7, canto: 'gi-ra-fa ce-les-tre' },
  { id: 'meowl', nome: 'Meowl', raridade: 'A', mundo: 7, canto: 'mi-aul' },
  // 8 ilha
  { id: 'burbaloni', nome: 'Burbaloni Luliloli', raridade: 'A', mundo: 8, canto: 'bur-ba-lo-ni lu-li-lo-li' },
  { id: 'cocofanto', nome: 'Cocofanto Elefanto', raridade: 'A', mundo: 8, canto: 'co-co-fan-to e-le-fan-to' },
  { id: 'strawberry-elephant', nome: 'Strawberry Elephant', raridade: 'A', mundo: 8, canto: 'stro-be-ri e-le-fant' },
  { id: 'tortuginni', nome: 'Tortuginni Dragonfruitini', raridade: 'B', mundo: 8, canto: 'tor-tu-gi-ni dra-gon-fru-ti-ni' },
  { id: 'glorbo', nome: 'Glorbo Fruttodrillo', raridade: 'A', mundo: 8, canto: 'glor-bo frut-to-dril-lo' },
  { id: 'u-din-din', nome: 'U Din Din Din Dun', raridade: 'S', mundo: 8, canto: 'u din din din dun ma din din din dun' },
  { id: 'uvanito', nome: 'Uvanito Pecorarito', raridade: 'B', mundo: 8, canto: 'u-va-ni-to pe-co-ra-ri-to' },
  { id: 'perochello', nome: 'Perochello Lemonchello', raridade: 'B', mundo: 8, canto: 'pe-ro-chel-lo le-mon-chel-lo' },
  // 9 cidade
  { id: 'tractoro', nome: 'Tractoro Dinosauro', raridade: 'B', mundo: 9, canto: 'trac-to-ro di-no-sau-ro' },
  { id: 'chicleteira', nome: 'Chicleteira Bicicleteira', raridade: 'B', mundo: 9, canto: 'chi-cle-tei-ra bi-ci-cle-tei-ra' },
  { id: 'tartaruga-cisterna', nome: 'Tartaruga Cisterna', raridade: 'B', mundo: 9, canto: 'tar-ta-ru-ga cis-ter-na' },
  { id: 'pot-hotspot', nome: 'Pot Hotspot', raridade: 'B', mundo: 9, canto: 'pot hot-spot' },
  { id: 'bobrito', nome: 'Bobrito Bandito', raridade: 'S', mundo: 9, canto: 'bo-bri-to ban-di-to' },
  { id: 'vulpegatto', nome: 'Vulpegatto', raridade: 'A', mundo: 9, canto: 'vul-pe-gat-to' },
  // 10 castelo
  { id: 'dragon-cannelloni', nome: 'Dragon Cannelloni', raridade: 'A', mundo: 10, canto: 'dra-gon can-ne-lo-ni' },
  { id: 'talpa-di-fero', nome: 'Talpa di Fero', raridade: 'B', mundo: 10, canto: 'tal-pa di fe-ro' },
  { id: 'ecco-cavallo', nome: 'Ecco Cavallo Virtuoso', raridade: 'A', mundo: 10, canto: 'ec-co ca-val-lo vir-tu-o-so' },
];

const PORID = new Map(BRAINROTS.map((b) => [b.id, b]));

/** @param {string} id */
export const brainrot = (id) => PORID.get(id) || null;

/** @param {number} n */
export const mundo = (n) => MUNDOS.find((m) => m.n === n) || MUNDOS[0];

/**
 * Vogais do canto, uma por silaba, para a voz sintetizada (a, e, i, o, u).
 * @param {string} canto
 * @returns {string[][]} palavras -> vogal de cada silaba
 */
export function vogaisDoCanto(canto) {
  return canto.split(/\s+/).filter(Boolean).map((palavra) => palavra.split('-').map((sil) => {
    const m = sil.match(/[aeiou]/);
    return m ? m[0] : 'u';
  }));
}

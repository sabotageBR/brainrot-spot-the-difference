// Roteiro da arte da Etapa 2: as 100 cenas (10 mundos x 10) e os 42 retratos das figurinhas.
// So dados. Quem le: tools/roteiro.mjs (prompts para o Grok), o estudio (quantos erros, protagonista)
// e test/roteiro.test.js (cobertura do catalogo). O estilo escolhido pelo dono e o E2 (cartoon 2D).
//
// Prompt da cena = `${lugar} with N characters: ${Nome (aparencia) acao; ...}. Around them: ${objetos}. ${COMPOSICAO}, ${ESTILO}`.
// Curto de proposito: o Grok do dono tem limite de uso e o pedido tem que ser objetivo.

import { BRAINROTS } from '../src/jogo/catalogo.js';

export const ESTILO = 'flat 2D cartoon illustration, thick clean black outlines, flat bright colors with simple cel shading, children\'s comic book style, crisp clear shapes';

export const COMPOSICAO = 'wide shot, busy scene packed with small distinct objects over the whole picture, no empty areas, everything in sharp focus, all characters medium size and fully visible, cute, no weapons, no alcohol, no text, no logo, no watermark, 4:3';

/** Aparencia fixa e curta de cada brainrot: o mesmo texto em toda cena, para o Grok desenhar igual. */
export const APARENCIA = {
  tralalero: 'Tralalero Tralala (blue shark on three legs, plain blue sneakers)',
  'trippi-troppi': 'Trippi Troppi (orange cat head on a pink shrimp body)',
  bananita: 'Bananita Dolphinita (gray dolphin inside a peeled banana skin)',
  trulimero: 'Trulimero Trulicina (orange fish body with a cat head and four cat legs)',
  blueberrini: 'Blueberrini Octopusini (cute round purple blueberry octopus with big eyes)',
  'trippa-troppa': 'Trippa Troppa (green fish head on a chubby brown bear body)',
  tralaleritos: 'Los Tralaleritos (three small blue sharks on legs with colored sneakers)',
  tralalita: 'Tralalita Tralala (blue shark girl on two legs, pink bow, pink sneakers)',
  ballerina: 'Ballerina Cappuccina (ballerina in a pink tutu with a cappuccino cup head)',
  'cappuccino-assassino': 'Cappuccino Assassino (striped coffee cup with a black ninja mask, little arms and legs in sneakers, holding two spoons, no knives)',
  espressona: 'Espressona Signora (old lady in a flowered dress with an espresso cup head)',
  crabracadabra: 'Chef Crabracadabra (red crab with a chef hat and a star magic wand)',
  'tung-tung': 'Tung Tung Tung Sahur (tall wooden log with big eyes, thin arms and legs, wooden bat)',
  'ta-ta-sahur': 'Ta Ta Ta Ta Sahur (brown teapot with big eyes, thin arms and legs)',
  'boneca-ambalabu': 'Boneca Ambalabu (green frog head on a black tire with two human legs)',
  patapim: 'Brr Brr Patapim (tree trunk with a mossy head, a long nose and huge bare feet)',
  chimpanzini: 'Chimpanzini Bananini (green chimpanzee with a pink face popping out of a peeled banana)',
  orangutini: 'Orangutini Ananassini (orange orangutan with a pineapple body and leaves on its head)',
  tigrrullini: 'Tigrrullini Watermellini (tiger with a round watermelon body)',
  pandaccini: 'Pandaccini Bananini (panda sitting in a peeled banana)',
  lirili: 'Lirili Larila (elephant with a green cactus body, wearing sandals, next to an alarm clock)',
  'cacto-hipopotamo': 'Il Cacto Hipopotamo (gray hippo with a cactus on its back, sandals)',
  'frigo-camelo': 'Frigo Camelo (camel with a white fridge body, brown boots)',
  'rhino-toasterino': 'Rhino Toasterino (rhino with a silver toaster body and toast popping out)',
  bombardiro: 'Bombardiro Crocodilo (crocodile head on a propeller airplane body, dropping confetti)',
  bombombini: 'Bombombini Gusini (white goose jet plane)',
  golubiro: 'Shpioniro Golubiro (pigeon spy in a trench coat and sunglasses)',
  'piccione-macchina': 'Piccione Macchina (pigeon with a small red car body)',
  trenostruzzo: 'Trenostruzzo Turbo 3000 (ostrich with a white bullet train body)',
  saturnita: 'La Vaca Saturno Saturnita (planet Saturn with a cow face and two big human feet)',
  'girafa-celestre': 'Girafa Celestre (round watermelon body with a small giraffe head and legs in brown boots)',
  meowl: 'Meowl (round fluffy half cat half owl with huge eyes)',
  burbaloni: 'Burbaloni Luliloli (brown capybara inside half a coconut)',
  cocofanto: 'Cocofanto Elefanto (small brown elephant with a coconut head)',
  'strawberry-elephant': 'Strawberry Elephant (pink strawberry elephant with green leaves)',
  tortuginni: 'Tortuginni Dragonfruitini (turtle with a pink dragon fruit shell)',
  glorbo: 'Glorbo Fruttodrillo (crocodile with a watermelon body)',
  'u-din-din': 'U Din Din Din Dun (muscular orange fruit with a leaf on top, shorts and sneakers)',
  tractoro: 'Tractoro Dinosauro (green dinosaur tractor with big wheels)',
  chicleteira: 'Chicleteira Bicicleteira (red gumball machine with eyes riding a bicycle)',
  'tartaruga-cisterna': 'Tartaruga Cisterna (turtle with a silver tank truck shell)',
  'pot-hotspot': 'Pot Hotspot (skinny friendly cartoon skeleton with a phone)',
  bobrito: 'Bobrito Bandito (beaver in a striped suit and fedora, no weapons)',
  'dragon-cannelloni': 'Dragon Cannelloni (friendly dragon made of cannelloni pasta)',
  'talpa-di-fero': 'Talpa di Fero (mole with a drill helmet)',
  'ecco-cavallo': 'Ecco Cavallo Virtuoso (brown horse head on a little red grand piano body)',
  tigrulli: 'Tigrulli Grapefrutunni (tiger with a round pink grapefruit body)',
  vulpegatto: 'Vulpegatto (half fox half cat sitting in a coconut shell)',
  'gattino-bananino': 'Gattino Bananino (orange kitten inside a peeled banana)',
  'crocodilo-fromagioso': 'Crocodilo Fromagioso (crocodile made of yellow cheese with holes)',
  'frulli-frulla': 'Frulli Frulla (small bird with huge round goggles and a long beak)',
  'bambini-crossini': 'Bambini Crossini (baby deer with a croissant body)',
  uvanito: 'Uvanito Pecorarito (sheep made of purple grapes)',
  perochello: 'Perochello Lemonchello (yellow parrot with a lemon body)',
};

/** Personagens por cena: o dono quer varios em toda cena (2026-11-08). O chefe tem mais. */
export const GENTE_MIN = 5;
export const GENTE_CHEFE = 7;

/** Acoes de quem entra so para encher a cena (a absurdez combina com o brainrot). */
const ACOES_EXTRA = ['waving hello', 'taking a photo', 'eating an ice cream', 'dancing', 'laughing', 'carrying a basket', 'playing a guitar', 'playing with a ball', 'juggling', 'jumping with joy'];

/**
 * @typedef {Object} CenaRoteiro
 * @property {string} id         <mundo>-<nn>
 * @property {number} mundo      1..10 (catalogo.js)
 * @property {number} k          1..10 dentro do mundo (10 = chefe)
 * @property {string} prot       protagonista: a figurinha do fim da cena
 * @property {[string, string][]} gente   [id do brainrot, o que ele faz]
 * @property {string} lugar
 * @property {string} objetos
 * @property {string} [bruto]    pasta de arte/bruto ja pronta (as cenas do laboratorio)
 * @property {string[]} [elenco] elenco congelado: a cena ja foi gerada (ou esta sendo) com ele
 * @property {string[]} [acoes]  o que cada vaga faz (a primeira e a do protagonista)
 */

/** @type {Omit<CenaRoteiro, 'mundo' | 'k'>[][]} um array por mundo, na ordem do catalogo */
const MUNDOS_ROTEIRO = [
  // 1 praia
  [
    { id: 'praia-01', prot: 'tralalero', bruto: 'praia-e2', gente: [['tralalero', 'dancing on the sand'], ['trippi-troppi', 'building a sandcastle'], ['bananita', 'jumping out of the turquoise sea']], lugar: 'a sunny tropical beach', objetos: 'a striped beach umbrella, beach balls, buckets and shovels, seashells, starfish, little crabs, palm trees with coconuts, sailboats, seagulls, fluffy clouds and an ice cream cart' },
    { id: 'praia-02', elenco: ['trulimero', 'tung-tung', 'chimpanzini', 'lirili', 'u-din-din'], acoes: ['selling ice cream from a cart', 'trying on sunglasses'], lugar: 'a lively beach boardwalk with shops and stalls', objetos: 'striped awnings, an ice cream cart, sunglasses on a rack, straw hats, beach towels hanging, a surfboard shop, balloons, palm trees in pots, bicycles, a popcorn stand and seagulls' },
    { id: 'praia-03', elenco: ['blueberrini', 'bombardiro', 'saturnita', 'ballerina', 'patapim'], acoes: ['jumping to hit the volleyball', 'cheering with pom-poms'], lugar: 'a beach volleyball match on the sand in the golden afternoon', objetos: 'a volleyball net, a striped volleyball, a referee chair, beach towels, sunglasses, coolers, a smoothie stand, palm trees, kites in the sky and beach umbrellas' },
    { id: 'praia-04', elenco: ['trippa-troppa', 'cappuccino-assassino', 'girafa-celestre', 'boneca-ambalabu', 'bobrito'], acoes: ['having a picnic on the grass', 'flying a kite'], lugar: 'a grassy cliff top with a red and white lighthouse', objetos: 'a checkered picnic blanket with sandwiches and fruit, a wooden staircase, flowers on the cliff, a kite in the sky, a small house with a blue door, a wooden fence, a bench, a telescope and fluffy clouds' },
    { id: 'praia-05', elenco: ['trippi-troppi', 'orangutini', 'burbaloni', 'cocofanto', 'espressona'], acoes: ['riding the carousel', 'eating cotton candy'], lugar: 'a seaside amusement park with a Ferris wheel and a carousel', objetos: 'a Ferris wheel, a carousel with horses, a cotton candy stand, balloons, game booths with prizes, a little roller coaster, a popcorn cart, string lights, palm trees and seagulls' },
    { id: 'praia-06', elenco: ['tung-tung', 'ta-ta-sahur', 'tigrrullini', 'cacto-hipopotamo', 'frigo-camelo'], acoes: ['scooping ice cream behind the counter', 'eating a giant sundae'], lugar: 'inside a cozy beach ice cream parlor', objetos: 'a long counter with tubs of colorful ice cream, sundae glasses, stacks of cones, jars of sprinkles, a jukebox, round stools, seashell decorations on the walls, a fishing net with starfish, a surfboard on the wall and potted palms' },
    { id: 'praia-07', elenco: ['chimpanzini', 'rhino-toasterino', 'bombombini', 'golubiro', 'meowl'], acoes: ['polishing the big brass lamp', 'reading a map at the table'], lugar: 'inside a lighthouse keeper\'s cozy round room', objetos: 'a spiral staircase, a big brass lamp, round windows, a ship wheel on the wall, coiled ropes, lanterns, a telescope, a globe, a kettle on a stove, a sleeping cat, books without titles and a model ship' },
    { id: 'praia-08', elenco: ['lirili', 'strawberry-elephant', 'glorbo', 'dragon-cannelloni', 'crabracadabra'], acoes: ['trying on a straw hat', 'shaking a snow globe'], lugar: 'inside a crowded beach souvenir shop', objetos: 'shelves of snow globes, shell necklaces, straw hats, colorful t-shirts without letters, flip-flops, toy boats, a cash register, a bin of beach balls, wind chimes, kites hanging from the ceiling and sunglasses on a stand' },
    { id: 'praia-09', elenco: ['u-din-din', 'pandaccini', 'piccione-macchina', 'trenostruzzo', 'tortuginni'], acoes: ['making smoothies', 'waxing a surfboard'], lugar: 'inside a surf shop with a smoothie bar', objetos: 'surfboards of many colors on wall racks, a smoothie counter with fruit, blenders, colorful cups, wetsuits on hangers, flip-flops, a sunglasses display, a parrot on a perch, string lights and a ceiling fan' },
    { id: 'praia-10', elenco: ['bombardiro', 'crocodilo-fromagioso', 'tigrulli', 'vulpegatto', 'ecco-cavallo', 'bambini-crossini', 'gattino-bananino'], acoes: ['dancing in the center', 'dancing', 'playing drums', 'serving drinks', 'waving maracas', 'juggling beach balls', 'taking photos'], lugar: 'a giant party inside a huge tiki hall with a bamboo roof', objetos: 'a stage with speakers, strings of colored lights, balloons, inflatable toys, food tables, tiki masks on the walls, beach balls, a fruit punch bowl, potted palms, confetti and a disco ball' },
  ],
  // 2 cafe
  [
    { id: 'cafe-01', prot: 'ballerina', bruto: 'cafe-e2', gente: [['ballerina', 'dancing on a table'], ['cappuccino-assassino', 'sneaking behind the counter'], ['espressona', 'sitting at a table with a newspaper without writing']], lugar: 'a cozy Italian café interior', objetos: 'a counter with croissants, cakes and donuts, a shiny coffee machine, cups and saucers, hanging lamps, potted plants, framed pictures of coffee beans, a checkered floor, windows with a street view and a cat sleeping on a chair' },
    { id: 'cafe-02', elenco: ['saturnita', 'frulli-frulla', 'uvanito', 'perochello', 'tractoro'], acoes: ['making cookies float with his magic wand', 'carrying a tray of cupcakes'], lugar: 'a busy pastry kitchen in a bakery', objetos: 'ovens, trays of cookies, flour sacks, rolling pins, eggs in a basket, whisks and bowls, a tall wedding cake, jars of sprinkles, hanging pans, a window with flowers and a mouse peeking from a hole' },
    { id: 'cafe-03', elenco: ['patapim', 'chicleteira', 'tartaruga-cisterna', 'pot-hotspot', 'talpa-di-fero'], acoes: ['carrying plates of spaghetti', 'eating a huge meatball'], lugar: 'inside a busy Italian restaurant dining room', objetos: 'tables with checkered tablecloths, plates of pasta, bread baskets, candles in glass jars, glasses of orange juice, hanging grapevines, framed paintings without text, a pizza oven in the back, a waiter tray, a violin player and potted lemon trees' },
    { id: 'cafe-04', elenco: ['cappuccino-assassino', 'tralalero', 'trulimero', 'blueberrini', 'trippa-troppa'], acoes: ['pouring coffee beans into a machine', 'sniffing a cup of coffee'], lugar: 'inside a coffee roasting factory', objetos: 'big shiny roasting machines, burlap sacks of beans, conveyor belts, pipes and gauges, scales, stacked cups, wooden barrels, a forklift, hanging lamps and a cat on a sack' },
    { id: 'cafe-05', elenco: ['girafa-celestre', 'boneca-ambalabu', 'bobrito', 'orangutini', 'burbaloni'], acoes: ['spinning while holding a giant ice cream cone', 'scooping gelato behind the counter'], lugar: 'a colorful Italian gelato shop', objetos: 'a long counter with many tubs of gelato of every color, stacks of cones, jars of sprinkles and candies, a plain menu board with only pictures, ceiling fans, round stools, a striped awning, balloons and a dog waiting at the door' },
    { id: 'cafe-06', elenco: ['cocofanto', 'crocodilo-fromagioso', 'ta-ta-sahur', 'tigrrullini', 'tigrulli'], acoes: ['tossing pizza dough in the air', 'sneaking a slice of pizza'], lugar: 'an Italian pizzeria kitchen', objetos: 'a brick pizza oven with fire, pizzas on wooden paddles, tomatoes, cheese wheels, basil pots, hanging garlic and peppers, jars of olives, copper pans, stacked plates, a checkered tablecloth and a cat on a shelf' },
    { id: 'cafe-07', elenco: ['espressona', 'cacto-hipopotamo', 'frigo-camelo', 'rhino-toasterino', 'bombombini'], acoes: ['feeding pigeons on a bench', 'dancing next to the fountain'], lugar: 'a sunny Italian piazza with a big stone fountain', objetos: 'a fountain with water jets, pigeons, a flower cart, a balloon seller, café tables, a man playing an accordion, scooters, colorful houses with balconies, potted lemon trees and string lights' },
    { id: 'cafe-08', elenco: ['boneca-ambalabu', 'golubiro', 'meowl', 'strawberry-elephant', 'glorbo'], acoes: ['practicing in front of a big mirror', 'sewing a costume'], lugar: 'the backstage of a ballet theater', objetos: 'racks of colorful costumes, mirrors with light bulbs, flower bouquets, ballet shoes with ribbons, a sewing machine, hat boxes, a red curtain, spotlights, music stands, a piano and a sleepy dog on a cushion' },
    { id: 'cafe-09', elenco: ['bobrito', 'vulpegatto', 'dragon-cannelloni', 'ecco-cavallo', 'bananita'], acoes: ['climbing a shelf to reach a jar', 'making lollipops appear with magic'], lugar: 'a sweet candy shop', objetos: 'shelves of glass jars full of candies, giant swirl lollipops, chocolate bars without labels, gumball machines, candy canes, a cotton candy machine, cupcakes, a pink counter, balloons and a little train toy running on a shelf' },
    { id: 'cafe-10', elenco: ['orangutini', 'crabracadabra', 'bambini-crossini', 'pandaccini', 'gattino-bananino', 'piccione-macchina', 'trenostruzzo'], acoes: ['dancing on a giant cake', 'juggling coffee cups', 'judging a coffee contest', 'making a fountain of hot chocolate with magic'], lugar: 'a grand coffee festival in a big decorated hall', objetos: 'long tables with cakes and pastries, many coffee machines, towers of cups, garlands of flags without text, balloons, chandeliers, a band with violins, coffee bean sacks, flower arrangements and confetti' },
  ],
  // 3 vila
  [
    { id: 'vila-01', elenco: ['burbaloni', 'frulli-frulla', 'tortuginni', 'uvanito', 'perochello'], acoes: ['eating breakfast at the table', 'yawning in a doorway'], lugar: 'inside a cozy wooden village house at breakfast time', objetos: 'a low table with rice bowls and fruit, clay pots, woven mats, a window with banana leaves, hanging lanterns, a rooster on the windowsill, baskets, a little shelf with toys, a sleeping cat and flower pots' },
    { id: 'vila-02', elenco: ['ta-ta-sahur', 'tractoro', 'chicleteira', 'tartaruga-cisterna', 'pot-hotspot'], acoes: ['hopping between the rice paddies', 'waving from a little hut'], lugar: 'green rice terraces in a sunny valley', objetos: 'farmers\' conical hats, ducks in the water, a scarecrow, a water buffalo, a wooden hut, palm trees, bamboo baskets, dragonflies, a little stream with a bridge and fluffy clouds' },
    { id: 'vila-03', elenco: ['tralaleritos', 'talpa-di-fero', 'tung-tung', 'chimpanzini', 'lirili'], acoes: ['pouring tea into cups', 'carrying a basket of rice'], lugar: 'a warm village kitchen', objetos: 'clay pots on a stove, steaming rice baskets, strings of chili peppers, coconuts, bunches of bananas, spice jars, a wooden table with bowls, hanging pans, a window with plants, a sleeping cat and chickens at the door' },
    { id: 'vila-04', elenco: ['crocodilo-fromagioso', 'u-din-din', 'bombardiro', 'saturnita', 'ballerina'], acoes: ['selling fruit from a stall', 'carrying a basket of fish'], lugar: 'inside a busy covered village market hall', objetos: 'stalls with fruit, vegetables, spices and flowers, woven baskets, conical hats, scales, hanging lanterns, wooden crates, chickens in a basket, umbrellas and a ceiling of palm leaves' },
    { id: 'vila-05', elenco: ['tigrrullini', 'trulimero', 'blueberrini', 'patapim', 'trippa-troppa'], acoes: ['drawing on a blank chalkboard', 'reading a picture book'], lugar: 'inside a colorful village classroom', objetos: 'small wooden desks, a blank chalkboard, a globe, school bags, paper kites on the walls, a world map with no text, pencils in cups, potted plants, a clock without numbers and a fish tank' },
    { id: 'vila-06', elenco: ['tigrulli', 'girafa-celestre', 'trippi-troppi', 'cocofanto', 'cacto-hipopotamo'], acoes: ['crossing a rope bridge', 'climbing a bamboo stalk'], lugar: 'a bright green bamboo forest', objetos: 'tall bamboo stalks, a rope bridge, paper lanterns, butterflies, frogs, a small stream with stones, mushrooms, ferns, birds, a stone lantern and a little tea house' },
    { id: 'vila-07', elenco: ['frigo-camelo', 'rhino-toasterino', 'bombombini', 'golubiro', 'meowl'], acoes: ['drumming in the middle of the crowd', 'selling hot tea at a stall', 'eating a skewer'], lugar: 'a lively village evening market lit by hundreds of colorful lanterns, bright and colorful', objetos: 'food stalls with skewers, noodle bowls and fruit, paper lanterns of many colors, string lights, toys, balloons, baskets, a spinning wheel game and happy visitors' },
    { id: 'vila-08', elenco: ['strawberry-elephant', 'glorbo', 'vulpegatto', 'dragon-cannelloni', 'ecco-cavallo'], acoes: ['painting a wooden puppet', 'playing with a spinning top'], lugar: 'inside a village toy workshop', objetos: 'shelves of wooden toys, puppets on strings, spinning tops, painted masks, kites, paint pots and brushes, wood shavings, a workbench with tools, a rocking horse and hanging lanterns' },
    { id: 'vila-09', elenco: ['cacto-hipopotamo', 'bananita', 'crabracadabra', 'bambini-crossini', 'pandaccini'], acoes: ['playing a big drum', 'blowing a bamboo flute'], lugar: 'inside a village music room full of instruments', objetos: 'drums of every size, gongs, bamboo flutes, xylophones, a ukulele, music stands, colorful cushions, hanging lanterns, a window with palm trees and a sleepy dog' },
    { id: 'vila-10', elenco: ['rhino-toasterino', 'tralalero', 'gattino-bananino', 'piccione-macchina', 'trenostruzzo', 'frulli-frulla', 'tortuginni'], acoes: ['leading the parade with his drum', 'marching and whistling steam', 'riding a decorated cart', 'dancing behind them'], lugar: 'a huge village drum parade festival', objetos: 'big decorated drums, giant paper lanterns, flags without text, flower garlands, a dragon puppet, balloons, food stalls, houses with decorations, confetti and cheering villagers' },
  ],
  // 4 selva
  [
    { id: 'selva-01', elenco: ['bombombini', 'uvanito', 'perochello', 'tractoro', 'chicleteira'], acoes: ['stomping happily with his huge feet', 'swinging on a vine'], lugar: 'a dense tropical jungle with giant leaves', objetos: 'parrots, toucans, butterflies, hanging vines, giant flowers, frogs, snails, mushrooms, a little waterfall, fallen logs, beetles and ferns' },
    { id: 'selva-02', elenco: ['pandaccini', 'tartaruga-cisterna', 'pot-hotspot', 'talpa-di-fero', 'tung-tung'], acoes: ['peeking out of a banana crate', 'driving a little cart'], lugar: 'inside a banana packing warehouse', objetos: 'stacks of banana crates, hanging banana bunches, conveyor belts, a little forklift, scales, ladders, ropes, a fan on the ceiling, parrots on beams and a big open door to the jungle' },
    { id: 'selva-03', elenco: ['gattino-bananino', 'chimpanzini', 'lirili', 'u-din-din', 'bombardiro'], acoes: ['reading a map by a lamp', 'looking through binoculars'], lugar: 'inside a jungle explorer\'s wooden cabin', objetos: 'maps on the walls without text, a compass, backpacks, a hammock, lanterns, butterfly frames, a globe, ropes, a kettle, potted plants and a window with jungle leaves' },
    { id: 'selva-04', elenco: ['golubiro', 'saturnita', 'ballerina', 'trulimero', 'blueberrini'], acoes: ['relaxing in a hammock', 'climbing a rope ladder'], lugar: 'inside a big treehouse living room', objetos: 'wooden walls, rope ladders, a hammock, lanterns, a round window with leaves, bunches of fruit, a rope bridge door, cushions, a little fireplace, birds on a branch inside and a telescope' },
    { id: 'selva-05', elenco: ['meowl', 'patapim', 'trippa-troppa', 'cappuccino-assassino', 'girafa-celestre'], acoes: ['splashing in a pool', 'standing under the waterfall'], lugar: 'a jungle waterfall with a turquoise pool', objetos: 'big mossy rocks, a rainbow over the water, tropical flowers, a toucan, butterflies, frogs, floating leaves, a rubber ring, palm trees, ferns and a little stone bridge' },
    { id: 'selva-06', elenco: ['glorbo', 'boneca-ambalabu', 'bobrito', 'orangutini', 'trippi-troppi'], acoes: ['blending juice behind the counter', 'drinking from a coconut'], lugar: 'inside a jungle fruit smoothie shop', objetos: 'a bamboo counter, blenders, plastic cups of bright pink, green and orange smoothies with straws, piles of mangoes, pineapples and coconuts, hanging fruit nets, stools, string lights, a parrot and big leaves on the walls' },
    { id: 'selva-07', elenco: ['vulpegatto', 'tralalero', 'burbaloni', 'cocofanto', 'espressona'], acoes: ['exploring with a lantern', 'peeking from behind a pillar'], lugar: 'inside an ancient jungle temple hall lit by torches', objetos: 'carved stone pillars, stone animal heads, steps, vines hanging inside, gold coins, an explorer backpack, a rope, colorful gems, torches on the walls, a hidden doorway and butterflies' },
    { id: 'selva-08', elenco: ['dragon-cannelloni', 'crocodilo-fromagioso', 'ta-ta-sahur', 'tigrrullini', 'tigrulli'], acoes: ['munching bamboo', 'playing a bamboo flute'], lugar: 'inside a panda nursery greenhouse', objetos: 'baby pandas, bamboo in pots, cushions, a little slide, bottles of milk, toy balls, glass walls with green plants, watering cans, a hammock and butterflies' },
    { id: 'selva-09', elenco: ['ecco-cavallo', 'frigo-camelo', 'strawberry-elephant', 'bananita', 'crabracadabra'], acoes: ['jumping in a puddle', 'holding a big leaf as an umbrella'], lugar: 'a rainy but bright jungle clearing', objetos: 'big puddles, raindrops, colorful umbrellas, frogs, snails, mushrooms, giant leaves, rubber boots, a rainbow, birds sheltering under leaves and a small wooden hut' },
    { id: 'selva-10', elenco: ['bambini-crossini', 'piccione-macchina', 'trenostruzzo', 'frulli-frulla', 'tortuginni', 'uvanito', 'perochello'], acoes: ['dancing with big steps', 'jumping out of a giant banana', 'playing the drums', 'juggling fruit', 'riding a giant leaf', 'waving maracas', 'cheering'], lugar: 'a jungle carnival party inside a giant striped tent', objetos: 'flower garlands, drums, maracas, fruit towers, lanterns, feather fans, balloons, a giant banana stage, parrots, streamers and confetti' },
  ],
  // 5 deserto
  [
    { id: 'deserto-01', elenco: ['tractoro', 'chicleteira', 'tartaruga-cisterna', 'pot-hotspot', 'talpa-di-fero'], acoes: ['checking his pocket watch by the water', 'drinking from the pond'], lugar: 'a sunny desert oasis', objetos: 'palm trees with dates, a blue pond, colorful tents, rugs, clay jars, lanterns, camels, lizards, flowers, sand dunes and a hot air balloon in the sky' },
    { id: 'deserto-02', elenco: ['bananita', 'tung-tung', 'chimpanzini', 'lirili', 'u-din-din'], acoes: ['selling colorful fruit', 'buying a rug'], lugar: 'inside a covered desert bazaar with brass lamps', objetos: 'stalls with colorful rugs, brass lamps, pottery, baskets of spices, hanging fabrics, slippers, a fruit stall, a cat on a crate, striped curtains and lanterns hanging from the ceiling' },
    { id: 'deserto-03', elenco: ['crabracadabra', 'bombardiro', 'saturnita', 'ballerina', 'trulimero'], acoes: ['watering cacti', 'smelling a cactus flower'], lugar: 'inside a big glass cactus greenhouse', objetos: 'many cacti in pots with pink and yellow flowers, round barrel cacti, shelves, a watering can, a little shovel, a wheelbarrow, lizards, butterflies, seed bags and glass panels' },
    { id: 'deserto-04', elenco: ['tralalita', 'blueberrini', 'patapim', 'trippa-troppa', 'cappuccino-assassino'], acoes: ['pouring tea into small cups', 'resting on cushions'], lugar: 'inside a big colorful desert tent', objetos: 'piles of cushions, rugs, brass lamps, a low table with a teapot and small porcelain cups, dates and fruit bowls, hanging fabrics, a tall brass vase with flowers, lanterns, a sleeping camel at the door and a drum' },
    { id: 'deserto-05', elenco: ['piccione-macchina', 'girafa-celestre', 'boneca-ambalabu', 'bobrito', 'orangutini'], acoes: ['toasting bread on a rock', 'resting in the shade'], lugar: 'a desert canyon with red rock arches', objetos: 'stone arches, red rock towers, hot air balloons, eagles, cacti, lizards, a little river, rope bridges, hiking backpacks, a picnic blanket and clouds' },
    { id: 'deserto-06', elenco: ['trenostruzzo', 'trippi-troppi', 'burbaloni', 'cocofanto', 'espressona'], acoes: ['serving ice cream sundaes at the counter', 'playing a banjo'], lugar: 'inside an old western ice cream parlor', objetos: 'a long wooden counter with ice cream sundaes, swinging doors, hay bales, wagon wheels on the walls, a piano, cowboy hats on hooks, lanterns, cacti in pots, a rocking chair and a sleepy dog' },
    { id: 'deserto-07', elenco: ['frulli-frulla', 'crocodilo-fromagioso', 'ta-ta-sahur', 'tigrrullini', 'tigrulli'], acoes: ['digging with a little shovel', 'brushing sand off a vase'], lugar: 'inside a pyramid chamber with painted picture carvings and no letters', objetos: 'stone walls with painted animal pictures, a golden sarcophagus, ancient vases, torches, a treasure chest, brushes, buckets, ropes, scarab statues and a sunbeam from a hole' },
    { id: 'deserto-08', elenco: ['tortuginni', 'cacto-hipopotamo', 'frigo-camelo', 'rhino-toasterino', 'bombombini'], acoes: ['serving toast to customers', 'keeping milkshakes cold'], lugar: 'a retro roadside diner in the desert', objetos: 'a diner counter with stools, plates of pancakes and eggs, milkshakes, a jukebox, a neon cactus shape without letters, an old car outside, a gas pump, cacti, a cat on the counter and plants' },
    { id: 'deserto-09', elenco: ['uvanito', 'golubiro', 'meowl', 'strawberry-elephant', 'glorbo'], acoes: ['looking at a huge dinosaur skeleton', 'holding a magnifying glass'], lugar: 'inside a natural history museum hall', objetos: 'a big friendly dinosaur skeleton, fossils in glass cases, rocks with shells, a mammoth statue, a magnifying glass, benches, ropes on posts, plants, skylights and visitors' },
    { id: 'deserto-10', elenco: ['perochello', 'vulpegatto', 'dragon-cannelloni', 'ecco-cavallo', 'bambini-crossini', 'pandaccini', 'gattino-bananino'], acoes: ['starting a race with his watch', 'racing', 'racing with toast flying', 'cheering in the crowd'], lugar: 'a big desert festival with a fun race', objetos: 'colorful tents, flags without text, balloons, a race track in the sand, food stalls, lanterns, drums, a hot air balloon, palm trees and confetti' },
  ],
  // 6 ceu
  [
    { id: 'ceu-01', acoes: ['pulling a suitcase', 'waving a little flag'], lugar: 'inside a busy airport terminal', objetos: 'suitcases on carts, departure screens with only symbols, big windows with airplanes outside, benches, a coffee kiosk, potted plants, a baggage belt, signs with arrows only and hanging lamps' },
    { id: 'ceu-02', acoes: ['flying between the islands', 'driving on a cloud road'], lugar: 'floating islands in the sky above the clouds', objetos: 'small islands with trees and houses, waterfalls falling into clouds, hot air balloons, rainbows, birds, kites, wooden bridges between islands, windmills and fluffy clouds' },
    { id: 'ceu-03', acoes: ['sorting letters into boxes', 'spying with binoculars'], lugar: 'inside a pigeon post office', objetos: 'wooden mail boxes, stacks of envelopes without writing, parcels, a scale, stamps, a mail cart, pigeons on perches, a big clock without numbers, lamps and a window with rooftops' },
    { id: 'ceu-04', acoes: ['arriving at the platform', 'hiding behind a newspaper without writing'], lugar: 'a modern train station with high speed trains', objetos: 'platforms, suitcases, benches, a big station clock without numbers, ticket gates, potted plants, a flower stand, a coffee kiosk, pigeons, hanging lamps and a glass roof' },
    { id: 'ceu-05', acoes: ['fixing a race car', 'holding a wrench'], lugar: 'inside a racing car garage workshop', objetos: 'race cars on lifts, tire stacks, tool boards, helmets, oil cans, a checkered flag, toolboxes, a trophy shelf, hoses and a big open door' },
    { id: 'ceu-06', acoes: ['flying around the towers', 'landing on a balcony'], lugar: 'a castle built on clouds in the sky', objetos: 'white towers with blue roofs, cloud gardens, rainbow bridges, flags without text, birds, a sun with rays, hot air balloons, kites, little cloud sheep and stars' },
    { id: 'ceu-07', acoes: ['looking out of the window', 'serving snacks from a cart'], lugar: 'inside an airplane cabin during a flight', objetos: 'rows of seats, round windows with clouds, a snack cart, little pillows, suitcases in the overhead bins, a curtain, seat belts, cups, a sleeping passenger and reading lights' },
    { id: 'ceu-08', acoes: ['pressing buttons on a big control panel', 'getting a gadget upgrade'], lugar: 'a secret pigeon spy headquarters', objetos: 'screens with maps and shapes but no text, gadgets on shelves, a periscope, binoculars, a rotating chair, filing cabinets, a globe, blinking lights, toolboxes and pigeons in disguises' },
    { id: 'ceu-09', acoes: ['turning a big gear', 'carrying a sack of flour'], lugar: 'inside an old windmill with wooden gears', objetos: 'big wooden gears, flour sacks, a millstone, ladders, ropes, a small window with sky, lanterns, mice, baskets of wheat, a cat and wooden beams' },
    { id: 'ceu-10', acoes: ['leading the formation', 'doing a loop', 'parachuting with a flag', 'driving on a ramp', 'running on a sky track'], lugar: 'a big air show over a crowd', objetos: 'colorful smoke trails, small planes, parachutes, hot air balloons, a grandstand with a cheering crowd, flags without text, a hangar, a control tower, balloons and confetti' },
  ],
  // 7 espaco
  [
    { id: 'espaco-01', acoes: ['floating with a wrench', 'looking out of a window'], lugar: 'a bright space station interior', objetos: 'round windows with planets, floating tools, control panels with colored buttons but no text, plants in pots, sleeping bags, a robot, food packets, cables, a treadmill and a fish bowl' },
    { id: 'espaco-02', acoes: ['walking across the moon', 'driving a moon rover'], lugar: 'the surface of the moon with craters and the Earth in the sky', objetos: 'craters, a moon rover, a lunar lander, plain flags, rocks, footprints, astronaut tools, a little telescope, satellites, stars and colorful planets' },
    { id: 'espaco-03', acoes: ['perched on a giant mushroom', 'waving from a hill'], lugar: 'a colorful alien planet with giant mushrooms', objetos: 'giant glowing mushrooms, cute little aliens, crystals, strange plants, two moons, floating bubbles, a small flying saucer, alien flowers, purple trees and rocks' },
    { id: 'espaco-04', acoes: ['pressing buttons on the panel', 'holding a checklist without text'], lugar: 'inside a rocket control room with big screens', objetos: 'rows of desks with colored buttons, big screens with planets and rockets only, headsets, coffee cups, a launch lever, a globe of the Earth, cables, a clock without numbers and a window with the rocket outside' },
    { id: 'espaco-05', acoes: ['sliding down her own rings', 'floating on a tube'], lugar: 'a playground in space built around a giant ringed planet', objetos: 'slides made of rings, floating swings, planets, comets, stars, little rockets, astronaut kids, balloons, a spinning wheel and asteroids' },
    { id: 'espaco-06', acoes: ['looking through a giant telescope', 'reading a star map without text'], lugar: 'a cozy observatory with a big telescope', objetos: 'a big brass telescope, star maps with dots only, globes, books, a ladder, a cup of cocoa, a planet model, a sleeping cat, lamps, a round window with stars and a desk with papers' },
    { id: 'espaco-07', acoes: ['buying space fruit', 'carrying bags'], lugar: 'inside an alien diner on a space station', objetos: 'a counter with glowing drinks, floating snacks, cute aliens of many colors, round windows with stars, robots serving food, stools, a jukebox with lights, plants and planets on the walls' },
    { id: 'espaco-08', acoes: ['watering space plants', 'picking glowing berries'], lugar: 'a greenhouse farm on a space station', objetos: 'rows of plants under glass domes, glowing tomatoes and carrots, watering cans, robots, flower pots, a bee robot, seed bags, hoses, round windows with planets and stars' },
    { id: 'espaco-09', acoes: ['flying through the cave', 'touching a glowing crystal'], lugar: 'a sparkling crystal cave on a far planet', objetos: 'huge colorful crystals, glowing mushrooms, a little underground lake, cute aliens, a lantern, a mine cart, gems, bats made of crystal, stalactites and footprints' },
    { id: 'espaco-10', acoes: ['dancing in the center', 'playing a keytar', 'spinning records', 'flying with confetti', 'doing loops'], lugar: 'a galactic party on a space station deck', objetos: 'a stage with lights, disco balls, cute aliens dancing, planets, rockets, balloons, floating snacks, comets, stars and confetti' },
  ],
  // 8 ilha
  [
    { id: 'ilha-01', acoes: ['floating in his coconut on the sea', 'spraying water with his trunk'], lugar: 'a tropical fruit island beach', objetos: 'palm trees, piles of tropical fruit, coconuts, pineapples, mangoes, a hammock, a straw hut, crabs, parrots, sea shells, a rowing boat and fluffy clouds' },
    { id: 'ilha-02', acoes: ['stirring a big pot of jam', 'carrying jars'], lugar: 'inside a fruit jam factory', objetos: 'big copper pots of jam, rows of jars with fruit pictures and no labels, conveyor belts, baskets of berries, apples and oranges, ladles, aprons on hooks, a scale and pipes' },
    { id: 'ilha-03', acoes: ['making smoothies', 'sipping with a straw'], lugar: 'inside a colorful fruit smoothie shop', objetos: 'blenders, bright opaque smoothies in plastic cups with straws, piles of fruit, a counter, stools, hanging lights, a surfboard on the wall, a parrot and potted palms' },
    { id: 'ilha-04', acoes: ['floating in the swamp', 'sitting on a log'], lugar: 'a bright jungle swamp full of watermelons', objetos: 'watermelons floating, lily pads, frogs, dragonflies, cattails, mangrove roots, a little wooden boat, fireflies, mushrooms, turtles, herons and mossy trees' },
    { id: 'ilha-05', acoes: ['walking among the plants', 'watering them'], lugar: 'inside a tropical fruit greenhouse', objetos: 'dragon fruit plants, banana plants, pineapples in pots, glass walls, watering cans, garden tools, a wooden cart, butterflies, bees, seed bags and a hose' },
    { id: 'ilha-06', acoes: ['relaxing in the warm water', 'reading a book without text'], lugar: 'inside a cozy wooden bathhouse with steaming tubs', objetos: 'wooden tubs with steam, capybaras with oranges on their heads, towels, wooden buckets, bamboo screens, lanterns, flowers, rubber ducks, a little waterfall and soap bottles' },
    { id: 'ilha-07', acoes: ['hiking up the path', 'roasting marshmallows'], lugar: 'a friendly cartoon volcano island with a gentle smoking peak', objetos: 'a smiling volcano with a little smoke, palm trees, a winding path, colorful rocks, a tent, a campfire, birds, flowers, a rope bridge and the sea around' },
    { id: 'ilha-08', acoes: ['decorating a strawberry cake', 'licking a spoon'], lugar: 'inside a fruit bakery making strawberry cakes', objetos: 'cakes with strawberries, cupcakes, baskets of berries, ovens, mixers, flour bags, rolling pins, cake stands, aprons and jars of sprinkles' },
    { id: 'ilha-09', acoes: ['sitting on a treasure chest', 'peeking from a barrel'], lugar: 'inside the hold of an old wooden ship full of treasure', objetos: 'treasure chests, gold coins, barrels, ropes, lanterns, a ship wheel, maps without text, a parrot, crates, round portholes with the sea and hammocks' },
    { id: 'ilha-10', acoes: ['on a giant fruit float', 'floating in a coconut', 'blowing a trumpet', 'carrying flags', 'dancing'], lugar: 'a big fruit festival parade on the island', objetos: 'parade floats shaped like fruits, flower garlands, drums, balloons, fruit towers, flags without text, palm trees, cheering crowds, confetti and streamers' },
  ],
  // 9 cidade
  [
    { id: 'cidade-01', acoes: ['riding across the street', 'waiting at the corner'], lugar: 'a busy colorful city crossroads', objetos: 'cars, a bus, traffic lights, a zebra crossing, shops with awnings and no text, street lamps, pigeons, a hot dog cart, bicycles, potted trees and fire hydrants' },
    { id: 'cidade-02', acoes: ['holding the handrail', 'reading a newspaper without writing'], lugar: 'inside a city bus full of passengers', objetos: 'rows of seats, handrails, windows with city buildings outside, shopping bags, a stroller, a dog, umbrellas, a driver at the wheel, a stop button and passengers' },
    { id: 'cidade-03', acoes: ['watering flowers', 'taking a selfie'], lugar: 'a green city park with a fountain', objetos: 'a fountain, benches, flower beds, ducks in a pond, a playground, kites, an ice cream cart, joggers, trees, a gazebo, balloons and pigeons' },
    { id: 'cidade-04', acoes: ['jumping on a trampoline', 'skating down a ramp'], lugar: 'inside an indoor skate and trampoline park', objetos: 'trampolines, ramps, foam pits, skateboards, helmets, colorful walls with shapes and no letters, a snack bar, lockers, a speaker and string lights' },
    { id: 'cidade-05', acoes: ['pushing a shopping cart', 'reaching the top shelf'], lugar: 'a colorful supermarket', objetos: 'shelves full of colorful boxes and jars without labels, fruit and vegetable stands, shopping carts, a cashier counter, balloons, a fish tank, bread baskets, cheese and a mopping robot' },
    { id: 'cidade-06', acoes: ['looking at his phone on the platform', 'carrying a briefcase'], lugar: 'a clean bright subway station', objetos: 'a subway train with open doors, benches, tiled walls, a plain map with colored lines only, turnstiles, escalators, a newspaper stand without text, plants, pigeons and lamps' },
    { id: 'cidade-07', acoes: ['reading a picture book', 'pushing a book cart'], lugar: 'inside a bright city library', objetos: 'tall bookshelves with books without titles, reading tables, lamps, a globe, comfy armchairs, a book cart, potted plants, a ladder, kids reading and big windows' },
    { id: 'cidade-08', acoes: ['spraying water from her tank', 'holding a ladder'], lugar: 'a friendly fire station with the doors open', objetos: 'a red fire truck, hoses, helmets on hooks, a dalmatian dog, ladders, boots, a fire pole, a hydrant, traffic cones, a basketball hoop and a cat on a roof' },
    { id: 'cidade-09', acoes: ['testing a toy car', 'riding a toy bicycle'], lugar: 'a big colorful toy store', objetos: 'shelves of teddy bears, toy trains, robots, rocking horses, balls, kites, building blocks without letters, dolls, a toy rocket, balloons and a train track around the ceiling' },
    { id: 'cidade-10', acoes: ['pulling a float', 'riding in front', 'spraying sparkly water', 'filming with his phone', 'waving from the top of a float'], lugar: 'a big city parade on the main avenue', objetos: 'parade floats, giant balloons, a marching band, confetti, flags without text, crowds on the sidewalks, buildings with decorations, street lamps, streamers and fireworks of colors' },
  ],
  // 10 castelo
  [
    { id: 'castelo-01', acoes: ['resting on the castle wall', 'guarding the gate'], lugar: 'a sunny medieval castle courtyard', objetos: 'stone towers, plain colorful banners, a well, horses, a hay cart, barrels, chickens, a market stall, flower boxes, a drawbridge and flags without text' },
    { id: 'castelo-02', acoes: ['drilling into the rock', 'pushing a mine cart'], lugar: 'a bright underground mine under the castle', objetos: 'mine carts on rails, shining gems in the walls, lanterns, wooden beams, pickaxes, buckets, gold nuggets, ladders, a little underground river and mushrooms' },
    { id: 'castelo-03', acoes: ['cooking pasta with his fire breath', 'stirring a pot'], lugar: 'a huge castle kitchen preparing a banquet', objetos: 'big pots of pasta, roasting chickens, bread loaves, cheese wheels, hanging herbs, copper pans, barrels, a long table, a fireplace, cats and baskets of vegetables' },
    { id: 'castelo-04', acoes: ['popping up from the floor', 'dancing before the throne', 'sitting on the throne'], lugar: 'a royal throne room', objetos: 'a golden throne, red carpet, tall windows with stained glass shapes, chandeliers, suits of armor without weapons, plain banners, a crown on a cushion, potted plants and a sleeping dog' },
    { id: 'castelo-05', acoes: ['digging under a hedge', 'lost in the maze'], lugar: 'a castle garden with a hedge maze', objetos: 'hedge walls, rose bushes, a fountain, statues of animals, a gazebo, garden benches, peacocks, butterflies, topiary shapes, a pond with swans and flower arches' },
    { id: 'castelo-06', acoes: ['reading a giant book without text', 'making books fly with magic'], lugar: 'a magical castle library', objetos: 'tall bookshelves, flying books, a ladder, glowing potions in bottles, candles, a globe, a crystal ball, an owl, scrolls, a cozy armchair and a fireplace' },
    { id: 'castelo-07', acoes: ['guarding a nest of eggs', 'peeking from the window'], lugar: 'inside the dragon\'s cozy room at the top of the castle tower', objetos: 'a big nest with colorful eggs, a round window with clouds, piles of gold coins, a pasta pot, candles, a rug, a little bed, books without titles, a telescope and banners without text' },
    { id: 'castelo-08', acoes: ['winning a game', 'juggling', 'eating cotton candy'], lugar: 'inside the castle game room with a puppet show', objetos: 'a puppet theater, game tables, chess boards, ring toss, juggling balls, cushions, banners without text, chandeliers, a pinball-like wooden game and a sleepy dog' },
    { id: 'castelo-09', acoes: ['polishing a giant gem', 'counting gold coins'], lugar: 'a castle treasure room full of gold', objetos: 'piles of gold coins, treasure chests, crowns, goblets, gems of every color, a golden mirror, necklaces, a suit of armor without weapons, torches and a magic lamp' },
    { id: 'castelo-10', acoes: ['dancing in the center', 'drumming', 'spinning', 'dancing', 'dropping confetti from the ceiling', 'waving', 'jumping', 'playing music'], lugar: 'a grand royal ball in the great hall of the castle', objetos: 'chandeliers, a long banquet table with cakes, a giant cake, balloons, plain banners, a band, a red carpet, tall windows, flowers and confetti' },
  ],
];

/** A familia dos tubaroes: o dono pediu menos tubarao (2026-11-08). No maximo 1 por cena. */
const TUBAROES = new Set(['tralalero', 'tralalita', 'tralaleritos']);
/** Cenas seguidas sem tubarao entre duas que tem. */
const FOLGA_TUBARAO = 6;
/** Cenas anteriores cujos personagens nao voltam (o dono: "para de colocar repetidos"). */
const SEM_REPETIR = 2;
const ORDEM_RAR = { S: 0, A: 1, B: 2 };
/**
 * O elenco minimo que o dono mandou (2026-11-08, a manta "Italian Brainrot"): estes sao os
 * primeiros a virar protagonista e os primeiros chamados para as cenas.
 */
export const ELENCO_DO_DONO = ['tung-tung', 'chimpanzini', 'lirili', 'u-din-din', 'bombardiro', 'tralalero', 'saturnita',
  'ballerina', 'trulimero', 'blueberrini', 'patapim', 'trippa-troppa', 'cappuccino-assassino', 'girafa-celestre',
  'boneca-ambalabu', 'bobrito', 'orangutini', 'trippi-troppi', 'burbaloni', 'cocofanto'];
const DO_DONO = new Map(ELENCO_DO_DONO.map((id, i) => [id, i]));
/** Posicao na fila: o elenco do dono primeiro (na ordem dele), depois a fama. @param {string} id */
const fila = (id) => (DO_DONO.has(id) ? /** @type {number} */ (DO_DONO.get(id)) : 100 + ORDEM_RAR[/** @type {'S'} */ ((BRAINROTS.find((b) => b.id === id) || { raridade: 'B' }).raridade)]);
const NATIVO = new Map(BRAINROTS.map((b) => [b.id, b.mundo]));

/**
 * Escolhe quem aparece em cada cena, na ordem de jogo, sem sorteio:
 * - o protagonista (a figurinha) e quem foi protagonista menos vezes: ate o album encher,
 *   toda cena da uma figurinha nova; empate vai para o nativo do mundo, depois o mais famoso;
 * - os outros sao os que apareceram menos, os famosos primeiro;
 * - ninguem das SEM_REPETIR cenas anteriores (nem da seguinte, se ela ja estiver pronta);
 * - no maximo 1 tubarao por cena, e so FOLGA_TUBARAO cenas depois do ultimo; Tralalita e
 *   Los Tralaleritos so aparecem na propria cena de protagonista.
 * A acao de cada vaga vem do roteiro da cena (a primeira e a do protagonista).
 * @param {any[]} cenas
 */
function escolherGente(cenas) {
  const ids = BRAINROTS.map((b) => b.id);
  const vezes = new Map(ids.map((id) => [id, 0]));
  const prots = new Map(ids.map((id) => [id, 0]));
  let ultimoTubarao = -99;
  /** @type {string[][]} */
  const elencos = [];
  cenas.forEach((c, i) => {
    let gente;
    if (c.bruto) gente = c.gente;
    else if (c.elenco) gente = c.elenco.map((id, k) => [id, (c.acoes || [])[k] || ACOES_EXTRA[(i + k) % ACOES_EXTRA.length]]);
    else {
      const proibidos = new Set(elencos.slice(Math.max(0, i - SEM_REPETIR)).flat());
      const prox = cenas[i + 1];
      if (prox && prox.bruto) for (const [g] of prox.gente) proibidos.add(g);
      const tubaraoOk = () => i - ultimoTubarao > FOLGA_TUBARAO;
      const nota = (/** @type {string} */ id, /** @type {Map<string, number>} */ m) => [m.get(id), fila(id), ids.indexOf(id)];
      const menor = (/** @type {string[]} */ l, /** @type {(id: string) => number[]} */ f) => [...l].sort((a, b) => {
        const x = f(a);
        const y = f(b);
        for (let k = 0; k < x.length; k++) if (x[k] !== y[k]) return x[k] - y[k];
        return 0;
      });
      const livres = ids.filter((id) => !proibidos.has(id) && (!TUBAROES.has(id) || tubaraoOk()));
      const prot = menor(livres, (id) => [prots.get(id), DO_DONO.has(id) ? 0 : 1, NATIVO.get(id) === c.mundo ? 0 : 1, fila(id), ids.indexOf(id)])[0];
      const n = c.k === 10 ? GENTE_CHEFE : GENTE_MIN;
      const elenco = [prot];
      for (const id of menor(livres, (x) => nota(x, vezes))) {
        if (elenco.length >= n) break;
        if (elenco.includes(id)) continue;
        if (TUBAROES.has(id) && (id !== 'tralalero' || elenco.some((x) => TUBAROES.has(x)))) continue;
        elenco.push(id);
      }
      const acoes = c.acoes || [];
      gente = elenco.map((id, k) => [id, acoes[k] || ACOES_EXTRA[(i + k) % ACOES_EXTRA.length]]);
    }
    const elenco = gente.map((/** @type {any} */ g) => g[0]);
    for (const id of elenco) vezes.set(id, (vezes.get(id) || 0) + 1);
    prots.set(elenco[0], (prots.get(elenco[0]) || 0) + 1);
    if (elenco.some((id) => TUBAROES.has(id))) ultimoTubarao = i;
    elencos.push(elenco);
    c.gente = gente;
    c.prot = elenco[0];
  });
  return cenas;
}

/** Todas as cenas na ordem de jogo. @type {CenaRoteiro[]} */
export const CENAS_ROTEIRO = escolherGente(MUNDOS_ROTEIRO.flatMap((lista, i) => lista.map((c, j) => ({ ...c, mundo: i + 1, k: j + 1 }))));

/**
 * Quantos erros a cena tem: as duas primeiras do jogo ensinam (3 e 5), o chefe do mundo tem 10.
 * @param {CenaRoteiro} c
 */
export function errosDaCena(c) {
  if (c.mundo === 1 && c.k === 1) return 3;
  if (c.mundo === 1 && c.k === 2) return 5;
  return c.k === 10 ? 10 : 7;
}

/**
 * Edicoes pedidas ao Grok, todas a partir de A. O Grok do dono tem limite de uso: poucas edicoes
 * com mais mudancas cada (2 x 6 = 12 candidatas para 7 erros; o chefe, 3 x 5 = 15 para 10).
 * @param {CenaRoteiro} c
 */
export const edicoesDaCena = (c) => (c.k === 10 ? 3 : 2);
/** @param {CenaRoteiro} c */
export const mudancasPorEdicao = (c) => (c.k === 10 ? 5 : 6);

/** @param {string} id */
export const cenaRoteiro = (id) => CENAS_ROTEIRO.find((c) => c.id === id) || null;

/** O prompt da imagem A. @param {CenaRoteiro} c */
export function promptDaCena(c) {
  const gente = c.gente.map(([id, acao]) => `${APARENCIA[id]} ${acao}`).join('; ');
  return `${c.lugar} with ${c.gente.length} characters: ${gente}. Around them: ${c.objetos}. ${COMPOSICAO}, ${ESTILO}`;
}

/** O prompt do retrato da figurinha (1:1). @param {string} id */
export function promptDoRetrato(id) {
  return `${APARENCIA[id]}, single character, full body, centered, happy, plain pastel background, 1:1, no text, no logo, ${ESTILO}`;
}

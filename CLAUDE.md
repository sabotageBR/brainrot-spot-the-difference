# Brainrot 7 Erros (Brainrot Spot the Difference)

Jogo dos sete erros com brainrots, para a Poki. É feito **só com HTML + JavaScript**: ES modules nativos, canvas 2D e WebAudio, no padrão do `../memecats-portais`. Não há bundler, framework nem TypeScript. As ferramentas usam o Node 18+ e o Chrome (`google-chrome`), e esta máquina não tem ImageMagick: a imagem é processada no navegador.

O plano aprovado está em `~/.claude/plans/quero-desenvolver-um-jogo-fuzzy-kettle.md`.

## Estado (2026-11-08)
- **Etapa 1 (laboratório): encerrada.** O dono escolheu **M2 Coleção zen + o pisca como poder, no estilo E2 (cartoon 2D)**.
  - A escolha está em `docs/decisao.md`.
  - `modelos/laboratorio.html` ficou congelado como registro, com as bases em `modelos/estilos/` e os prints em `modelos/prints/`.
  - Os modelos que não foram escolhidos saíram do código.
- **Etapa 2 (jogo completo): em andamento.**
  - O código do jogo final está pronto: 100 fases em 10 mundos, figurinha por fase, mapa, álbum, dourado escondido, presente do dia, faixa de mundo e de chefe, e o build da Poki.
  - A arte é produzida no Grok, em lotes (`docs/arte/producao.md`). `node tools/roteiro.mjs falta` mostra o que falta.
  - **Em 2026-11-08 havia 50 de 100 fases prontas**: praia, café, vila, selva e deserto completos. Faltavam céu, espaço, ilha, cidade e castelo.
    - A produção parou em 52% da cota semanal do Grok do dono, que reinicia em 2026-11-12 01:29. Cada fase gasta cerca de 3,2 pedidos, e as 50 restantes levariam a cota a perto de 100%.
    - Instruções fixas do lote: `docs/arte/lote.md`.
    - Capa: 4 opções em `marketing/thumb/` (`opcoes.png` lado a lado), cada uma com a estática em 1256 e 628 px e a animada em MP4 (`vitrine.html` compara). **O dono escolheu a opção 1 em 2026-11-09**: ela foi copiada para `distribuicao/brainrot-spot-the-difference/poki/` (`thumb-1256x1256.png`, `thumb-628x628.png` e `thumb-animada-1080x1080.mp4`), junto com o zip da build.

## Repositório
- **GitHub:** `sabotageBR/brainrot-spot-the-difference` (público), branch `main`.
- **Ficam fora do git:**
  - `dist/`, `dist-poki/` e o zip, que saem do `npm run poki`;
  - as folhas `docs/cenas/*.png`, que o `node tools/estudio-auto.mjs` regenera.
- **Entram no git:** os originais do Grok em `arte/bruto/` e o `arte/origem.json`, porque são a prova de "editado, não cru" que a Poki pede.

## Regra do jogo
- **A cena:** a imagem A (do Grok) e a B, que é A com os remendos. **B não existe em arquivo:** `render/compor.js` monta B em tempo de execução, então B só difere de A dentro das elipses dos erros.
- **Erros por fase:** 3 na fase 1, 5 na fase 2, 7 nas outras e 10 no chefe (a 10ª de cada mundo).
- **O toque:** acerta a elipse dilatada pela tolerância `toleranciaImg` (dedo de 22 px CSS, entre 2% e 7% da largura).
  - Toque num erro já achado não pune.
  - Arrastar, fazer pinça ou usar a roda nunca conta como palpite (`ui/entrada.js`).
- **Antispam:** 3 erros em 2 s travam o toque por 1,5 s ("Calma!").
- **Combo:** acertos a até 4 s um do outro sobem a nota sem fim (`notaSemFim`).
- **Zen:** não há prazo nem derrota. Errar e usar dica só tiram estrela (`jogo/regras.js`, `estrelasDe`; o chefe tem folga).
- **Dica:**
  - 1 grátis por cena;
  - depois, as do banco (presente do dia);
  - depois, 🎬 (rewarded).
- **Pisca:** 1 grátis por cena e depois 🎬. Alterna A e B sozinho por 3 s.
- **Dourado:**
  - cada cena esconde um brainrot dourado (`lugarEscondido`, com semente pelo id);
  - ele só vale antes do último erro;
  - deixa a figurinha dourada para sempre.
- **Figurinha:** é o protagonista da cena (`cena.prot`), recortado da caixa dele em A (`cena.personagens`). Repetida, mostra "x2" e a fase passa sozinha em 3 s; nova, espera o jogador.
- **Progresso** (`jogo/progresso.js`):
  - a próxima fase é a primeira não feita, na ordem do roteiro;
  - no mapa, a fase feita e a atual abrem; a que ainda não tem arte aparece "em breve";
  - o número da fase é `(mundo-1)*10+k`.
- **Presente do dia:** só para quem já jogou. Dá dicas pela sequência de dias seguidos (1, 1, 2, 2, 2, 2, 3...).
- **Intervalo comercial:** entre fases, a partir da 4ª fase da sessão.

## Estrutura
- **`src/jogo/`, lógica pura** (sem DOM, relógio nem `Math.random`):
  - `cena.js`: formato, acerto e validação;
  - `partida.js`: estado da cena, dica, pisca, estrelas e escondido;
  - `regras.js`: os números do modo zen;
  - `progresso.js`: próxima fase, mapa, figurinha e presente do dia;
  - `catalogo.js`: os 54 brainrots, os mundos e o canto.
- **`src/render/`:**
  - `layout.js`: geometria pura; empilha ou põe lado a lado, o que der a maior imagem;
  - `palco.js`: canvas, câmera compartilhada, caneta, X, partículas, pisca, dourado e mão do tutorial;
  - `compor.js`.
- **`src/ui/`:** `hud.js` (DOM: placa, progresso, status, painel, álbum, mapa e faixa), `entrada.js` (gestos), `estilo.css` e as fontes Fredoka (OFL).
- **`src/core/`:** copiado do memecats (`poki.js` com fila e prazos, `portal.js`, `relogio.js`, `armazenamento.js` com prefixo `brainrot7.`, `depuracao.js`, `rng.js` e `audio.js`).
- **`src/main.js`** liga tudo. O estado fica em `J`, e `J.gen` sobe a cada `iniciarCena`. Todo timer usa `depois(ms, fn)`, que guarda a geração.
- **`src/arte/cenas/<id>/`** (`a.webp`, `d1..dN.webp` e `cena.json`, com `id` = `<mundo>-<nn>`) e o `manifesto.js` (na ordem de jogo) são **gerados pelo estúdio**. Não edite à mão.
- **`arte/roteiro.js`:** as 100 cenas (lugar, objetos e ações) e a aparência fixa de cada brainrot. `escolherGente` decide o elenco de cada cena, sem sorteio:
  - 5 brainrots por cena, 7 no chefe;
  - nenhum repete da cena anterior nem da anterior a ela;
  - um protagonista novo por cena até o álbum encher;
  - o elenco mínimo do dono (`ELENCO_DO_DONO`, os 20 da manta "Italian Brainrot") vem primeiro, e depois os 9 da tier list que ele mandou;
  - as cenas já geradas têm o `elenco` congelado no roteiro, então mexer no catálogo não muda essas cenas;
  - no máximo 1 tubarão por cena, a cada 7 cenas;
  - nada de fundo do mar.

## Arte (Grok Imagine → estúdio → cena)
1. **Geração:** Claude opera o Grok Imagine no Chrome do dono (decisão dele; não há chave de API). **O Grok dele tem limite de uso, e ele acompanha ao vivo.**
   - O manual do agente está em `docs/arte/producao.md`, e as lições em `docs/arte/prompts.md`.
   - Os prompts saem de `node tools/roteiro.mjs <id>`.
   - Por cena: a base A e 2 edições a partir de A, com 6 mudanças cada. O chefe tem 3 × 5.
   - O registro traz as `caixas` dos personagens, de onde sai a figurinha.
   - Cenas recusadas vão para `arte/descartadas/`.
   - **Efeito colateral feio** (um personagem inteiro recolorido, por exemplo): o registro ganha `"evitar": [[x, y], ...]`, em px de `a.jpg`, e a escolha automática do estúdio pula a mancha que contém o ponto (vila-05 e vila-09).
   - **Retoque à mão:** só em último caso, como o copo âmbar da cafe-07, que virou suco. Ele vale para A e para as variantes, fica anotado no registro (`retoque`), e os originais vão para `arte/descartadas/`.
   - **Nada de álcool, narguilé ou bar:** o roteiro usa sorveteria, loja de vitaminas e chá em xícara.
   - Os arquivos ficam em `arte/bruto/<cena>-<estilo>/` (`a.jpg`, `v1..v3.jpg`, `registro.json` com o prompt exato e as mudanças pedidas, e `personagens.json` com as caixas das figurinhas em px de 1024×768).
   - Fatos do piloto:
     - o Grok sai em 1600×1200 JPEG, sem marca d'água visível, com EXIF de proveniência (o estúdio recodifica e tira o EXIF);
     - cada edição redesenha a imagem inteira, mas não desloca nada: fica só um fantasma fino nos contornos;
     - remover e contar coisas são os pedidos menos confiáveis.
2. **Estúdio** (`tools/estudio.html` + `estudio.js`, núcleo puro em `tools/estudio-nucleo.js`):
   1. reduz para 1024×768;
   2. alinha cada variante;
   3. mede a diferença borrada;
   4. limiar mais abertura, que apaga o fantasma;
   5. componentes, fundidos se ficarem a até 70 px, sem inchar a caixa mais de 2,5×, com no máximo 20% da largura e com a mesma troca de cor.
   - A escolha automática pega quantas o roteiro pedir (`errosDaCena`), bem espalhadas, sem sobreposição, e dá bônus a mudanças nos personagens. A base sai em WebP 0,75, cerca de 145 KB.
   - À mão: clicar alterna a candidata, há o remendo manual por retângulo e as caixas dos personagens.
   - **Gravar** (`POST /__estudio` → `tools/estudio.mjs`): valida com `validarCena` e escreve a cena, o manifesto, `docs/cenas/<id>.png` (folha A | B com os erros numerados, para conferir) e `arte/origem.json` (a prova de "editado, não cru" para a Poki).
3. **Sem tela:** `node tools/estudio-auto.mjs [ids]` faz o mesmo no Chrome headless.

## Risco de IP (decisão do dono, 2026-11-07)
- **Personagens famosos com os nomes reais:**
  - Tung Tung Tung Sahur está em processo nos EUA;
  - Tralalero e Ballerina Cappuccina têm pedidos de marca, e o da Ballerina cobre jogos.
- **Blueberrini Octopusini:** entrou porque está no elenco mínimo do dono, escrito "Octopusini", com um s só. A grafia original, "Octopussini", foi barrada na pesquisa por ser um nome sexual.
- **A regra escrita da Poki** prevê rejeição. Mesmo assim, ela publicou Thung Wars e Brainrot Puzzle com os nomes.
- **Atenuação:** nomes e arte só nos dados.
- **Ficam fora** os nomes sexuais, as pessoas reais e IP de terceiros. A lista e as fontes estão em `docs/pesquisa/brainrots.md`.
- **Nenhum áudio dos memes:** o canto é sintetizado.

## Convenções
- Código e comentários em português, comentários em ASCII. 2 espaços, aspas simples, ponto e vírgula. JSDoc no lugar de tipos.
- **Fronteiras vigiadas por `test/estilo.test.js`:**
  - só `portal.js` importa `poki.js`, e só `main.js` importa `portal.js`;
  - nada de escrever "Poki" em `src/` fora desses dois;
  - só `relogio.js` lê o tempo e agenda (exceção: o timer do mudo em `audio.js`);
  - só `armazenamento.js` toca o localStorage;
  - só `depuracao.js` lê a URL;
  - `src/jogo/` não usa sorteio, DOM nem relógio;
  - sem `console.log`;
  - a única URL externa é a do SDK.
- **Toda proposta visual vai como imagem ou protótipo jogável**, nunca como descrição (preferência do dono).

## Comandos
- `npm test`: lógica, progresso, roteiro, layout, cena, partida, SDK, relógio, estilo e as cenas geradas.
- `npm run servir`: sobe o servidor em http://127.0.0.1:5400/.
  - **Parâmetros locais:**
    - `?cena=praia-03`;
    - `?revelar`, `?auto=300`, `?semanuncio`;
    - `?novo` (sem save);
    - `?lang=pt|es|en`;
    - `?dia=AAAA-MM-DD` (finge o dia, para o presente).
  - **Páginas:** `/tools/estudio.html?id=<cena>` e o laboratório congelado em `/modelos/laboratorio.html`.
- `node tools/roteiro.mjs <id> | falta [mundo] | retrato <id>`: os prompts e o que falta.
- `node tools/estudio-auto.mjs [ids]`: processa as cenas sem tela.
- `node tools/thumb.mjs`: a thumb da Poki em 1256 e 628 px, a partir de `marketing/thumb/grok-*.jpg` (o prompt está em `docs/arte/thumb.md`).
- `node tools/thumb-animada.mjs <opção>`: a thumb animada da Poki (MP4 1080×1080, 60 fps, 5,8 s), gravada do jogo quadro a quadro, começando e terminando na arte da opção. A vitrine das opções fica em `/marketing/thumb/vitrine.html`.
- `npm run prints`: prints em `docs/prints/` (1031×580, 640×360, 390×844, fim, mapa e álbum) e os erros do console.
- `npm run sdkcheck`: 5 cenários do SDK falso:
  - init, loading e start só com input;
  - dica grátis antes do vídeo;
  - rewarded e commercialBreak calados;
  - intervalo na entrada da 4ª fase;
  - sem SDK e localStorage quebrado.
- `npm run poki`: testes, `dist/`, conferência (URL externa, `console.log`, `.map`, carga inicial ≤ 5 MB, aviso acima de 8 MB no total), zip em `dist-poki/` e sdkcheck na build.
- **Ganchos** (só no local): `window.__b7` (`J`, `save`, `palco`, `audio`, `relogio`, `portal`, `tocarErro(i)`, `errar()`, `acharDourado()`, `auto(ms)` e `irPara(id)`).

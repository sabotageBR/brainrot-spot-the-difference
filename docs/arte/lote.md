# Lote de produção no Grok (instruções fixas do agente)

**Quem lê:** o agente que opera o Grok Imagine no Chrome do dono, em grok.com/imagine, na conta dele. Foi decisão dele: "Claude opera o Grok Imagine no meu Chrome".

**O Grok do dono tem LIMITE DE USO:** cada pedido tem que ser o definitivo. Os lotes anteriores saíram com 3 pedidos por cena (4 no chefe). Faça igual.

**Leia antes, e siga à risca:**
- `docs/arte/producao.md`: o manual;
- `docs/arte/prompts.md`: as lições;
- `arte/bruto/praia-08/registro.json` e `arte/bruto/praia-10/registro.json` (chefe): exemplos bons.

## Cada cena
- **O prompt:** rode `node tools/roteiro.mjs <id>` e cole o `prompt` **exatamente** como vem.
- **A cena comum:** 5 brainrots, 2 edições a partir de A, com 6 mudanças cada (`v1.jpg` e `v2.jpg`). Aceite a base com pelo menos 4 dos 5 reconhecíveis.
- **O chefe** (`<mundo>-10`): 7 brainrots, 3 edições com 5 mudanças cada (`v1` a `v3`). Aceite a base com pelo menos 6 dos 7.
- **A base:** 1 geração (×4, 4:3). Recuse a imagem que tiver:
  - texto legível ou logo;
  - faca, arma ou espada;
  - **álcool** (vinho, cerveja, garrafa ou taça de bebida);
  - tubarão a mais;
  - cena no fundo do mar;
  - sala com parede ou chão quase vazios;
  - área grande desfocada;
  - personagem desenhado errado: ao lado do objeto em vez de ser feito dele, ou com o papel trocado.

  Gere de novo só se as 4 forem inaceitáveis, e no máximo 2 rodadas.
- **As edições:** todas a partir de A.
  - Pelo menos 2 mudanças por edição em personagens da lista.
  - Uma mudança por objeto pequeno e isolado, com a posição dita: o Grok recolore os vizinhos da mesma cor.
  - Nunca o mesmo objeto em duas edições.
  - Espalhadas pela tela, cada uma com pelo menos ~4% da largura.
  - No máximo 1 remoção ou contagem por edição.
  - **Nunca recolorir um objeto na mão ou colado num personagem** (violão, câmera, bola no colo): o Grok recolore o personagem inteiro (Blueberrini em vila-05, Bambini Crossini em vila-09). Em personagem, só acessório novo (óculos, chapéu, laço, lenço) ou a cor de uma peça de roupa grande.
- **Refazer:** só quando um personagem sumir ou o enquadramento andar. Senão, registre o "NAO FEITO" e os efeitos colaterais, e siga.
- **Os arquivos** vão para `arte/bruto/<id>/`: `a.jpg`, `v1.jpg`, `v2.jpg` (e `v3.jpg` no chefe), e `registro.json`.
  - O registro leva `caixas`: a caixa folgada, da cabeça aos pés, de cada personagem em px de `a.jpg` (1600×1200), com os ids do roteiro e o protagonista primeiro.
  - Confira as caixas desenhando-as sobre A.
- **Termine cada cena por inteiro** antes de começar a próxima.

## Navegador
- Carregue a skill `claude-in-chrome` antes de tudo.
- Trabalhe numa aba nova só sua. Nunca mexa nas outras abas e feche a sua no fim.
- O download chega em `~/Downloads` como `grok-image-<grokid>.jpg`. Mova (não copie) o arquivo que você acabou de baixar.
- Poupe screenshots.

## Pare e relate, sem improvisar
- A extensão não está conectada.
- O Grok não está logado.
- Aparece aviso de limite de uso: copie o texto exato e o horário de volta, se aparecer.
- A interface trava depois de 2 ou 3 tentativas.

## Relatório final
Curto, por cena:
- os personagens presentes em A;
- os pedidos ao Grok;
- as mudanças feitas, os "NAO FEITO" e os efeitos colaterais;
- o que foi estranho.

# Produção da arte no Grok Imagine (Etapa 2)

É o manual de quem opera o Grok Imagine no Chrome do dono (grok.com/imagine, conta dele, decisão dele). O estilo é o **E2, cartoon 2D**, escolhido pelo dono em 2026-11-08.

- **O roteiro** fica em `arte/roteiro.js`: são 100 cenas (10 mundos × 10) e 42 retratos.
- **Os prompts não são escritos à mão:** saem de `node tools/roteiro.mjs <id>`.
- **As lições do laboratório** estão em `docs/arte/prompts.md`.

## Antes de começar
1. Carregue a skill `claude-in-chrome` antes de qualquer ferramenta `mcp__claude-in-chrome__*` e siga o que ela diz:
   - carregue as ferramentas numa só ToolSearch;
   - chame `tabs_context` primeiro e trabalhe numa aba nova, sem mexer nas outras;
   - nunca dispare alert ou confirm.
2. **Pare e relate** quando:
   - a extensão não está conectada;
   - o grok.com não está logado;
   - aparece um aviso de limite de uso;
   - a interface trava depois de 2 ou 3 tentativas.

   Não crie conta nem invente contorno.
3. `node tools/roteiro.mjs falta` lista as cenas sem arte bruta, na ordem de jogo.

## Uma cena
1. **O prompt:** rode `node tools/roteiro.mjs <id>`. Ele devolve:
   - o `prompt`, com 5 personagens ou mais (pedido do dono: vários brainrots em toda cena);
   - as `edicoes` e as `mudancas_por_edicao`: 2 × 6, ou 3 × 5 no chefe;
   - a pasta `arte/bruto/<id>/`.
2. **Gerar:**
   - modo **Imagem**, **Qualidade 2.0**, ×4, proporção **4:3**;
   - cole o prompt **exatamente** como veio.
3. **Escolher** uma das 4. **O Grok do dono tem limite de uso:** gere de novo só se as 4 forem inaceitáveis, e no máximo 2 rodadas. **Recuse** a imagem que tiver:
   - faca, arma ou espada (o Grok arma o ninja: olhe as mãos);
   - logo de marca (o "swoosh" no tênis);
   - texto ou letras legíveis;
   - anatomia quebrada;
   - área grande vazia ou desfocada;
   - menos de 4 dos personagens do roteiro reconhecíveis.

   **Prefira** a imagem com detalhe espalhado pela tela toda e personagens reconhecíveis.
4. **Baixar** pelo botão da interface:
   - o arquivo chega como `~/Downloads/grok-image-<id do grok>.jpg`;
   - mova para `arte/bruto/<id>/a.jpg`;
   - confira o tamanho, que deve ser 1600×1200: `python3 -c "from PIL import Image;print(Image.open('arte/bruto/<id>/a.jpg').size)"`.
5. **Editar:** são N edições, **todas a partir de A** (nunca em cadeia), com M mudanças cada (N e M vêm do roteiro).
   - Use a caixa "Descreva sua edição" na página da imagem A, com o modelo:
     ```
     Edit this image. Make exactly these changes and nothing else: 1) ... 2) ... 3) ... 4) ... 5) ... 6) ... Keep the composition, camera, style, colors, lighting and every other detail exactly the same.
     ```
   - Escolha as mudanças **olhando A**:
     - **Uma por região:** céu ou topo, esquerda, direita, chão, meio. Nas N edições somadas, cubra a imagem inteira.
     - **Objeto do tamanho certo:** pelo menos ~4% da largura e bem separado dos outros mudados.
     - **Um objeto só,** com a posição dita: "the pink lamp hanging on the far left". Senão o Grok muda todos os parecidos.
     - **Os tipos que funcionam:**
       - trocar a cor do objeto inteiro;
       - pôr um acessório (chapéu, óculos, laço);
       - trocar um objeto por outro do mesmo tamanho;
       - trocar o padrão (listras → bolinhas).
     - **No máximo 1 remoção ou contagem por edição:** é o que mais falha.
     - **Pelo menos 2 mudanças por edição em personagens do roteiro** (cor do tênis, chapéu, óculos, laço).
     - **Frases curtas e objetivas**, uma por mudança: "6) Make the red bucket on the bottom right blue.".
     - **Nada repetido** entre as edições. Sem texto, sem arma, nada assustador.
   - Se aparecer a tela "Qual imagem você prefere manter?", escolha a que fez as mudanças.
   - Baixe e mova para `v1.jpg`, `v2.jpg`, ... e confira o tamanho de cada uma. A tela A/B às vezes entrega 1152×864: anote, mas serve.
   - **Refaça uma vez, a partir de A, só** quando um personagem sumir ou o enquadramento andar. Mudança que não aconteceu não se refaz: registre o "NAO FEITO" e siga (o estúdio só precisa de 7 das 12).
6. **Registro:** escreva `arte/bruto/<id>/registro.json`:
   ```json
   {"cena":"<id>","estilo":"e2","ferramenta":"Grok Imagine (grok.com, navegador)",
    "modelo_ou_modo":"Imagem, Qualidade 2.0, x4, 4:3; edicoes pela caixa 'Descreva sua edicao'",
    "data":"AAAA-MM-DD","prompt":"<exato>","iteracoes":1,
    "base":{"arquivo":"a.jpg","tam":[1600,1200],"grok_id":"...","escolhida_de":"2a de 4 da rodada 1"},
    "edicoes":[{"arquivo":"v1.jpg","tam":[1600,1200],"grok_id":"...","prompt":"<exato>",
                "mudancas":["...","NAO FEITO: ..."]}],
    "marca_dagua":"nenhuma visivel","notas":"<o que foi estranho>"}
   ```
   Em `mudancas`, escreva o que **aconteceu** (não só o que foi pedido): onde caiu, o efeito colateral, o "NAO FEITO".

## Um retrato (figurinha do álbum)
1. **O prompt:** rode `node tools/roteiro.mjs retrato <id>`. A proporção é **1:1**.
2. **Escolher:** personagem inteiro, centralizado, fundo liso, fiel à aparência e sem texto nem logo. Até 3 rodadas.
3. **Baixar:** mova para `arte/bruto/retratos/<id>.jpg`.
4. **Registrar:** acrescente uma entrada em `arte/bruto/retratos/registro.json`, no formato `{ "<id>": { "prompt", "iteracoes", "grok_id", "tam", "data", "notas" } }`. Leia o arquivo, junte a entrada e grave.

## Ritmo
- **Tempo:** uma geração leva cerca de 25 s, e uma edição menos de 10 s. Uma cena completa sai em 5 a 10 min.
- **Uso do Grok:** uma cena gasta 1 geração e 2 edições (o chefe, 3). Nada de gerar "para ver": cada pedido tem que ser o definitivo.
- **Screenshots:** poupe. Um para escolher entre as 4, um para conferir cada edição.
- **No fim do lote,** relate por cena:
  - a imagem escolhida;
  - as rodadas;
  - as mudanças feitas e as não feitas;
  - o que foi estranho.

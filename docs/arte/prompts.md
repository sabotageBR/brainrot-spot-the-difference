# Prompts do Grok Imagine (Etapa 1: modelos)

Ferramenta: Grok Imagine no navegador (grok.com/imagine), conta do dono, operado por Claude in Chrome.
Toda imagem sai em **4:3**. O prompt é sempre `[CENA], [COMPOSICAO], [ESTILO]`, com os blocos colados palavra por palavra.

## Blocos de estilo

| Estilo | Bloco |
|---|---|
| **E1 · 3D de brinquedo** | `3D animated movie style render, glossy toy-like characters with big expressive eyes, soft bright studio lighting, vibrant saturated colors, smooth clean shapes, high detail` |
| **E2 · Cartoon 2D** | `flat 2D cartoon illustration, thick clean black outlines, flat bright colors with simple cel shading, children's comic book style, crisp clear shapes` |
| **E3 · Massinha** | `claymation style, every character and prop made of colorful modeling clay with soft clay texture and tiny fingerprints, miniature stop-motion set, soft warm lighting` |

## Bloco de composição (é o que faz o jogo funcionar)

```
wide establishing shot, busy detailed scene with many small distinct objects spread across the whole picture, every area of the image has something to look at, no large empty areas, everything in sharp focus with no blur and no depth of field, characters medium size and fully visible, 4:3, no text, no letters, no numbers, no watermark, no logo, no signature
```

Por quê: o erro precisa poder cair em qualquer canto. Céu liso, fundo desfocado ou um personagem gigante deixam metade da imagem sem lugar para diferença.

## Cenas

### `praia`: Praia do Tralalero
```
a sunny tropical beach: Tralalero Tralala, a blue shark standing on three muscular legs wearing blue sneakers, dancing on the sand; Trippi Troppi, a creature with an orange cat head and a pink shrimp body, building a sandcastle; Bananita Dolphinita, a dolphin wearing a yellow banana peel, jumping out of the turquoise sea; a striped beach umbrella, beach balls, buckets and shovels, seashells, starfish, little crabs, palm trees with coconuts, sailboats, seagulls, fluffy clouds and an ice cream cart
```

### `cafe`: Café da Ballerina Cappuccina
```
a cozy Italian café interior: Ballerina Cappuccina, a ballerina in a pink tutu whose head is a cappuccino cup with foam, dancing on a table; Cappuccino Assassino, a small ninja in a black suit whose head is a cappuccino cup, holding two coffee spoons, sneaking behind the counter; Espressona Signora, an elegant old lady whose head is an espresso cup, sitting at a table with a newspaper without writing; a counter with croissants, cakes and donuts, a shiny coffee machine, cups and saucers, hanging lamps, potted plants, framed pictures of coffee beans, a checkered floor, windows with a street view and a cat sleeping on a chair
```

## Edições (as variantes que viram os erros)

Cada cena recebe **3 pedidos de edição, todos a partir da imagem A** (nunca em cadeia), com **4 mudanças cada**. São cerca de 12 candidatas por cena; o estúdio escolhe as 7 melhores.

Modelo do pedido:
```
Edit this image. Make exactly these changes and nothing else: 1) ... 2) ... 3) ... 4) ... Keep the composition, camera, style, colors, lighting and every other detail exactly the same.
```

Regras para escolher as mudanças (olhando a imagem A):
- **Espalhadas:** as 4 mudanças de um pedido caem em regiões diferentes da imagem (cantos, meio, céu, chão).
- **Locais e claras:** objeto com pelo menos ~4% da largura da imagem; nada de mudar só um olho ou um fio.
- **Tipos variados:** trocar a cor de um objeto, sumir com um objeto, acrescentar um objeto pequeno, mudar o número de coisas (3 cocos → 2), virar a direção, trocar a forma (listras → bolinhas).
- **Brainrot:** pelo menos uma mudança por pedido mexe num personagem (cor do tênis, acessório, chapéu), porque é o que o público reconhece.
- **Sem texto**, sem violência e sem nada assustador.

## Registro

Cada cena fica em `arte/bruto/<cena>-<estilo>/` (ex.: `praia-e2/`):
- `a.<ext>`, a base escolhida;
- `v1.<ext>`, `v2.<ext>`, `v3.<ext>`, as variantes editadas;
- `registro.json`, com o prompt exato, as iterações, os pedidos de edição e a marca d'água.

É a prova de "editado, não cru" que a Poki pede.

## O que o piloto ensinou (2026-11-07)

- **Saída do Grok:** JPEG de 1600×1200, sem marca d'água visível. O EXIF traz uma assinatura de proveniência e o id da imagem; o estúdio recodifica em WebP sem EXIF.
- **Tempo e limite:** uma geração (4 imagens) leva cerca de 25 s, e uma edição menos de 10 s. Não apareceu limite de uso.
- **Edição:** redesenha a imagem inteira sem deslocar nada. Fica só um fantasma fino nos contornos (diferença média de 7 a 11 em 255), que o estúdio apaga com limiar + abertura.
- **O que o Grok faz bem:** trocar a cor de um objeto inteiro, pôr um acessório (chapéu, óculos), trocar um objeto por outro (bola → patinho).
- **O que falha:** remover algo e mudar quantidades. Ele às vezes remove dois, ou redesenha em outro lugar.
- **Logo:** o Grok pôs um "swoosh" no tênis do Tralalero em 2 de 4 imagens. Rejeite as imagens com logo de marca.
- **Variante redesenhada:** uma edição que muda algo grande sem pedido (um personagem some) é refeita a partir de A.

## O que as 6 cenas do laboratório ensinaram (2026-11-07)

- **Café:** o Grok armou o ninja com facas em 5 das 12 imagens. Ponha no prompt da cena: `holding two coffee spoons, no knives, no weapons`.
- **Objeto único no pedido:** o Grok às vezes aplica a mudança a objetos parecidos (as duas luminárias, as almofadas, os toldos, as bolas). Descreva só um ("the pink lamp hanging on the far left").
- **A/B do Grok:** a tela "Qual imagem você prefere manter?" pode abrir em qualquer edição, e o resultado sai em 1152×864. Confira o tamanho de cada edição (o estúdio reduz tudo para 1024×768, mas a variante pequena perde detalhe).
- **Tralalero:** sai com 2 pernas, nunca 3, em todos os estilos. Peça `standing on three legs` no começo do prompt, se fizer questão.
- **E1 (3D):** tem desfoque de profundidade no primeiro plano mesmo com "no depth of field".
- **Conta do estúdio por estilo** (candidatas detectadas / mudanças pedidas; visibilidade média dos 7 escolhidos):
  - E1: 28/25, 0,82;
  - E2: 24/24, 0,82;
  - E3: 23/24, 0,75.

## O que a produção ensinou (2026-11-08, Etapa 2)

- **Elenco:**
  - com 5 brainrots descritos em poucas palavras ("Nome (aparência) ação"), a 1ª geração quase sempre traz os 5;
  - o defeito comum é o personagem ao lado do objeto em vez de ser feito dele (o cavalo atrás do piano, o avestruz ao lado do trem) ou com os papéis trocados;
  - escolha entre as 4 e não gere de novo.
- **Álcool:**
  - a palavra "bottles" (velas em garrafas) trouxe vinho para o restaurante;
  - o bloco de composição agora tem "no alcohol";
  - recuse vinho e cerveja na base.
- **Efeitos colaterais da edição:** o Grok recolore os vizinhos da mesma cor (todos os bancos, o trilho junto com o carrinho, a toldo vizinha).
  - Isso **não estraga a cena:** a B é montada só com os remendos escolhidos, então mudança que não foi escolhida não aparece no jogo.
  - O que estraga é o mesmo objeto mudado nas duas edições: o estúdio fica com uma só.
- **Cota:** 3 pedidos por cena (4 no chefe), sem nenhuma geração repetida, em 7 lotes seguidos. Uma cena sai em cerca de 7 min.

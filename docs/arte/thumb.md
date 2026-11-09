# Thumb da Poki

**O pedido:** 1 geração no Grok Imagine, em **1:1**, com o prompt abaixo colado exatamente como está. As 4 opções da geração vão para `marketing/thumb/grok-1.jpg` até `grok-4.jpg`. Baixar as 4 não gasta pedido a mais.

**O prompt:**

```
Tung Tung Tung Sahur (tall wooden log with big eyes, thin arms and legs) holding a giant magnifying glass up to one big amazed eye, Tralalero Tralala (blue shark on three legs, plain blue sneakers) peeking from behind him with a surprised face, simple bright sunny yellow background with soft rays, both characters big and centered, close-up, cute, no weapons, no text, no logo, no watermark, 1:1, flat 2D cartoon illustration, thick clean black outlines, flat bright colors with simple cel shading, children's comic book style, crisp clear shapes
```

**O tamanho final:** `node tools/thumb.mjs` recorta em quadrado e grava `marketing/thumb/grok-N-1256.png` e `grok-N-628.png`.

**A escolha da opção:** é do dono, e a escolhida foi a opção 1, em 2026-11-09. A regra da Poki pede um objeto principal só, sem colagem e sem texto, num quadrado de pelo menos 628 px, sem borda (os cantos redondos o portal aplica).

## Thumb animada

**A regra da Poki** (developers.poki.com/guide/your-game-page, lida em 2026-11-09):
- 1:1, 1080×1080 ou mais, 50 fps ou mais, de 4 a 6 s, sem som, `.mp4` de até 100 MB;
- 2 ou 3 cenas, começando da arte estática; o foco é o jogo, sem UI que não importa e sem cursor;
- entra no Soft Release, e todo jogo precisa dela antes do lançamento global.

**Como sai:** `node tools/thumb-animada.mjs <opção>` grava `marketing/thumb/grok-N-animada-1080.mp4` (1080×1080, 60 fps, 5,8 s, cerca de 3,6 MB) do próprio jogo, na cena praia-01:
1. a arte estática se aproxima da lupa, a lente vira janela e a câmera mergulha na cena;
2. os 3 erros são achados com a caneta, com confete;
3. a figurinha do Tralalero vira no painel, com as estrelas;
4. a arte volta num círculo que abre da lupa, e o último quadro é igual ao primeiro, para o laço não saltar.

O relógio da página vira manual (tempo, timers, `requestAnimationFrame` e animações CSS), então cada quadro sai no tempo exato. A posição da lente de cada opção está em `LENTE`, no topo da ferramenta: uma arte nova precisa da medida dela.

**A vitrine:** `/marketing/thumb/vitrine.html`, com o `npm run servir` no ar, mostra as 4 opções em 314, 204 e 94 px, e o vídeo toca ao passar o mouse.

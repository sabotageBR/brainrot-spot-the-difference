# Pesquisa: requisitos da Poki (2026-11-07)

Fonte: developers.poki.com (os links antigos de sdk.poki.com redirecionam para lá).

## SDK
- **Script:** `<script src="https://game-cdn.poki.com/scripts/v2/poki-sdk.js">` no `<head>`. O jogo começa no `.then` e no `.catch` do `PokiSDK.init()`.
- **Ordem dos eventos:**
  - partida: `gameLoadingFinished` → `gameplayStart` no primeiro input;
  - próximo nível: `gameplayStop` → `commercialBreak` → `gameplayStart`;
  - continuar: `gameplayStop` → `rewardedBreak` → `gameplayStart`.
  - Nunca dois start ou dois stop seguidos, e nenhum evento durante um anúncio.
- **Durante o anúncio:** som mudo e input desligado. O `onStart` pode não vir, então o som volta no fim da promessa.
- **Rewarded:**
  - o prêmio só sai com `true`;
  - um botão normal de seguir fica ao lado ou acima, **do mesmo tamanho ou maior**;
  - o botão do vídeo não pode ser verde e leva 🎬;
  - um vídeo por prêmio.
- **`measure(categoria, oque, acao)`:**
  - as ações especiais são `start`, `complete`, `fail`, `visible` e `interact`;
  - sem `/` nem `^`;
  - complete ou fail, nunca os dois.
- **`getLanguage()`:** síncrono. A ordem sugerida de idiomas é EN, FR, IT, DE, ES, TR e, depois, pt-BR.
- **Save na nuvem:** automático para quem tem conta. O localStorage e o IndexedDB sincronizam até 1 MB em gzip, e chaves `poki_ignore*` ficam de fora.
- **Links:** só `openExternalLink`. Nenhum pedido externo além do SDK.

## Técnico
- **Plataformas:** desktop, celular e tablet.
- **Celular:** tela cheia, e o **retrato é exigido** (o blog de jun/2026 diz que o QA testa).
- **Desktop:** escala 16:9 em 640×360, 836×470 e 1031×580.
- **Fontes e bibliotecas:** embutidas, sem CDN e sem Google Fonts.
- **Bloqueador de anúncio e janela anônima:** o jogo tem de funcionar com os dois, e o localStorage fica em try/catch.
- **Tamanho:** a página de requisitos não dá número e só diz que acima de 10 s o jogador sai. O guia de engine fala em **≤ 5 MB de carga inicial e 8 MB no total**. Cada MB a mais custa "alguns por cento" de jogadores.
- **Teclado:** `preventDefault` em setas, espaço e roda. ESC ou espaço pausam, se o jogo usar teclado.

## Aprovação
1. **Moderação.**
2. **Playtests:** 10 gravações de jogadores reais, de graça e sem limite.
3. **Player fit:** 500 jogadores. **Passa com tempo médio acima de 3 min e 25% das partidas acima de 3 min.**
4. **Web fit:** cerca de 7 dias nas páginas de categoria, medindo CTR, tempo na página e conversão para jogar.
5. **Revisão final:** 1 a 2 semanas. Avalia originalidade, acabamento e se o jogo é "unique enough within the categories it falls into".

As metas são 65%+ de conversão e 5+ min de tempo médio. A Poki não publica D1.

## Conteúdo
- **IP mal usado:** rejeição imediata. Os personagens precisam ser originais, e paródias podem sair do ar a pedido.
- **Arte de IA:** aceita se for editada (saída crua não serve), sem marca d'água e sem texto do prompt. Guarde as ferramentas, os prompts e as iterações (`arte/origem.json`).
- **Público:** para todos, incluindo crianças. Nada de tema adulto, violência gráfica, medo prolongado ou jogo de azar.
- **Negócio:** 50/50 sobre o tráfego da Poki e 100% sobre o tráfego direto. O padrão é exclusividade na web por 5 anos.

## Concorrência no gênero
- **Spot the Differences** (Rabbit Mountain, mai/2024, 4,3★ com cerca de 111 mil votos):
  - 3 vidas, dica, cronômetro e zoom por pinça ou roda;
  - cenas genéricas (contos, comida, rua).
  - É o único jogo de sete erros na Poki.
- **Objetos escondidos:** Find it!, Hidden Pigeon, Where Is?, Detective Loupe Puzzle e Cozyville.

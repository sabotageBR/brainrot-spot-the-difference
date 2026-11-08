# Brainrot Spot the Difference

Jogo dos 7 erros com brainrots, feito para a Poki, só com HTML e JavaScript: ES modules nativos, canvas 2D e WebAudio. Não há bundler nem framework.

- **Como joga:** coleção zen, sem prazo nem derrota. Cada fase rende a figurinha do protagonista, e o pisca alterna as duas imagens.
- **Fases:** 100, em 10 mundos.
- **Arte:** feita no Grok Imagine e transformada em cena pelo estúdio, em `tools/`.

## Comandos
- `npm test`: os testes.
- `npm run servir`: sobe o jogo em http://127.0.0.1:5400/.
- `npm run poki`: testes, build, zip em `dist-poki/` e sdkcheck.
- `node tools/roteiro.mjs falta`: as fases que ainda não têm arte.
- `node tools/estudio-auto.mjs`: regenera as cenas e as folhas de conferência (`docs/cenas/`).

O estado, as regras e as decisões estão em `CLAUDE.md`. A produção da arte está em `docs/arte/`.

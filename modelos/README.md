# Laboratório de modelos (Etapa 1)

O laboratório precisa do servidor: `npm run servir` e depois http://127.0.0.1:5400/modelos/laboratorio.html. Os módulos ES não carregam por `file://`.

- **A grade:** 4 modelos × 3 estilos. Cada célula mostra o print em paisagem, e clicar abre os três prints: paisagem 1031×580, celular 390×844 e o fim da cena.
- **Jogar** abre `index.html?modelo=..&estilo=..&lab&novo`. O jogo começa do zero, sem save, e tem o botão de voltar para cá.
- **Escolher** marca a célula, e **Gravar escolha** escreve `docs/decisao.md` (por `POST /__decisao`), com a nota opcional.
- **Prints:** `node tools/prints-modelos.mjs [m2-e2 ...]` os refaz em `modelos/prints/`. Uma célula sem cena no estilo é pulada.
- **Nada daqui entra na build:** o laboratório só lê `src/` e os prints.

## Modelos (regras em `src/jogo/regras.js`)

| Modelo | Regras | Gancho de retenção |
|---|---|---|
| M1 · Clássico | 90 s, 3 vidas, 1 dica + 🎬, vídeo de continuar (+30 s e 1 vida) | A referência: é o formato do único concorrente na Poki |
| M2 · Coleção zen | Sem prazo nem derrota; erros e dicas tiram estrela. Brainrot dourado escondido, pisca-poder (1 + 🎬), mapa | A figurinha do protagonista no álbum, com o canto do nome; a versão dourada se achar o escondido |
| M3 · Rush | 40 s, +5 s por acerto, −3 s por erro; o combo multiplica os pontos; a maratona herda tempo e pontos | Recorde e "só mais uma" |
| M4 · Pisca + lupa | Uma imagem só, lupa de raio-X arrastável, pisca livre; o relógio conta para cima e o erro soma 5 s | A novidade no celular em pé |

As peças comuns aos 4:
- zoom por pinça ou roda, sincronizado nas duas imagens;
- a mão do tutorial no 1º erro;
- o antispam ("Calma!");
- o combo musical;
- a passagem 3-2-1;
- o intervalo comercial a partir do 4º nível.

## Estilos (blocos em `docs/arte/prompts.md`)
- **E1 · 3D de brinquedo:** o render brilhante dos memes originais.
- **E2 · Cartoon 2D:** contorno grosso e cor chapada.
- **E3 · Massinha:** claymation.

Mesmas duas cenas em todos os estilos: a Praia do Tralalero e o Café da Ballerina Cappuccina, cada uma com 7 erros.

A recomendação fica no fim da página do laboratório.

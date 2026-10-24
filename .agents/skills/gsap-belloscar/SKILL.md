---
name: gsap-belloscar
description: Use GSAP for BellosCar motion on the index opening and the Erros patio. Use when changing IndiceAbertura, the Erros background tilt, or any timed animation in belloscar-leads. Do not animate the ID table.
---

# GSAP na BellosCar

Biblioteca: [GSAP](https://github.com/greensock/GSAP). O pacote `gsap` já está no app. A licença padrão cobre uso comercial.

## Onde usar

- Abertura do índice (`IndiceAbertura`): uma timeline curta na placa e na foto.
- Página Erros: `gsap.quickTo` só no fundo do pátio, acompanhando o ponteiro.

## Regras

- `prefers-reduced-motion: reduce` não anima.
- Não anime a tabela de IDs, o gráfico nem o texto. O fundo se move; a mesa fica parada.
- Limpe com `gsap.context(...).revert()` no unmount.
- Não instale plugins Club nem `@gsap/react` se o `gsap` puro resolver.

---
name: three-abertura
description: Use Three.js only for the short BellosCar index opening, as a small WebGL accent behind the logos. Use when editing IndiceAbertura. Do not put a 3D scene on the Erros table or other dashboards.
---

# Three.js na abertura

Biblioteca: [three.js](https://github.com/mrdoob/three.js/). O pacote `three` já está no app. Licença MIT.

## Onde usar

Um canvas pequeno na abertura do índice: um aro vermelho, atrás das logos, que some com a placa.

## Regras

- Não monte cena 3D na página de erros nem nas abas de campanhas, agendamentos ou negociações.
- No cleanup: `cancelAnimationFrame`, `dispose()` de geometria, material e renderer.
- Se WebGL falhar, a abertura segue só com foto e logos.
- Respeite `prefers-reduced-motion`: sem canvas.

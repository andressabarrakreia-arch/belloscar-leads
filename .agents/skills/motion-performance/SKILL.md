---
name: motion-performance
description: Keep BellosCar motion on transform and opacity. Use when adding animation to the index, the opening, the Erros page, or the client map.
---

# Movimento sem pesar a tela

Referência: [fixing-motion-performance](https://github.com/ibelick/ui-skills/blob/main/skills/fixing-motion-performance/SKILL.md).

- Anime com transform e opacity. A inclinação do mapa e a luz do ponteiro usam transform.
- Meça o retângulo no pointerenter. Não chame getBoundingClientRect a cada movimento.
- Não anime blur, largura ou filtro no mapa inteiro. O mapa é grande.
- A abertura continua com GSAP e Three.js. Não misture um terceiro sistema medindo o layout no mesmo componente.
- Respeite prefers-reduced-motion.

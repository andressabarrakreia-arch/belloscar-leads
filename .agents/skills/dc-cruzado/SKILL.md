---
name: dc-cruzado
description: Use dc.js with crossfilter2 for linked dimensional charts. Use when changing DcCruzado or a click-to-filter pair of bars.
---

# dc.js no filtro cruzado

Biblioteca: [dc-js/dc.js](https://github.com/dc-js/dc.js). O pacote `dc` resolve o próprio d3 6, separado do d3 7 do app.

- Duas row charts no mesmo grupo. O clique numa filtra a outra.
- Ao desmontar, chame `deregisterChart` para não acumular gráfico.
- Motivo × vendedor fica em Insucessos. SDR × resultado fica em Atendentes.

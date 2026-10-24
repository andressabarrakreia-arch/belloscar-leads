---
name: vega-mapa-clientes
description: Use Vega and Vega-Lite for the BellosCar client map and extra bars. Use when changing MapaClientes, VegaBarras, DDD aggregation, filters, or the Brazil state layer.
---

# Vega no mapa de clientes

Biblioteca: [vega/vega](https://github.com/vega/vega), com Vega-Lite e vega-embed.

- O mapa fica no índice (`IndiceGeral`), não na página Erros. O padrão é todo o período importado.
- O estado usa `public/geo/br-uf.geojson`. Cada anel precisa de pelo menos 4 pontos. O ponto no mapa é o DDD do telefone.
- A cor vai de rosa claro transparente a `#c02026`. O fundo do Vega é transparente.
- Filtros: período, região, estado, origem, canal, situação, proposta, tipo de veículo, marca e vendedor. Tipo e marca vêm da negociação, cruzados pelo nome do cliente. A negociação não tem telefone.
- O clique abre o painel. A dica do mouse é o balão `.mapa-dica`, passado em `embed(..., { tooltip })` antes da primeira pintura. Não chame `view.tooltip()` depois do embed: isso zera o canvas. A inclinação é transform no palco, sem redesenhar o canvas a cada movimento.
- Barras avulsas usam `VegaBarras`. Não substitua os gráficos Recharts que já existem.

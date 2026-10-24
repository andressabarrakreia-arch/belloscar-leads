---
name: echarts-erros
description: Use Apache ECharts for the Erros page bar chart of missing IDs, including inside zoom and click-to-filter. Use when editing the Erros chart. Keep Recharts on the other BellosCar dashboards.
---

# ECharts na página de erros

Biblioteca: [Apache ECharts](https://github.com/apache/echarts). Importe só o núcleo, o gráfico de barras, grade, tooltip, dataZoom e o renderer canvas.

## Onde usar

O gráfico "IDs por tipo de falta" em `src/pages/Erros.tsx`. O zoom interno e o slider aproximam as categorias. O clique numa barra filtra a tabela.

## Regras

- Não troque os gráficos de campanhas, agendamentos e negociações. Eles continuam em Recharts.
- `echarts.init` uma vez; `dispose` no unmount; `resize` no window.
- Cores da marca: `#c02026` na barra ativa, vermelho a 35% nas demais.
- Eixo de valores em "IDs". Nomes das categorias por extenso.

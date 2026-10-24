---
name: d3-cruzamento
description: Use D3 for the BellosCar Erros summary of how many IDs are missing from each spreadsheet. Use when editing that summary. Do not redraw the ECharts bar or the ID table with D3.
---

# D3 no cruzamento

Biblioteca: [D3](https://github.com/d3/d3). O pacote `d3` já está no app. Licença ISC.

## Onde usar

O resumo "Falta em cada planilha": uma barra por base (Leads Geral, Realizados, Agenda, Sucessos, Insucessos) com a quantidade de IDs cuja ausência é o erro.

## Regras

- A fonte é `ErroIdLinha`, contando `presenca === "nao"`.
- Não use D3 para a tabela nem para o gráfico de tipos de falta. Esse é o ECharts.
- Recrie o SVG quando os dados mudarem e não deixe seleção antiga no unmount.

# Catálogo de páginas — BellosCar · Análise de Resultados

Formato: `(nome da pagina)=(link da pagina)`

Hub: **Análise de Resultados**. Páginas com links distintos para envio a pessoas diferentes da equipe.

## Índice Geral

```
Índice Geral=https://andressacarmetrics.com.br/
Índice Geral (atalho)=https://andressacarmetrics.com.br/#/indice
```

## Links da equipe (somente leitura)

```
Análise de Campanhas=https://andressacarmetrics.com.br/#/campanhas
Análise de Agendamentos=https://andressacarmetrics.com.br/#/agendamentos
Análise de Negociações=https://andressacarmetrics.com.br/#/negociacoes
Perfil de Clientes=https://andressacarmetrics.com.br/#/perfil
```

## Gate PIN (Erros + Mapa + Apresentação — não enviar como link da equipe)

Mesmo PIN de gate (`VITE_GATE_PIN`, separado da Gestão).

```
Erros (cruzamento de IDs)=https://andressacarmetrics.com.br/#/erros
Mapa do Site (atlas de rotas e dados)=https://andressacarmetrics.com.br/#/mapa
Apresentação de resultados=https://andressacarmetrics.com.br/#/apresentacao
```

## Gestão (PIN — não enviar como link da equipe)

Upload de planilhas e export de clientes ficam **só** neste painel. As rotas antigas `#/campanhas/admin`, `#/agendamentos/admin` e `#/negociacoes/admin` redirecionam para cá.

```
Gestão do Índice (importar e exportar)=https://andressacarmetrics.com.br/#/indice/gestao
```

## Subpáginas — Análise de Campanhas

```
Campanhas Dashboard=https://andressacarmetrics.com.br/#/campanhas
Campanhas Atendentes=https://andressacarmetrics.com.br/#/campanhas/atendentes
Campanhas Comparar=https://andressacarmetrics.com.br/#/campanhas/comparar
Campanhas Leads por formulário=https://andressacarmetrics.com.br/#/campanhas/formularios
```

## Subpáginas — Análise de Agendamentos

```
Agendamentos Visão Geral=https://andressacarmetrics.com.br/#/agendamentos
Agendamentos Pré-Vendas=https://andressacarmetrics.com.br/#/agendamentos/pre-vendas
Agendamentos Vendedores=https://andressacarmetrics.com.br/#/agendamentos/vendedores
Agendamentos Detalhe=https://andressacarmetrics.com.br/#/agendamentos/detalhe
Agendamentos Portais=https://andressacarmetrics.com.br/#/agendamentos/portais
Agendamentos Insucessos=https://andressacarmetrics.com.br/#/agendamentos/insucessos
```

## Subpáginas — Análise de Negociações

```
Negociações Visão Geral=https://andressacarmetrics.com.br/#/negociacoes
Negociações Lançamentos=https://andressacarmetrics.com.br/#/negociacoes/lancamentos
Negociações Vendedores=https://andressacarmetrics.com.br/#/negociacoes/vendedores
```

Spec histórica (abas): [`docs/REESTRUTURACAO_ABAS.md`](docs/REESTRUTURACAO_ABAS.md).

Fonte de verdade das rotas: `src/modules/registry.ts`.
Manter este arquivo sincronizado ao criar ou renomear módulos.

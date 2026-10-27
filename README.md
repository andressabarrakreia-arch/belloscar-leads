# BellosCar · Análise de Resultados

Hub **estático** de análises da BellosCar (Curitiba), organizado em **páginas/módulos** com links distintos (**Análise de Campanhas**, **Análise de Agendamentos**, **Análise de Negociações**, …).

- React + Vite + TypeScript + Recharts  
- Sem servidor em produção  
- Dados por módulo em `public/data/`  
- GitHub Pages + HashRouter  

Catálogo completo: [`CATALOGO_DE_PAGINAS.md`](CATALOGO_DE_PAGINAS.md) (`nome=link`).  
Spec / abas Agendamentos: [`docs/REESTRUTURACAO_ABAS.md`](docs/REESTRUTURACAO_ABAS.md).

## Análise de Campanhas

**Link da equipe:**  
https://andressacarmetrics.com.br/#/campanhas

Só entram IDs cuja coluna **Origem** no LEADS GERAL é Facebook, Facebook Ads, Instagram ou Instagram Ads (também com canal junto, ex.: `WhatsApp | Instagram Ads`). O restante é ignorado. Cruzamento por ID:

| Número | Planilha | Data |
|--------|----------|------|
| Atendimentos (total e por SDR) | LEADS REALIZADOS | Atendido em |
| Visitas | LEADS REALIZADOS | Visita em, Visita = Sim |
| Agendamentos e vendedor | AGENDAMENTOS | Agendado em · Agendado para |
| Sucessos | SUCESSOS | Finalizado em |

A página lê o JSON publicado de Agendamentos e aplica esse recorte no navegador. Não grava dados de Agendamentos.

| Página | Link |
|--------|------|
| Dashboard | `#/campanhas` |
| Atendentes | `#/campanhas/atendentes` |
| Comparar períodos | `#/campanhas/comparar` |
| Leads por formulário | `#/campanhas/formularios` |

### Atualizar os números de Campanhas

Publique a base no **Painel de Gestão do Índice** (`#/indice/gestao`): LEADS GERAL (origem), LEADS REALIZADOS, AGENDAMENTOS e SUCESSOS. A página de Campanhas acompanha o JSON de Agendamentos. O histórico legado `dataset.json` não alimenta o dashboard vivo.

## Análise de Agendamentos

**Setor:** Vendas Web · **Gestão:** Andressa Barra  

**Link da equipe:**  
https://andressacarmetrics.com.br/#/agendamentos

| Página | Link |
|--------|------|
| Visão Geral | `#/agendamentos` |
| Pré-Vendas | `#/agendamentos/pre-vendas` |
| Vendedores | `#/agendamentos/vendedores` |
| Agendamentos (detalhe) | `#/agendamentos/detalhe` |
| Portais | `#/agendamentos/portais` |
| Insucessos | `#/agendamentos/insucessos` |

Dataset isolado: [`public/data/agendamentos-dataset.json`](public/data/agendamentos-dataset.json)  
Storage local: `agendamentos_dataset`, `agendamentos_admin_config`

### O que o painel mostra

- **Pré-Venda e Recepção separados** — totais, %, visitas e sucessos não se misturam  
- Recepção = canal à parte (na base inclui atendimentos classificados como Recepção; nomenclatura na UI só “Recepção”)  
- **Agendamentos × proposta**: cruzamento SDR → Vendedor (propostas, visitas, sucessos, %)  
- Comparação direta entre vendedores (Pré-Venda e Recepção) e comparação só de quem atendeu  
- Conversão por vendedor: geral = Pré-Venda; Recepção com índices próprios  
- Motivos de insucesso e origem por canal  
- **Atendimentos (LEADS GERAL)** na Pré-Vendas e Portais, com % Agendamento = Ag/Atend  
- Filtros por data, SDR e tipo de proposta (inclui **Financiamento**) · barra sticky  

### Base inicial (já publicada)

Dataset gerado a partir das planilhas de 01/01/2026 a 15/10/2026:

- **4.450** agendamentos (universo)  
- **2.992** com motivo de insucesso (cruzamento por ID)  
- **4.425** com origem via LEADS GERAL  

Regenerar localmente (pasta `EXEMPLO ARQUIVO DE DADOS` ao lado do repo):

```bash
npm run generate:agendamentos
```

### Atualizar dados daqui pra frente

1. Abra `#/indice/gestao` (PIN unificado de gestão)  
2. Envie novas planilhas de **AGENDAMENTOS** (agrega por ID)  
3. Opcional: INSUCESSOS / LEADS GERAL só **enriquecem** IDs existentes  
4. Opcional: no card **Exportar**, baixar CSV de clientes (Campanhas / Agendamentos / Negociações)  

## Análise de Negociações

**Link da equipe:**  
https://andressacarmetrics.com.br/#/negociacoes

| Página | Link |
|--------|------|
| Visão Geral | `#/negociacoes` |
| Lançamentos | `#/negociacoes/lancamentos` |
| Vendedores | `#/negociacoes/vendedores` |

Dataset isolado: [`public/data/negociacoes-dataset.json`](public/data/negociacoes-dataset.json)

### Regras de contagem

- Sem **Cancelado** nos totais · **Compra de Consignado** não entra  
- **Troca** (2 linhas) = 1 negócio · **Venda/Compra** multi-linha = 1 por linha  
- Merge acumulativo pelo **nº da Negociação** no Painel de Gestão (arquivo novo atualiza o grupo)  
- Também aceita planilha de **conversão de avaliações** (Aprovadas/Realizadas) — ranking na aba Vendedores  

## Gestão do Índice

**Painel único (PIN):** https://andressacarmetrics.com.br/#/indice/gestao  

- Importar planilhas (vários arquivos de uma vez) e publicar nos JSON de `public/data/`  
- Exportar clientes com seleção (Campanhas · Agendamentos · Negociações)  
- Rotas antigas `#/…/admin` redirecionam para este painel  


```bash
node scripts/generate-negociacoes-dataset.mjs
```

## Setup local

```bash
cp .env.example .env
npm install
npm run dev
```

## Documentação e segurança

- Ao final de cada alteração: `CHANGELOG.md`, `ROADMAP.md`, README/DEPLOY/CATALOGO se URLs mudarem  
- Segredos nunca no Git — `.cursor/rules/no-secrets-in-repo.mdc`  
- Ver `AGENTS.md` e regras alwaysApply em `.cursor/rules/`  

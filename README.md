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
https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas

| Página | Link |
|--------|------|
| Dashboard | `#/campanhas` |
| Atendentes | `#/campanhas/atendentes` |
| Comparar períodos | `#/campanhas/comparar` |
| Gestão | `#/campanhas/admin` |

Dataset: [`public/data/dataset.json`](public/data/dataset.json)

### Atualizar dados de campanhas

1. Abra `#/campanhas/admin` e entre com o PIN  
2. Salve o PAT GitHub neste computador (`localStorage`)  
3. Envie a planilha `.xlsx` (agrega + dedupe + publica)  

## Análise de Agendamentos

**Setor:** Vendas Web · **Gestão:** Andressa Barra  

**Link da equipe:**  
https://andressabarrakreia-arch.github.io/belloscar-leads/#/agendamentos

| Página | Link |
|--------|------|
| Visão Geral | `#/agendamentos` |
| Pré-Vendas | `#/agendamentos/pre-vendas` |
| Vendedores | `#/agendamentos/vendedores` |
| Agendamentos (detalhe) | `#/agendamentos/detalhe` |
| Portais | `#/agendamentos/portais` |
| Insucessos | `#/agendamentos/insucessos` |
| Gestão | `#/agendamentos/admin` |

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

### Atualizar dados daqui pra frente (admin)

1. Abra `#/agendamentos/admin` (mesmo PIN unificado)  
2. Envie novas planilhas de **AGENDAMENTOS** (agrega por ID)  
3. Opcional: INSUCESSOS / LEADS GERAL só **enriquecem** IDs existentes  
4. Opcional: exportar CSV de clientes (nome, email, telefone)  

## Análise de Negociações

**Link da equipe:**  
https://andressabarrakreia-arch.github.io/belloscar-leads/#/negociacoes

| Página | Link |
|--------|------|
| Visão Geral | `#/negociacoes` |
| Lançamentos | `#/negociacoes/lancamentos` |
| Vendedores | `#/negociacoes/vendedores` |
| Gestão | `#/negociacoes/admin` |

Dataset isolado: [`public/data/negociacoes-dataset.json`](public/data/negociacoes-dataset.json)

### Regras de contagem

- Sem **Cancelado** nos totais · **Compra de Consignado** não entra  
- **Troca** (2 linhas) = 1 negócio · **Venda/Compra** multi-linha = 1 por linha  
- Gestão: merge acumulativo pelo **nº da Negociação** (arquivo novo atualiza o grupo)

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

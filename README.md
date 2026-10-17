# BellosCar Analytics

Hub **estático** de análises da BellosCar (Curitiba), organizado em **módulos** com links distintos.

- React + Vite + TypeScript + Recharts  
- Sem servidor em produção  
- Dados por módulo em `public/data/`  
- GitHub Pages + HashRouter  

Catálogo completo: [`CATALOGO_DE_PAGINAS.md`](CATALOGO_DE_PAGINAS.md) (`nome=link`).

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
| Dashboard | `#/agendamentos` |
| Gestão | `#/agendamentos/admin` |

Dataset isolado: [`public/data/agendamentos-dataset.json`](public/data/agendamentos-dataset.json)  
Storage local: `agendamentos_dataset`, `agendamentos_admin_config`

### O que o painel mostra

- Desempenho de Pré-Venda / Recepção (SDR)  
- Conversão por vendedor (geral, Pré-Venda, Recepção)  
- Motivos de insucesso e origem/canal por vendedor  
- Comparação direta de performance  
- Filtros por data, SDR e tipo de proposta (inclui **Financiamento**)  

### Atualizar dados de agendamentos

1. Abra `#/agendamentos/admin` (mesmo PIN unificado)  
2. Importe na ordem sugerida: **AGENDAMENTOS** → **INSUCESSOS** → **LEADS GERAL**  
3. Dedupe **somente por ID** (vários atendimentos no mesmo dia são mantidos)  
4. Opcional: exportar CSV de clientes (nome, email, telefone)  

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

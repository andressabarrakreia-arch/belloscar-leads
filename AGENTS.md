# Instruções para agentes (BellosCar Analytics)

## Documentação obrigatória

Ao final de **toda** alteração, task ou criação, atualizar:

- `CHANGELOG.md`, `ROADMAP.md`
- `README.md` / `DEPLOY.md` quando URLs, módulos ou deploy mudarem
- `CATALOGO_DE_PAGINAS.md` no formato `nome=link` quando páginas/módulos mudarem
- `.env.example` só com placeholders (sem segredos reais)
- Regras em `.cursor/rules/` quando novas convenções forem definidas

## Antes de criar

- Analisar o existente e reutilizar padrões — `reuse-before-create.mdc` / skill `reuse-before-create`
- Stack tipada — `typescript-stack.mdc`
- Isolamento de storage por módulo — `module-storage-isolation.mdc`
- Agendamentos: dedupe só por `id` — `scheduling-dedupe.mdc`
- Negociações: merge por nº da Negociação — `negociacoes-dedupe.mdc`

## Segurança

- Nunca commit tokens/senhas/`.env` real — `.cursor/rules/no-secrets-in-repo.mdc`
- Token GitHub só em `localStorage` no Admin

## Módulos e links distintos

- Hub / título principal: **Análise de Resultados** (`index.html` + `document.title` por módulo)
- Registro: `src/modules/registry.ts`
- **Análise de Campanhas** → `#/campanhas`
- **Análise de Agendamentos** → `#/agendamentos` (Vendas Web · Andressa Barra)
  - Abas: Visão Geral · Pré-Vendas · Vendedores · Detalhe · Portais · Insucessos (+ Gestão)
- **Análise de Negociações** → `#/negociacoes` (loja)
  - Abas: Visão Geral · Lançamentos · Vendedores (+ Gestão)
- Novos módulos: rota `#/<modulo>/...`, layout próprio, link de equipe separado
- Regras: `multi-module-pages.mdc`, `belloscar-product-prefs.mdc` (alwaysApply)
- Spec abas: [`docs/REESTRUTURACAO_ABAS.md`](docs/REESTRUTURACAO_ABAS.md) — abas **dentro** de Agendamentos; Campanhas e Negociações são módulos separados

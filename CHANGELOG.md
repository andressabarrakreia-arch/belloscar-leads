# Changelog

## [1.7.10] - 2026-10-19

### Added
- Spec de reestruturação em abas: [`docs/REESTRUTURACAO_ABAS.md`](docs/REESTRUTURACAO_ABAS.md) (arquitetura, contrato de métricas, prompt mestre, fases)
- Catálogo: rotas planejadas das abas de Agendamentos (Fase 1)

## [1.7.9] - 2026-10-17

### Changed
- Título principal do hub: **Análise de Resultados** (aba do navegador / `index.html`)
- `document.title` passa a refletir a página atual (Campanhas ou Agendamentos)
- Docs e regras alinhadas: hub = Resultados; páginas permanecem separadas

## [1.7.8] - 2026-10-17

### Changed
- Base de agendamentos regenerada com INSUCESSOS atualizado (20.687 linhas)
- Removidos **22** registros Insucesso sem motivo cruzado — dataset com **4.428** itens; **3.602** insucessos, todos com motivo

## [1.7.7] - 2026-10-17

### Removed
- Foto hero do topo da Análise de Agendamentos

## [1.7.6] - 2026-10-17

### Changed
- Marca: “Car” com o mesmo negrito de “Bellos” (`font-weight: 800`)

## [1.7.5] - 2026-10-17

### Changed
- Comparação direta: agendamentos × proposta ordena por **SDR (pré-venda) em sequência**, não por volume

## [1.7.4] - 2026-10-17

### Added
- Comparação direta entre vendedores (tabela só Pré-Venda e só Recepção), com % e taxas
- **Comparação direta: agendamentos × proposta** — uma linha por par SDR × Vendedor (propostas, visitas, sucessos, insucessos, %)

### Changed
- Comparação direta · Pré-Venda / Recepção passa a listar **apenas quem atendeu** (sem linhas de vendedor)
- Removida a tabela “Desempenho Pré-Venda (SDR)” em favor do cruzamento SDR × Vendedor

## [1.7.3] - 2026-10-17

### Changed
- Análise de Agendamentos: barra de filtros (inclui Vendedor) fica **sticky** ao rolar a página

## [1.7.2] - 2026-10-17

### Changed
- Análise de Agendamentos: **Pré-Venda e Recepção com totais separados** — Recepção (loja / Gabriela) não entra mais no geral da pré-venda
- KPIs, tabelas SDR, comparação, gráficos e detalhe do vendedor duplicados por canal, cada um com índices e % próprios

## [1.7.1] - 2026-10-16

### Added
- Base inicial publicada: **4.450** agendamentos (01/01–15/10/2026) cruzados com INSUCESSOS (2.992 motivos) e LEADS GERAL (4.425 origens)
- Script `npm run generate:agendamentos` para regenerar o dataset a partir das planilhas base

### Changed
- INSUCESSOS e LEADS GERAL passam a ser **enrich-only** (não criam IDs órfãos na base de agendamentos)
- Admin de agendamentos documenta que a 1ª carga já está no Pages; uso manual só para atualizações

## [1.7.0] - 2026-10-16

### Added
- Módulo **Análise de Agendamentos** (`#/agendamentos` / `#/agendamentos/admin`) — Vendas Web · Andressa Barra
- Parse/merge acumulativo por ID (AGENDAMENTOS, INSUCESSOS, LEADS GERAL), datas ISO, Financiamento como tipo de proposta
- Métricas SDR/Recepção, conversão por vendedor (Pré-Venda vs Recepção), motivos de insucesso, origem, comparação direta, gráficos
- Dataset isolado `public/data/agendamentos-dataset.json` + storage `agendamentos_*`
- Export CSV de clientes (nome, email, telefone) no admin de agendamentos
- `CATALOGO_DE_PAGINAS.md` no formato `nome=link`
- Regras/skills: `reuse-before-create`, `typescript-stack`, `module-storage-isolation`, `scheduling-dedupe`
- Login admin unificado via `adminAuth.ts`; `publishJsonToGitHub` com path por módulo

## [1.6.0] - 2026-10-16

### Added
- Dashboard de Campanhas enriquecido: funil por status, comparação quinzena atual vs anterior, dias até visita (média/mediana), destaques de conversão por canal, mix de propostas, agendados em aberto, top atendentes (volume e taxa)
- Tabela de origem com % do total e coluna Visita → Sucesso
- `buildDashboardInsights` em `metrics.ts`

## [1.5.1] - 2026-10-16

### Added
- Backlog no `ROADMAP.md`: Análise de Portais, Fechamento mensal Web, Fechamento mensal Vendas, integração Telegram (lembretes, insights, pautas/atas)

## [1.5.0] - 2026-10-16

### Changed
- App organizado em módulos; módulo atual renomeado para **Análise de Campanhas**
- Rotas sob `#/campanhas` (dashboard, atendentes, comparar, admin)
- Header e docs com nome do módulo e links distintos

### Added
- `src/modules/registry.ts` — registro de módulos
- `ModuleLayout` por módulo
- Regras Cursor alwaysApply: `multi-module-pages.mdc`, `belloscar-product-prefs.mdc`
- Redirects de compatibilidade para links antigos (`#/admin`, etc.)

## [1.4.1] - 2026-10-16

### Added
- Faixa ticker com indicadores-chave (leads, visitas, sucessos, top origem) abaixo do header

## [1.4.0] - 2026-10-16

### Changed
- UX/UI alinhada à marca BellosCar (vermelho, charcoal, azul de apoio)
- Header com logo BC, tipografia Montserrat/DM Sans, cards com profundidade
- Layout responsivo aprimorado (mobile/smartphone)
- Cores dos gráficos e favicon da marca

## [1.3.0] - 2026-10-16

### Changed
- Token GitHub do Admin passa a persistir em `localStorage` (não precisa colar a cada visita no mesmo navegador)

### Added
- Regra `.cursor/rules/no-secrets-in-repo.mdc` — proíbe versionar tokens/senhas
- `.gitignore` reforçado (`.secrets/`, `.env`, chaves)
- Pasta local `.secrets/` (gitignored) para referência da gestora

### Security
- Removida documentação pública do PIN/PAT em claros onde possível; PAT nunca no bundle `VITE_`

## [1.2.1] - 2026-10-16

### Changed
- PIN do Admin atualizado no build (fallback no Admin + `.env` local)

## [1.2.0] - 2026-10-16

### Fixed
- 404 ao abrir `/admin` (e demais rotas) direto no GitHub Pages — migração para `HashRouter` (`#/admin`)

### Changed
- PIN do Admin atualizado via `VITE_ADMIN_PIN` / fallback no código

### Added
- Regra Cursor `.cursor/rules/update-documentation.mdc` (documentação obrigatória ao fim de cada alteração)
- `AGENTS.md` com a mesma obrigação para agentes

## [1.1.0] - 2026-10-16

### Added
- Publicação automática no Admin via GitHub API (PAT na sessão)
- Upload agrega período novo + dedupe; commit direto em `public/data/dataset.json`

## [1.0.0] - 2026-10-16

### Added
- Publicação em GitHub Pages: https://andressabarrakreia-arch.github.io/belloscar-leads/
- App estático React + Vite (sem Node/servidor em produção)
- Motor client-side: parse XLSX, dedupe mensal, métricas
- Dashboard, Atendentes, Comparar períodos
- Admin com PIN: upload, preview de dedupe, download de `dataset.json`
- Dataset inicial gerado a partir da planilha exemplo (2388 leads)
- Workflow GitHub Actions → GitHub Pages
- Guia [`DEPLOY.md`](DEPLOY.md)
- `.gitignore`, `.env.example`, README, ROADMAP

### Removed
- Backend Node/Express/Prisma/PostgreSQL (descontinuado)
- Dependência de Railway ou servidor local em tempo real

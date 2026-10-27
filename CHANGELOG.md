# Changelog

## [1.13.8] - 2026-10-27

### Added
- Compartilhar briefing no WhatsApp no modal da **Apresentação** (mensagem opcional, prévia do card, abrir/copiar)
- Skills `whatsapp-marketing`, `contagious` e `social-sharing` no catálogo

## [1.13.7] - 2026-10-27

### Changed
- Badges do coletivo na Apresentação atualizados (Campanhas Meta, Agendamentos, Negociações · Loja, sem SDR, Recepção)

## [1.13.6] - 2026-10-27

### Added
- Badges de avatar na Apresentação: Campanhas Meta, Agendamentos, Negociações · Loja, (sem SDR), Recepção

## [1.13.5] - 2026-10-27

### Changed
- Foto do **Matheus Imbroinise** atualizada na Apresentação

### Added
- Arte **Aniversariantes BellosCar** como avatar na Apresentação

## [1.13.4] - 2026-10-27

### Added
- Fotos da equipe na **Apresentação** (pré-venda, vendas, loja) + logos para lead sem interesse e Espaço Bellos
- Reflexo de vidro nos avatares: brilho no hover e segundo nível no clique / abertura do modal
- Skills `gsap-core` e `awwwards-animations` no catálogo

## [1.13.3] - 2026-10-27

### Changed
- **Erros** redesenhada em sala de cruzamento (masthead, toolbar de período, faixas), tema escuro forçado e sem botão de tema

### Added
- Foto da **Thayna** (pré-venda) nos cards e no modal da **Apresentação** (`public/brand/equipe/`)

## [1.13.2] - 2026-10-26

### Changed
- **Apresentação** redesenhada em layout de sala de resultados (destaque + trilho), toolbar de período e modal tipo briefing — menos cara de grade genérica

### Added
- Skills `design-taste-frontend` e `design-distinctive-ui` no catálogo

## [1.13.1] - 2026-10-26

### Changed
- **Apresentação** abre no mês vigente (dia 01 até hoje), com filtro de período (presets e datas)
- Clique no card abre modal ampliado com fundo fosco e blocos de performance positiva e negativa

## [1.13.0] - 2026-10-26

### Added
- Mapa gráfico D3 interativo ao final de **Mapa do Site** (arrastar nós, clique seleciona)
- Página **Apresentação** (`#/apresentacao`): cards coletivos e individuais com números vivos e avatares por iniciais; PIN gate 2640; teclas ← → espaço / ↑ ↓
- Porta **Apresentação** no Índice
- Skills `d3-visualization`, `cinematic-web`, `presentation-building`

## [1.12.0] - 2026-10-26

### Added
- Página **Mapa do Site** (`#/mapa`): atlas de rotas, módulos e fontes de dados, com visual blueprint distinto do índice
- Porta **Mapa do Site** no Índice
- PIN de gate compartilhado entre **Erros** e **Mapa do Site** (`gateAuth` / `VITE_GATE_PIN`), separado da Gestão
- Mapas persistentes para agentes: `.nexus-map/`, `SYSTEM.md`, `repo.md`, rule `mapa-orientacao-dados`
- Skills de orientação: `nexus-mapper`, `system-atlas`, `context-map`, `ghost-repo-context`, `codebase-onboarding`, `codebase-learner`

### Changed
- Página **Erros** passa a pedir o PIN de gate antes de abrir

## [1.11.4] - 2026-10-24

### Changed
- No índice, cada número do mercado, dos três cards e dos destaques ganha um sinal de alta, baixa ou estabilidade
- O mapa de clientes fica entre os cards de campanhas, agendamentos e negociações e o faturamento do mês

## [1.11.3] - 2026-10-24

### Changed
- O catálogo do agente passou a se chamar `CATALOGO.md` e agora lista skills, rules, hooks, MCP e plugins
- A dica do mapa de clientes mostra o nome do estado, a cidade, a região e os números do ponto, num balão curto. O handler entra na criação da vista, para o mapa continuar desenhado

## [1.11.2] - 2026-10-23

### Added
- Skills do repositório Ant Design em `.agents/skills/`: mensagem de commit, pull request, resposta a issues, revisão de testes, changelog e publicação de versão. São instruções para o agente, sem mudança nas telas

## [1.11.1] - 2026-10-21

### Added
- Regra `escopo-estrito`: alterar só o que foi pedido; qualquer mudança extra exige confirmação antes

## [1.11.0] - 2026-10-21

### Changed
- Cabeçalho e tela de PIN usam a logo Andressa Car Metrics (sem o ícone vermelho BC)
- Definições dos títulos ficam num ícone **i**, visíveis ao passar o mouse
- Fundo com partículas leves em vermelho, rosa e bronze

## [1.10.0] - 2026-10-20

### Changed
- Página **Análise de Campanhas** conta só IDs com origem Facebook ou Instagram no LEADS GERAL (incluindo Ads e canal junto, ex. `WhatsApp | Instagram Ads`)
- Atendimentos e visitas vêm de LEADS REALIZADOS (`Atendido em` / `Visita em`); agendamentos de `Agendado em` + `Agendado para`; sucessos de `Finalizado em`
- Demais origens ficam de fora. Dedupe e cruzamento por ID. A página lê o JSON de Agendamentos e não altera o storage desse módulo

## [1.9.5] - 2026-10-20

### Fixed
- LEADS GERAL CSV UTF-8: coluna **Responsável** reconhecida (antes virava `(sem SDR)`)
- Merge de atendimentos: SDR/origem vazios no arquivo **não apagam** o valor já existente

## [1.9.4] - 2026-10-20

### Changed
- Ticker do topo acompanha o **filtro ativo** (Negociações e Agendamentos)

## [1.9.3] - 2026-10-20

### Changed
- Ticker do topo **por módulo**: Campanhas · Agendamentos · Negociações (totais + tops)

## [1.9.2] - 2026-10-19

### Changed
- Negociações · Rankings: removida Conv. avaliação (fica só na tabela abaixo)

## [1.9.1] - 2026-10-19

### Added
- Negociações · Vendedores: ranking **unificado** (colocação única + blocos) e **conversão de avaliações**
- Gestão Negociações: upload da planilha de conversão de avaliações (merge por mês)

### Changed
- Rankings: uma tabela com # compartilhado (Vendas+Trocas · Compras · Consignações)

## [1.9.0] - 2026-10-19

### Added
- Módulo **Análise de Negociações** `#/negociacoes` (Visão Geral · Lançamentos · Vendedores · Gestão)
- Dataset `public/data/negociacoes-dataset.json` + merge acumulativo por **nº da Negociação**
- Regras: sem Cancelado nos KPIs · ignora Compra de Consignado · Troca = 1 negócio · Venda/Compra multi-linha = 1 por linha

## [1.8.10] - 2026-10-19

### Changed
- Pré-Vendas: **Conversão por tipo** e **Top 3 vendedores** só para Allan, Thayna, Lais, Matheus, Liriane e Bruno
- Insucessos: donut de motivos → **barras horizontais** (sem rótulo “Donut”)

## [1.8.9] - 2026-10-19

### Added
- Volume de **LEADS GERAL** persistido em `leadsAtendimentos` (atendimentos por origem/SDR)
- Portais e Pré-Vendas: coluna **Atendimentos** + **% Agend.** (Ag/Atend)

### Changed
- Portais: cores por nível da cascata; removido % Insucesso

## [1.8.8] - 2026-10-19

### Changed
- Aba Portais: cascata **Grupo → Origem → Canal → Proposta**; removido Share; Show-up → **Conv. visita**; Top 5 abaixo do ranking

## [1.8.7] - 2026-10-19

### Changed
- Aba Pré-Vendas: **3 tabelas** — Desempenho · Conversão por tipo de proposta · Top 3 vendedores por SDR

## [1.8.6] - 2026-10-19

### Added
- Aba **Portais** `#/agendamentos/portais`: parse origem/canal, grupos expansíveis, ranking, detalhe (canais, propostas, tops, motivos) e série dos top 5

## [1.8.5] - 2026-10-19

### Changed
- Aba Pré-Vendas: **uma tabela unificada** (desempenho + insucessos) com **conv. por tipo de proposta** e **top 3 vendedores** por SDR
- Removida a tabela duplicada “Comparação direta · Pré-Venda” (e a de Recepção redundante nessa aba)

## [1.8.4] - 2026-10-19

### Changed
- Pré-Venda: ordem exata **Allan Junior Dos Santos Ramos → Thayna PRE-VENDAS → Lais Narimã Ferreira Vieira → Matheus Imbroinise → demais**
- Recepção: desempenho e comparação somam o canal em **uma linha “Recepção”** (Gabriela entra no total, sem rótulo próprio)

## [1.8.3] - 2026-10-19

### Changed
- Comparações / desempenho Pré-Venda: ordem fixa **Allan → Thayna → Lais → Matheus**, depois os demais

## [1.8.2] - 2026-10-19

### Changed
- UI de Agendamentos: canal exibido só como **Recepção** (Gabriela continua na regra de classificação, sem aparecer nos textos da página)

## [1.8.1] - 2026-10-19

### Changed
- Aba Vendedores: detalhe e comparações começam no **geral de todos**; “Ver vendedor” (ou clique no card) filtra as seções abaixo
- Nomenclatura: **Fechamento em loja** (antes “fechamento salão”)
- Cards de desempenho listam todos os vendedores

## [1.8.0] - 2026-10-19

### Added
- Fase 1 UI: abas em `#/agendamentos` com deep links (Visão Geral, Pré-Vendas, Vendedores, Detalhe, Insucessos)
- Filtros sticky compartilhados entre abas (origem, busca rápida, presets de período)
- Aba Insucessos: KPIs, donut de motivos, cruzamento por SDR e vendedor

### Changed
- Nav do módulo Agendamentos passa a listar as abas + Gestão
- Labels de % com denominador (show-up Vi/Ag, conv. Su/Ag, fechamento em loja Su/Vi)

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

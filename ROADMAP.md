# Roadmap — Belloscar Leads Analytics

## Status das fases

- [x] **Task 1 — Fundação**: app estático, gitignore, env, changelog, roadmap, README (repo público)
- [x] **Task 2 — Motor de dados**: parse XLSX, dedupe mensal, métricas, `dataset.json`
- [x] **Task 3 — Dashboard**: KPIs, tabela origem, gráficos, filtros
- [x] **Task 4 — Atendentes + comparação**: ranking, matriz, compare períodos
- [x] **Task 5 — Admin + share**: PIN, upload, download JSON; site Pages = leitura
- [x] **Task 6 — Deploy GitHub Pages**: repo público + Actions + site no ar

## Checklist final

- [x] Task 1 Fundação
- [x] Task 2 Motor de dados
- [x] Task 3 Dashboard
- [x] Task 4 Atendentes + comparação
- [x] Task 5 Admin + share (Pages = leitura)
- [x] Task 6 Deploy publicado

## Links

- Repo: https://github.com/andressabarrakreia-arch/belloscar-leads
- Catálogo: [`CATALOGO_DE_PAGINAS.md`](CATALOGO_DE_PAGINAS.md)
- **Análise de Campanhas (equipe):** https://andressacarmetrics.com.br/#/campanhas
- **Análise de Agendamentos (equipe):** https://andressacarmetrics.com.br/#/agendamentos
- **Análise de Negociações (equipe):** https://andressacarmetrics.com.br/#/negociacoes
- **Gestão do Índice (importar e exportar):** https://andressacarmetrics.com.br/#/indice/gestao

## Pós-lançamento

- [x] Publicação automática no Admin (agregar + dedupe + commit GitHub)
- [x] Correção 404 de rotas no GitHub Pages (`HashRouter`)
- [x] Regra de documentação obrigatória (`.cursor/rules/update-documentation.mdc`)
- [x] Token Admin em `localStorage` + regra anti-segredos no Git
- [x] Redesign UX/UI BellosCar (identidade visual + responsivo)
- [x] Faixa ticker de KPIs no topo do app
- [x] Arquitetura multi-módulo (Campanhas + regras alwaysApply)
- [x] Dashboard Campanhas enriquecido (funil, quinzena vs anterior, tempo até visita, tops)
- [x] Módulo **Análise de Agendamentos** (`#/agendamentos`) + catálogo + regras de reuso/isolamento/dedupe
- [x] Base inicial de agendamentos publicada (cruzamento AGENDAMENTOS + INSUCESSOS + LEADS GERAL)
- [x] Spec de reestruturação em abas (`docs/REESTRUTURACAO_ABAS.md`) — arquitetura, métricas, prompt mestre
- [x] **Fase 1 UI:** abas em `#/agendamentos` (Visão Geral, Pré-Vendas, Vendedores, Detalhe, Insucessos)
- [x] Aba **Portais** em `#/agendamentos/portais` (origem/canal + grupos; sem UTM/custo)
- [x] Módulo **Análise de Negociações** (`#/negociacoes`) + seed + Gestão (merge por nº)
- [x] Campanhas restrita a Facebook/Instagram (origem do LEADS GERAL, cruzamento por ID)
- [x] Gestão unificada só em `#/indice/gestao` (import + export com seleção; sem abas Gestão nos módulos)
- [ ] **Fase 2:** UTMs / tráfego pago no módulo `#/campanhas`
- [ ] Próximos módulos com públicos/links próprios

## Agendado — teste cópias `#/v2` (2D HD / Remotion / filme)

- [ ] **30 out 2026, após 13h** (reset da cota semanal do Cursor) — executar o plano de **cópias de teste** em `#/v2` (páginas oficiais intocadas):
  - Skills Remotion / HyperFrames / vídeo de marketing
  - Índice v2 + abertura Remotion; Apresentação v2 (Remotion no show); Mapa, Erros e módulos v2
  - Scaffold `film/` (HyperFrames, video-maker, Higgsfield); docs como teste
  - Tornar oficial **só** quando Andressa avisar
- Plano: Cursor plan `2d_hd_no_site` (cópias, não substituição)

## Backlog — próximos módulos e integrações (não esquecer)

Cada item abaixo deve ser um **módulo/página com link próprio** (`#/<modulo>`), público distinto quando necessário.

Spec detalhada: [`docs/REESTRUTURACAO_ABAS.md`](docs/REESTRUTURACAO_ABAS.md).

### Páginas / módulos

- [ ] **Análise de Portais** — módulo `#/portais` (link de acesso separado da equipe de portais) *ou* aba em Campanhas (Fase 2)
- [ ] **Fechamento mensal de Web** — módulo `#/fechamento-web` (link próprio)
- [ ] **Fechamento mensal de Vendas** — módulo `#/fechamento-vendas` (link próprio)

### Comunicação Telegram

- [ ] **Bot / chat Telegram BellosCar** — envio de:
  - [ ] Lembretes
  - [ ] Insights (automáticos ou manuais a partir dos módulos)
  - [ ] Pautas e atas de reunião
- [ ] Canal/grupo Telegram definido + token só em segredo local (nunca no Git público)
- [ ] Documentar no README/DEPLOY o fluxo de configuração do bot (sem expor o token)

### Notas de arquitetura

- Seguir `src/modules/registry.ts` + regras `multi-module-pages.mdc` / `belloscar-product-prefs.mdc`
- Telegram exigirá componente fora do Pages puro (ex.: GitHub Actions schedule, Cloudflare Worker ou bot hospedado) — detalhar na implementação

Detalhes em [`DEPLOY.md`](DEPLOY.md).

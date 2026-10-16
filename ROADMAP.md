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
- **Análise de Campanhas (equipe):** https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas
- Gestão: https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas/admin

## Pós-lançamento

- [x] Publicação automática no Admin (agregar + dedupe + commit GitHub)
- [x] Correção 404 de rotas no GitHub Pages (`HashRouter`)
- [x] Regra de documentação obrigatória (`.cursor/rules/update-documentation.mdc`)
- [x] Token Admin em `localStorage` + regra anti-segredos no Git
- [x] Redesign UX/UI BellosCar (identidade visual + responsivo)
- [x] Faixa ticker de KPIs no topo do app
- [x] Arquitetura multi-módulo (Campanhas + regras alwaysApply)
- [ ] Próximos módulos com públicos/links próprios

Detalhes em [`DEPLOY.md`](DEPLOY.md).

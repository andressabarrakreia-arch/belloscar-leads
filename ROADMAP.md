# Roadmap — Belloscar Leads Analytics

## Status das fases

- [x] **Task 1 — Fundação**: app estático, gitignore, env, changelog, roadmap, README (repo público)
- [x] **Task 2 — Motor de dados**: parse XLSX, dedupe mensal, métricas, `dataset.json`
- [x] **Task 3 — Dashboard**: KPIs, tabela origem, gráficos, filtros
- [x] **Task 4 — Atendentes + comparação**: ranking, matriz, compare períodos
- [x] **Task 5 — Admin + share**: PIN, upload, download JSON; site Pages = leitura
- [x] **Task 6 — Deploy preparado**: workflow Pages, commits locais, `DEPLOY.md` (falta só `gh auth login` + push)

## Checklist final

- [x] Task 1 Fundação
- [x] Task 2 Motor de dados
- [x] Task 3 Dashboard
- [x] Task 4 Atendentes + comparação
- [x] Task 5 Admin + share (Pages = leitura)
- [x] Task 6 Artefatos de deploy prontos (aguardando login GitHub da Andressa)

## Único passo pendente na sua máquina

1. No terminal: `gh auth login` (browser)
2. Em `belloscar-leads`:
   ```powershell
   gh repo create belloscar-leads --public --source=. --remote=origin --push
   ```
3. Settings → Pages → Source: **GitHub Actions**
4. Abrir `https://SEU_USUARIO.github.io/belloscar-leads/`

Detalhes em [`DEPLOY.md`](DEPLOY.md).

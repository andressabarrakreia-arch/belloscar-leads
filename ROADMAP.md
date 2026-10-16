# Roadmap — Belloscar Leads Analytics

## Status das fases

- [x] **Task 1 — Fundação**: app estático, gitignore, env, changelog, roadmap, README (repo público)
- [x] **Task 2 — Motor de dados**: parse XLSX, dedupe mensal, métricas, `dataset.json`
- [x] **Task 3 — Dashboard**: KPIs, tabela origem, gráficos, filtros
- [x] **Task 4 — Atendentes + comparação**: ranking, matriz, compare períodos
- [x] **Task 5 — Admin + share**: PIN, upload, download JSON; site Pages = leitura
- [ ] **Task 6 — Deploy GitHub Pages**: requer Git + `gh auth login` nesta máquina; app e workflow já prontos

## Checklist final

- [x] Task 1 Fundação
- [x] Task 2 Motor de dados
- [x] Task 3 Dashboard
- [x] Task 4 Atendentes + comparação
- [x] Task 5 Admin + share (Pages = leitura)
- [ ] Task 6 Deploy (Git/login GitHub na máquina da Andressa)

## Próximo (manual, 2 minutos)

1. Instalar Git se ainda não estiver
2. `gh auth login`
3. Na pasta `belloscar-leads`:
   ```bash
   git init -b main
   git add .
   git commit -m "Initial release: Belloscar Leads static app"
   gh repo create belloscar-leads --public --source=. --remote=origin --push
   ```
4. GitHub → Settings → Pages → Source: **GitHub Actions**
5. Abrir `https://<user>.github.io/belloscar-leads/`

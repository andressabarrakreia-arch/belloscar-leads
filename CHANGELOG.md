# Changelog

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

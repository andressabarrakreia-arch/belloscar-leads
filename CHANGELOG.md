# Changelog

## [1.0.0] - 2026-10-16

### Added
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

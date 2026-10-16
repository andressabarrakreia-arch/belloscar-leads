# Instruções para agentes (BellosCar Analytics)

## Documentação obrigatória

Ao final de **toda** alteração, task ou criação, atualizar:

- `CHANGELOG.md`, `ROADMAP.md`
- `README.md` / `DEPLOY.md` quando URLs, módulos ou deploy mudarem
- `.env.example` só com placeholders (sem segredos reais)
- Regras em `.cursor/rules/` quando novas convenções forem definidas

## Segurança

- Nunca commit tokens/senhas/`.env` real — `.cursor/rules/no-secrets-in-repo.mdc`
- Token GitHub só em `localStorage` no Admin

## Módulos e links distintos

- Registro: `src/modules/registry.ts`
- Módulo atual: **Análise de Campanhas** → `#/campanhas`
- Novos módulos: rota `#/<modulo>/...`, layout próprio, link de equipe separado
- Regras: `multi-module-pages.mdc`, `belloscar-product-prefs.mdc` (alwaysApply)

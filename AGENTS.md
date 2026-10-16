# Instruções para agentes (Belloscar Leads)

## Documentação obrigatória

Ao final de **toda** alteração, task ou criação, atualizar a documentação do projeto:

- `CHANGELOG.md`
- `ROADMAP.md`
- `README.md` / `DEPLOY.md` quando o uso ou o deploy mudar
- `.env.example` se houver novas variáveis (sem valores secretos reais)
- Regra Cursor: `.cursor/rules/update-documentation.mdc` (alwaysApply)

Não encerrar o trabalho sem esse passo.

## Segurança (obrigatório)

- Nunca commit tokens, senhas, `.env` real, chaves — ver `.cursor/rules/no-secrets-in-repo.mdc`
- Token de publicação: só `localStorage` no Admin, nunca `VITE_` / código / GitHub
- Se um segredo vazar no repo público: remover + revogar + registrar no CHANGELOG

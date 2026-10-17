# Deploy no GitHub Pages

## Links publicados

Catálogo: [`CATALOGO_DE_PAGINAS.md`](CATALOGO_DE_PAGINAS.md)

- **Análise de Campanhas (equipe):** https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas  
- **Gestão Campanhas:** https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas/admin  
- **Análise de Agendamentos (equipe):** https://andressabarrakreia-arch.github.io/belloscar-leads/#/agendamentos  
- **Gestão Agendamentos:** https://andressabarrakreia-arch.github.io/belloscar-leads/#/agendamentos/admin  
- Repo: https://github.com/andressabarrakreia-arch/belloscar-leads  

Rotas em hash (`#/…`) para não gerar 404 no Pages.

## Atualizar dados — Campanhas

1. Abra `#/campanhas/admin` e entre com o PIN  
2. Uma vez: cole o Fine-grained PAT → **Salvar neste computador**  
3. Envie a planilha `.xlsx` → publica em `public/data/dataset.json`  
4. Aguarde o Actions (1–2 min)  

## Atualizar dados — Agendamentos

1. Abra `#/agendamentos/admin` (mesmo PIN)  
2. Token GitHub já salvo no navegador é reutilizado  
3. Envie AGENDAMENTOS / INSUCESSOS / LEADS GERAL  
4. Publica em `public/data/agendamentos-dataset.json` (isolado do dataset de campanhas)  

**Nunca** commit o PAT. Ver `.cursor/rules/no-secrets-in-repo.mdc`.

## Deploy técnico

Repo público + workflow `Deploy GitHub Pages` na branch `main`.

# Deploy no GitHub Pages

## Links publicados

- **Análise de Campanhas (equipe):** https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas  
- **Gestão do módulo:** https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas/admin  
- Repo: https://github.com/andressabarrakreia-arch/belloscar-leads  

Rotas em hash (`#/…`) para não gerar 404 no Pages.

## Atualizar dados (módulo Campanhas)

1. Abra `#/campanhas/admin` e entre com o PIN  
2. Uma vez: cole o Fine-grained PAT (Contents: Read and write) → **Salvar neste computador**  
3. Envie a planilha `.xlsx`  
4. Aguarde o Actions (1–2 min)  

**Nunca** commit o PAT. Ver `.cursor/rules/no-secrets-in-repo.mdc`.

## Deploy técnico

Repo público + workflow `Deploy GitHub Pages` na branch `main`.

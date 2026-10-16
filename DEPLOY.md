# Deploy no GitHub Pages

## Site publicado

- Home: https://andressabarrakreia-arch.github.io/belloscar-leads/
- Admin: https://andressabarrakreia-arch.github.io/belloscar-leads/#/admin  

Rotas usam **hash** (`#/…`) para não gerar 404 no GitHub Pages.

## Atualizar dados (automático)

1. Abra o **Admin** (`#/admin`) e entre com o PIN  
2. **Uma vez por computador/navegador:** cole o Fine-grained PAT (Contents: Read and write) → **Salvar neste computador** (`localStorage`)  
3. Envie a planilha `.xlsx` (agrega + dedupe + commit automático)  
4. Em 1–2 minutos o site da equipe atualiza  

**Nunca** commit o PAT no Git. Ver `.cursor/rules/no-secrets-in-repo.mdc`.

## Deploy técnico

Repo público + GitHub Actions (`Deploy GitHub Pages`) na branch `main`.  
O PIN de produção vem do fallback no código / variáveis `VITE_*` no build do Actions.

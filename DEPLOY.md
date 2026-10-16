# Deploy no GitHub Pages

## Site publicado

- Home: https://andressabarrakreia-arch.github.io/belloscar-leads/
- Admin: https://andressabarrakreia-arch.github.io/belloscar-leads/#/admin  
  PIN: `belloscar864275@`

Rotas usam **hash** (`#/…`) para não gerar 404 no GitHub Pages.

## Atualizar dados (automático)

1. Abra o **Admin** (`#/admin`) e entre com o PIN  
2. Crie um token em https://github.com/settings/tokens?type=beta  
   - Resource owner: sua conta  
   - Repository access: só `belloscar-leads`  
   - Permissions → **Contents: Read and write**
3. Cole o token no Admin → **Salvar token na sessão**
4. Envie a planilha `.xlsx`  
   - O app **agrega** (não substitui)  
   - Faz dedupe no mês (visita/agendamento → mais recente; Sucesso permanece)  
   - Faz **commit automático** no GitHub  
5. Em 1–2 minutos o site da equipe atualiza

O token fica só no `sessionStorage` do navegador. Não é commitado.

## Deploy técnico

Repo público + GitHub Actions (`Deploy GitHub Pages`) na branch `main`.  
O PIN de produção vem do fallback no código / variáveis `VITE_*` no build do Actions.

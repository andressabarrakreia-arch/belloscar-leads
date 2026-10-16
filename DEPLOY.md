# Deploy no GitHub Pages

## Site publicado

- https://andressabarrakreia-arch.github.io/belloscar-leads/
- Admin: https://andressabarrakreia-arch.github.io/belloscar-leads/admin

## Atualizar dados (automático)

1. Abra o **Admin** e entre com o PIN (`belloscar`)
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

## Deploy técnico (já feito)

Repo público + GitHub Actions (`Deploy GitHub Pages`) na branch `main`.

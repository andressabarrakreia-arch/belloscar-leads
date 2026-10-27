# Deploy no GitHub Pages

Hub: **BellosCar · Análise de Resultados**. Páginas separadas abaixo.

## Links publicados

Catálogo: [`CATALOGO_DE_PAGINAS.md`](CATALOGO_DE_PAGINAS.md)

- **Índice Geral:** https://andressacarmetrics.com.br/  
- **Análise de Campanhas (equipe):** https://andressacarmetrics.com.br/#/campanhas  
- **Análise de Agendamentos (equipe):** https://andressacarmetrics.com.br/#/agendamentos  
- **Análise de Negociações (equipe):** https://andressacarmetrics.com.br/#/negociacoes  
- **Gestão do Índice (PIN — importar e exportar):** https://andressacarmetrics.com.br/#/indice/gestao  
- Repo: https://github.com/andressabarrakreia-arch/belloscar-leads  

Rotas em hash (`#/…`) para não gerar 404 no Pages.  
Rotas antigas `#/…/admin` redirecionam para `#/indice/gestao`.

## Atualizar dados (único painel)

Tudo sobe e baixa em **Gestão do Índice** (`#/indice/gestao`), com o mesmo PIN de `adminAuth`.

1. Abra `#/indice/gestao` e entre com o PIN  
2. Uma vez: cole o Fine-grained PAT → **Salvar neste computador**  
3. Envie uma ou várias planilhas (`.xlsx` / `.xls` / `.csv`) — o painel reconhece o tipo e atualiza a base certa  
4. Aguarde o Actions (1–2 min) no site no ar  

O que cada tipo atualiza:

- LEADS, agendamentos, realizados, sucessos e insucessos → `public/data/agendamentos-dataset.json` (Campanhas lê essa mesma base)  
- LEADS POR CAMPANHA → alimenta a aba Leads por formulário  
- Negociações e avaliações → `public/data/negociacoes-dataset.json`  

### Exportar clientes

No mesmo painel, card **Exportar**: marque Campanhas / Agendamentos / Negociações e **Baixar selecionados** (CSV).

Regenerar a base completa a partir das planilhas locais: `npm run generate:agendamentos` + commit (ou o script de negociações).

**Nunca** commit o PAT. Ver `.cursor/rules/no-secrets-in-repo.mdc`.

## Domínio

Endereço principal: `https://andressacarmetrics.com.br`  
O `www` redireciona para esse endereço quando o CNAME dele aponta para `andressabarrakreia-arch.github.io`.  
DNS (registros A, AAAA e CNAME) fica na zona da HostGator. O arquivo `public/CNAME` vai no artefato do Pages.

## Deploy técnico

Repo público + workflow `Deploy GitHub Pages` na branch `main`.

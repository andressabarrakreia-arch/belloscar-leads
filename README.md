# Belloscar Leads Analytics

Dashboard **estático** para análise de leads da Belloscar (Curitiba).

- React + Vite + TypeScript + Recharts  
- **Sem servidor** em produção (nada rodando na sua máquina)  
- Dados em [`public/data/dataset.json`](public/data/dataset.json)  
- Publicação via **GitHub Pages** (repositório público)  
- Rotas com **HashRouter** (links diretos não dão 404 no Pages)

## URL

- Site: https://andressabarrakreia-arch.github.io/belloscar-leads/
- Repo: https://github.com/andressabarrakreia-arch/belloscar-leads
- Admin: https://andressabarrakreia-arch.github.io/belloscar-leads/#/admin  
  PIN: `belloscar864275@`

## O que a equipe vê

- Dashboard com KPIs, tabela por origem e gráficos  
- Atendentes (ranking + matriz origem × atendente)  
- Comparar períodos (quinzenas)  
- Filtros: período, mês, origem, atendente, datas  
- **Somente leitura** — sem editar dados  

Links da equipe (sem 404):

- https://andressabarrakreia-arch.github.io/belloscar-leads/#/
- https://andressabarrakreia-arch.github.io/belloscar-leads/#/atendentes
- https://andressabarrakreia-arch.github.io/belloscar-leads/#/comparar

## Como você atualiza os dados (a cada 15 dias ou quando quiser)

1. Abra `/#/admin` (no site ou local) e entre com o PIN  
2. Cole um **Personal Access Token** do GitHub (Contents: Read and write) e salve na sessão  
3. Envie a planilha `.xlsx`  
4. O app **agrega** o período novo, faz a limpeza de duplicados e **publica sozinho** no repositório  
5. Em 1–2 minutos o GitHub Pages atualiza o link da equipe  

O token não fica no código — só na sessão do seu navegador.

### Colunas esperadas na planilha

`ID`, `Criado em`, `Responsável`, `Status`, `Visita`, `Data Visita`, `Origem`, `Tipo Proposta`, `Cliente`, `Celular`

### Deduplicação

- Só dentro do **mesmo mês**  
- Prioriza visita (`Visita=Sim` ou `Status=Visita`) ou `Status=Agendado`  
- Senão mantém o mais recente  
- `Status=Sucesso` nunca é removido  

## Setup local

```bash
cp .env.example .env
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Documentação do projeto

Ao final de qualquer alteração, atualizar:

- `CHANGELOG.md`, `ROADMAP.md`, `README.md`, `DEPLOY.md` conforme necessário  
- Regra Cursor: `.cursor/rules/update-documentation.mdc`  
- Ver também `AGENTS.md`

## Segurança

- Não commite `.env` nem planilhas `.xlsx` brutas  
- O JSON publicado fica público (necessário para Pages)  
- O PIN do admin entra no bundle do frontend (limitação do app estático)

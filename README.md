# Belloscar Leads Analytics

Dashboard **estático** para análise de leads da Belloscar (Curitiba).

- React + Vite + TypeScript + Recharts  
- **Sem servidor** em produção (nada rodando na sua máquina)  
- Dados em [`public/data/dataset.json`](public/data/dataset.json)  
- Publicação via **GitHub Pages** (repositório público)

## URL

- Site: https://andressabarrakreia-arch.github.io/belloscar-leads/
- Repo: https://github.com/andressabarrakreia-arch/belloscar-leads
- Admin: https://andressabarrakreia-arch.github.io/belloscar-leads/admin

## O que a equipe vê

- Dashboard com KPIs, tabela por origem e gráficos  
- Atendentes (ranking + matriz origem × atendente)  
- Comparar períodos (quinzenas)  
- Filtros: período, mês, origem, atendente, datas  
- **Somente leitura** — sem editar dados

## Como você atualiza os dados (a cada 15 dias ou quando quiser)

1. Rode local: `npm install` → `npm run dev`  
2. Abra `/admin` e entre com o PIN (`VITE_ADMIN_PIN` no `.env`)  
3. Envie a planilha `.xlsx`  
4. Baixe o `dataset.json` gerado  
5. Substitua `public/data/dataset.json`  
6. Commit + push na branch `main`  
7. O GitHub Actions publica no Pages automaticamente  

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

## Ativar GitHub Pages

1. Crie o repo público `belloscar-leads` e faça push  
2. Settings → Pages → Source: **GitHub Actions**  
3. Após o workflow `Deploy GitHub Pages` concluir, use a URL do Pages  

## Segurança

- Não commite `.env` nem planilhas `.xlsx` brutas  
- O JSON publicado fica público (necessário para Pages)  
- O PIN do admin é proteção leve (repo público)

## Roadmap / Changelog

Veja [`ROADMAP.md`](ROADMAP.md) e [`CHANGELOG.md`](CHANGELOG.md).

# BellosCar Analytics

Hub **estático** de análises da BellosCar (Curitiba), organizado em **módulos** com links distintos.

- React + Vite + TypeScript + Recharts  
- Sem servidor em produção  
- Dados de campanhas em [`public/data/dataset.json`](public/data/dataset.json)  
- GitHub Pages + HashRouter  

## Módulo atual: Análise de Campanhas

**Link da equipe (compartilhar este):**  
https://andressabarrakreia-arch.github.io/belloscar-leads/#/campanhas

| Página | Link |
|--------|------|
| Dashboard | `#/campanhas` |
| Atendentes | `#/campanhas/atendentes` |
| Comparar períodos | `#/campanhas/comparar` |
| Gestão (importar planilha) | `#/campanhas/admin` |

A home `#/` redireciona para `#/campanhas`. Links antigos (`#/admin`, etc.) também redirecionam.

### O que a equipe vê neste módulo

- KPIs, tabela por origem, gráficos  
- Atendentes e comparação de períodos  
- Filtros · **somente leitura**  

## Novos módulos (futuro)

Cada módulo novo terá:

- entrada em `src/modules/registry.ts`  
- rotas `#/<modulo>/...`  
- link de acesso próprio para o público autorizado  

Regras Cursor (sempre ativas): `multi-module-pages.mdc`, `belloscar-product-prefs.mdc`.

## Como atualizar dados de campanhas

1. Abra `#/campanhas/admin` e entre com o PIN  
2. Na primeira vez, salve o PAT GitHub neste computador (`localStorage`)  
3. Envie a planilha `.xlsx` (agrega + dedupe + publica)  
4. Em 1–2 minutos o Pages atualiza  

### Colunas da planilha

`ID`, `Criado em`, `Responsável`, `Status`, `Visita`, `Data Visita`, `Origem`, `Tipo Proposta`, `Cliente`, `Celular`

### Deduplicação

- Só no mesmo mês · visita/agendamento primeiro · senão mais recente · Sucesso sempre permanece  

## Setup local

```bash
cp .env.example .env
npm install
npm run dev
```

## Documentação e segurança

- Ao final de cada alteração: `CHANGELOG.md`, `ROADMAP.md`, README/DEPLOY se URLs mudarem  
- Segredos nunca no Git — `.cursor/rules/no-secrets-in-repo.mdc`  
- Ver `AGENTS.md`  

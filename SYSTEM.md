# BellosCar Analytics — System Definition

_Fonte viva: este arquivo + `.nexus-map/INDEX.md`. Não inventar rotas nem JSON keys fora daqui._

## One paragraph

Painel estático (React/Vite/GitHub Pages) que analisa campanhas Meta, agendamentos de pré-venda, negociações da loja e perfil de clientes. Dados entram por planilhas no **Painel de Gestão**, viram JSON em `public/data/`, e cada módulo tem rota e storage isolados. O hub **Análise de Resultados** (`#/indice`) aponta para as portas da equipe; Erros e Mapa do Site pedem PIN de gate; Gestão usa PIN de admin separado.

## Decisions locked

| Axis | Decision |
| --- | --- |
| Runtime | SPA HashRouter, base `./`, deploy GitHub Pages |
| Dados vivos | `agendamentos-dataset.json` + `negociacoes-dataset.json` |
| Legado | `dataset.json` só histórico admin campanhas |
| Mapa clientes | Só no índice; filtros já fechados (`grill-mapa`) |
| Erros | Cruzamento de IDs; página standalone `#/erros` |
| Mapa do Site | Atlas do produto `#/mapa`; mesmo gate PIN que Erros |
| Gestão | PIN `adminAuth` — não misturar com gate Erros/Mapa |
| Upload e export | Só `#/indice/gestao` (rotas `#/…/admin` redirecionam) |

## Structures

### Hub (Índice)

- Rota `#/` / `#/indice` → `IndiceGeral.tsx`
- Portas: campanhas, agendamentos, negociações, perfil, erros, mapa, apresentação
- Contém mapa geográfico de clientes (Vega) e ranking
- Link Gestão no rodapé → `#/indice/gestao`

### Módulos de análise

- **Campanhas** `#/campanhas` — dashboard / atendentes / comparar / formulários
- **Agendamentos** `#/agendamentos` — visão geral, pré-vendas, vendedores, detalhe, portais, insucessos
- **Negociações** `#/negociacoes` — visão geral, lançamentos, vendedores
- **Perfil** `#/perfil` — marcas, modelos, gênero, motivos

### Gate + Gestão

- Gate PIN compartilhado Erros + Mapa + Apresentação (`gateAuth`)
- Admin PIN Gestão (`adminAuth`) — painel único `#/indice/gestao` (import + export)

## Flows

1. **Publicar base:** `#/indice/gestao` → importar planilhas → JSON em `public/data/` (+ publish GitHub) → módulos leem store/JSON.
2. **Exportar clientes:** mesmo painel → checkboxes Campanhas / Agendamentos / Negociações → CSV.
3. **Ver equipe:** Índice → porta do módulo → abas do `registry.ts` (sem aba Gestão).
4. **Cruzar faltas:** Índice → Erros (PIN) → cruzamento entre planilhas do dataset de agendamentos.
5. **Orientar agente/humano:** Índice → Mapa do Site (PIN) → atlas de rotas e fontes de dados.

## Open questions

_Nenhuma aberta nesta versão do atlas (2026-10-26)._

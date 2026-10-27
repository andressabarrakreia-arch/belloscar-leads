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
| Upload | Só `#/indice/gestao` e admins de módulo |

## Structures

### Hub (Índice)

- Rota `#/` / `#/indice` → `IndiceGeral.tsx`
- Portas: campanhas, agendamentos, negociações, perfil, erros, mapa
- Contém mapa geográfico de clientes (Vega) e ranking

### Módulos de análise

- **Campanhas** `#/campanhas` — dashboard / atendentes / comparar / formulários / admin
- **Agendamentos** `#/agendamentos` — visão geral, pré-vendas, vendedores, detalhe, portais, insucessos / admin
- **Negociações** `#/negociacoes` — visão geral, lançamentos, vendedores / admin
- **Perfil** `#/perfil` — marcas, modelos, gênero, motivos

### Gate + Gestão

- Gate PIN compartilhado Erros + Mapa (`gateAuth`)
- Admin PIN Gestão (`adminAuth`)

## Flows

1. **Publicar base:** Gestão → importar planilhas → JSON em `public/data/` (+ opcional publish GitHub) → módulos leem store/JSON.
2. **Ver equipe:** Índice → porta do módulo → abas do `registry.ts` (sem gestão).
3. **Cruzar faltas:** Índice → Erros (PIN) → cruzamento entre planilhas do dataset de agendamentos.
4. **Orientar agente/humano:** Índice → Mapa do Site (PIN) → atlas de rotas e fontes de dados.

## Open questions

_Nenhuma aberta nesta versão do atlas (2026-10-26)._

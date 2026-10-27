# Nexus map — BellosCar · Análise de Resultados

Atualizado: 2026-10-26. Cold start: leia este arquivo antes de criar dados, rotas ou páginas.

## O que é este produto

SPA React + Vite + HashRouter em GitHub Pages. Hub: **Análise de Resultados**. Sem backend — JSON em `public/data/` + overrides em `localStorage`.

## Rotas (fonte: `src/App.tsx` + `src/modules/registry.ts`)

| Hash | Página / módulo | Arquivo principal |
| --- | --- | --- |
| `#/` `#/indice` | Índice Geral | `src/pages/IndiceGeral.tsx` |
| `#/indice/gestao` | Gestão do Índice (upload) | `src/pages/IndiceGestao.tsx` |
| `#/erros` | Cruzamento de IDs (PIN gate) | `src/pages/Erros.tsx` |
| `#/mapa` | Mapa do Site (PIN gate) | `src/pages/MapaDoSite.tsx` |
| `#/campanhas/*` | Análise de Campanhas | `src/pages/Dashboard.tsx` + … |
| `#/agendamentos/*` | Análise de Agendamentos | `src/pages/agendamentos/*` |
| `#/negociacoes/*` | Análise de Negociações | `src/pages/negociacoes/*` |
| `#/perfil` | Perfil de Clientes | `src/pages/perfil/PerfilClientes.tsx` |

Portas do índice (`DOORS` em `IndiceGeral.tsx`): Campanhas, Agendamentos, Negociações, Perfil, Erros, Mapa do Site. Gestão fica no rodapé (`#/indice/gestao`).

## Dados — não recriar

| Dataset publicado | Serve para | Não confundir com |
| --- | --- | --- |
| `public/data/agendamentos-dataset.json` | Agendamentos **e** analytics de campanhas + Erros | — |
| `public/data/negociacoes-dataset.json` | Negociações / ranking no índice | — |
| `public/data/dataset.json` | **Legado** — histórico campanhas no admin | Não é a fonte do dashboard vivo de campanhas |

### Storage (isolamento por módulo)

- Agendamentos: `agendamentos_dataset`, `agendamentos_admin_config`
- Negociações: `negociacoes_dataset`, `negociacoes_admin_config`
- Admin Gestão: `belloscar_admin_ok` (`src/lib/adminAuth.ts`)
- Gate Erros/Mapa: `belloscar_gate_ok` (`src/lib/gateAuth.ts`)
- Tema: `belloscar-tema`

## Decisões fechadas (não reabrir)

- Mapa **geográfico de clientes** fica no **índice** (`grill-mapa`). Não volta para Erros nem para Mapa do Site.
- Erros = cruzamento de IDs entre planilhas (`lib/scheduling/errosCruzamento.ts`).
- Upload de planilhas só no Painel de Gestão.
- Dedupe agendamentos por `id`; negociações por nº da Negociação.

## Pastas-chave

```
src/pages/           # telas
src/modules/         # registry de módulos
src/lib/             # auth, datasets, github publish
src/components/      # UI + viz
public/data/         # JSON publicado
.nexus-map/          # este mapa (agente)
SYSTEM.md            # atlas textual
repo.md              # overview arquitetura
AGENTS.md            # instruções agentes
CATALOGO_DE_PAGINAS.md
```

## Artefatos irmãos

- `SYSTEM.md` — decisões e fluxos (atlas)
- `repo.md` — overview do repositório
- `.cursor/rules/mapa-orientacao-dados.mdc` — rule alwaysApply
- `graphify-out/` — grafo de código (quando gerado)

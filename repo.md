# Repository Context

## Repository Overview

BellosCar Analytics (`belloscar-leads`) is a TypeScript React 19 + Vite 6 single-page app deployed on GitHub Pages. It turns dealership spreadsheet uploads into module dashboards (campanhas, agendamentos, negociações, perfil), with a hub index, an ID-crosscheck Erros page, and a product atlas (Mapa do Site). There is no application server: published JSON under `public/data/` plus optional `localStorage` overrides drive the UI. Agent orientation lives in `.nexus-map/`, `SYSTEM.md`, `AGENTS.md`, and `.cursor/rules/`.

---

## Project: BellosCar · Análise de Resultados

### Detection

- **ID**: `. (frontend)`
- **Type**: frontend
- **Base Path**: `.`
- **Languages**: TypeScript, CSS, HTML
- **Frameworks**: React, Vite, React Router (HashRouter), Tailwind 4, Recharts/ECharts/Vega/D3/GSAP/Motion
- **Dependency Files**: `package.json`, `package-lock.json`
- **Extensions**: `.ts`, `.tsx`, `.css`, `.json`, `.md`
- **Evidence**: `src/main.tsx` mounts React; `vite.config.ts` sets `base: "./"` for Pages; modules registered in `src/modules/registry.ts`.

### Summary

The app is organized as a hub (`IndiceGeral`) plus four analysis modules under HashRouter paths. Campanhas analytics share the agendamentos published dataset for live views; negociacoes use their own JSON. Admin screens share `adminAuth` PIN; Erros and Mapa do Site share a separate `gateAuth` PIN. Visualization libraries are page-specific (ECharts on Erros, Vega map on index, Recharts on module overviews). Publishing updates `public/data/*.json` via Gestão flows and optional GitHub token in browser storage. Cursor agents must consult `.nexus-map/INDEX.md` before inventing storage keys or relocating the client map.

### Sensitive Data Types

PII (client names, phones in spreadsheets), login (PIN gates), secrets (GitHub token only in localStorage — never commit)

### Business Criticality

high

### Component Map

| Directory | Type | Criticality | Description |
| --- | --- | --- | --- |
| `src/pages` | pages | 0.95 | Route screens (índice, módulos, erros, mapa) |
| `src/modules` | registry | 0.9 | Module names, nav, public paths |
| `src/lib` | domain | 1.0 | Auth, datasets, scheduling/negociacoes logic, publish |
| `src/components` | ui/viz | 0.7 | Shared UI and chart widgets |
| `public/data` | data | 1.0 | Published JSON source of truth |
| `.nexus-map` | agent-map | 0.8 | Cold-start map for agents |
| `.agents/skills` | skills | 0.6 | Project agent skills |
| `.cursor/rules` | rules | 0.85 | Always-on agent constraints |

### Evidence

Inspected `src/App.tsx`, `src/modules/registry.ts`, `src/lib/adminAuth.ts`, `AGENTS.md`, `CATALOGO_DE_PAGINAS.md`, and `public/data/` naming conventions used across scheduling/negociacoes stores.

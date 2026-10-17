---
name: reuse-before-create
description: >-
  Antes de implementar páginas ou módulos BellosCar, analisa o código existente
  e reutiliza padrões (registry, ModuleLayout, parse XLSX, admin PIN, CSS).
---

# Reutilizar antes de criar

## Quando usar

Ao criar página, módulo, importador ou painel admin neste repositório.

## Checklist

1. Ler `src/modules/registry.ts` e `App.tsx`
2. Ver parse/datas/dedupe em `src/lib/`
3. Ver UI em `styles.css`, `ModuleLayout`, `KpiGrid`, filtros
4. Ver isolamento em `.cursor/rules/module-storage-isolation.mdc`
5. Atualizar `CATALOGO_DE_PAGINAS.md` no formato `nome=link`
6. Preferir TypeScript estrito e HashRouter (GitHub Pages)

## Não fazer

- Misturar storage entre módulos
- Deduplicar agendamentos por data
- Criar layout/CSS paralelo sem necessidade

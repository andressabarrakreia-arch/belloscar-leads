# Graph Report - belloscar-leads  (2026-10-23)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 843 nodes · 2279 edges · 34 communities (31 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 5 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fcbc73cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33

## God Nodes (most connected - your core abstractions)
1. `InfoTip()` - 48 edges
2. `react` - 33 edges
3. `useSchedulingAnalytics()` - 26 edges
4. `App()` - 24 edges
5. `round2()` - 23 edges
6. `compilerOptions` - 20 edges
7. `KeyTicker()` - 19 edges
8. `sliceCampanhas()` - 19 edges
9. `currentMonthRange()` - 19 edges
10. `FormLeads()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `App()` --calls--> `ModuleLayout()`  [EXTRACTED]
  src/App.tsx → src/components/ModuleLayout.tsx
- `App()` --calls--> `Admin()`  [EXTRACTED]
  src/App.tsx → src/pages/Admin.tsx
- `App()` --calls--> `SchedulingAdmin()`  [EXTRACTED]
  src/App.tsx → src/pages/agendamentos/SchedulingAdmin.tsx
- `App()` --calls--> `SchedulingDetalhe()`  [EXTRACTED]
  src/App.tsx → src/pages/agendamentos/SchedulingDetalhe.tsx
- `App()` --calls--> `SchedulingInsucessos()`  [EXTRACTED]
  src/App.tsx → src/pages/agendamentos/SchedulingInsucessos.tsx

## Import Cycles
- None detected.

## Communities (34 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (74): CampanhasFilters(), Props, ClearFiltersButton(), filterActiveClass(), Props, FilterOptions, FiltersBar(), Props (+66 more)

### Community 1 - "Community 1"
Cohesion: 0.07
Nodes (76): Props, Row, SDRPerformanceTable(), Props, SdrPreVendaConvPropostaTable(), SdrPreVendaTopParceirosTable(), SdrPreVendaUnifiedTable(), taxaOf() (+68 more)

### Community 2 - "Community 2"
Cohesion: 0.07
Nodes (68): EMPTY_NEGO_FILTERS, KeyTicker(), load(), Props, Ctx, ModuleTickerContext, useModuleTicker(), Analytics (+60 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (56): react-router-dom@^7.18.4, react-router-dom, ADMIN_AUTH_KEY, ADMIN_PIN, isAdminAuthed(), setAdminAuthed(), campanhaClientsForExport(), clearStoredToken() (+48 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (29): Row, useDataset(), useFilteredAnalytics(), applyImport(), loadDataset(), formatPeriodLabel(), DedupeMergeResult, Entry (+21 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (31): runs-on, steps, concurrency, cancel-in-progress, group, environment, needs, runs-on (+23 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (26): Acc, attributeByOrigemChannels(), buildPortalDashboard(), ChannelBreakdown, emptyPropostas(), ensureAcc(), finalizeOrigin(), personTops() (+18 more)

### Community 7 - "Community 7"
Cohesion: 0.15
Nodes (24): canalFromSdr(), isVisitFlag(), isVisitYesNo(), normalizeId(), normalizeStatus(), normalizeTipoProposta(), normHeader(), repairUtf8Mojibake() (+16 more)

### Community 8 - "Community 8"
Cohesion: 0.09
Nodes (14): avaliacoes, avalPath, dataset, defaultXlsx, __dirname, isCompraDeConsignado(), lines, normalizeKey() (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.21
Nodes (19): xlsx@^0.18.5, xlsx, dealFromLines(), linesToDeals(), platesOf(), cellNumber(), cellStr(), isCancelado() (+11 more)

### Community 10 - "Community 10"
Cohesion: 0.11
Nodes (22): description, devDependencies, esbuild@^0.28.2, @types/node@^24.13.3, @types/react@^19.2.18, @types/react-dom@^19.2.7, typescript@~5.8.2, vite@^6.2.0 (+14 more)

### Community 11 - "Community 11"
Cohesion: 0.15
Nodes (20): applyOne(), FileImportResult, ImportBase, SCHEDULING_LABEL, applyAvaliacoesImport(), applyNegociacoesImport(), mergeAvaliacoes(), mergeByNegociacao() (+12 more)

### Community 12 - "Community 12"
Cohesion: 0.16
Nodes (21): isoToPeriodKey(), applyLeadsCampanhaImport(), applySchedulingImport(), atendimentosFromLeads(), dedupeCount(), dedupeLeadsCampanha(), emptySchedulingDataset(), finishImport() (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.09
Nodes (21): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, jsx, lib, module (+13 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (14): Ambient(), ModuleLayout(), Props, makeParticle(), Particle, ParticleField(), SiteCredit(), ModuleTickerProvider() (+6 more)

### Community 15 - "Community 15"
Cohesion: 0.15
Nodes (16): PerformanceComparisonTable(), Props, DetailBlock(), MotivosTable(), OrigensTable(), Props, VendedorConversionCards(), Analytics (+8 more)

### Community 16 - "Community 16"
Cohesion: 0.18
Nodes (17): blankSnap(), buildFormularioReport(), compareCampanhas(), CrossedFormLead, FormularioFilters, FormularioReport, FormularioScore, IdSnap (+9 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (17): dependencies, class-variance-authority@^0.7.1, clsx@^2.1.1, lucide-react@^1.61.0, @radix-ui/react-slot@^1.5.0, react@^19.2.8, react-dom@^19.2.8, recharts@^3.10.1 (+9 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (12): @tailwindcss/vite@^4.3.3, @tailwindcss/vite, argDir, dataDir, __dirname, loadModules(), main(), outPath (+4 more)

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (12): InfoTip(), Props, MotivoByPersonTable(), Props, MotivoDistributionChart(), MotivoTick(), Props, MotivoLabel() (+4 more)

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (13): excelSerialToDate(), monthKeyFromDate(), periodKeyFromDate(), hasPriorityKeep(), isScheduledStatus(), isSuccessStatus(), isVisitFlag(), cell() (+5 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.28
Nodes (14): MarketStrip(), placeholders(), brNumber(), DollarPayload, dollarQuote(), dollarWhen(), ipcaQuote(), loadMarketQuotes() (+6 more)

### Community 23 - "Community 23"
Cohesion: 0.14
Nodes (13): aliases, components, lib, ui, utils, rsc, $schema, style (+5 more)

### Community 24 - "Community 24"
Cohesion: 0.27
Nodes (10): react, Badge(), Button(), ButtonProps, buttonVariants, Card(), CardContent(), CardHeader() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.24
Nodes (8): recharts, CanalKpiGrid(), Props, Point, Props, TimeSeriesChart(), CanalKpis, SchedulingOverview()

### Community 26 - "Community 26"
Cohesion: 0.26
Nodes (6): App(), useNegociacoesAnalyticsContext(), fmtDate(), NegociacoesLancamentos(), NegociacoesOverview(), NegociacoesVendedores()

### Community 27 - "Community 27"
Cohesion: 0.31
Nodes (8): ExpandBtn(), OriginSummary(), PortaisDashboard(), Props, tipoLabel(), PortalDashboard, PortalOriginMetrics, SchedulingPortais()

### Community 28 - "Community 28"
Cohesion: 0.29
Nodes (7): COLORS, ProposalDistributionChart(), Props, Props, SdrVendedorProposalTable(), SdrVendedorPairRow, SchedulingDetalhe()

### Community 29 - "Community 29"
Cohesion: 0.44
Nodes (7): headerMap(), isLeadsCampanhaHeader(), parseFormCreatedAt(), parseLeadsCampanhaArrayBuffer(), readRows(), formatPhoneDisplay(), phoneKey()

### Community 30 - "Community 30"
Cohesion: 0.29
Nodes (7): scripts, build, dev, generate:agendamentos, generate:dataset, generate:negociacoes, preview

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 24` to `Community 0`, `Community 1`, `Community 2`, `Community 3`, `Community 4`, `Community 10`, `Community 14`, `Community 15`, `Community 17`, `Community 19`, `Community 22`, `Community 26`, `Community 27`?**
  _High betweenness centrality (0.154) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06991260923845194 - nodes in this community are weakly interconnected._
- **Why does `xlsx` connect `Community 9` to `Community 1`, `Community 7`, `Community 8`, `Community 10`, `Community 20`, `Community 29`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06683878370625358 - nodes in this community are weakly interconnected._
- **Why does `InfoTip()` connect `Community 19` to `Community 0`, `Community 1`, `Community 14`, `Community 15`, `Community 25`, `Community 26`, `Community 27`, `Community 28`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06726606726606726 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.06734867860187553 - nodes in this community are weakly interconnected._
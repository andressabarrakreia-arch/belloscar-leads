# Reestruturação em abas — Análise de Resultados (BellosCar)

Documento de especificação (histórico da Fase 1).  
**Status 2026-10-27:** abas de Agendamentos implementadas. **Gestão** não fica mais no nav do módulo — upload e export estão só em `#/indice/gestao` (rotas `#/…/admin` redirecionam).  
**Não fundir** os módulos atuais numa única página.

| Hub | Páginas (módulos separados) |
|-----|-----------------------------|
| **Análise de Resultados** | **Análise de Campanhas** `#/campanhas` · **Análise de Agendamentos** `#/agendamentos` |

---

## 1. Decisão de arquitetura (obrigatória)

### O que fazer

1. **Módulo `#/agendamentos`** — reorganizar a UI em **abas internas** (Fase 1):
   - Visão Geral  
   - Pré-Vendas  
   - Vendedores  
   - Agendamentos  
   - Insucessos  
2. **Módulo `#/campanhas`** — evoluir Portais / Origens / UTMs (Fase 2), **sem** virar aba de Agendamentos.  
3. Manter **links distintos** por equipe (`CATALOGO_DE_PAGINAS.md`).  
4. Manter **GitHub Pages + HashRouter**, PIN admin, datasets isolados, TypeScript, `styles.css` atual.

### O que NÃO fazer

- Um único mega-dashboard com 7 abas misturando Campanhas + Agendamentos.  
- Dark mode (fora do escopo / design system).  
- Reinventar parse/merge/admin.  
- Misturar **Pré-Venda** e **Recepção** no “geral” sem bloco separado.

### Rotas alvo (Fase 1 — HashRouter)

```
#/agendamentos                 → Visão Geral (default)
#/agendamentos/pre-vendas      → Performance Pré-Vendas
#/agendamentos/vendedores      → Performance Vendedores
#/agendamentos/detalhe         → Análise de Agendamentos (cruzamentos)
#/agendamentos/insucessos      → Análise de Insucessos
#/agendamentos/portais         → Portais
#/indice/gestao                → Gestão (PIN) — import + export (único painel)
```

Nav do módulo = abas (ou tabs no topo). Gestão fica só no Índice.

---

## 2. Contrato de dados e funil

### Fontes

| Planilha | Papel |
|----------|--------|
| **AGENDAMENTOS** | Universo operacional do módulo Agendamentos (autoritativo para status/vendedor/data) |
| **INSUCESSOS** | Enrich-only por `id` → `motivoInsucesso` (+ origem quando houver) |
| **LEADS GERAL** | Enrich-only por `id` → origem, email, cliente; **e** base de “Atendimentos” no funil executivo quando necessário |
| **LEADS POR UTM** / dataset Campanhas | Fase 2 — módulo Campanhas |
| PERFORMANCE * | Só validação opcional; não vira linha do dataset |

### Chave

- Cruzamento e dedupe: **somente `id`** (nunca por data).  
- Import acumulativo; Insucessos/Leads = **enrich-only** (não criam órfãos).  
- Insucesso sem motivo cruzado: **excluir da base publicada** (política atual) ou marcar explicitamente — não inventar motivo.

### Etapas do funil (rótulos na UI)

| Etapa | Definição operacional (módulo Agendamentos) |
|-------|-----------------------------------------------|
| **Atendimento** | Registro em LEADS GERAL no período **ou**, se funil só sobre agendados: cada item do dataset de agendamentos conta como 1 atendimento agendado. *Na Visão Geral Fase 1, usar o universo do dataset de agendamentos filtrado; Fase 1.1 pode cruzar volume de LEADS GERAL se importado.* |
| **Agendamento** | Item no dataset de agendamentos (todos os registros da base operacional) |
| **Visita** | `teveVisita === true` (Visita=Sim **ou** status Visita/Sucesso **ou** Insucesso com visita) |
| **Sucesso** | `status === "Sucesso"` (normalizado de Sucesso (Compra/Venda/…)) |
| **Insucesso** | `status === "Insucesso"` |

### Canal de atendimento (para o vendedor)

| Canal | Regra |
|-------|--------|
| **Recepção** | `Atendido por` ∈ Recepção, Gabriela (normalizado) |
| **Pré-Venda** | Demais |

**Regra de ouro:** totais/geral da Pré-Venda **não incluem** Recepção. Recepção tem KPIs e tabelas próprios.

### Tipos de proposta

`Compra` | `Venda` | `Troca` | `Consignação` | `Financiamento` | `não informado(celulas em branco)`

---

## 3. Contrato de métricas (fórmulas fixas)

Sempre exibir o **denominador no subtítulo** do card/coluna.

| Métrica | Fórmula | Onde usar |
|---------|---------|-----------|
| % Agendamento sobre atendimento* | Agendamentos / Atendimentos × 100 | Visão Geral (*se Atendimentos ≠ Agendamentos) |
| Show-up (comparecimento) | Visitas / Agendamentos × 100 | Visão Geral, Pré-Vendas, Agendamentos |
| Conv. final (atendimento→sucesso)* | Sucessos / Atendimentos × 100 | Visão Geral |
| Conv. agendamento→sucesso | Sucessos / Agendamentos × 100 | Pré-Vendas, Agendamentos |
| Fechamento de salão | Sucessos / Visitas × 100 | Vendedores |
| Conv. Pré-Venda (vendedor) | Sucessos (canal PV) / Recebidos (canal PV) × 100 | Vendedores |
| Conv. Recepção (vendedor) | Sucessos (canal Rec) / Recebidos (canal Rec) × 100 | Vendedores |
| % Insucesso | Insucessos / Agendamentos × 100 | Insucessos |
| % motivo | Qtd motivo / Insucessos (do recorte) × 100 | Insucessos |

\* Na Fase 1, se a Visão Geral usar só o dataset de agendamentos, então “Atendimentos” = total de itens filtrados e “% Agendamento sobre atendimento” fica 100% ou o card é omitido — preferir cards: **Agendamentos | Visitas (show-up) | Sucessos (conv. ag→sucesso) | Insucessos (%)**.

### Assinatura UI

- Setor: **Vendas Web** · Gestão: **Andressa Barra**

---

## 4. Filtros globais (sticky) — módulo Agendamentos

Aplicam a **todas as abas** do módulo:

| Filtro | Tipo |
|--------|------|
| De / Até | date ISO |
| Presets | Mês atual, Últimos 7 dias, Quinzena, Personalizado |
| Origem / Canal lead | select |
| Tipo de proposta | select |
| SDR / Atendido por | select |
| Vendedor | select |
| Busca rápida | ID, nome cliente, telefone (normalizado) |

Reutilizar padrão `filters--sticky` já existente.

---

## 5. Abas — Fase 1 (`#/agendamentos`)

### 5.1 Visão Geral (executiva)

- KPI cards (Pré-Venda e Recepção **separados**, ou toggle de canal).  
- Funil: Agendamentos → Visitas → Sucessos (+ Insucessos como saída lateral).  
- Série temporal por dia/quinzena.  
- Público: diretoria / gerência.

### 5.2 Performance Pré-Vendas

- Lista dinâmica de SDRs (excluir canal Recepção desta aba, ou sub-aba Recepção).  
- Por SDR: recebidos, visitas, sucessos, insucessos, % show-up, % conv. ag→sucesso, breakdown propostas.  
- Manter / evoluir: comparação direta só SDR; gráfico de barras de conversão.  
- Ordenação: configurável (volume ou %); default volume ou nome — documentar na UI.

### 5.3 Performance Vendedores

- Por vendedor: recebidos PV vs Rec (separados).  
- Visitas, sucessos, fechamento de salão (Su/Vi).  
- Breakdown propostas; motivos e origens **por canal**.  
- Manter: cards de conversão; comparação direta entre vendedores (PV e Rec).

### 5.4 Análise de Agendamentos (detalhe)

- Tabela **Comparação direta: agendamentos × proposta** (par SDR × Vendedor).  
  - Ordenar por **SDR em sequência** (não por volume).  
  - Sem pares com 0; incluir propostas, visitas, sucessos, insucessos, %.  
- Rosca de tipos de proposta.  
- Opcional: drill origem (modal).

### 5.5 Análise de Insucessos

- Total e % insucesso.  
- Donut de motivos (somente com motivo).  
- Tabelas: motivos por SDR; motivos por vendedor.  
- Política: registros sem motivo não entram na base (já aplicado).

### Reaproveitar (não recriar do zero)

| Existente | Destino |
|-----------|---------|
| `CanalKpiGrid`, séries, propostas | Visão Geral / gráficos |
| `SDRPerformanceTable`, `buildSdrComparisonRows` | Aba Pré-Vendas |
| `VendedorConversionCards`, `buildVendedorComparisonRows` | Aba Vendedores |
| `SdrVendedorProposalTable` | Aba Agendamentos |
| Motivos em cards do vendedor | Extrair para aba Insucessos + manter no detalhe |
| `SchedulingFiltersBar` | Header sticky global do módulo |
| Admin + `generate:agendamentos` | Inalterado na Fase 1 (só rotas/nav) |

---

## 6. Portais & UTMs

### Portais (implementado) — `#/agendamentos/portais`

- Parse origem/canal (`src/lib/scheduling/portalOrigin.ts`) + métricas (`portalMetrics.ts`).  
- Grupos expansíveis; multi-origem conta em cada portal.  
- Sem custo / sem funil lead→agendamento / sem UTM.

### Fase 2 — `#/campanhas` (UTMs)

- UTMs: planilha LEADS POR UTM / enriquecimento — funil exclusivo tráfego pago.  
- Links e admin **permanecem** sob `#/campanhas`.  
- Não misturar storage com `agendamentos_*`.

---

## 7. UX transversal

- Tabs superiores + conteúdo por rota (deep link).  
- Modais para “Ver lista” (clientes) — não dump na página.  
- Sem dark mode.  
- Empty/loading/erro amigáveis.  
- Performance: métricas via `useMemo`; não reparsear XLSX no view.  
- Atualizar `CATALOGO_DE_PAGINAS.md` ao criar rotas de abas.

---

## 8. Prompt mestre (copiar para o agente de implementação)

```text
Atue no repositório belloscar-leads (React + TypeScript + HashRouter + GitHub Pages).

Hub = "Análise de Resultados". NÃO fundir módulos.
- Fase 1: só módulo #/agendamentos — reorganizar em abas com rotas:
  #/agendamentos (Visão Geral)
  #/agendamentos/pre-vendas
  #/agendamentos/vendedores
  #/agendamentos/detalhe
  #/agendamentos/insucessos
  #/agendamentos/portais
  (Gestão: #/indice/gestao — não criar aba admin no módulo)
- Fase 2 (depois): Portais/UTMs em #/campanhas.

OBRIGATÓRIO reutilizar:
- src/modules/registry.ts, ModuleLayout, styles.css
- src/lib/scheduling/* (parse, mergeById enrich-only, splitByCanal, metrics)
- Filtros sticky; PIN admin; datasets isolados
- Recepção = Recepção + Gabriela, FORA do geral da Pré-Venda
- Financiamento = tipo de proposta próprio
- Dedupe só por id; datas ISO
- Docs: CATALOGO_DE_PAGINAS, CHANGELOG, README, ROADMAP
- Seguir docs/REESTRUTURACAO_ABAS.md (contrato de métricas e fórmulas)

NÃO: dark mode; mega-dashboard único; misturar campanhas no módulo agendamentos;
criar IDs órfãos no enrich; deduplicar por data.

Entregar Fase 1 completa com tabs, filtros globais no módulo, deep links e
reaproveitamento máximo dos componentes scheduling existentes.
```

---

## 9. Checklist de aceite — Fase 1

- [x] Abas com URL própria (HashRouter)  
- [x] Filtros sticky afetam todas as abas  
- [x] Pré-Venda e Recepção com totais separados  
- [x] Fórmulas de % rotuladas com denominador  
- [x] SDR × Vendedor ordenado por SDR  
- [x] Insucessos: donut + cruzamento; 100% com motivo na base  
- [x] Admin e import intactos  
- [x] Catálogo e changelog atualizados  
- [x] Build `npm run build` OK  

---

## 10. Status

| Item | Estado |
|------|--------|
| Spec / prompt / métricas | **Documentado** (este arquivo) |
| Implementação UI abas Fase 1 | **Implementado** (branch `feat/abas-agendamentos`) |
| Fase 2 Campanhas/UTMs | Pendente |

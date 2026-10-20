import { useEffect, useMemo, useState } from "react";
import { loadDataset } from "../lib/dataset";
import { buildSummary, calcMetrics } from "../lib/metrics";
import {
  buildNegociacoesKpis,
  buildVendedorRows,
  dealsFromLines,
  filterAvaliacoes,
} from "../lib/negociacoes/metrics";
import { loadNegociacoesDataset } from "../lib/negociacoes/storage";
import {
  buildCanalKpis,
  filterAgendamentos,
  splitByCanal,
} from "../lib/scheduling/metrics";
import { loadSchedulingDataset } from "../lib/scheduling/storage";
import type { Dataset } from "../lib/types";
import type { NegociacoesDataset } from "../lib/negociacoes/types";
import type { SchedulingDataset } from "../lib/scheduling/types";

type Props = {
  /** id do módulo no registry: campanhas | agendamentos | negociacoes */
  moduleId: string;
};

function buildCampanhasItems(dataset: Dataset): string[] {
  const kpis = calcMetrics(dataset.leads);
  const summary = buildSummary(dataset.leads);
  const topOrigin = summary.byOrigin[0];
  const updated = new Date(dataset.updatedAt).toLocaleDateString("pt-BR");

  const items = [
    `Leads: ${kpis.leads.toLocaleString("pt-BR")}`,
    `Visitas: ${kpis.visitas.toLocaleString("pt-BR")} (${kpis.taxaVisita}%)`,
    `Sucessos: ${kpis.sucessos.toLocaleString("pt-BR")} (${kpis.taxaSucesso}%)`,
    `Visita → Sucesso: ${kpis.taxaVisitaParaSucesso}%`,
  ];

  if (topOrigin) {
    items.push(
      `Top origem: ${topOrigin.canal} · ${topOrigin.leads} leads · ${topOrigin.sucessos} sucessos`
    );
  }

  items.push(`Atualizado em ${updated}`);
  return items;
}

function buildAgendamentosItems(dataset: SchedulingDataset): string[] {
  const items_all = filterAgendamentos(dataset.items, {});
  const { preVenda, recepcao } = splitByCanal(items_all);
  const kpisPv = buildCanalKpis(preVenda, "Pré-Venda");
  const kpisRec = buildCanalKpis(recepcao, "Recepção");
  const updated = new Date(dataset.updatedAt).toLocaleDateString("pt-BR");
  const leads = (dataset.leadsAtendimentos || []).length;

  return [
    `Agendamentos: ${items_all.length.toLocaleString("pt-BR")}`,
    `Atendimentos (LEADS): ${leads.toLocaleString("pt-BR")}`,
    `Pré-Venda: ${kpisPv.total.toLocaleString("pt-BR")} · Su ${kpisPv.sucessos} (${kpisPv.taxaSucesso}%)`,
    `Recepção: ${kpisRec.total.toLocaleString("pt-BR")} · Su ${kpisRec.sucessos} (${kpisRec.taxaSucesso}%)`,
    `Atualizado em ${updated}`,
  ];
}

function buildNegociacoesItems(dataset: NegociacoesDataset): string[] {
  const deals = dealsFromLines(dataset.lines);
  const kpis = buildNegociacoesKpis(deals);
  const vendedores = buildVendedorRows(deals);
  const topNeg = [...vendedores].sort((a, b) => b.vendasMaisTrocas - a.vendasMaisTrocas)[0];
  const avaliacoes = filterAvaliacoes(dataset.avaliacoes || [], {
    month: "all",
    period: "all",
    vendedor: "all",
    tipo: "all",
    status: "all",
    tipoVenda: "all",
  });
  const topConv = [...avaliacoes]
    .filter((a) => a.realizadas > 0)
    .sort(
      (a, b) =>
        b.percentual - a.percentual ||
        b.aprovadas - a.aprovadas ||
        a.vendedor.localeCompare(b.vendedor, "pt-BR")
    )[0];
  const updated = new Date(dataset.updatedAt).toLocaleDateString("pt-BR");

  const items = [
    `Negócios: ${kpis.total.toLocaleString("pt-BR")}`,
    `Vendas: ${kpis.vendas} · Trocas: ${kpis.trocas}`,
    `Compras: ${kpis.compras} · Consignações: ${kpis.consignacoes}`,
  ];

  if (topNeg) {
    items.push(
      `Top Vendas+Trocas: ${topNeg.vendedor} · ${topNeg.vendasMaisTrocas}`
    );
  }
  if (topConv) {
    items.push(
      `Top conv. avaliação: ${topConv.vendedor} · ${topConv.percentual}% (${topConv.aprovadas}/${topConv.realizadas})`
    );
  }

  items.push(`Atualizado em ${updated}`);
  return items;
}

export function KeyTicker({ moduleId }: Props) {
  const [items, setItems] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems(null);

    async function load() {
      try {
        if (moduleId === "negociacoes") {
          const ds = await loadNegociacoesDataset();
          if (!cancelled) setItems(buildNegociacoesItems(ds));
          return;
        }
        if (moduleId === "agendamentos") {
          const ds = await loadSchedulingDataset();
          if (!cancelled) setItems(buildAgendamentosItems(ds));
          return;
        }
        const ds = await loadDataset();
        if (!cancelled) setItems(buildCampanhasItems(ds));
      } catch {
        if (!cancelled) setItems(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const sequence = useMemo(() => (items && items.length ? [...items, ...items] : null), [items]);

  if (!sequence) return null;

  return (
    <div className="key-ticker" aria-label="Indicadores principais em destaque">
      <div className="key-ticker-track">
        {sequence.map((text, i) => (
          <span className="key-ticker-item" key={`${moduleId}-${text}-${i}`}>
            <span className="key-ticker-dot" aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

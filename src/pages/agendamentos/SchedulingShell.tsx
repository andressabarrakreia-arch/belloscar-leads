import { useEffect, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { SchedulingFiltersBar } from "../../components/scheduling/SchedulingFiltersBar";
import {
  SchedulingAnalyticsProvider,
  useSchedulingAnalyticsContext,
} from "../../context/SchedulingAnalyticsContext";
import { useModuleTicker } from "../../context/ModuleTickerContext";
import {
  buildAgendamentosTickerItems,
  schedulingFilterHint,
} from "../../lib/tickerItems";

function collectMonthOptions(dataset: {
  items: { dataAgendamento: string }[];
  realizados?: { dataAtendido: string; dataVisita: string | null }[];
  sucessosEventos?: { dataFinalizado: string }[];
}): string[] {
  const set = new Set<string>();
  for (const i of dataset.items) {
    if (i.dataAgendamento?.length >= 7) set.add(i.dataAgendamento.slice(0, 7));
  }
  for (const r of dataset.realizados || []) {
    if (r.dataAtendido?.length >= 7) set.add(r.dataAtendido.slice(0, 7));
    if (r.dataVisita && r.dataVisita.length >= 7) set.add(r.dataVisita.slice(0, 7));
  }
  for (const s of dataset.sucessosEventos || []) {
    if (s.dataFinalizado?.length >= 7) set.add(s.dataFinalizado.slice(0, 7));
  }
  return [...set].sort((a, b) => b.localeCompare(a));
}

function SchedulingShellInner() {
  const { dataset, loading, error, filters, setFilters, analytics } =
    useSchedulingAnalyticsContext();
  const { setOverrideItems } = useModuleTicker();

  const monthOptions = useMemo(
    () => (dataset ? collectMonthOptions(dataset) : []),
    [dataset]
  );

  useEffect(() => {
    if (!analytics || !dataset) {
      setOverrideItems(null);
      return;
    }
    setOverrideItems(
      buildAgendamentosTickerItems(
        analytics.filtered,
        analytics.filteredLeads || [],
        dataset.updatedAt,
        schedulingFilterHint(filters),
        {
          visitas: (analytics.filteredVisitas || []).length,
          sucessos: (analytics.filteredSucessos || []).length,
        }
      )
    );
    return () => setOverrideItems(null);
  }, [analytics, dataset, filters, setOverrideItems]);

  if (loading) return <p className="muted">Carregando agendamentos…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!analytics || !dataset) return null;

  return (
    <div className="scheduling-layout">
      <div className="card report-signature">
        <p>
          <strong>Setor:</strong> Vendas Web · <strong>Gestão:</strong> Andressa Barra
        </p>
        <p className="muted">
          Análise · {analytics.filtered.length} agend. (Agendado em) ·{" "}
          {(analytics.filteredLeads || []).length} atend. (Atendido em) ·{" "}
          {(analytics.filteredVisitas || []).length} visitas (Visita em) ·{" "}
          {(analytics.filteredSucessos || []).length} sucessos (Finalizado em) · base{" "}
          {dataset.items.length} ag. / {(dataset.realizados || []).length} realizados /{" "}
          {(dataset.sucessosEventos || []).length} sucessos · atualizado{" "}
          {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <SchedulingFiltersBar
        options={analytics.options}
        filters={filters}
        onChange={setFilters}
        monthOptions={monthOptions}
      />

      {dataset.items.length === 0 && (
        <div className="card">
          <h2>Sem dados ainda</h2>
          <p className="muted">
            A base publicada ainda não carregou. Atualize a página ou verifique o deploy do
            GitHub Pages. Novas planilhas entram pela <strong>Gestão</strong>.
          </p>
        </div>
      )}

      <Outlet />
    </div>
  );
}

/** Layout compartilhado: filtros sticky + contexto de analytics para todas as abas. */
export function SchedulingShell() {
  return (
    <SchedulingAnalyticsProvider>
      <SchedulingShellInner />
    </SchedulingAnalyticsProvider>
  );
}

import { useEffect } from "react";
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

function SchedulingShellInner() {
  const { dataset, loading, error, filters, setFilters, analytics } =
    useSchedulingAnalyticsContext();
  const { setOverrideItems } = useModuleTicker();

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
        schedulingFilterHint(filters)
      )
    );
    return () => setOverrideItems(null);
  }, [analytics, dataset, filters, setOverrideItems]);

  if (loading) return <p className="muted">Carregando agendamentos…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!analytics || !dataset) return null;

  return (
    <>
      <div className="card report-signature">
        <p>
          <strong>Setor:</strong> Vendas Web · <strong>Gestão:</strong> Andressa Barra
        </p>
        <p className="muted">
          Análise de Agendamentos · {analytics.filtered.length} agendamentos no filtro ·{" "}
          {(analytics.filteredLeads || []).length} atendimentos (LEADS) ·{" "}
          {dataset.items.length} ag. na base · {(dataset.leadsAtendimentos || []).length} leads na
          base · atualizado {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <SchedulingFiltersBar
        options={analytics.options}
        filters={filters}
        onChange={setFilters}
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
    </>
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

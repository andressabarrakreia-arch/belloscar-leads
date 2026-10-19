import { Outlet } from "react-router-dom";
import { SchedulingFiltersBar } from "../../components/scheduling/SchedulingFiltersBar";
import {
  SchedulingAnalyticsProvider,
  useSchedulingAnalyticsContext,
} from "../../context/SchedulingAnalyticsContext";

function SchedulingShellInner() {
  const { dataset, loading, error, filters, setFilters, analytics } =
    useSchedulingAnalyticsContext();

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
          Análise de Agendamentos · {analytics.filtered.length} no filtro ·{" "}
          {dataset.items.length} na base · Pré-Venda e Recepção com totais separados ·
          atualizado {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
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

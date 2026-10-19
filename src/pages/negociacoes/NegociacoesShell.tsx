import { Outlet } from "react-router-dom";
import { NegociacoesFiltersBar } from "../../components/negociacoes/NegociacoesFiltersBar";
import {
  NegociacoesAnalyticsProvider,
  useNegociacoesAnalyticsContext,
} from "../../context/NegociacoesAnalyticsContext";

function NegociacoesShellInner() {
  const { dataset, loading, error, filters, setFilters, analytics } =
    useNegociacoesAnalyticsContext();

  if (loading) return <p className="muted">Carregando negociações…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!analytics || !dataset) return null;

  return (
    <>
      <div className="card report-signature">
        <p>
          <strong>Módulo:</strong> Análise de Negociações · <strong>Gestão:</strong> Andressa
          Barra
        </p>
        <p className="muted">
          {analytics.filtered.length} negócios no filtro · {dataset.lines.length} linhas na base ·
          atualizado {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
        </p>
      </div>

      <NegociacoesFiltersBar
        options={analytics.options}
        filters={filters}
        onChange={setFilters}
      />

      {dataset.lines.length === 0 && (
        <div className="card">
          <h2>Sem dados ainda</h2>
          <p className="muted">
            A base publicada ainda não carregou. Novas planilhas entram pela{" "}
            <strong>Gestão</strong>.
          </p>
        </div>
      )}

      <Outlet />
    </>
  );
}

export function NegociacoesShell() {
  return (
    <NegociacoesAnalyticsProvider>
      <NegociacoesShellInner />
    </NegociacoesAnalyticsProvider>
  );
}

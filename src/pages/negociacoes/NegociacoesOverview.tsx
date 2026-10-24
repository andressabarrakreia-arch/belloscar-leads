import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

export function NegociacoesOverview() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { kpis, periodSeries, statusRows } = analytics;

  return (
    <>
      <div className="card">
        <h2>
          Resumo da loja
          <InfoTip>
            Total = negócios contáveis (sem Cancelado · sem Compra de Consignado). Troca com 2
            linhas conta como 1; Venda/Compra multi-linha contam por linha.
          </InfoTip>
        </h2>
        <div className="kpi-grid">
          <div className="kpi-card accent">
            <h3>Total negócios</h3>
            <p>{kpis.total}</p>
          </div>
          <div className="kpi-card success num-ok">
            <h3>Vendas</h3>
            <p>{kpis.vendas}</p>
          </div>
          <div className="kpi-card">
            <h3>Trocas</h3>
            <p>{kpis.trocas}</p>
          </div>
          <div className="kpi-card">
            <h3>Compras</h3>
            <p>{kpis.compras}</p>
          </div>
          <div className="kpi-card success">
            <h3>Consignações</h3>
            <p>{kpis.consignacoes}</p>
          </div>
        </div>
      </div>

      <div className="charts">
        <SeriesChart
          title="Série por quinzena"
          data={periodSeries}
          xKey="label"
          kind="area"
          series={[
            { key: "vendas", name: "Vendas", color: CHART_COLORS.green },
            { key: "trocas", name: "Trocas", color: CHART_COLORS.blue },
            { key: "compras", name: "Compras", color: CHART_COLORS.charcoal },
            { key: "consignacoes", name: "Consignações", color: CHART_COLORS.teal },
          ]}
        />
        <SeriesChart
          title="Quinzena em barras"
          data={periodSeries}
          xKey="label"
          kind="bar"
          series={[
            { key: "vendas", name: "Vendas", color: CHART_COLORS.green },
            { key: "trocas", name: "Trocas", color: CHART_COLORS.blue },
            { key: "compras", name: "Compras", color: CHART_COLORS.charcoal },
            { key: "consignacoes", name: "Consignações", color: CHART_COLORS.teal },
          ]}
        />
        <ShareDonut
          title="Status"
          data={statusRows.map((row) => ({ label: row.status, value: row.quantidade }))}
        />
      </div>

      <div className="card">
        <h2>Status</h2>
        <InteractiveTable
          rows={statusRows}
          rowKey={(row) => row.status}
          columns={[
            { key: "status", label: "Status", sortValue: (row) => row.status },
            { key: "qtd", label: "Qtd", sortValue: (row) => row.quantidade },
          ]}
        />
      </div>
    </>
  );
}

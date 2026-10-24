import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { DygraphLinhas } from "../../components/viz/DygraphLinhas";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

function vendedorDeRepasse(nome: string): boolean {
  const chave = nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return chave === "filipe portes";
}

export function NegociacoesOverview() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { kpis, periodSeries, statusRows, vendedores } = analytics;
  const lider = (campo: "vendas" | "trocas" | "compras" | "consignacoes") => {
    const top = vendedores
      .filter((row) => row[campo] > 0 && !vendedorDeRepasse(row.vendedor))
      .sort(
        (a, b) => b[campo] - a[campo] || a.vendedor.localeCompare(b.vendedor, "pt-BR")
      )[0];
    return top ? `${top.vendedor} · ${top[campo]}` : "";
  };

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
            {lider("vendas") ? <small className="kpi-lider">{lider("vendas")}</small> : null}
          </div>
          <div className="kpi-card">
            <h3>Trocas</h3>
            <p>{kpis.trocas}</p>
            {lider("trocas") ? <small className="kpi-lider">{lider("trocas")}</small> : null}
          </div>
          <div className="kpi-card">
            <h3>Compras</h3>
            <p>{kpis.compras}</p>
            {lider("compras") ? <small className="kpi-lider">{lider("compras")}</small> : null}
          </div>
          <div className="kpi-card success">
            <h3>Consignações</h3>
            <p>{kpis.consignacoes}</p>
            {lider("consignacoes") ? <small className="kpi-lider">{lider("consignacoes")}</small> : null}
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

      <DygraphLinhas
        titulo="Negócios por quinzena"
        dica="Arraste para aproximar. Clique duplo volta ao período inteiro."
        linhas={periodSeries}
        x="periodKey"
        series={[
          { key: "vendas", name: "Vendas", color: "#2e7d4f" },
          { key: "trocas", name: "Trocas", color: "#2f6f9f" },
          { key: "compras", name: "Compras", color: "#404041" },
        ]}
      />

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

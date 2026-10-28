import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { DygraphLinhas } from "../../components/viz/DygraphLinhas";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";
import type { NegociacoesCanalKpis } from "../../lib/negociacoes/types";

function vendedorDeRepasse(nome: string): boolean {
  const chave = nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  return chave === "filipe portes";
}

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function CanalCard({
  titulo,
  meta,
  canal,
  tom,
}: {
  titulo: string;
  meta: string;
  canal: NegociacoesCanalKpis;
  tom: "showroom" | "atacado";
}) {
  return (
    <div className={`loja-kpi loja-kpi--canal loja-kpi--${tom}`}>
      <div className="loja-kpi__canal-head">
        <h3>{titulo}</h3>
        <p>{fmt(canal.total)}</p>
        <span className="loja-kpi__meta">{meta}</span>
      </div>
      <ul className="loja-kpi__subtipos">
        <li>
          <span>Vendas</span>
          <strong>{fmt(canal.vendas)}</strong>
        </li>
        <li>
          <span>Trocas</span>
          <strong>{fmt(canal.trocas)}</strong>
        </li>
        <li>
          <span>Compras</span>
          <strong>{fmt(canal.compras)}</strong>
        </li>
        <li>
          <span>Consignações</span>
          <strong>{fmt(canal.consignacoes)}</strong>
        </li>
      </ul>
    </div>
  );
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
      <div className="card loja-resumo">
        <h2>
          Resumo da loja
          <InfoTip>
            Total = negócios contáveis (sem Cancelado · sem Compra de Consignado). Troca com 2
            linhas conta como 1; Venda/Compra multi-linha contam por linha. Showroom e Atacado
            vêm do Tipo Venda (um negócio “Showroom e Atacado” entra nos dois).
          </InfoTip>
        </h2>

        <div className="loja-resumo__tipos">
          <div className="loja-kpi loja-kpi--total">
            <h3>Total negócios</h3>
            <p>{fmt(kpis.total)}</p>
            <span className="loja-kpi__meta">Loja no filtro atual</span>
          </div>
          <div className="loja-kpi loja-kpi--venda">
            <h3>Vendas</h3>
            <p>{fmt(kpis.vendas)}</p>
            {lider("vendas") ? <small className="loja-kpi__lider">{lider("vendas")}</small> : null}
          </div>
          <div className="loja-kpi loja-kpi--troca">
            <h3>Trocas</h3>
            <p>{fmt(kpis.trocas)}</p>
            {lider("trocas") ? <small className="loja-kpi__lider">{lider("trocas")}</small> : null}
          </div>
          <div className="loja-kpi loja-kpi--compra">
            <h3>Compras</h3>
            <p>{fmt(kpis.compras)}</p>
            {lider("compras") ? <small className="loja-kpi__lider">{lider("compras")}</small> : null}
          </div>
          <div className="loja-kpi loja-kpi--consig">
            <h3>Consignações</h3>
            <p>{fmt(kpis.consignacoes)}</p>
            {lider("consignacoes") ? (
              <small className="loja-kpi__lider">{lider("consignacoes")}</small>
            ) : null}
          </div>
        </div>

        <div className="loja-resumo__canais" aria-label="Por tipo de venda">
          <CanalCard
            titulo="Showroom"
            meta="Negociações showroom"
            canal={kpis.showroom}
            tom="showroom"
          />
          <CanalCard
            titulo="Atacado"
            meta="Negociações atacado"
            canal={kpis.atacado}
            tom="atacado"
          />
        </div>
      </div>

      <div className="charts">
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
          { key: "vendas", name: "Vendas", color: "var(--chart-dy-green)" },
          { key: "trocas", name: "Trocas", color: "var(--chart-dy-blue)" },
          { key: "compras", name: "Compras", color: "var(--chart-ink)" },
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

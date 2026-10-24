import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { VegaBarras } from "../../components/viz/VegaBarras";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";

function fmtDate(iso: string): string {
  if (!iso || iso === "1970-01-01") return "—";
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export function NegociacoesLancamentos() {
  const { analytics } = useNegociacoesAnalyticsContext();
  if (!analytics) return null;

  const { lancamentos } = analytics;
  const porTipo = countBy(lancamentos, (row) => row.tipo);
  const porStatus = countBy(lancamentos, (row) => row.status);

  return (
    <>
      <div className="charts">
        <SeriesChart
          title="Lançamentos por tipo"
          tip="Contagem das linhas desta tabela."
          data={porTipo}
          xKey="nome"
          kind="bar"
          series={[{ key: "qtd", name: "Quantidade", color: CHART_COLORS.red }]}
        />
        <ShareDonut title="Lançamentos por status" data={porStatus.map((row) => ({ label: row.nome, value: row.qtd }))} />
      </div>
      <VegaBarras
        titulo="Tipos de lançamento"
        dica="A mesma contagem da barra acima, com o valor no mouse."
        dados={porTipo}
        nome="nome"
        valor="qtd"
      />
    <div className="card">
      <h2>
        Lançamentos
        <InfoTip>
          Uma linha por negócio. Troca aparece consolidada (placa entrada + placa saída).
        </InfoTip>
      </h2>
      <InteractiveTable
        rows={lancamentos}
        rowKey={(row) => row.dealId}
        columns={[
          { key: "data", label: "Data", sortValue: (row) => row.data, render: (row) => fmtDate(row.data) },
          { key: "n", label: "Nº", sortValue: (row) => row.negociacaoId },
          { key: "vendedor", label: "Vendedor", sortValue: (row) => row.vendedor },
          { key: "tipo", label: "Tipo", sortValue: (row) => row.tipo },
          { key: "mov", label: "Mov.", sortValue: (row) => row.movimentacao || "" },
          { key: "pe", label: "Placa entrada", sortValue: (row) => row.placaEntrada || "" },
          { key: "ps", label: "Placa saída", sortValue: (row) => row.placaSaida || "" },
          { key: "tv", label: "Tipo venda", sortValue: (row) => row.tipoVenda },
          { key: "status", label: "Status", sortValue: (row) => row.status },
          { key: "cliente", label: "Cliente", sortValue: (row) => row.cliente || "" },
        ]}
      />
    </div>
    </>
  );
}

function countBy<T>(rows: T[], pick: (row: T) => string) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const nome = pick(row) || "—";
    map.set(nome, (map.get(nome) || 0) + 1);
  }
  return [...map.entries()].map(([nome, qtd]) => ({ nome, qtd }));
}

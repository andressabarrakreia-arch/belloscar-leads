import { useMemo } from "react";
import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { MotivoByPersonTable } from "../../components/scheduling/MotivoByPersonTable";
import { MotivoDistributionChart } from "../../components/scheduling/MotivoDistributionChart";
import { MotivoLabel } from "../../components/scheduling/MotivoLabel";
import { DcCruzado } from "../../components/viz/DcCruzado";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Análise de Insucessos. */
export function SchedulingInsucessos() {
  const { analytics, dataset } = useSchedulingAnalyticsContext();
  const linhasDc = useMemo(
    () =>
      (dataset?.items || [])
        .filter((item) => item.status === "Insucesso")
        .map((item) => ({
          motivo: item.motivoInsucesso?.trim() || "Sem motivo",
          vendedor: item.vendedor || "Sem vendedor",
        })),
    [dataset]
  );
  if (!analytics) return null;

  const { insucessoKpis, motivosInsucesso, motivosBySdr, motivosByVendedor } = analytics;

  return (
    <>
      <DcCruzado
        titulo="Motivo e vendedor, ligados"
        dica="Clique num motivo para ver quais vendedores ficam nesse recorte. Clique de novo para soltar."
        linhas={linhasDc}
        chaveA="motivo"
        tituloA="Motivo"
        chaveB="vendedor"
        tituloB="Vendedor"
      />
      <div className="card">
        <h2>
          Insucessos · resumo
          <InfoTip>
            % Insucesso = Insucessos / Agendamentos (filtro atual). Motivos só entram com texto
            cruzado na base.
          </InfoTip>
        </h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <h3>Agendamentos</h3>
            <p>{insucessoKpis.agendamentos}</p>
            <small className="muted">denominador</small>
          </div>
          <div className="kpi-card num-bad">
            <h3>Insucessos</h3>
            <p>{insucessoKpis.insucessos}</p>
            <small className="muted">status Insucesso</small>
          </div>
          <div className="kpi-card num-bad">
            <h3>% Insucesso</h3>
            <p>{insucessoKpis.percentualInsucesso}%</p>
            <small className="muted">Insucessos / Agendamentos</small>
          </div>
          <div className="kpi-card success">
            <h3>Com motivo</h3>
            <p>{insucessoKpis.comMotivo}</p>
            <small className="muted">enrich INSUCESSOS</small>
          </div>
        </div>
      </div>

      <div className="charts">
        <ShareDonut
          title="Participação dos motivos"
          tip="A mesma quantidade da tabela de ranking."
          data={motivosInsucesso.map((item) => ({ label: item.motivo, value: item.quantidade }))}
        />
        <SeriesChart
          title="Recorte do resumo"
          kind="bar"
          xKey="nome"
          data={[
            { nome: "Agendamentos", valor: insucessoKpis.agendamentos },
            { nome: "Insucessos", valor: insucessoKpis.insucessos },
            { nome: "Com motivo", valor: insucessoKpis.comMotivo },
          ]}
          series={[{ key: "valor", name: "Quantidade", color: CHART_COLORS.red }]}
        />
      </div>

      <MotivoDistributionChart
        data={motivosInsucesso.map((m) => ({
          label: m.motivo,
          value: m.quantidade,
          ids: m.ids,
        }))}
        title="Motivos de insucesso"
        subtitle="% motivo = Qtd do motivo / Insucessos do filtro atual."
      />

      <div className="card">
        <h2>
          Motivos · ranking
          <InfoTip>Todos os motivos do recorte, ordenados por volume.</InfoTip>
        </h2>
        <InteractiveTable
          rows={motivosInsucesso}
          rowKey={(row) => row.motivo}
          columns={[
            {
              key: "motivo",
              label: "Motivo",
              sortValue: (row) => row.motivo,
              render: (row) => <MotivoLabel motivo={row.motivo} ids={row.ids} />,
            },
            { key: "qtd", label: "Qtd", sortValue: (row) => row.quantidade },
            {
              key: "pct",
              label: "% dos insucessos",
              sortValue: (row) => row.percentual,
              render: (row) => `${row.percentual}%`,
            },
          ]}
        />
      </div>

      <MotivoByPersonTable
        rows={motivosBySdr}
        title="Motivos por SDR / Atendido por"
        subtitle="Principal motivo de cada atendente no filtro atual (% sobre os insucessos daquela pessoa)."
        nameLabel="Atendido por"
      />

      <MotivoByPersonTable
        rows={motivosByVendedor}
        title="Motivos por vendedor"
        subtitle="Principal motivo de cada vendedor no filtro atual (% sobre os insucessos daquela pessoa)."
        nameLabel="Vendedor"
      />
    </>
  );
}

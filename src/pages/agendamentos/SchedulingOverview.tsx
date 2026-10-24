import { InfoTip } from "../../components/InfoTip";
import { SeriesChart } from "../../components/charts/SeriesChart";
import { CHART_COLORS } from "../../components/charts/chartTheme";
import { CanalKpiGrid } from "../../components/scheduling/CanalKpiGrid";
import { ProposalDistributionChart } from "../../components/scheduling/ProposalDistributionChart";
import { TimeSeriesChart } from "../../components/scheduling/TimeSeriesChart";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Visão Geral — KPIs e séries (Pré-Venda e Recepção separados). */
export function SchedulingOverview() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const {
    kpisPreVenda,
    kpisRecepcao,
    proposalsPreVenda,
    proposalsRecepcao,
    periodSeriesPreVenda,
    periodSeriesRecepcao,
  } = analytics;

  return (
    <>
      <CanalKpiGrid
        kpis={kpisPreVenda}
        title="Pré-Venda · visão geral"
        subtitle="Clientes com pré-atendimento da equipe web. Recepção não entra nestes números. Taxas: show-up = Visitas/Agendamentos · conv. = Sucessos/Agendamentos."
      />

      <CanalKpiGrid
        kpis={kpisRecepcao}
        title="Recepção · visão geral (à parte)"
        subtitle="Clientes atendidos pela Recepção (sem pré-atendimento da equipe web). Taxas: show-up = Visitas/Agendamentos · conv. = Sucessos/Agendamentos."
        accent
      />

      <div className="card">
        <h2>
          Funil · Pré-Venda
          <InfoTip>
            Agendamentos pelo Agendado em. Visitas pelo Visita em. Sucessos pelo Finalizado em.
            O mesmo ID pode contar em meses diferentes. Insucessos seguem o mês do agendamento.
          </InfoTip>
        </h2>
        <div className="funnel-row" aria-label="Funil Pré-Venda">
          <div className="funnel-step">
            <strong>{kpisPreVenda.total}</strong>
            <span>Agendamentos</span>
          </div>
          <span className="funnel-arrow" aria-hidden="true">
            →
          </span>
          <div className="funnel-step">
            <strong>{kpisPreVenda.visitas}</strong>
            <span>Visitas · {kpisPreVenda.taxaVisita}% show-up</span>
          </div>
          <span className="funnel-arrow" aria-hidden="true">
            →
          </span>
          <div className="funnel-step funnel-step--success">
            <strong>{kpisPreVenda.sucessos}</strong>
            <span>Sucessos · {kpisPreVenda.taxaSucesso}% ag→sucesso</span>
          </div>
          <span className="funnel-arrow" aria-hidden="true">
            /
          </span>
          <div className="funnel-step funnel-step--exit">
            <strong>{kpisPreVenda.insucessos}</strong>
            <span>
              Insucessos ·{" "}
              {kpisPreVenda.total
                ? Math.round((kpisPreVenda.insucessos / kpisPreVenda.total) * 1000) / 10
                : 0}
              %
            </span>
          </div>
        </div>
      </div>

      <div className="charts">
        <ProposalDistributionChart
          data={proposalsPreVenda}
          title="Propostas · Pré-Venda"
          subtitle="Mix só do canal Pré-Venda (sem Recepção)."
        />
        <TimeSeriesChart
          data={periodSeriesPreVenda.map((p) => ({
            label: p.label,
            total: p.total,
            visitas: p.visitas,
            sucessos: p.sucessos,
            insucessos: p.insucessos,
          }))}
          title="Série por quinzena · Pré-Venda"
          xKey="label"
        />
      </div>

      <div className="charts">
        <ProposalDistributionChart
          data={proposalsRecepcao}
          title="Propostas · Recepção"
          subtitle="Mix só do canal Recepção."
        />
        <TimeSeriesChart
          data={periodSeriesRecepcao.map((p) => ({
            label: p.label,
            total: p.total,
            visitas: p.visitas,
            sucessos: p.sucessos,
            insucessos: p.insucessos,
          }))}
          title="Série por quinzena · Recepção"
          xKey="label"
        />
      </div>

      <div className="charts">
        <SeriesChart
          title="Funil em barras · Pré-Venda"
          tip="Os mesmos totais do funil acima."
          kind="bar"
          xKey="etapa"
          data={[
            { etapa: "Agendamentos", valor: kpisPreVenda.total },
            { etapa: "Visitas", valor: kpisPreVenda.visitas },
            { etapa: "Sucessos", valor: kpisPreVenda.sucessos },
            { etapa: "Insucessos", valor: kpisPreVenda.insucessos },
          ]}
          series={[{ key: "valor", name: "Quantidade", color: CHART_COLORS.red }]}
        />
        <SeriesChart
          title="Funil em barras · Recepção"
          tip="Os mesmos totais do funil de recepção."
          kind="bar"
          xKey="etapa"
          data={[
            { etapa: "Agendamentos", valor: kpisRecepcao.total },
            { etapa: "Visitas", valor: kpisRecepcao.visitas },
            { etapa: "Sucessos", valor: kpisRecepcao.sucessos },
            { etapa: "Insucessos", valor: kpisRecepcao.insucessos },
          ]}
          series={[{ key: "valor", name: "Quantidade", color: CHART_COLORS.charcoal }]}
        />
      </div>
    </>
  );
}

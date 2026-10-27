import { InfoTip } from "../../components/InfoTip";
import { CanalKpiGrid } from "../../components/scheduling/CanalKpiGrid";
import { ProposalDistributionChart } from "../../components/scheduling/ProposalDistributionChart";
import { TimeSeriesChart } from "../../components/scheduling/TimeSeriesChart";
import { DygraphLinhas } from "../../components/viz/DygraphLinhas";
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
            Atendimentos pelo Atendido em. Agendamentos pelo Agendado em. Visitas pelo Visita em.
            Sucessos pelo Finalizado em. O mesmo ID pode contar em meses diferentes. Insucessos
            seguem o mês do agendamento. A conversão da visita é visitas dividido pelos atendimentos.
          </InfoTip>
        </h2>
        <div className="funnel-row" aria-label="Funil Pré-Venda">
          <div className="funnel-step">
            <strong>{kpisPreVenda.atendimentos}</strong>
            <span>Atendimentos</span>
          </div>
          <span className="funnel-arrow" aria-hidden="true">
            →
          </span>
          <div className="funnel-step">
            <strong>{kpisPreVenda.total}</strong>
            <span>Agendamentos</span>
          </div>
          <span className="funnel-arrow" aria-hidden="true">
            →
          </span>
          <div className="funnel-step">
            <strong>{kpisPreVenda.visitas}</strong>
            <span>
              Visitas ·{" "}
              {kpisPreVenda.atendimentos
                ? Math.round((kpisPreVenda.visitas / kpisPreVenda.atendimentos) * 1000) / 10
                : 0}
              % dos atendimentos
            </span>
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

      <DygraphLinhas
        titulo="Quinzenas da pré-venda"
        dica="Arraste para aproximar uma quinzena. Clique duplo mostra o período todo."
        linhas={periodSeriesPreVenda}
        x="periodKey"
        series={[
          { key: "total", name: "Agendamentos", color: "var(--chart-ink)" },
          { key: "visitas", name: "Visitas", color: "var(--chart-dy-blue)" },
          { key: "sucessos", name: "Sucessos", color: "var(--chart-dy-green)" },
          { key: "insucessos", name: "Insucessos", color: "var(--chart-red)" },
        ]}
      />

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
    </>
  );
}

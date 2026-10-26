import type { CanalKpis } from "../../lib/scheduling/metrics";
import { InfoTip } from "../InfoTip";

type Props = {
  kpis: CanalKpis;
  title: string;
  subtitle: string;
  accent?: boolean;
};

export function CanalKpiGrid({ kpis, title, subtitle, accent }: Props) {
  const pctInsucesso = kpis.total
    ? Math.round((kpis.insucessos / kpis.total) * 1000) / 10
    : 0;

  return (
    <div className="card">
      <h2>
        {title}
        {subtitle ? <InfoTip>{subtitle}</InfoTip> : null}
      </h2>
      <div className="kpi-grid">
        <div className={`kpi-card ${accent ? "accent" : ""}`}>
          <h3>Atendimentos</h3>
          <p>{kpis.atendimentos}</p>
          <small className="muted">realizados no período</small>
        </div>
        <div className="kpi-card">
          <h3>Agendamentos</h3>
          <p>{kpis.total}</p>
          <small className="muted">universo do canal</small>
        </div>
        <div className="kpi-card">
          <h3>Visitas</h3>
          <p>{kpis.visitas}</p>
          <small className="muted">show-up {kpis.taxaVisita}% · Vi/Ag</small>
        </div>
        <div className="kpi-card success num-ok">
          <h3>Sucessos</h3>
          <p>{kpis.sucessos}</p>
          <small className="muted">conv. {kpis.taxaSucesso}% · Su/Ag</small>
        </div>
        <div className="kpi-card num-bad">
          <h3>Insucessos</h3>
          <p>{kpis.insucessos}</p>
          <small className="muted">{pctInsucesso}% · Ins/Ag</small>
        </div>
      </div>
    </div>
  );
}

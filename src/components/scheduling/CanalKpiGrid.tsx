import type { CanalKpis } from "../../lib/scheduling/metrics";

type Props = {
  kpis: CanalKpis;
  title: string;
  subtitle: string;
  accent?: boolean;
};

export function CanalKpiGrid({ kpis, title, subtitle, accent }: Props) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p className="muted">{subtitle}</p>
      <div className="kpi-grid">
        <div className={`kpi-card ${accent ? "accent" : ""}`}>
          <h3>Agendamentos</h3>
          <p>{kpis.total}</p>
        </div>
        <div className="kpi-card">
          <h3>Visitas</h3>
          <p>{kpis.visitas}</p>
        </div>
        <div className="kpi-card">
          <h3>Taxa visita</h3>
          <p>{kpis.taxaVisita}%</p>
        </div>
        <div className="kpi-card success">
          <h3>Sucessos</h3>
          <p>{kpis.sucessos}</p>
        </div>
        <div className="kpi-card success">
          <h3>Taxa sucesso</h3>
          <p>{kpis.taxaSucesso}%</p>
        </div>
        <div className="kpi-card">
          <h3>Insucessos</h3>
          <p>{kpis.insucessos}</p>
        </div>
      </div>
    </div>
  );
}

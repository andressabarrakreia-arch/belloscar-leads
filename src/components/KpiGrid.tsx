import type { Kpis } from "../lib/types";

export function KpiGrid({ kpis }: { kpis: Kpis }) {
  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <h3>Total de Leads</h3>
        <p>{kpis.leads}</p>
      </div>
      <div className="kpi-card">
        <h3>Visitas</h3>
        <p>{kpis.visitas}</p>
      </div>
      <div className="kpi-card">
        <h3>Taxa Visita</h3>
        <p>{kpis.taxaVisita}%</p>
      </div>
      <div className="kpi-card accent">
        <h3>Sucessos</h3>
        <p>{kpis.sucessos}</p>
      </div>
      <div className="kpi-card success">
        <h3>Taxa Sucesso</h3>
        <p>{kpis.taxaSucesso}%</p>
      </div>
      <div className="kpi-card success">
        <h3>Visita → Sucesso</h3>
        <p>{kpis.taxaVisitaParaSucesso}%</p>
      </div>
    </div>
  );
}

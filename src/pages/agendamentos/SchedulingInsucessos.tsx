import { InfoTip } from "../../components/InfoTip";
import { MotivoByPersonTable } from "../../components/scheduling/MotivoByPersonTable";
import { MotivoDistributionChart } from "../../components/scheduling/MotivoDistributionChart";
import { useSchedulingAnalyticsContext } from "../../context/SchedulingAnalyticsContext";

/** Aba Análise de Insucessos. */
export function SchedulingInsucessos() {
  const { analytics } = useSchedulingAnalyticsContext();
  if (!analytics) return null;

  const { insucessoKpis, motivosInsucesso, motivosBySdr, motivosByVendedor } = analytics;

  return (
    <>
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

      <MotivoDistributionChart
        data={motivosInsucesso.map((m) => ({ label: m.motivo, value: m.quantidade }))}
        title="Motivos de insucesso"
        subtitle="% motivo = Qtd do motivo / Insucessos do filtro atual."
      />

      <div className="card">
        <h2>
          Motivos · ranking
          <InfoTip>Todos os motivos do recorte, ordenados por volume.</InfoTip>
        </h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Motivo</th>
                <th>Qtd</th>
                <th>% dos insucessos</th>
              </tr>
            </thead>
            <tbody>
              {motivosInsucesso.map((m) => (
                <tr key={m.motivo}>
                  <td>{m.motivo}</td>
                  <td>{m.quantidade}</td>
                  <td>{m.percentual}%</td>
                </tr>
              ))}
              {motivosInsucesso.length === 0 && (
                <tr>
                  <td colSpan={3} className="muted">
                    Nenhum insucesso no filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

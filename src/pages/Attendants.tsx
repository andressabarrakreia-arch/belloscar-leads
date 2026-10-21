import { useMemo, useState } from "react";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  buildSdrRows,
  buildVendedorRows,
  listSdrOptions,
  sliceCampanhas,
  type CampanhaFilters,
} from "../lib/campanhas/analytics";

export function Attendants() {
  const { rows, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<CampanhaFilters>({});
  const sdrs = useMemo(() => listSdrOptions(rows), [rows]);
  const slice = useMemo(() => sliceCampanhas(rows, filters), [rows, filters]);
  const sdrRows = useMemo(() => buildSdrRows(slice), [slice]);
  const vendedores = useMemo(() => buildVendedorRows(slice), [slice]);

  if (loading) return <p className="muted">Carregando campanhas…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <CampanhasFilters filters={filters} sdrs={sdrs} onChange={setFilters} />

      <div className="card">
        <h2>SDR · só Facebook e Instagram</h2>
        <p className="muted">
          Atendimentos e visitas pelo SDR de LEADS REALIZADOS. Agendamentos e sucessos do mesmo
          ID, nas datas de Agendado em e Finalizado em.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>SDR</th>
                <th>Atendimentos</th>
                <th>Visitas</th>
                <th>Visita / atend.</th>
                <th>Agendamentos</th>
                <th>Sucessos</th>
                <th>Sucesso / visita</th>
              </tr>
            </thead>
            <tbody>
              {sdrRows.map((row) => (
                <tr key={row.sdr}>
                  <td>
                    <strong>{row.sdr}</strong>
                  </td>
                  <td>{row.atendimentos}</td>
                  <td className={row.visitas ? "positive" : "zero"}>{row.visitas}</td>
                  <td>{row.taxaVisita}%</td>
                  <td>{row.agendamentos}</td>
                  <td className={row.sucessos ? "positive" : "zero"}>{row.sucessos}</td>
                  <td>{row.taxaVisitaParaSucesso}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Vendedor · Agendado para</h2>
        <p className="muted">
          Só IDs Meta. Agendamentos pela data Agendado em; sucessos pela data Finalizado em.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Agendamentos</th>
                <th>Sucessos</th>
                <th>Sucesso / agendamento</th>
              </tr>
            </thead>
            <tbody>
              {vendedores.map((row) => (
                <tr key={row.vendedor}>
                  <td>
                    <strong>{row.vendedor}</strong>
                  </td>
                  <td>{row.agendamentos}</td>
                  <td className={row.sucessos ? "positive" : "zero"}>{row.sucessos}</td>
                  <td>{row.taxaSucesso}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

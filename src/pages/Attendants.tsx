import { useMemo, useState } from "react";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { InfoTip } from "../components/InfoTip";
import { InteractiveTable } from "../components/InteractiveTable";
import { SeriesChart } from "../components/charts/SeriesChart";
import { ShareDonut } from "../components/charts/ShareDonut";
import { CHART_COLORS } from "../components/charts/chartTheme";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  buildSdrRows,
  buildVendedorRows,
  listMonthOptions,
  listSdrOptions,
  sliceCampanhas,
  type CampanhaFilters,
} from "../lib/campanhas/analytics";
import { currentMonthRange } from "../lib/dates";

export function Attendants() {
  const { rows, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<CampanhaFilters>(() => currentMonthRange());
  const sdrs = useMemo(() => listSdrOptions(rows), [rows]);
  const months = useMemo(() => listMonthOptions(rows), [rows]);
  const slice = useMemo(() => sliceCampanhas(rows, filters), [rows, filters]);
  const sdrRows = useMemo(() => buildSdrRows(slice), [slice]);
  const vendedores = useMemo(() => buildVendedorRows(slice), [slice]);

  if (loading) return <p className="muted">Carregando campanhas…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <CampanhasFilters filters={filters} sdrs={sdrs} months={months} onChange={setFilters} />

      <div className="charts">
        <SeriesChart
          title="Atendimentos e visitas por SDR"
          tip="Mesmos números da tabela de SDR."
          data={sdrRows}
          xKey="sdr"
          kind="bar"
          series={[
            { key: "atendimentos", name: "Atendimentos", color: CHART_COLORS.charcoal },
            { key: "visitas", name: "Visitas", color: CHART_COLORS.blue },
          ]}
        />
        <ShareDonut
          title="Sucessos por vendedor"
          tip="Sucessos já contados na tabela de vendedor."
          data={vendedores.map((row) => ({ label: row.vendedor, value: row.sucessos }))}
        />
      </div>

      <div className="card">
        <h2>
          SDR · só Facebook e Instagram
          <InfoTip>
            Atendimentos e visitas pelo SDR de LEADS REALIZADOS. Agendamentos e sucessos do mesmo
            ID, nas datas de Agendado em e Finalizado em.
          </InfoTip>
        </h2>
        <InteractiveTable
          rows={sdrRows}
          rowKey={(row) => row.sdr}
          columns={[
            { key: "sdr", label: "SDR", sortValue: (row) => row.sdr, render: (row) => <strong>{row.sdr}</strong> },
            { key: "atendimentos", label: "Atendimentos", sortValue: (row) => row.atendimentos },
            { key: "visitas", label: "Visitas", sortValue: (row) => row.visitas },
            { key: "taxaVisita", label: "Visita / atend.", sortValue: (row) => row.taxaVisita, render: (row) => `${row.taxaVisita}%` },
            { key: "agendamentos", label: "Agendamentos", sortValue: (row) => row.agendamentos },
            { key: "sucessos", label: "Sucessos", sortValue: (row) => row.sucessos, render: (row) => <span className="num-ok">{row.sucessos}</span> },
            { key: "taxa", label: "Sucesso / visita", sortValue: (row) => row.taxaVisitaParaSucesso, render: (row) => `${row.taxaVisitaParaSucesso}%` },
          ]}
        />
      </div>

      <div className="card">
        <h2>
          Vendedor · Agendado para
          <InfoTip>
            Só IDs Meta. Agendamentos pela data Agendado em; sucessos pela data Finalizado em.
          </InfoTip>
        </h2>
        <InteractiveTable
          rows={vendedores}
          rowKey={(row) => row.vendedor}
          columns={[
            { key: "vendedor", label: "Vendedor", sortValue: (row) => row.vendedor, render: (row) => <strong>{row.vendedor}</strong> },
            { key: "agendamentos", label: "Agendamentos", sortValue: (row) => row.agendamentos },
            { key: "sucessos", label: "Sucessos", sortValue: (row) => row.sucessos, render: (row) => <span className="num-ok">{row.sucessos}</span> },
            { key: "taxa", label: "Sucesso / agendamento", sortValue: (row) => row.taxaSucesso, render: (row) => <span className="num-ok">{row.taxaSucesso}%</span> },
          ]}
        />
      </div>
    </>
  );
}

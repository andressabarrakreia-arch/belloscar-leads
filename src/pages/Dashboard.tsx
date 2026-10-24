import { useMemo, useState } from "react";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { InfoTip } from "../components/InfoTip";
import { InteractiveTable } from "../components/InteractiveTable";
import { SeriesChart } from "../components/charts/SeriesChart";
import { ShareDonut } from "../components/charts/ShareDonut";
import { CHART_COLORS } from "../components/charts/chartTheme";
import { Card } from "../components/ui/card";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  buildCanalRows,
  buildMonthRows,
  buildSdrRows,
  listMonthOptions,
  listSdrOptions,
  sliceCampanhas,
  type CampanhaFilters,
} from "../lib/campanhas/analytics";
import { currentMonthRange } from "../lib/dates";

export function Dashboard() {
  const { dataset, rows, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<CampanhaFilters>(() => currentMonthRange());
  const sdrs = useMemo(() => listSdrOptions(rows), [rows]);
  const months = useMemo(() => listMonthOptions(rows), [rows]);
  const slice = useMemo(() => sliceCampanhas(rows, filters), [rows, filters]);
  const canais = useMemo(() => buildCanalRows(slice), [slice]);
  const sdrRows = useMemo(() => buildSdrRows(slice).slice(0, 12), [slice]);
  const monthChart = useMemo(() => buildMonthRows(slice), [slice]);

  if (loading) return <p className="muted">Carregando campanhas…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dataset) return null;

  const { kpis } = slice;

  return (
    <>
      <div className="card">
        <h2>
          Facebook e Instagram
          <InfoTip>
            Só entram IDs cuja origem no LEADS GERAL é Facebook, Facebook Ads, Instagram ou
            Instagram Ads (também com canal junto, como WhatsApp | Instagram Ads). Os demais
            atendimentos ficam de fora. Cada número usa a própria data: atendimento em{" "}
            <strong>Atendido em</strong>, visita em <strong>Visita em</strong> (Visita = Sim),
            agendamento em <strong>Agendado em</strong>, sucesso em <strong>Finalizado em</strong>.
            Cruzamento e dedupe por ID.
          </InfoTip>
        </h2>
      </div>

      <CampanhasFilters filters={filters} sdrs={sdrs} months={months} onChange={setFilters} />

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Card className="border-l-4 border-l-foreground px-4 py-3 shadow-none">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Atendimentos</h3>
          <p className="font-display text-2xl font-extrabold">{kpis.atendimentos.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="border-l-4 border-l-accent-foreground px-4 py-3 shadow-none">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Visitas</h3>
          <p className="font-display text-2xl font-extrabold">{kpis.visitas.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="px-4 py-3 shadow-none">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Visita / atendimento</h3>
          <p className="font-display text-2xl font-extrabold">{kpis.taxaVisita}%</p>
        </Card>
        <Card className="border-l-4 border-l-primary px-4 py-3 shadow-none">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Agendamentos</h3>
          <p className="font-display text-2xl font-extrabold">{kpis.agendamentos.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="border-l-4 border-l-success px-4 py-3 shadow-none">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Sucessos</h3>
          <p className="font-display text-2xl font-extrabold text-success">{kpis.sucessos.toLocaleString("pt-BR")}</p>
        </Card>
        <Card className="border-l-4 border-l-success px-4 py-3 shadow-none">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Sucesso / visita</h3>
          <p className="font-display text-2xl font-extrabold text-success">{kpis.taxaVisitaParaSucesso}%</p>
        </Card>
      </div>

      <div className="card">
        <h2>
          Por canal
          <InfoTip>
            Um ID com Facebook e Instagram entra nas duas linhas. O total dos cards acima conta o
            ID uma vez.
          </InfoTip>
        </h2>
        <InteractiveTable
          rows={canais}
          rowKey={(row) => row.canal}
          columns={[
            { key: "canal", label: "Canal", sortValue: (row) => row.canal, render: (row) => <strong>{row.canal}</strong> },
            { key: "atendimentos", label: "Atendimentos", sortValue: (row) => row.atendimentos },
            { key: "visitas", label: "Visitas", sortValue: (row) => row.visitas },
            { key: "agendamentos", label: "Agendamentos", sortValue: (row) => row.agendamentos },
            { key: "sucessos", label: "Sucessos", sortValue: (row) => row.sucessos, render: (row) => <span className="num-ok">{row.sucessos}</span> },
            { key: "taxaVisita", label: "Visita / atend.", sortValue: (row) => row.taxaVisita, render: (row) => `${row.taxaVisita}%` },
            { key: "taxaSucesso", label: "Sucesso / visita", sortValue: (row) => row.taxaVisitaParaSucesso, render: (row) => `${row.taxaVisitaParaSucesso}%` },
          ]}
        />
      </div>

      <div className="charts">
        <SeriesChart
          title="Volume por canal"
          tip="Clique numa série para esconder. Os números são os da tabela."
          data={canais}
          xKey="canal"
          kind="bar"
          series={[
            { key: "atendimentos", name: "Atendimentos", color: CHART_COLORS.charcoal },
            { key: "visitas", name: "Visitas", color: CHART_COLORS.blue },
            { key: "agendamentos", name: "Agendamentos", color: CHART_COLORS.gray },
            { key: "sucessos", name: "Sucessos", color: CHART_COLORS.green },
          ]}
        />
        <SeriesChart
          title="Por mês"
          data={monthChart}
          xKey="month"
          kind="area"
          series={[
            { key: "atendimentos", name: "Atendimentos", color: CHART_COLORS.charcoal },
            { key: "visitas", name: "Visitas", color: CHART_COLORS.blue },
            { key: "sucessos", name: "Sucessos", color: CHART_COLORS.green },
          ]}
        />
        <ShareDonut
          title="Sucessos por canal"
          tip="A fatia usa o sucesso já contado na tabela de canal."
          data={canais.map((row) => ({ label: row.canal, value: row.sucessos }))}
        />
        <SeriesChart
          title="SDR no recorte"
          tip="Os 12 SDRs da tabela abaixo."
          data={sdrRows}
          xKey="sdr"
          kind="bar"
          series={[
            { key: "atendimentos", name: "Atendimentos", color: CHART_COLORS.charcoal },
            { key: "sucessos", name: "Sucessos", color: CHART_COLORS.green },
          ]}
        />
      </div>

      <div className="card">
        <h2>Por SDR</h2>
        <InteractiveTable
          rows={sdrRows}
          rowKey={(row) => row.sdr}
          columns={[
            { key: "sdr", label: "SDR", sortValue: (row) => row.sdr, render: (row) => <strong>{row.sdr}</strong> },
            { key: "atendimentos", label: "Atendimentos", sortValue: (row) => row.atendimentos },
            { key: "visitas", label: "Visitas", sortValue: (row) => row.visitas },
            { key: "agendamentos", label: "Agendamentos", sortValue: (row) => row.agendamentos },
            { key: "sucessos", label: "Sucessos", sortValue: (row) => row.sucessos, render: (row) => <span className="num-ok">{row.sucessos}</span> },
            { key: "taxaVisita", label: "Visita / atend.", sortValue: (row) => row.taxaVisita, render: (row) => `${row.taxaVisita}%` },
          ]}
        />
      </div>

      <p className="muted">
        IDs Meta no LEADS GERAL: {rows.length.toLocaleString("pt-BR")} · base publicada em{" "}
        {new Date(dataset.updatedAt).toLocaleString("pt-BR")}
      </p>
    </>
  );
}

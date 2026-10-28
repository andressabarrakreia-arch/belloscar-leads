import { Fragment, useMemo, useState } from "react";
import { CampanhasFilters } from "../components/CampanhasFilters";
import { InfoTip } from "../components/InfoTip";
import { InteractiveTable } from "../components/InteractiveTable";
import { Card } from "../components/ui/card";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  buildCanalRows,
  buildSdrRows,
  formatMonthLabel,
  listMonthOptions,
  listSdrOptions,
  monthKeyFromRange,
  sliceCampanhas,
  type CampanhaFilters,
} from "../lib/campanhas/analytics";
import { currentMonthRange, formatDateRangeLabel } from "../lib/dates";

export function Dashboard() {
  const { dataset, rows, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<CampanhaFilters>(() => currentMonthRange());
  const [openCanais, setOpenCanais] = useState<Record<string, boolean>>({});
  const padrao = currentMonthRange();
  const scoped = useMemo<CampanhaFilters>(
    () => ({
      ...filters,
      from: filters.from || padrao.from,
      to: filters.to || padrao.to,
    }),
    [filters, padrao.from, padrao.to]
  );
  const sdrs = useMemo(() => listSdrOptions(rows), [rows]);
  const months = useMemo(() => listMonthOptions(rows), [rows]);
  const slice = useMemo(() => sliceCampanhas(rows, scoped), [rows, scoped]);
  const canais = useMemo(() => buildCanalRows(slice), [slice]);
  const sdrRows = useMemo(() => buildSdrRows(slice).slice(0, 12), [slice]);
  const selectedMonth = monthKeyFromRange(scoped.from, scoped.to);
  const periodFora = scoped.from !== padrao.from || scoped.to !== padrao.to;
  const periodoLabel = selectedMonth
    ? formatMonthLabel(selectedMonth)
    : formatDateRangeLabel(scoped.from!, scoped.to!);

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
            Cruzamento e dedupe por ID. Abre no mês vigente; amplie De/Até ou troque o mês no
            filtro para ver outros períodos.
          </InfoTip>
        </h2>
        <p className="muted" style={{ marginTop: 4 }}>
          Período: <strong>{periodoLabel}</strong>
          {!periodFora ? " (mês vigente)" : ""}
        </p>
      </div>

      <CampanhasFilters filters={scoped} sdrs={sdrs} months={months} onChange={setFilters} />

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
            ID uma vez. Com sucessos, o + abre ID, atendente, vendedor e proposta.
          </InfoTip>
        </h2>
        <div className="table-scroll">
          <table className="sdr-vendedor-expande">
            <thead>
              <tr>
                <th>Canal</th>
                <th>Atendimentos</th>
                <th>Visitas</th>
                <th>Agendamentos</th>
                <th>Sucessos</th>
                <th>Visita / atend.</th>
                <th>Sucesso / visita</th>
              </tr>
            </thead>
            <tbody>
              {canais.map((row) => {
                const aberto = !!openCanais[row.canal];
                const temSucesso = row.sucessoItens.length > 0;
                return (
                  <Fragment key={row.canal}>
                    <tr className="sdr-pai">
                      <td>
                        {temSucesso ? (
                          <button
                            type="button"
                            className="marca-mais"
                            aria-expanded={aberto}
                            aria-label={
                              aberto
                                ? `Fechar sucessos de ${row.canal}`
                                : `Abrir sucessos de ${row.canal}`
                            }
                            onClick={() =>
                              setOpenCanais((prev) => ({ ...prev, [row.canal]: !prev[row.canal] }))
                            }
                          >
                            {aberto ? "−" : "+"}
                          </button>
                        ) : null}
                        <strong>{row.canal}</strong>
                      </td>
                      <td>{row.atendimentos}</td>
                      <td>{row.visitas}</td>
                      <td>{row.agendamentos}</td>
                      <td className="num-ok">{row.sucessos}</td>
                      <td>{row.taxaVisita}%</td>
                      <td>{row.taxaVisitaParaSucesso}%</td>
                    </tr>
                    {aberto && (
                      <tr className="modelo-filho sdr-filho">
                        <td colSpan={7}>
                          <div className="table-scroll expand-panel">
                            <table>
                              <thead>
                                <tr>
                                  <th>ID</th>
                                  <th>Atendente</th>
                                  <th>Vendedor</th>
                                  <th>Proposta</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.sucessoItens.map((item) => (
                                  <tr key={`${row.canal}::${item.id}`}>
                                    <td>
                                      <strong>{item.id}</strong>
                                    </td>
                                    <td>{item.atendente}</td>
                                    <td>{item.vendedor}</td>
                                    <td>{item.proposta}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
              {canais.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    Sem volume Meta neste período.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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

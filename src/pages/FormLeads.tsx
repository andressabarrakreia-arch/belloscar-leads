import { useMemo, useState } from "react";
import { ClearFiltersButton, filterActiveClass } from "../components/ClearFiltersButton";
import { FiltersPanel } from "../components/FiltersPanel";
import { InfoTip } from "../components/InfoTip";
import { InteractiveTable } from "../components/InteractiveTable";
import { SeriesChart } from "../components/charts/SeriesChart";
import { ShareDonut } from "../components/charts/ShareDonut";
import { VegaBarras } from "../components/viz/VegaBarras";
import { phoneKey } from "../lib/campanhas/phoneMatch";
import { CHART_COLORS } from "../components/charts/chartTheme";
import { Card } from "../components/ui/card";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  buildFormularioReport,
  listFormularioMonths,
  listFormularioOptions,
  type FormularioFilters,
} from "../lib/campanhas/leadsFormulario";
import { formatMonthLabel, monthBounds, monthKeyFromRange } from "../lib/campanhas/analytics";
import { currentMonthKey, currentMonthRange, formatDateRangeLabel } from "../lib/dates";

function formatIso(iso: string | null): string {
  if (!iso || iso.length < 10) return "—";
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return "—";
  return `${day}/${month}/${year}`;
}

function simNao(value: boolean) {
  return <span className={value ? "positive" : "zero"}>{value ? "Sim" : "Não"}</span>;
}

export function FormLeads() {
  const { dataset, loading, error } = useCampanhas();
  const [filters, setFilters] = useState<FormularioFilters>(() => currentMonthRange());
  const [openMissing, setOpenMissing] = useState(false);
  const leads = dataset?.leadsCampanha || [];
  const formularios = useMemo(() => listFormularioOptions(leads), [leads]);
  const months = useMemo(() => listFormularioMonths(leads), [leads]);
  const padrao = currentMonthRange();
  /** Sempre com intervalo; mês vigente se faltar De/Até (nunca “todo o histórico”). */
  const scoped = useMemo<FormularioFilters>(
    () => ({
      ...filters,
      from: filters.from || padrao.from,
      to: filters.to || padrao.to,
    }),
    [filters, padrao.from, padrao.to]
  );
  const report = useMemo(
    () =>
      buildFormularioReport(
        leads,
        dataset?.items || [],
        dataset?.realizados || [],
        dataset?.sucessosEventos || [],
        scoped
      ),
    [leads, dataset, scoped]
  );
  const ddds = useMemo(() => {
    const mapa = new Map<string, number>();
    for (const row of leads) {
      if (scoped.from && row.criadoEm < scoped.from) continue;
      if (scoped.to && row.criadoEm > scoped.to) continue;
      if (scoped.formulario && row.formulario !== scoped.formulario) continue;
      const chaves = row.phoneKeys?.length ? row.phoneKeys : [row.phoneKey || row.telefone];
      const ddd = phoneKey(chaves[0] || "").slice(0, 2);
      if (ddd.length !== 2) continue;
      mapa.set(ddd, (mapa.get(ddd) || 0) + 1);
    }
    return [...mapa.entries()]
      .map(([ddd, total]) => ({ ddd, leads: total }))
      .sort((a, b) => b.leads - a.leads)
      .slice(0, 12);
  }, [leads, scoped]);
  const selectedMonth = monthKeyFromRange(scoped.from, scoped.to);
  const monthPadrao = currentMonthKey();
  const monthChoices = months.includes(monthPadrao) ? months : [monthPadrao, ...months];
  const periodFora = scoped.from !== padrao.from || scoped.to !== padrao.to;
  const active = Boolean(scoped.formulario || periodFora);
  const periodoLabel = selectedMonth
    ? formatMonthLabel(selectedMonth)
    : formatDateRangeLabel(scoped.from!, scoped.to!);

  if (loading) return <p className="muted">Carregando campanhas…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <div className="card">
        <h2>
          Leads por formulário
          <InfoTip>
            Só entram as linhas da planilha LEADS POR CAMPANHA. O anúncio é a coluna Formulário.
            O cruzamento com a operação é pelo telefone. O lead conta pelo Criado em. O agendamento
            conta pelo Agendado em, a visita pelo Visita em e o sucesso pelo Finalizado em. O mesmo
            ID pode entrar em meses diferentes. Quem não achou telefone fica em Leads sem cruzamento.
            Abre no mês vigente; amplie De/Até ou troque o mês no filtro para ver outros períodos.
          </InfoTip>
        </h2>
        <p className="muted" style={{ marginTop: 4 }}>
          Período: <strong>{periodoLabel}</strong>
          {!periodFora ? " (mês vigente)" : ""}
        </p>
      </div>

      {leads.length === 0 ? (
        <p className="muted">
          Nenhuma planilha LEADS POR CAMPANHA publicada. Envie o arquivo na Gestão do Índice.
        </p>
      ) : (
        <>
          <FiltersPanel active={active} label="filtros">
            <div className="filters">
              <label>
                Mês
                <select
                  className={filterActiveClass(selectedMonth !== monthPadrao)}
                  value={selectedMonth || "__custom__"}
                  aria-label="Mês"
                  onChange={(event) => {
                    const ym = event.target.value;
                    if (!ym || ym === "__custom__") return;
                    const range = monthBounds(ym);
                    setFilters({ ...filters, from: range.from, to: range.to });
                  }}
                >
                  {!selectedMonth && (
                    <option value="__custom__" disabled>
                      Personalizado
                    </option>
                  )}
                  {monthChoices.map((ym) => (
                    <option key={ym} value={ym}>
                      {formatMonthLabel(ym)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                De
                <input
                  className={filterActiveClass(scoped.from !== padrao.from)}
                  type="date"
                  value={scoped.from}
                  onChange={(event) => {
                    const from = event.target.value || padrao.from;
                    setFilters({ ...filters, from, to: scoped.to });
                  }}
                />
              </label>
              <label>
                Até
                <input
                  className={filterActiveClass(scoped.to !== padrao.to)}
                  type="date"
                  value={scoped.to}
                  onChange={(event) => {
                    const to = event.target.value || padrao.to;
                    setFilters({ ...filters, from: scoped.from, to });
                  }}
                />
              </label>
              <label>
                Campanha
                <select
                  className={filterActiveClass(Boolean(scoped.formulario))}
                  value={scoped.formulario || ""}
                  onChange={(event) =>
                    setFilters({ ...filters, formulario: event.target.value || undefined })
                  }
                >
                  <option value="">Todas</option>
                  {formularios.map((nome) => (
                    <option key={nome} value={nome}>
                      {nome}
                    </option>
                  ))}
                </select>
              </label>
              <ClearFiltersButton onClick={() => setFilters({ ...currentMonthRange() })} />
            </div>
          </FiltersPanel>

          {report.destaque && (
            <div className="card">
              <h2>Campanha com mais resultado</h2>
              <p className="form-winner">{report.destaque.formulario}</p>
              <p className="muted">
                <span className="num-ok">{report.destaque.sucessos.toLocaleString("pt-BR")} sucessos</span> ·{" "}
                {report.destaque.visitas.toLocaleString("pt-BR")} visitas ·{" "}
                {report.destaque.agendados.toLocaleString("pt-BR")} agendados ·{" "}
                {report.destaque.leads.toLocaleString("pt-BR")} leads do formulário
              </p>
            </div>
          )}

          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-5">
            <Card className="px-4 py-3 shadow-none">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Leads do formulário</h3>
              <p className="font-display text-2xl font-extrabold">{report.total.toLocaleString("pt-BR")}</p>
            </Card>
            <Card className="border-l-4 border-l-primary px-4 py-3 shadow-none">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Cruzados</h3>
              <p className="font-display text-2xl font-extrabold">
                {report.cruzados.filter((row) => row.leadNoPeriodo).length.toLocaleString("pt-BR")}
              </p>
            </Card>
            <Card className="px-4 py-3 shadow-none">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Agendados</h3>
              <p className="font-display text-2xl font-extrabold">{report.agendados.toLocaleString("pt-BR")}</p>
            </Card>
            <Card className="border-l-4 border-l-accent-foreground px-4 py-3 shadow-none">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Visitas</h3>
              <p className="font-display text-2xl font-extrabold">{report.visitas.toLocaleString("pt-BR")}</p>
            </Card>
            <Card className="border-l-4 border-l-success px-4 py-3 shadow-none">
              <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Sucessos</h3>
              <p className="font-display text-2xl font-extrabold text-success">{report.sucessos.toLocaleString("pt-BR")}</p>
            </Card>
          </div>

          <div className="card">
            <h2>
              Resultado por campanha
              <InfoTip>
                Uma linha por formulário (campanha). Leads pelo Criado em; agendamentos pelo Agendado
                em; visitas pelo Visita em; sucessos pelo Finalizado em — cruzados pelo telefone.
              </InfoTip>
            </h2>
            <InteractiveTable
              rows={report.campanhas}
              rowKey={(row) => row.formulario}
              columns={[
                {
                  key: "campanha",
                  label: "Campanha",
                  sortValue: (row) => row.formulario,
                  render: (row) => <strong>{row.formulario}</strong>,
                },
                {
                  key: "leads",
                  label: "Leads",
                  sortValue: (row) => row.leads,
                  render: (row) => row.leads.toLocaleString("pt-BR"),
                },
                {
                  key: "agendamentos",
                  label: "Agendamentos",
                  sortValue: (row) => row.agendados,
                  render: (row) => row.agendados.toLocaleString("pt-BR"),
                },
                {
                  key: "visitas",
                  label: "Visitas",
                  sortValue: (row) => row.visitas,
                  render: (row) => row.visitas.toLocaleString("pt-BR"),
                },
                {
                  key: "sucessos",
                  label: "Sucessos",
                  sortValue: (row) => row.sucessos,
                  render: (row) => <span className="num-ok">{row.sucessos.toLocaleString("pt-BR")}</span>,
                },
              ]}
            />
            {report.campanhas.length === 0 ? (
              <p className="muted">Nenhuma campanha no filtro atual.</p>
            ) : null}
          </div>

          <div className="charts">
            <SeriesChart
              title="Resultado por anúncio"
              tip="Leads, agendados, visitas e sucessos já somados por formulário."
              data={report.campanhas}
              xKey="formulario"
              kind="bar"
              series={[
                { key: "leads", name: "Leads", color: CHART_COLORS.charcoal },
                { key: "agendados", name: "Agendados", color: CHART_COLORS.gray },
                { key: "visitas", name: "Visitas", color: CHART_COLORS.blue },
                { key: "sucessos", name: "Sucessos", color: CHART_COLORS.green },
              ]}
            />
            <ShareDonut
              title="Sucessos por anúncio"
              data={report.campanhas.map((row) => ({ label: row.formulario, value: row.sucessos }))}
            />
          </div>

          <VegaBarras
            titulo="DDD dos formulários cruzados"
            dica="Os 12 DDDs com mais leads que acharam telefone na operação."
            dados={ddds}
            nome="ddd"
            valor="leads"
            valorLabel="Leads"
          />

          <div className="card">
            <h2>Cruzados pelo telefone</h2>
            <InteractiveTable
              rows={report.cruzados.map((row, index) => ({ ...row, key: `${row.id}-${row.anuncio}-${index}` }))}
              rowKey={(row) => row.key}
              columns={[
                { key: "id", label: "ID", sortValue: (row) => row.id, render: (row) => <strong>{row.id}</strong> },
                { key: "atendente", label: "Atendente", sortValue: (row) => row.atendente },
                { key: "agendado", label: "Agendado", sortValue: (row) => (row.agendado ? 1 : 0), render: (row) => simNao(row.agendado) },
                { key: "vendedor", label: "Vendedor", sortValue: (row) => row.vendedor },
                { key: "visita", label: "Visita", sortValue: (row) => (row.visita ? 1 : 0), render: (row) => simNao(row.visita) },
                { key: "data", label: "Data da visita", sortValue: (row) => row.dataVisita || "", render: (row) => formatIso(row.dataVisita) },
                { key: "sucesso", label: "Sucesso", sortValue: (row) => (row.sucesso ? 1 : 0), render: (row) => simNao(row.sucesso) },
                { key: "anuncio", label: "Anúncio", sortValue: (row) => row.anuncio },
              ]}
            />
            <div className="table-scroll">
              <table>
                <tbody>
                  <tr>
                    <td>
                      <button
                        type="button"
                        className="expand-toggle"
                        aria-expanded={openMissing}
                        onClick={() => setOpenMissing((open) => !open)}
                      >
                        {openMissing ? "▾" : "▸"} Leads sem cruzamento (
                        {report.semCruzamento.length.toLocaleString("pt-BR")})
                      </button>
                      {openMissing && (
                        <div className="table-scroll expand-panel">
                          <table>
                            <thead>
                              <tr>
                                <th>Data</th>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>Campanha</th>
                              </tr>
                            </thead>
                            <tbody>
                              {report.semCruzamento.length === 0 ? (
                                <tr>
                                  <td colSpan={4}>Nenhum lead sem cruzamento neste recorte.</td>
                                </tr>
                              ) : (
                                report.semCruzamento.map((row, index) => (
                                  <tr key={`${row.telefone}-${row.campanha}-${index}`}>
                                    <td>{formatIso(row.data)}</td>
                                    <td>
                                      <strong>{row.nome}</strong>
                                    </td>
                                    <td>{row.telefone}</td>
                                    <td>{row.campanha}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

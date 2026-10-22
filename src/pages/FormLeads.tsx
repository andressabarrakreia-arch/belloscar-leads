import { useMemo, useState } from "react";
import { ClearFiltersButton, filterActiveClass } from "../components/ClearFiltersButton";
import { FiltersPanel } from "../components/FiltersPanel";
import { InfoTip } from "../components/InfoTip";
import { useCampanhas } from "../hooks/useCampanhas";
import {
  buildFormularioReport,
  listFormularioMonths,
  listFormularioOptions,
  type FormularioFilters,
} from "../lib/campanhas/leadsFormulario";
import { formatMonthLabel, monthBounds, monthKeyFromRange } from "../lib/campanhas/analytics";

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
  const [filters, setFilters] = useState<FormularioFilters>({});
  const [openMissing, setOpenMissing] = useState(false);
  const leads = dataset?.leadsCampanha || [];
  const formularios = useMemo(() => listFormularioOptions(leads), [leads]);
  const months = useMemo(() => listFormularioMonths(leads), [leads]);
  const report = useMemo(
    () =>
      buildFormularioReport(
        leads,
        dataset?.items || [],
        dataset?.realizados || [],
        dataset?.sucessosEventos || [],
        filters
      ),
    [leads, dataset, filters]
  );
  const selectedMonth = monthKeyFromRange(filters.from, filters.to);
  const active = Boolean(filters.from || filters.to || filters.formulario);

  if (loading) return <p className="muted">Carregando campanhas…</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <>
      <div className="card">
        <h2>
          Leads por formulário
          <InfoTip>
            Só entram as linhas da planilha LEADS POR CAMPANHA. O anúncio é a coluna Formulário. O
            ID, o atendente, o agendamento, a visita e o sucesso vêm das mesmas bases das outras
            abas, cruzados pelo telefone. Quem não achou telefone fica em Leads sem cruzamento.
          </InfoTip>
        </h2>
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
                  className={filterActiveClass(Boolean(selectedMonth))}
                  value={selectedMonth}
                  aria-label="Mês"
                  onChange={(event) => {
                    const ym = event.target.value;
                    if (!ym) {
                      setFilters({ ...filters, from: undefined, to: undefined });
                      return;
                    }
                    const range = monthBounds(ym);
                    setFilters({ ...filters, from: range.from, to: range.to });
                  }}
                >
                  <option value="">Todos</option>
                  {months.map((ym) => (
                    <option key={ym} value={ym}>
                      {formatMonthLabel(ym)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                De
                <input
                  className={filterActiveClass(Boolean(filters.from))}
                  type="date"
                  value={filters.from || ""}
                  onChange={(event) =>
                    setFilters({ ...filters, from: event.target.value || undefined })
                  }
                />
              </label>
              <label>
                Até
                <input
                  className={filterActiveClass(Boolean(filters.to))}
                  type="date"
                  value={filters.to || ""}
                  onChange={(event) =>
                    setFilters({ ...filters, to: event.target.value || undefined })
                  }
                />
              </label>
              <label>
                Campanha
                <select
                  className={filterActiveClass(Boolean(filters.formulario))}
                  value={filters.formulario || ""}
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
              <ClearFiltersButton onClick={() => setFilters({})} />
            </div>
          </FiltersPanel>

          {report.destaque && (
            <div className="card">
              <h2>Campanha com mais resultado</h2>
              <p className="form-winner">{report.destaque.formulario}</p>
              <p className="muted">
                {report.destaque.sucessos.toLocaleString("pt-BR")} sucessos ·{" "}
                {report.destaque.visitas.toLocaleString("pt-BR")} visitas ·{" "}
                {report.destaque.agendados.toLocaleString("pt-BR")} agendados ·{" "}
                {report.destaque.leads.toLocaleString("pt-BR")} leads do formulário
              </p>
            </div>
          )}

          <div className="kpi-grid">
            <div className="kpi-card">
              <h3>Leads do formulário</h3>
              <p>{report.total.toLocaleString("pt-BR")}</p>
            </div>
            <div className="kpi-card accent">
              <h3>Cruzados</h3>
              <p>{report.cruzados.length.toLocaleString("pt-BR")}</p>
            </div>
            <div className="kpi-card">
              <h3>Agendados</h3>
              <p>{report.agendados.toLocaleString("pt-BR")}</p>
            </div>
            <div className="kpi-card">
              <h3>Visitas</h3>
              <p>{report.visitas.toLocaleString("pt-BR")}</p>
            </div>
            <div className="kpi-card success">
              <h3>Sucessos</h3>
              <p>{report.sucessos.toLocaleString("pt-BR")}</p>
            </div>
          </div>

          <div className="card">
            <h2>Cruzados pelo telefone</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Atendente</th>
                    <th>Agendado</th>
                    <th>Vendedor</th>
                    <th>Visita</th>
                    <th>Data da visita</th>
                    <th>Sucesso</th>
                    <th>Anúncio</th>
                  </tr>
                </thead>
                <tbody>
                  {report.cruzados.map((row, index) => (
                    <tr key={`${row.id}-${row.anuncio}-${index}`}>
                      <td>
                        <strong>{row.id}</strong>
                      </td>
                      <td>{row.atendente}</td>
                      <td>{simNao(row.agendado)}</td>
                      <td>{row.vendedor}</td>
                      <td>{simNao(row.visita)}</td>
                      <td>{formatIso(row.dataVisita)}</td>
                      <td>{simNao(row.sucesso)}</td>
                      <td>{row.anuncio}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={8}>
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

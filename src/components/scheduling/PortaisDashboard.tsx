import { Fragment, useMemo, useState } from "react";
import type { PortalDashboard, PortalOriginMetrics } from "../../lib/scheduling/portalMetrics";

type Props = {
  data: PortalDashboard;
};

function MetricCell({ value, suffix = "" }: { value: number; suffix?: string }) {
  return (
    <>
      {value}
      {suffix}
    </>
  );
}

function OriginDetail({ origin }: { origin: PortalOriginMetrics }) {
  return (
    <div className="portal-detail stack">
      <h3>{origin.origin}</h3>
      <p className="muted">
        Show-up = Vi/Ag · Conv. = Su/Ag · Multi-origem: o mesmo agendamento pode entrar em mais de
        um portal. Pré-Venda {origin.preVenda} · Recepção {origin.recepcao}.
      </p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Agendamentos</h3>
          <p>{origin.total}</p>
          <small className="muted">{origin.sharePct}% do filtro*</small>
        </div>
        <div className="kpi-card">
          <h3>Show-up</h3>
          <p>{origin.taxaVisita}%</p>
          <small className="muted">
            {origin.visitas}/{origin.total} Vi/Ag
          </small>
        </div>
        <div className="kpi-card success">
          <h3>Conv.</h3>
          <p>{origin.taxaSucesso}%</p>
          <small className="muted">
            {origin.sucessos}/{origin.total} Su/Ag
          </small>
        </div>
        <div className="kpi-card accent">
          <h3>% Insucesso</h3>
          <p>{origin.taxaInsucesso}%</p>
          <small className="muted">
            {origin.insucessos}/{origin.total}
          </small>
        </div>
      </div>

      <h4>Canais de chegada</h4>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Canal</th>
              <th>Ag.</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Show-up</th>
              <th>Conv.</th>
            </tr>
          </thead>
          <tbody>
            {origin.channels.map((c) => (
              <tr key={c.canal}>
                <td>{c.canal}</td>
                <td>{c.total}</td>
                <td>{c.visitas}</td>
                <td>{c.sucessos}</td>
                <td>{c.taxaVisita}%</td>
                <td>{c.taxaSucesso}%</td>
              </tr>
            ))}
            {origin.channels.length === 0 && (
              <tr>
                <td colSpan={6} className="muted">
                  Sem canal informado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h4>Tipos de proposta</h4>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Qtd</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(origin.propostas)
              .filter(([, n]) => n > 0)
              .map(([tipo, n]) => (
                <tr key={tipo}>
                  <td>{tipo === "não informado(celulas em branco)" ? "N/I" : tipo}</td>
                  <td>{n}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="charts" style={{ gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <h4>Top SDRs</h4>
          <ul className="mini-list">
            {origin.topSdrs.map((s, i) => (
              <li key={s.nome}>
                {i + 1}. {s.nome}{" "}
                <span className="muted">
                  ({s.total} · {s.taxaSucesso}% Su/Ag)
                </span>
              </li>
            ))}
            {origin.topSdrs.length === 0 && <li className="muted">—</li>}
          </ul>
        </div>
        <div>
          <h4>Top vendedores</h4>
          <ul className="mini-list">
            {origin.topVendedores.map((s, i) => (
              <li key={s.nome}>
                {i + 1}. {s.nome}{" "}
                <span className="muted">
                  ({s.total} · {s.taxaSucesso}% Su/Ag)
                </span>
              </li>
            ))}
            {origin.topVendedores.length === 0 && <li className="muted">—</li>}
          </ul>
        </div>
      </div>

      <h4>Top motivos de insucesso</h4>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Motivo</th>
              <th>Qtd</th>
              <th>%</th>
            </tr>
          </thead>
          <tbody>
            {origin.topMotivos.map((m) => (
              <tr key={m.motivo}>
                <td>{m.motivo}</td>
                <td>{m.quantidade}</td>
                <td>{m.percentual}%</td>
              </tr>
            ))}
            {origin.topMotivos.length === 0 && (
              <tr>
                <td colSpan={3} className="muted">
                  Sem insucessos neste portal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h4>Origens brutas (planilha)</h4>
      <ul className="mini-list">
        {origin.rawLabels.slice(0, 12).map((r) => (
          <li key={r.label}>
            {r.label} <span className="muted">({r.total})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PortaisDashboard({ data }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(
    data.topByVolume[0]?.origin ?? null
  );

  const selectedOrigin = useMemo(
    () => data.origins.find((o) => o.origin === selected) ?? null,
    [data.origins, selected]
  );

  const toggle = (id: string) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <div className="card">
        <h2>Portais</h2>
        <p className="muted">
          Resultados por <strong>origem/portal</strong>, com canal de chegada (WhatsApp, Site,
          Telefone…). Grupos agregam aliases — expanda para ver cada portal. *Share e totais de
          grupo podem somar &gt; 100% quando um agendamento tem mais de uma origem (ex.: SóCarrão +
          Chaves na Mão). Universo do filtro: {data.uniqueTotal} agendamentos · atribuições:{" "}
          {data.attributedTotal}.
        </p>
      </div>

      <div className="charts">
        <div className="card">
          <h2>Top 5 · volume</h2>
          <div className="kpi-grid">
            {data.topByVolume.map((o) => (
              <button
                key={o.origin}
                type="button"
                className={`kpi-card ${selected === o.origin ? "accent" : ""}`}
                style={{ textAlign: "left", cursor: "pointer", border: "none", width: "100%" }}
                onClick={() => setSelected(o.origin)}
              >
                <h3>{o.origin}</h3>
                <p>{o.total}</p>
                <small className="muted">
                  Conv. {o.taxaSucesso}% · Show-up {o.taxaVisita}%
                </small>
              </button>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>Top 5 · conversão</h2>
          <p className="muted">Mínimo 20 agendamentos.</p>
          <div className="kpi-grid">
            {data.topByConversion.map((o) => (
              <button
                key={o.origin}
                type="button"
                className={`kpi-card success ${selected === o.origin ? "accent" : ""}`}
                style={{ textAlign: "left", cursor: "pointer", border: "none", width: "100%" }}
                onClick={() => setSelected(o.origin)}
              >
                <h3>{o.origin}</h3>
                <p>{o.taxaSucesso}%</p>
                <small className="muted">
                  {o.sucessos}/{o.total} Su/Ag
                </small>
              </button>
            ))}
            {data.topByConversion.length === 0 && (
              <p className="muted">Sem portais com volume mínimo no filtro.</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Ranking por grupo</h2>
        <p className="muted">Clique no grupo para expandir os portais. Clique no portal para o detalhe.</p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Grupo / Portal</th>
                <th>Ag.</th>
                <th>Visitas</th>
                <th>Sucessos</th>
                <th>Insucessos</th>
                <th>Show-up</th>
                <th>Conv.</th>
                <th>% Insuc.</th>
                <th>Share*</th>
              </tr>
            </thead>
            <tbody>
              {data.groups.map((g) => (
                <Fragment key={g.id}>
                  <tr className="portal-group-row">
                    <td>
                      <button
                        type="button"
                        className="btn secondary"
                        aria-expanded={!!expanded[g.id]}
                        onClick={() => toggle(g.id)}
                        style={{ padding: "4px 10px" }}
                      >
                        {expanded[g.id] ? "−" : "+"}
                      </button>
                    </td>
                    <td>
                      <strong>{g.label}</strong>
                    </td>
                    <td>
                      <MetricCell value={g.total} />
                    </td>
                    <td>{g.visitas}</td>
                    <td>{g.sucessos}</td>
                    <td>{g.insucessos}</td>
                    <td>{g.taxaVisita}%</td>
                    <td>{g.taxaSucesso}%</td>
                    <td>{g.taxaInsucesso}%</td>
                    <td>{g.sharePct}%</td>
                  </tr>
                  {expanded[g.id] &&
                    g.origins.map((o) => (
                      <tr
                        key={`${g.id}-${o.origin}`}
                        className={selected === o.origin ? "highlight-row" : undefined}
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelected(o.origin)}
                      >
                        <td></td>
                        <td style={{ paddingLeft: 28 }}>{o.origin}</td>
                        <td>{o.total}</td>
                        <td>{o.visitas}</td>
                        <td>{o.sucessos}</td>
                        <td>{o.insucessos}</td>
                        <td>{o.taxaVisita}%</td>
                        <td>{o.taxaSucesso}%</td>
                        <td>{o.taxaInsucesso}%</td>
                        <td>{o.sharePct}%</td>
                      </tr>
                    ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrigin && (
        <div className="card">
          <OriginDetail origin={selectedOrigin} />
        </div>
      )}

      {data.periodSeriesTop.length > 0 && (
        <div className="card">
          <h2>Série por quinzena · top 5 portais (volume)</h2>
          <p className="muted">Agendamentos atribuídos a cada portal no período (multi-origem pode repetir).</p>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Quinzena</th>
                  {data.topByVolume.map((o) => (
                    <th key={o.origin}>{o.origin}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.periodSeriesTop.map((row) => (
                  <tr key={row.label}>
                    <td>{row.label}</td>
                    {data.topByVolume.map((o) => {
                      const hit = row.series.find((s) => s.origin === o.origin);
                      return <td key={o.origin}>{hit?.total ?? 0}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

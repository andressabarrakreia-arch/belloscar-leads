import { Fragment, useMemo, useState } from "react";
import { InfoTip } from "../InfoTip";
import type { PortalDashboard, PortalOriginMetrics } from "../../lib/scheduling/portalMetrics";
import { MotivoLabel } from "./MotivoLabel";

type Props = {
  data: PortalDashboard;
};

function tipoLabel(tipo: string): string {
  return tipo === "não informado(celulas em branco)" ? "N/I" : tipo;
}

function ExpandBtn({
  open,
  onClick,
  label,
}: {
  open: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className="btn secondary"
      aria-expanded={open}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ padding: "4px 10px" }}
    >
      {open ? "−" : "+"}
    </button>
  );
}

function OriginTops({ origin }: { origin: PortalOriginMetrics }) {
  return (
    <div className="portal-detail stack" style={{ marginTop: 12 }}>
      <h3 style={{ marginBottom: 8 }}>
        {origin.origin}
        <InfoTip>
          Pré-Venda {origin.preVenda} · Recepção {origin.recepcao}. Totais Su/Ag na origem
          selecionada.
        </InfoTip>
      </h3>

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

      {origin.topMotivos.length > 0 && (
        <>
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
                    <td>
                      <MotivoLabel motivo={m.motivo} ids={m.ids} />
                    </td>
                    <td>{m.quantidade}</td>
                    <td>{m.percentual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

export function PortaisDashboard({ data }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [expandedOrigins, setExpandedOrigins] = useState<Record<string, boolean>>({});
  const [expandedChannels, setExpandedChannels] = useState<Record<string, boolean>>({});
  const [selectedVolume, setSelectedVolume] = useState<string | null>(
    data.topByVolume[0]?.origin ?? null
  );
  const [selectedConversion, setSelectedConversion] = useState<string | null>(null);

  const selectedVolumeOrigin = useMemo(
    () => data.origins.find((o) => o.origin === selectedVolume) ?? null,
    [data.origins, selectedVolume]
  );
  const selectedConversionOrigin = useMemo(
    () => data.origins.find((o) => o.origin === selectedConversion) ?? null,
    [data.origins, selectedConversion]
  );

  const toggleGroup = (id: string) =>
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleOrigin = (key: string) =>
    setExpandedOrigins((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleChannel = (key: string) =>
    setExpandedChannels((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <>
      <div className="card">
        <h2>
          Portais
          <InfoTip>
            Cascata: <strong>Grupo</strong> → Origem → Canal. Cada ID conta uma vez, na primeira
            origem e no primeiro canal da célula. Atendimentos = REALIZADOS. Filtro:{" "}
            {data.uniqueLeads} atendimentos · {data.uniqueTotal} agendamentos.
          </InfoTip>
        </h2>
      </div>

      <div className="card">
        <h2>
          Ranking por grupo
          <InfoTip>
            Expanda grupo → origem → canal. A soma dos canais fecha com a origem. Clique no nome
            da origem para ver tops no bloco de volume.
          </InfoTip>
        </h2>
        <div className="table-scroll table-scroll--cascade">
          <table className="portal-cascade-table">
            <thead>
              <tr>
                <th></th>
                <th>Grupo / Origem / Canal / Proposta</th>
                <th>Atend.</th>
                <th>Ag.</th>
                <th>% Agend.</th>
                <th>Visitas</th>
                <th>Sucessos</th>
                <th>Insucessos</th>
                <th>Conv. visita</th>
                <th>Conv.</th>
              </tr>
            </thead>
            <tbody>
              {data.groups.map((g) => (
                <Fragment key={g.id}>
                  <tr className="portal-row-group">
                    <td>
                      <ExpandBtn
                        open={!!expandedGroups[g.id]}
                        onClick={() => toggleGroup(g.id)}
                        label={`Expandir grupo ${g.label}`}
                      />
                    </td>
                    <td>
                      <strong>{g.label}</strong>
                    </td>
                    <td>{g.atendimentos}</td>
                    <td>{g.total}</td>
                    <td>{g.taxaAgendamento}%</td>
                    <td>{g.visitas}</td>
                    <td className="num-ok">{g.sucessos}</td>
                    <td className="num-bad">{g.insucessos}</td>
                    <td>{g.taxaVisita}%</td>
                    <td className="num-ok">{g.taxaSucesso}%</td>
                  </tr>

                  {expandedGroups[g.id] &&
                    g.origins.map((o) => {
                      const originKey = `${g.id}::${o.origin}`;
                      const originOpen = !!expandedOrigins[originKey];
                      return (
                        <Fragment key={originKey}>
                          <tr
                            className={`portal-row-origin ${
                              selectedVolume === o.origin || selectedConversion === o.origin
                                ? "highlight-row"
                                : ""
                            }`}
                            style={{ cursor: "pointer" }}
                            onClick={() => setSelectedVolume(o.origin)}
                          >
                            <td>
                              <ExpandBtn
                                open={originOpen}
                                onClick={() => toggleOrigin(originKey)}
                                label={`Expandir origem ${o.origin}`}
                              />
                            </td>
                            <td style={{ paddingLeft: 20 }}>{o.origin}</td>
                            <td>{o.atendimentos}</td>
                            <td>{o.total}</td>
                            <td>{o.taxaAgendamento}%</td>
                            <td>{o.visitas}</td>
                            <td className="num-ok">{o.sucessos}</td>
                            <td className="num-bad">{o.insucessos}</td>
                            <td>{o.taxaVisita}%</td>
                            <td className="num-ok">{o.taxaSucesso}%</td>
                          </tr>

                          {originOpen &&
                            o.channels.map((c) => {
                              const chKey = `${originKey}::${c.canal}`;
                              const chOpen = !!expandedChannels[chKey];
                              return (
                                <Fragment key={chKey}>
                                  <tr className="portal-row-channel">
                                    <td>
                                      <ExpandBtn
                                        open={chOpen}
                                        onClick={() => toggleChannel(chKey)}
                                        label={`Expandir canal ${c.canal}`}
                                      />
                                    </td>
                                    <td style={{ paddingLeft: 40 }}>Canal · {c.canal}</td>
                                    <td>{c.atendimentos}</td>
                                    <td>{c.total}</td>
                                    <td>
                                      {c.atendimentos
                                        ? `${Math.round((c.total / c.atendimentos) * 1000) / 10}%`
                                        : "0%"}
                                    </td>
                                    <td>{c.visitas}</td>
                                    <td className="num-ok">{c.sucessos}</td>
                                    <td className="num-bad">{c.insucessos}</td>
                                    <td>{c.taxaVisita}%</td>
                                    <td className="num-ok">{c.taxaSucesso}%</td>
                                  </tr>

                                  {chOpen &&
                                    c.propostas.map((p) => (
                                      <tr key={`${chKey}::${p.tipo}`} className="portal-row-proposta">
                                        <td></td>
                                        <td style={{ paddingLeft: 60 }}>
                                          Proposta · {tipoLabel(p.tipo)}
                                        </td>
                                        <td>{p.atendimentos}</td>
                                        <td>{p.total}</td>
                                        <td>
                                          {p.atendimentos
                                            ? `${Math.round((p.total / p.atendimentos) * 1000) / 10}%`
                                            : "0%"}
                                        </td>
                                        <td>{p.visitas}</td>
                                        <td className="num-ok">{p.sucessos}</td>
                                        <td className="num-bad">{p.insucessos}</td>
                                        <td>{p.taxaVisita}%</td>
                                        <td className="num-ok">{p.taxaSucesso}%</td>
                                      </tr>
                                    ))}
                                </Fragment>
                              );
                            })}
                        </Fragment>
                      );
                    })}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="charts">
        <div className="card">
          <h2>
            Top 5 · volume (atendimentos)
            <InfoTip>Clique na origem para ver top SDR e top vendedores abaixo.</InfoTip>
          </h2>
          <div className="kpi-grid">
            {data.topByVolume.map((o) => (
              <button
                key={o.origin}
                type="button"
                className={`kpi-card ${selectedVolume === o.origin ? "accent" : ""}`}
                style={{ textAlign: "left", cursor: "pointer", border: "none", width: "100%" }}
                onClick={() => setSelectedVolume(o.origin)}
              >
                <h3>{o.origin}</h3>
                <p>{o.atendimentos}</p>
                <small className="muted">
                  {o.total} ag · Conv. {o.taxaSucesso}%
                </small>
              </button>
            ))}
          </div>
          {selectedVolumeOrigin && <OriginTops origin={selectedVolumeOrigin} />}
        </div>
        <div className="card">
          <h2>
            Top 5 · conversão
            <InfoTip>
              Mínimo 20 agendamentos. Clique na origem para ver top SDR e top vendedores abaixo.
            </InfoTip>
          </h2>
          <div className="kpi-grid">
            {data.topByConversion.map((o) => (
              <button
                key={o.origin}
                type="button"
                className={`kpi-card success num-ok ${
                  selectedConversion === o.origin ? "accent" : ""
                }`}
                style={{ textAlign: "left", cursor: "pointer", border: "none", width: "100%" }}
                onClick={() => setSelectedConversion(o.origin)}
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
          {selectedConversionOrigin && <OriginTops origin={selectedConversionOrigin} />}
        </div>
      </div>

      {data.periodSeriesTop.length > 0 && (
        <div className="card">
          <h2>Série por quinzena · top 5 portais (agendamentos)</h2>
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

      <div className="card">
        <h2>
          Volume de IDs por DDD
          {selectedVolumeOrigin ? ` · ${selectedVolumeOrigin.origin}` : ""}
          <InfoTip>
            Segue a origem clicada em Top 5 · volume. IDs únicos dos agendamentos dessa origem,
            pelo DDD do celular.
            {selectedVolumeOrigin && selectedVolumeOrigin.dddSemTelefone > 0
              ? ` ${selectedVolumeOrigin.dddSemTelefone} sem telefone.`
              : ""}
            {selectedVolumeOrigin && selectedVolumeOrigin.dddSemCodigo > 0
              ? ` ${selectedVolumeOrigin.dddSemCodigo} com DDD fora da lista Anatel.`
              : ""}
          </InfoTip>
        </h2>
        {!selectedVolumeOrigin ? (
          <p className="muted">Clique numa origem em Top 5 · volume para ver os DDDs.</p>
        ) : selectedVolumeOrigin.byDdd.length === 0 ? (
          <p className="muted">Nenhum ID com DDD reconhecido nesta origem.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>DDD</th>
                  <th>Cidade</th>
                  <th>UF</th>
                  <th>IDs</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {selectedVolumeOrigin.byDdd.map((row, i) => (
                  <tr key={row.ddd}>
                    <td>{i + 1}</td>
                    <td>
                      <strong>{row.ddd}</strong>
                    </td>
                    <td>{row.cidade}</td>
                    <td>{row.uf}</td>
                    <td>{row.ids}</td>
                    <td>{row.percentual}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

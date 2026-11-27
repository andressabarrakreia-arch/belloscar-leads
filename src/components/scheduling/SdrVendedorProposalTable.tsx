import { Fragment, useMemo, useState } from "react";
import type {
  SdrVendedorCruzadoId,
  SdrVendedorPairRow,
} from "../../lib/scheduling/metrics";
import {
  comparePreVendaSdrNames,
  round2,
  shortSdrName,
} from "../../lib/scheduling/metrics";
import { InfoTip } from "../InfoTip";

type Props = {
  rows: SdrVendedorPairRow[];
};

type SdrGroup = {
  sdr: string;
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  compra: number;
  venda: number;
  troca: number;
  consignacao: number;
  financiamento: number;
  naoInformado: number;
  vendedores: SdrVendedorPairRow[];
};

type MetricRow = {
  total: number;
  visitas: number;
  sucessos: number;
  insucessos: number;
  taxaVisita: number;
  taxaSucesso: number;
  compra: number;
  venda: number;
  troca: number;
  consignacao: number;
  financiamento: number;
  naoInformado: number;
};

function sumGroup(sdr: string, vendedores: SdrVendedorPairRow[]): SdrGroup {
  let total = 0;
  let visitas = 0;
  let sucessos = 0;
  let insucessos = 0;
  let compra = 0;
  let venda = 0;
  let troca = 0;
  let consignacao = 0;
  let financiamento = 0;
  let naoInformado = 0;
  for (const row of vendedores) {
    total += row.total;
    visitas += row.visitas;
    sucessos += row.sucessos;
    insucessos += row.insucessos;
    compra += row.compra;
    venda += row.venda;
    troca += row.troca;
    consignacao += row.consignacao;
    financiamento += row.financiamento;
    naoInformado += row.naoInformado;
  }
  return {
    sdr,
    total,
    visitas,
    sucessos,
    insucessos,
    taxaVisita: round2(total ? (visitas / total) * 100 : 0),
    taxaSucesso: round2(total ? (sucessos / total) * 100 : 0),
    compra,
    venda,
    troca,
    consignacao,
    financiamento,
    naoInformado,
    vendedores,
  };
}

function MetricCells({ row }: { row: MetricRow }) {
  return (
    <>
      <td className="col-metric col-metric--volume">{row.total}</td>
      <td className="col-metric">{row.compra}</td>
      <td className="col-metric">{row.venda}</td>
      <td className="col-metric">{row.troca}</td>
      <td className="col-metric">{row.consignacao}</td>
      <td className="col-metric">{row.financiamento}</td>
      <td className="col-metric">{row.naoInformado}</td>
      <td className="col-metric col-metric--resultado">{row.visitas}</td>
      <td className="col-metric col-metric--resultado num-ok">{row.sucessos}</td>
      <td className="col-metric col-metric--resultado num-bad">{row.insucessos}</td>
      <td className="col-metric col-metric--taxa">{row.taxaVisita}%</td>
      <td className="col-metric col-metric--taxa num-ok">{row.taxaSucesso}%</td>
    </>
  );
}

function sdrAgendadoLabel(row: SdrVendedorCruzadoId): string {
  return `${shortSdrName(row.sdr)} / por ${shortSdrName(row.agendadoPor)}`;
}

function sdrAgendadoTitle(row: SdrVendedorCruzadoId): string {
  return `${row.sdr} / agendado por ${row.agendadoPor}`;
}

export function SdrVendedorProposalTable({ rows }: Props) {
  const [abertosSdr, setAbertosSdr] = useState<string[]>([]);
  const [abertosVend, setAbertosVend] = useState<string[]>([]);

  const grupos = useMemo(() => {
    const map = new Map<string, SdrVendedorPairRow[]>();
    for (const row of rows) {
      const list = map.get(row.sdr) || [];
      list.push(row);
      map.set(row.sdr, list);
    }
    return [...map.entries()]
      .map(([sdr, vendedores]) =>
        sumGroup(
          sdr,
          [...vendedores].sort((a, b) => a.vendedor.localeCompare(b.vendedor, "pt-BR"))
        )
      )
      .sort((a, b) => comparePreVendaSdrNames(a.sdr, b.sdr));
  }, [rows]);

  function alternarSdr(sdr: string) {
    setAbertosSdr((atual) =>
      atual.includes(sdr) ? atual.filter((item) => item !== sdr) : [...atual, sdr]
    );
  }

  function alternarVend(chave: string) {
    setAbertosVend((atual) =>
      atual.includes(chave) ? atual.filter((item) => item !== chave) : [...atual, chave]
    );
  }

  function expandirTodos() {
    setAbertosSdr(grupos.map((g) => g.sdr));
  }

  function recolherTodos() {
    setAbertosSdr([]);
    setAbertosVend([]);
  }

  return (
    <div className="card card--sdr-cruzamento">
      <div className="sdr-cruzamento__cabecalho">
        <h2>
          Comparação direta: agendamentos × proposta
          <InfoTip>
            Pré-Venda — visitas e sucessos pelo responsável do atendimento (não por quem agendou).
            Uma linha por SDR; o + abre os vendedores. Se o ID foi agendado por outra pessoa, o + no
            vendedor mostra esse ID com “SDR / agendado por …”. Ordem: Allan → Thayna → Lais → Matheus
            → Liriane.
          </InfoTip>
        </h2>
        <div className="sdr-cruzamento__acoes">
          <button type="button" className="btn secondary" onClick={expandirTodos}>
            Expandir todos
          </button>
          <button type="button" className="btn secondary" onClick={recolherTodos}>
            Recolher
          </button>
        </div>
      </div>

      <div className="table-scroll table-scroll--sdr-cruzamento" tabIndex={0}>
        <table className="table-sticky-head sdr-vendedor-expande sdr-cruzamento-table">
          <thead>
            <tr className="sdr-cruzamento-table__grupos">
              <th colSpan={2} scope="colgroup">
                Quem
              </th>
              <th colSpan={1} scope="colgroup">
                Volume
              </th>
              <th colSpan={6} scope="colgroup">
                Tipo de proposta
              </th>
              <th colSpan={3} scope="colgroup">
                Resultado
              </th>
              <th colSpan={2} scope="colgroup">
                Taxas
              </th>
            </tr>
            <tr className="sdr-cruzamento-table__cols">
              <th className="col-sticky col-sticky--sdr">SDR</th>
              <th className="col-sticky col-sticky--vend">Vendedor</th>
              <th className="col-metric col-metric--volume">Agend.</th>
              <th className="col-metric">Compra</th>
              <th className="col-metric">Venda</th>
              <th className="col-metric">Troca</th>
              <th className="col-metric">Consign.</th>
              <th className="col-metric">Financ.</th>
              <th className="col-metric">N/I</th>
              <th className="col-metric col-metric--resultado">Visitas</th>
              <th className="col-metric col-metric--resultado">Sucessos</th>
              <th className="col-metric col-metric--resultado">Insucessos</th>
              <th className="col-metric col-metric--taxa">% Visita</th>
              <th className="col-metric col-metric--taxa">% Sucesso</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo) => {
              const sdrAberto = abertosSdr.includes(grupo.sdr);
              return (
                <Fragment key={grupo.sdr}>
                  <tr className="sdr-pai">
                    <td className="col-sticky col-sticky--sdr">
                      <button
                        type="button"
                        className="marca-mais"
                        aria-expanded={sdrAberto}
                        aria-label={
                          sdrAberto
                            ? `Fechar vendedores de ${grupo.sdr}`
                            : `Abrir vendedores de ${grupo.sdr}`
                        }
                        onClick={() => alternarSdr(grupo.sdr)}
                      >
                        {sdrAberto ? "−" : "+"}
                      </button>
                      <span className="sdr-cruzamento__nome" title={grupo.sdr}>
                        {shortSdrName(grupo.sdr)}
                      </span>
                    </td>
                    <td className="col-sticky col-sticky--vend muted">
                      {grupo.vendedores.length}{" "}
                      {grupo.vendedores.length === 1 ? "vend." : "vends."}
                    </td>
                    <MetricCells row={grupo} />
                  </tr>
                  {sdrAberto
                    ? grupo.vendedores.map((row) => {
                        const chave = `${row.sdr}::${row.vendedor}`;
                        const temCruzados = row.cruzados.length > 0;
                        const vendAberto = abertosVend.includes(chave);
                        return (
                          <Fragment key={chave}>
                            <tr className="modelo-filho sdr-filho">
                              <td className="col-sticky col-sticky--sdr muted">
                                {temCruzados ? (
                                  <button
                                    type="button"
                                    className="marca-mais"
                                    aria-expanded={vendAberto}
                                    aria-label={
                                      vendAberto
                                        ? `Fechar IDs agendados por outra pessoa · ${row.vendedor}`
                                        : `Abrir IDs agendados por outra pessoa · ${row.vendedor}`
                                    }
                                    onClick={() => alternarVend(chave)}
                                  >
                                    {vendAberto ? "−" : "+"}
                                  </button>
                                ) : (
                                  <span className="marca-mais marca-mais--fantasma" aria-hidden="true" />
                                )}
                                <span className="sdr-cruzamento__nome" title={row.sdr}>
                                  {shortSdrName(row.sdr)}
                                </span>
                              </td>
                              <td className="col-sticky col-sticky--vend" title={row.vendedor}>
                                {row.vendedor}
                              </td>
                              <MetricCells row={row} />
                            </tr>
                            {vendAberto
                              ? row.cruzados.map((cruzado) => (
                                  <tr
                                    className="modelo-filho sdr-neto"
                                    key={`${chave}::${cruzado.id}`}
                                  >
                                    <td
                                      className="col-sticky col-sticky--sdr sdr-neto__sdr"
                                      title={sdrAgendadoTitle(cruzado)}
                                    >
                                      {sdrAgendadoLabel(cruzado)}
                                    </td>
                                    <td className="col-sticky col-sticky--vend" title={cruzado.vendedor}>
                                      <span className="muted">ID {cruzado.id}</span>
                                    </td>
                                    <MetricCells row={cruzado} />
                                  </tr>
                                ))
                              : null}
                          </Fragment>
                        );
                      })
                    : null}
                </Fragment>
              );
            })}
            {grupos.length === 0 && (
              <tr>
                <td colSpan={14} className="muted">
                  Nenhum par SDR × Vendedor com agendamentos no filtro atual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

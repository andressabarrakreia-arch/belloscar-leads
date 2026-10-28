import { Fragment, useMemo, useState } from "react";
import type {
  SdrVendedorCruzadoId,
  SdrVendedorPairRow,
} from "../../lib/scheduling/metrics";
import { comparePreVendaSdrNames, round2 } from "../../lib/scheduling/metrics";
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
      <td>{row.total}</td>
      <td>{row.compra}</td>
      <td>{row.venda}</td>
      <td>{row.troca}</td>
      <td>{row.consignacao}</td>
      <td>{row.financiamento}</td>
      <td>{row.naoInformado}</td>
      <td>{row.visitas}</td>
      <td className="num-ok">{row.sucessos}</td>
      <td className="num-bad">{row.insucessos}</td>
      <td>{row.taxaVisita}%</td>
      <td className="num-ok">{row.taxaSucesso}%</td>
    </>
  );
}

function sdrAgendadoLabel(row: SdrVendedorCruzadoId): string {
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

  return (
    <div className="card">
      <h2>
        Comparação direta: agendamentos × proposta
        <InfoTip>
          Pré-Venda — visitas e sucessos pelo responsável do atendimento (não por quem agendou).
          Uma linha por SDR; o + abre os vendedores. Se o ID foi agendado por outra pessoa, o + no
          vendedor mostra esse ID com “SDR / agendado por …”. Ordem: Allan → Thayna → Lais → Matheus
          → Liriane.
        </InfoTip>
      </h2>
      <div className="table-scroll table-scroll--sticky-head" tabIndex={0}>
        <table className="table-sticky-head sdr-vendedor-expande">
          <thead>
            <tr>
              <th>SDR</th>
              <th>Vendedor</th>
              <th>Agendamentos</th>
              <th>Compra</th>
              <th>Venda</th>
              <th>Troca</th>
              <th>Consign.</th>
              <th>Financ.</th>
              <th>N/I</th>
              <th>Visitas</th>
              <th>Sucessos</th>
              <th>Insucessos</th>
              <th>% Visita</th>
              <th>% Sucesso</th>
            </tr>
          </thead>
          <tbody>
            {grupos.map((grupo) => {
              const sdrAberto = abertosSdr.includes(grupo.sdr);
              return (
                <Fragment key={grupo.sdr}>
                  <tr className="sdr-pai">
                    <td>
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
                      {grupo.sdr}
                    </td>
                    <td className="muted">
                      {grupo.vendedores.length}{" "}
                      {grupo.vendedores.length === 1 ? "vendedor" : "vendedores"}
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
                              <td className="muted">
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
                                ) : null}
                                {row.sdr}
                              </td>
                              <td>{row.vendedor}</td>
                              <MetricCells row={row} />
                            </tr>
                            {vendAberto
                              ? row.cruzados.map((cruzado) => (
                                  <tr
                                    className="modelo-filho sdr-neto"
                                    key={`${chave}::${cruzado.id}`}
                                  >
                                    <td className="sdr-neto__sdr">{sdrAgendadoLabel(cruzado)}</td>
                                    <td>
                                      <span className="muted">ID {cruzado.id}</span>
                                      <span className="sdr-neto__vend"> · {cruzado.vendedor}</span>
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

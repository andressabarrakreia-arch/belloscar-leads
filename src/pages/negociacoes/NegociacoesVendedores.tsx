import { useEffect, useMemo, useRef, useState } from "react";
import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { useNegociacoesAnalyticsContext } from "../../context/NegociacoesAnalyticsContext";
import { currentMonthKey } from "../../lib/dates";

function mesLabel(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  if (!year || !month) return ym;
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function mesAnterior(): string {
  const hoje = new Date();
  return currentMonthKey(new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1));
}

export function NegociacoesVendedores() {
  const { analytics, dataset } = useNegociacoesAnalyticsContext();
  const mesPadrao = useMemo(() => mesAnterior(), []);
  const [mesAvaliacao, setMesAvaliacao] = useState(mesPadrao);
  const [mesesAberto, setMesesAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const mesesAvaliacao = useMemo(() => {
    const meses = new Set<string>([mesPadrao]);
    for (const row of dataset?.avaliacoes ?? []) if (row.monthKey) meses.add(row.monthKey);
    return [...meses].sort((a, b) => b.localeCompare(a));
  }, [dataset, mesPadrao]);

  const avaliacoesMes = useMemo(
    () => (dataset?.avaliacoes ?? []).filter((row) => row.monthKey === mesAvaliacao),
    [dataset, mesAvaliacao]
  );

  useEffect(() => {
    if (!mesesAberto) return;
    function fechar(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) setMesesAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [mesesAberto]);

  if (!analytics) return null;

  const { vendedores, rankings } = analytics;

  return (
    <>
      <div className="charts charts--full">
        <ShareDonut
          title="Total por vendedor"
          grande
          data={vendedores.map((row) => ({ label: row.vendedor, value: row.total }))}
        />
      </div>
      <div className="card">
        <h2>
          Desempenho por vendedor
          <InfoTip>Vendas + Trocas · Consignações · Compras · Total (filtro atual).</InfoTip>
        </h2>
        <InteractiveTable
          rows={vendedores}
          rowKey={(row) => row.vendedor}
          columns={[
            { key: "vendedor", label: "Vendedor", sortValue: (row) => row.vendedor },
            { key: "vendas", label: "Vendas", sortValue: (row) => row.vendas, render: (row) => <span className="num-ok">{row.vendas}</span> },
            { key: "trocas", label: "Trocas", sortValue: (row) => row.trocas },
            { key: "vt", label: "Vendas + Trocas", sortValue: (row) => row.vendasMaisTrocas },
            { key: "consignacoes", label: "Consignações", sortValue: (row) => row.consignacoes },
            { key: "compras", label: "Compras", sortValue: (row) => row.compras },
            { key: "total", label: "Total", sortValue: (row) => row.total },
          ]}
        />
      </div>

      <div className="card">
        <h2>
          Rankings
          <InfoTip>
            Uma linha por colocação. Cada bloco mostra o vendedor e a quantidade daquela métrica.
          </InfoTip>
        </h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th rowSpan={2}>#</th>
                <th colSpan={2}>Vendas + Trocas</th>
                <th colSpan={2}>Compras</th>
                <th colSpan={2}>Consignações</th>
              </tr>
              <tr>
                <th>Vendedor</th>
                <th>Qtde</th>
                <th>Vendedor</th>
                <th>Qtde</th>
                <th>Vendedor</th>
                <th>Qtde</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr key={r.pos}>
                  <td>{r.pos}</td>
                  <td>{r.vendasTrocas?.vendedor || "—"}</td>
                  <td>{r.vendasTrocas ? r.vendasTrocas.qtde : "—"}</td>
                  <td>{r.compras?.vendedor || "—"}</td>
                  <td>{r.compras ? r.compras.qtde : "—"}</td>
                  <td>{r.consignacoes?.vendedor || "—"}</td>
                  <td>{r.consignacoes ? r.consignacoes.qtde : "—"}</td>
                </tr>
              ))}
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={7} className="muted">
                    Sem dados de ranking no filtro atual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="avaliacao-titulo">
          <span>
            Conversão de avaliações
            <InfoTip>
              Mês fechado, separado do filtro da página. Abre no mês anterior. % = Aprovadas / Realizadas.
            </InfoTip>
          </span>
          <div className="mes-mini" ref={menuRef}>
            <button
              type="button"
              className="btn secondary mes-mini__btn"
              aria-expanded={mesesAberto}
              aria-haspopup="listbox"
              onClick={() => setMesesAberto((aberto) => !aberto)}
            >
              {mesLabel(mesAvaliacao)}
            </button>
            {mesesAberto ? (
              <ul className="mes-mini__lista" role="listbox" aria-label="Mês da conversão">
                {mesesAvaliacao.map((mes) => (
                  <li key={mes}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={mes === mesAvaliacao}
                      className={mes === mesAvaliacao ? "is-on" : ""}
                      onClick={() => {
                        setMesAvaliacao(mes);
                        setMesesAberto(false);
                      }}
                    >
                      {mesLabel(mes)}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </h2>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Vendedor</th>
                <th>Realizadas</th>
                <th>Aprovadas</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {[...avaliacoesMes]
                .sort(
                  (a, b) =>
                    b.percentual - a.percentual ||
                    b.realizadas - a.realizadas ||
                    a.vendedor.localeCompare(b.vendedor, "pt-BR")
                )
                .map((r) => (
                  <tr key={`${r.monthKey}-${r.vendedor}`}>
                    <td>{r.vendedor}</td>
                    <td>{r.realizadas}</td>
                    <td>{r.aprovadas}</td>
                    <td>{r.percentual}%</td>
                  </tr>
                ))}
              {avaliacoesMes.length === 0 && (
                <tr>
                  <td colSpan={4} className="muted">
                    Sem avaliações em {mesLabel(mesAvaliacao)}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

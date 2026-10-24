import { Fragment, useEffect, useMemo, useState } from "react";
import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { useModuleTicker } from "../../context/ModuleTickerContext";
import { currentMonthKey } from "../../lib/dates";
import { dealsFromLines } from "../../lib/negociacoes/metrics";
import { mesesDisponiveis, perfilDoMes, type Contagem, type ModeloContagem } from "../../lib/perfil/analytics";
import { useNegociacoesStore } from "../../hooks/useNegociacoesStore";
import { useSchedulingStore } from "../../hooks/useSchedulingStore";

function mesLabel(ym: string): string {
  const [year, month] = ym.split("-").map(Number);
  if (!year || !month) return ym;
  const label = new Date(year, month - 1, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function pct(value: number): string {
  return `${value.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

function conta(n: number, um: string, varios: string): string {
  return `${n.toLocaleString("pt-BR")} ${n === 1 ? um : varios}`;
}

function nomeDoModelo(row: ModeloContagem): string {
  const prefixo = `${row.marca} `;
  return row.nome.startsWith(prefixo) ? row.nome.slice(prefixo.length) : row.nome;
}

function gruposPorMarca(rows: ModeloContagem[], total: number) {
  const mapa = new Map<string, ModeloContagem[]>();
  for (const row of rows) {
    const lista = mapa.get(row.marca) ?? [];
    lista.push(row);
    mapa.set(row.marca, lista);
  }
  return [...mapa.entries()]
    .map(([marca, modelos]) => {
      const quantidade = modelos.reduce((soma, row) => soma + row.quantidade, 0);
      const vendidos = modelos.reduce((soma, row) => soma + row.vendidos, 0);
      const comprados = modelos.reduce((soma, row) => soma + row.comprados, 0);
      const consignados = modelos.reduce((soma, row) => soma + row.consignados, 0);
      return {
        marca,
        quantidade,
        vendidos,
        comprados,
        consignados,
        percentual: total ? Math.round((quantidade / total) * 1000) / 10 : 0,
        modelos: [...modelos].sort(
          (a, b) => b.quantidade - a.quantidade || nomeDoModelo(a).localeCompare(nomeDoModelo(b), "pt-BR")
        ),
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade || a.marca.localeCompare(b.marca, "pt-BR"));
}

function fatias(rows: Contagem[], limite: number, resto: string): { label: string; value: number }[] {
  const topo = rows.slice(0, limite).map((row) => ({ label: row.nome, value: row.quantidade }));
  const outros = rows.slice(limite).reduce((sum, row) => sum + row.quantidade, 0);
  if (outros > 0) topo.push({ label: resto, value: outros });
  return topo;
}

export function PerfilClientes() {
  const negociacoes = useNegociacoesStore();
  const agendamentos = useSchedulingStore();
  const { setOverrideItems } = useModuleTicker();
  const [month, setMonth] = useState(currentMonthKey);
  const [marca, setMarca] = useState("all");
  const [marcasAbertas, setMarcasAbertas] = useState<string[]>([]);

  const deals = useMemo(
    () => (negociacoes.dataset ? dealsFromLines(negociacoes.dataset.lines) : []),
    [negociacoes.dataset]
  );
  const itens = agendamentos.dataset?.items ?? [];
  const meses = useMemo(() => mesesDisponiveis(deals, itens), [deals, itens]);
  const perfil = useMemo(() => perfilDoMes(deals, itens, month), [deals, itens, month]);
  const modelos = useMemo(
    () => (marca === "all" ? perfil.modelos : perfil.modelos.filter((row) => row.marca === marca)),
    [marca, perfil.modelos]
  );
  const totalModelos = useMemo(
    () => perfil.modelos.reduce((soma, row) => soma + row.quantidade, 0),
    [perfil.modelos]
  );
  const grupos = useMemo(() => gruposPorMarca(modelos, totalModelos), [modelos, totalModelos]);
  const destaques = modelos.slice(0, 3);

  useEffect(() => {
    const marcaTopo = perfil.marcas[0];
    const motivoTopo = perfil.motivos[0];
    const feminino = perfil.genero.find((row) => row.nome === "Feminino");
    const masculino = perfil.genero.find((row) => row.nome === "Masculino");
    const itensTicker = [
      marcaTopo ? `Marca em destaque: ${marcaTopo.nome} · ${pct(marcaTopo.percentual)}` : "",
      feminino || masculino
        ? `Clientes: ${pct(feminino?.percentual ?? 0)} feminino · ${pct(masculino?.percentual ?? 0)} masculino`
        : "",
      motivoTopo ? `Principal recusa: ${motivoTopo.nome}` : "",
    ].filter(Boolean);
    setOverrideItems(itensTicker.length ? itensTicker : null);
    return () => setOverrideItems(null);
  }, [perfil, setOverrideItems]);

  useEffect(() => {
    if (marca !== "all" && !perfil.marcas.some((row) => row.nome === marca)) setMarca("all");
  }, [marca, perfil.marcas]);

  useEffect(() => {
    setMarcasAbertas([]);
  }, [month, marca]);

  function alternarMarca(nome: string) {
    setMarcasAbertas((atual) =>
      atual.includes(nome) ? atual.filter((item) => item !== nome) : [...atual, nome]
    );
  }

  const carregando = negociacoes.loading || agendamentos.loading;

  return (
    <>
      <div className="card report-signature">
        <p>
          <strong>Módulo:</strong> Perfil de Clientes · <strong>Marcas e modelos</strong> saem das negociações da loja.{" "}
          <strong>Motivos</strong> saem dos insucessos da agenda.
        </p>
        <p className="muted">
          O gênero não vem na planilha. É uma estimativa pelo primeiro nome do cliente da negociação, e quem não dá para
          ler fica em Não identificado.
        </p>
      </div>

      {negociacoes.error ? <p className="error">{negociacoes.error}</p> : null}
      {agendamentos.error ? <p className="error">{agendamentos.error}</p> : null}

      <div className="card">
        <h2>
          Recorte
          <InfoTip>O mês vale para os três blocos: carros, clientes e motivos de não fechamento.</InfoTip>
        </h2>
        <div className="filters" role="search" aria-label="Filtros do perfil">
          <label>
            Mês
            <select value={month} onChange={(event) => setMonth(event.target.value)}>
              <option value="all">Todo o período</option>
              {(meses.includes(month) || month === "all" ? meses : [month, ...meses]).map((item) => (
                <option key={item} value={item}>
                  {mesLabel(item)}
                </option>
              ))}
            </select>
          </label>
          <label>
            Marca
            <select value={marca} onChange={(event) => setMarca(event.target.value)}>
              <option value="all">Todas</option>
              {perfil.marcas.map((row) => (
                <option key={row.nome} value={row.nome}>
                  {row.nome}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="kpi-grid">
          <div className="kpi-card accent">
            <h3>Negócios</h3>
            <p>{carregando ? "…" : perfil.negocios.toLocaleString("pt-BR")}</p>
          </div>
          <div className="kpi-card">
            <h3>Clientes</h3>
            <p>{carregando ? "…" : perfil.clientes.toLocaleString("pt-BR")}</p>
          </div>
          <div className="kpi-card">
            <h3>Marcas</h3>
            <p>{carregando ? "…" : perfil.marcas.length.toLocaleString("pt-BR")}</p>
          </div>
          <div className="kpi-card">
            <h3>Insucessos</h3>
            <p>{carregando ? "…" : perfil.insucessos.toLocaleString("pt-BR")}</p>
          </div>
        </div>
      </div>

      <div className="charts">
        <ShareDonut
          title="Marcas"
          tip="Cada negócio conta uma vez, pelo veículo que saiu. Na troca, o carro de entrada fica de fora."
          data={fatias(perfil.marcas, 8, "Outras")}
        />
        <ShareDonut
          title="Gênero dos clientes"
          tip="Um cliente por nome nas negociações do recorte. Estimado pelo primeiro nome."
          data={perfil.genero.map((row) => ({ label: row.nome, value: row.quantidade }))}
        />
      </div>

      <div className="card">
        <h2>
          {marca === "all" ? "Modelos em destaque" : `Modelos em destaque · ${marca}`}
          <InfoTip>
            O número é a soma de vendidos, comprados e consignados desse modelo. Na troca, o carro de
            entrada conta como compra e o de saída como venda.
          </InfoTip>
        </h2>
        {destaques.length === 0 ? (
          <p className="muted">Sem modelos neste recorte.</p>
        ) : (
          <div className="kpi-grid kpi-grid--tres">
            {destaques.map((row, index) => (
              <div className={index === 0 ? "kpi-card modelo-destaque accent" : "kpi-card modelo-destaque"} key={row.nome}>
                <h3>{row.nome}</h3>
                <p>{row.quantidade.toLocaleString("pt-BR")}</p>
                <small className="kpi-lider">
                  {conta(row.vendidos, "vendido", "vendidos")} · {conta(row.comprados, "comprado", "comprados")} ·{" "}
                  {conta(row.consignados, "consignado", "consignados")}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2>
          Modelos
          <InfoTip>
            O + abre os modelos. Comprados, consignados e vendidos são de cada modelo. Na troca, a entrada
            entra em comprados e a saída em vendidos.
          </InfoTip>
        </h2>
        {grupos.length === 0 ? (
          <p className="muted">Sem modelos neste recorte.</p>
        ) : (
          <div className="table-scroll">
            <table className="modelos-marca">
              <thead>
                <tr>
                  <th>Marca</th>
                  <th>Comprados</th>
                  <th>Consignados</th>
                  <th>Vendidos</th>
                  <th>Total</th>
                  <th>% do recorte</th>
                </tr>
              </thead>
              <tbody>
                {grupos.map((grupo) => {
                  const aberta = marcasAbertas.includes(grupo.marca);
                  return (
                    <Fragment key={grupo.marca}>
                      <tr>
                        <td>
                          <button
                            type="button"
                            className="marca-mais"
                            aria-expanded={aberta}
                            aria-label={aberta ? `Fechar modelos de ${grupo.marca}` : `Abrir modelos de ${grupo.marca}`}
                            onClick={() => alternarMarca(grupo.marca)}
                          >
                            {aberta ? "−" : "+"}
                          </button>
                          {grupo.marca}
                        </td>
                        <td>{grupo.comprados.toLocaleString("pt-BR")}</td>
                        <td>{grupo.consignados.toLocaleString("pt-BR")}</td>
                        <td>{grupo.vendidos.toLocaleString("pt-BR")}</td>
                        <td>{grupo.quantidade.toLocaleString("pt-BR")}</td>
                        <td>{pct(grupo.percentual)}</td>
                      </tr>
                      {aberta
                        ? grupo.modelos.map((row) => (
                            <tr className="modelo-filho" key={row.nome}>
                              <td>{nomeDoModelo(row)}</td>
                              <td>{row.comprados.toLocaleString("pt-BR")}</td>
                              <td>{row.consignados.toLocaleString("pt-BR")}</td>
                              <td>{row.vendidos.toLocaleString("pt-BR")}</td>
                              <td>{row.quantidade.toLocaleString("pt-BR")}</td>
                              <td>{pct(row.percentual)}</td>
                            </tr>
                          ))
                        : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="charts charts--full">
        <ShareDonut
          grande
          title="Motivos de não fechamento"
          tip="Os 8 motivos com mais insucessos aparecem separados. O restante entra junto na fatia Outros. A porcentagem aqui é arredondada. A tabela abaixo lista cada motivo, com uma casa decimal."
          data={fatias(perfil.motivos, 8, "Outros")}
        />
      </div>

      <div className="card">
        <h2>
          Principais motivos
          <InfoTip>
            Cada linha é um motivo dos agendamentos com status Insucesso neste mês, pela data em que
            foram agendados. A quantidade é quantos desses agendamentos têm aquele texto. O gráfico
            junta os menores em Outros e não mostra essa soma como uma linha da tabela.
          </InfoTip>
        </h2>
        <InteractiveTable<Contagem>
          rows={perfil.motivos}
          rowKey={(row) => row.nome}
          columns={[
            { key: "nome", label: "Motivo", sortValue: (row) => row.nome },
            {
              key: "quantidade",
              label: "Insucessos",
              align: "right",
              sortValue: (row) => row.quantidade,
              render: (row) => row.quantidade.toLocaleString("pt-BR"),
            },
            {
              key: "percentual",
              label: "% dos insucessos",
              align: "right",
              sortValue: (row) => row.percentual,
              render: (row) => pct(row.percentual),
            },
          ]}
        />
      </div>
    </>
  );
}

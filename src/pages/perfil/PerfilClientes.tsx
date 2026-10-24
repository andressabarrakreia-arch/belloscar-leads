import { useEffect, useMemo, useState } from "react";
import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { ShareDonut } from "../../components/charts/ShareDonut";
import { VegaBarras } from "../../components/viz/VegaBarras";
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

      <VegaBarras
        titulo={marca === "all" ? "Modelos em destaque" : `Modelos · ${marca}`}
        dica="Os doze modelos com mais negócios no recorte. O mouse mostra a quantidade."
        dados={modelos.slice(0, 12).map((row) => ({ nome: row.nome, negocios: row.quantidade }))}
        nome="nome"
        valor="negocios"
        valorLabel="Negócios"
      />

      <div className="card">
        <h2>Modelos</h2>
        <InteractiveTable<ModeloContagem>
          rows={modelos}
          rowKey={(row) => row.nome}
          columns={[
            { key: "nome", label: "Modelo", sortValue: (row) => row.nome },
            { key: "marca", label: "Marca", sortValue: (row) => row.marca },
            {
              key: "quantidade",
              label: "Negócios",
              align: "right",
              sortValue: (row) => row.quantidade,
              render: (row) => row.quantidade.toLocaleString("pt-BR"),
            },
            {
              key: "percentual",
              label: "% do recorte",
              align: "right",
              sortValue: (row) => row.percentual,
              render: (row) => pct(row.percentual),
            },
          ]}
        />
      </div>

      <div className="charts">
        <ShareDonut
          title="Motivos de não fechamento"
          tip="Insucessos da agenda no mesmo mês. A porcentagem é sobre os insucessos do recorte."
          data={fatias(perfil.motivos, 8, "Outros")}
        />
      </div>

      <div className="card">
        <h2>Principais motivos</h2>
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

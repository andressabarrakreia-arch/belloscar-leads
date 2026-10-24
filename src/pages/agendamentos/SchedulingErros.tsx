import { useMemo, useState } from "react";
import { InfoTip } from "../../components/InfoTip";
import { InteractiveTable } from "../../components/InteractiveTable";
import { Button } from "../../components/ui/button";
import { useSchedulingStore } from "../../hooks/useSchedulingStore";
import {
  buildErrosCruzamento,
  ERRO_CATEGORIAS,
  type ErroCategoria,
  type ErroIdLinha,
  type PresencaPlanilha,
} from "../../lib/scheduling/errosCruzamento";

function PresencaCell({ value }: { value: PresencaPlanilha }) {
  if (value === "esta") return <span className="num-ok">Está</span>;
  if (value === "nao") return <span className="num-bad">Não está</span>;
  return <span className="muted">Não está</span>;
}

function presencaRank(value: PresencaPlanilha): number {
  if (value === "nao") return 0;
  if (value === "nao-erro") return 1;
  return 2;
}

function formatWhen(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("pt-BR");
}

export function SchedulingErros() {
  const { dataset, loading, error } = useSchedulingStore();
  const [categoria, setCategoria] = useState<ErroCategoria | "todos">("todos");
  const [query, setQuery] = useState("");
  const [copyNote, setCopyNote] = useState<string | null>(null);

  const report = useMemo(
    () => (dataset ? buildErrosCruzamento(dataset) : null),
    [dataset]
  );

  const counts = useMemo(() => {
    const map = new Map<ErroCategoria, number>();
    for (const item of ERRO_CATEGORIAS) map.set(item.id, 0);
    for (const row of report?.linhas || []) {
      for (const categoria of row.categorias) map.set(categoria, (map.get(categoria) || 0) + 1);
    }
    return map;
  }, [report]);

  const visible = useMemo(() => {
    const rows = report?.linhas || [];
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (categoria !== "todos" && !row.categorias.includes(categoria)) return false;
      if (!q) return true;
      const blob = `${row.id} ${row.estaEm} ${row.faltaEm} ${row.observacao} ${row.responsavel} ${row.cliente}`.toLowerCase();
      return blob.includes(q);
    });
  }, [report, categoria, query]);

  async function copyIds() {
    const ids = [...new Set(visible.map((row) => row.id))].join("\n");
    try {
      await navigator.clipboard.writeText(ids);
      setCopyNote(`${new Set(visible.map((row) => row.id)).size} IDs copiados.`);
    } catch {
      setCopyNote("Não foi possível copiar daqui. Selecione os IDs na tabela.");
    }
  }

  if (loading) return <p className="muted">Carregando erros de cruzamento…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!dataset || !report) return null;

  const totalFora = report.insucessosForaDaAgendaTotal;
  const amostra = report.insucessosForaDaAgendaAmostra;

  return (
    <>
      <div className="card">
        <h2>
          Erros de cruzamento
          <InfoTip>
            Cada linha é um ID com falha entre Agenda, Leads Geral, Realizados, Sucessos ou a
            planilha de insucessos. A lista usa a base inteira, sem filtro de mês.
          </InfoTip>
        </h2>
        <p className="muted">
          {report.linhas.length.toLocaleString("pt-BR")} IDs
          {formatWhen(dataset.updatedAt) ? ` · base de ${formatWhen(dataset.updatedAt)}` : ""}.
          Cada linha é um ID. Verde está na planilha. Vermelho é a planilha em que ele falta.
        </p>
        {totalFora != null && totalFora > amostra ? (
          <p className="muted">
            A última planilha de insucessos deixou {totalFora.toLocaleString("pt-BR")} IDs fora da
            agenda. O log de importação guardou {amostra.toLocaleString("pt-BR")} números; a tabela
            mostra esses IDs, que continuam ausentes da agenda.
          </p>
        ) : null}
        {report.checagensLimpas.length > 0 ? (
          <p className="muted">{report.checagensLimpas.join(" · ")}.</p>
        ) : null}
      </div>

      <div className="kpi-grid">
        <button
          type="button"
          className={`kpi-card${categoria === "todos" ? " is-on" : ""}`}
          onClick={() => setCategoria("todos")}
        >
          <h3>Todos</h3>
          <p>{report.linhas.length}</p>
        </button>
        {ERRO_CATEGORIAS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`kpi-card num-bad${categoria === item.id ? " is-on" : ""}`}
            onClick={() => setCategoria(item.id)}
          >
            <h3>{item.label}</h3>
            <p>{counts.get(item.id) || 0}</p>
          </button>
        ))}
      </div>

      <div className="card">
        <h2>
          {categoria === "todos"
            ? "IDs com erro"
            : ERRO_CATEGORIAS.find((item) => item.id === categoria)?.label}
          <InfoTip>
            Verde: o ID está nessa planilha. Vermelho: não está, e essa falta é o erro. Cinza: não
            está, e essa ausência não é o erro deste ID.
          </InfoTip>
        </h2>
        <p className="erro-legenda">
          <span className="num-ok">Está</span>
          <span className="num-bad">Não está</span>
          <span className="muted">Não está, sem ser o erro</span>
        </p>
        <div className="erro-toolbar">
          <label>
            Buscar
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ID, nome ou base"
            />
          </label>
          <Button type="button" variant="secondary" onClick={copyIds} disabled={visible.length === 0}>
            Copiar IDs
          </Button>
          {copyNote ? <span className="muted">{copyNote}</span> : null}
        </div>
        <InteractiveTable<ErroIdLinha>
          rows={visible}
          rowKey={(row) => row.id}
          columns={[
            { key: "id", label: "ID", sortValue: (row) => row.id },
            {
              key: "leads",
              label: "Leads Geral",
              align: "center",
              sortValue: (row) => presencaRank(row.leads),
              render: (row) => <PresencaCell value={row.leads} />,
            },
            {
              key: "realizados",
              label: "Realizados",
              align: "center",
              sortValue: (row) => presencaRank(row.realizados),
              render: (row) => <PresencaCell value={row.realizados} />,
            },
            {
              key: "agenda",
              label: "Agenda",
              align: "center",
              sortValue: (row) => presencaRank(row.agenda),
              render: (row) => <PresencaCell value={row.agenda} />,
            },
            {
              key: "sucessos",
              label: "Sucessos",
              align: "center",
              sortValue: (row) => presencaRank(row.sucessos),
              render: (row) => <PresencaCell value={row.sucessos} />,
            },
            {
              key: "insucessos",
              label: "Insucessos",
              align: "center",
              sortValue: (row) => presencaRank(row.insucessos),
              render: (row) => <PresencaCell value={row.insucessos} />,
            },
            { key: "falta", label: "Falta em", sortValue: (row) => row.faltaEm },
            {
              key: "obs",
              label: "Observação",
              sortValue: (row) => row.observacao,
              render: (row) => row.observacao || "—",
            },
            {
              key: "quem",
              label: "Responsável",
              sortValue: (row) => row.responsavel || "",
              render: (row) => row.responsavel || "—",
            },
          ]}
        />
      </div>
    </>
  );
}

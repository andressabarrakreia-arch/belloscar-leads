import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { FaltasChart } from "../components/erros/FaltasChart";
import { FaltasPlanilha } from "../components/erros/FaltasPlanilha";
import { QuadroCruzamento } from "../components/viz/QuadroCruzamento";
import { GateLogin } from "../components/GateLogin";
import { InfoTip } from "../components/InfoTip";
import { SiteCredit } from "../components/SiteCredit";
import { InteractiveTable } from "../components/InteractiveTable";
import { Button } from "../components/ui/button";
import { useSchedulingStore } from "../hooks/useSchedulingStore";
import { currentMonthRange } from "../lib/dates";
import { isGateAuthed } from "../lib/gateAuth";
import {
  buildErrosCruzamento,
  ERRO_CATEGORIAS,
  type ErroCategoria,
  type ErroIdLinha,
  type PresencaPlanilha,
} from "../lib/scheduling/errosCruzamento";

function PresencaCell({ value }: { value: PresencaPlanilha }) {
  if (value === "esta") return <span className="num-ok">Está</span>;
  if (value === "nao") return <span className="num-bad">Não está</span>;
  if (value === "nao-aplica") return <span className="muted">—</span>;
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

function formatDia(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  if (!ano || !mes || !dia) return iso;
  return `${dia}/${mes}/${ano}`;
}

function rotuloPeriodo(from: string, to: string): string {
  if (!from && !to) return "todo o período";
  if (from && to && from.slice(0, 7) === to.slice(0, 7) && from.endsWith("-01")) {
    const [ano, mes] = from.split("-").map(Number);
    const fim = new Date(ano, mes, 0).getDate();
    if (to === `${from.slice(0, 7)}-${String(fim).padStart(2, "0")}`) {
      const nome = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
      return nome.charAt(0).toUpperCase() + nome.slice(1);
    }
  }
  if (from && to) return `${formatDia(from)} a ${formatDia(to)}`;
  if (from) return `a partir de ${formatDia(from)}`;
  return `até ${formatDia(to)}`;
}

function dataNoPeriodo(data: string, from: string, to: string): boolean {
  if (!from && !to) return true;
  if (!data) return false;
  if (from && data < from) return false;
  if (to && data > to) return false;
  return true;
}

type PatioMotion = {
  x: (value: number) => void;
  y: (value: number) => void;
  s: (value: number) => void;
};

export function Erros() {
  const [authed, setAuthed] = useState(isGateAuthed);
  if (!authed) {
    return (
      <GateLogin
        title="Erros"
        blurb="Mesmo PIN do Mapa do Site. Abrir o cruzamento de IDs."
        onSuccess={() => setAuthed(true)}
      />
    );
  }
  return <ErrosConteudo />;
}

function ErrosConteudo() {
  const { dataset, loading, error } = useSchedulingStore();
  const [categoria, setCategoria] = useState<ErroCategoria | "todos">("todos");
  const [periodo, setPeriodo] = useState(() => currentMonthRange());
  const [query, setQuery] = useState("");
  const [copyNote, setCopyNote] = useState<string | null>(null);
  const mesaRef = useRef<HTMLDivElement>(null);
  const cena = useRef<HTMLDivElement>(null);
  const motion = useRef<PatioMotion | null>(null);

  useEffect(() => {
    const prev = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = "dark";
    return () => {
      if (prev) document.documentElement.dataset.theme = prev;
      else delete document.documentElement.dataset.theme;
    };
  }, []);

  useEffect(() => {
    const el = cena.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.set(el, { transformPerspective: 1400, rotationX: 0, rotationY: 0, scale: 1.02 });
    motion.current = {
      x: gsap.quickTo(el, "rotationY", { duration: 0.55, ease: "power3.out" }),
      y: gsap.quickTo(el, "rotationX", { duration: 0.55, ease: "power3.out" }),
      s: gsap.quickTo(el, "scale", { duration: 0.55, ease: "power3.out" }),
    };
  }, []);

  function moverPatio(event: PointerEvent<HTMLElement>) {
    const glide = motion.current;
    if (!glide) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    const z = Math.min(0.02, Math.hypot(x, y) * 0.04);
    event.currentTarget.style.setProperty("--patio-x", x.toFixed(3));
    event.currentTarget.style.setProperty("--patio-y", y.toFixed(3));
    glide.x(x * 4);
    glide.y(y * -3);
    glide.s(1.02 + z);
  }

  useEffect(() => {
    document.title = "BellosCar · Erros";
    return () => {
      document.title = "BellosCar · Análise de Resultados";
    };
  }, []);

  const report = useMemo(
    () => (dataset ? buildErrosCruzamento(dataset) : null),
    [dataset]
  );

  useEffect(() => {
    const el = mesaRef.current;
    if (!el || loading || !report) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bands = el.querySelectorAll(".patio-band");
    if (!bands.length) return;
    if (reduce) {
      gsap.set(bands, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      bands,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" }
    );
  }, [loading, dataset]);

  const noPeriodo = useMemo(() => {
    const linhas = report?.linhas || [];
    const erros = report?.rows || [];
    const categorias = new Map<string, Set<ErroCategoria>>();
    for (const row of erros) {
      if (!dataNoPeriodo(row.data, periodo.from, periodo.to)) continue;
      const set = categorias.get(row.id) || new Set<ErroCategoria>();
      set.add(row.categoria);
      categorias.set(row.id, set);
    }
    return linhas
      .filter((linha) => categorias.has(linha.id))
      .map((linha) => ({
        ...linha,
        categorias: linha.categorias.filter((item) => categorias.get(linha.id)?.has(item)),
      }));
  }, [report, periodo]);

  const counts = useMemo(() => {
    const map = new Map<ErroCategoria, number>();
    for (const item of ERRO_CATEGORIAS) map.set(item.id, 0);
    for (const row of noPeriodo) {
      for (const item of row.categorias) map.set(item, (map.get(item) || 0) + 1);
    }
    return map;
  }, [noPeriodo]);

  const chartData = useMemo(
    () =>
      ERRO_CATEGORIAS.map((item) => ({
        id: item.id,
        nome: item.label,
        ids: counts.get(item.id) || 0,
      })),
    [counts]
  );

  const visible = useMemo(() => {
    const rows = noPeriodo;
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (categoria !== "todos" && !row.categorias.includes(categoria)) return false;
      if (!q) return true;
      const blob = `${row.id} ${row.estaEm} ${row.faltaEm} ${row.observacao} ${row.responsavel} ${row.cliente}`.toLowerCase();
      return blob.includes(q);
    });
  }, [noPeriodo, categoria, query]);

  async function copyIds() {
    const ids = [...new Set(visible.map((row) => row.id))].join("\n");
    try {
      await navigator.clipboard.writeText(ids);
      setCopyNote(`${new Set(visible.map((row) => row.id)).size} IDs copiados.`);
    } catch {
      setCopyNote("Não foi possível copiar daqui. Selecione os IDs na tabela.");
    }
  }

  function escolherBarra(id: ErroCategoria) {
    setCategoria((current) => (current === id ? "todos" : id));
  }

  const totalFora = report?.insucessosForaDaAgendaTotal;
  const amostra = report?.insucessosForaDaAgendaAmostra ?? 0;
  const placar = report
    ? `${noPeriodo.length.toLocaleString("pt-BR")} IDs`
    : "—";
  const periodoLabel = rotuloPeriodo(periodo.from, periodo.to);

  return (
    <div className="patio" onPointerMove={moverPatio}>
      <div ref={cena} className="patio-cena" aria-hidden="true">
        <div className="patio-foto" />
        <div className="patio-luz" />
      </div>

      <div className="patio-mesa" ref={mesaRef}>
        <header className="patio-masthead">
          <div className="patio-masthead-left">
            <Link className="patio-back" to="/">
              Índice
            </Link>
            <div className="patio-brand">
              <p>Sala de cruzamento</p>
              <h1>Erros</h1>
            </div>
          </div>
          <div className="patio-masthead-score" aria-label="Placar do período">
            <span>{periodoLabel}</span>
            <strong>{placar}</strong>
          </div>
          <p className="patio-hint">
            Mapa de clientes no <Link to="/">índice</Link>
            {formatWhen(dataset?.updatedAt) ? ` · base ${formatWhen(dataset?.updatedAt)}` : ""}
          </p>
        </header>

        {loading ? <p className="patio-status">Carregando o cruzamento…</p> : null}
        {error ? <p className="patio-status patio-status--err">{error}</p> : null}

        {report ? (
          <>
            <section className="patio-toolbar patio-band" aria-label="Período">
              <div className="patio-toolbar-presets">
                <button
                  type="button"
                  className={periodo.from && periodo.to ? "is-active" : undefined}
                  onClick={() => setPeriodo(currentMonthRange())}
                >
                  Mês vigente
                </button>
                <button
                  type="button"
                  className={!periodo.from && !periodo.to ? "is-active" : undefined}
                  onClick={() => setPeriodo({ from: "", to: "" })}
                >
                  Todo o período
                </button>
              </div>
              <div className="patio-toolbar-dates">
                <label>
                  De
                  <input
                    type="date"
                    value={periodo.from}
                    max={periodo.to || undefined}
                    onChange={(event) => setPeriodo((atual) => ({ ...atual, from: event.target.value }))}
                  />
                </label>
                <label>
                  Até
                  <input
                    type="date"
                    value={periodo.to}
                    min={periodo.from || undefined}
                    onChange={(event) => setPeriodo((atual) => ({ ...atual, to: event.target.value }))}
                  />
                </label>
              </div>
              <InfoTip>
                A página abre no mês vigente. A data do erro é a do agendamento, do atendimento ou do sucesso,
                conforme a planilha em que ele apareceu.
              </InfoTip>
              {noPeriodo.length === 0 ? <p className="patio-toolbar-empty">Nenhum ID neste período.</p> : null}
            </section>

            <section className="patio-band patio-grafico">
              <header className="patio-band-head">
                <h2>
                  IDs por tipo de falta
                  <InfoTip>
                    Clique numa barra para filtrar a tabela. A roda do mouse aproxima as categorias.
                  </InfoTip>
                </h2>
              </header>
              <FaltasChart data={chartData} categoria={categoria} onPick={escolherBarra} />
              <h3 className="faltas-subtitulo">Falta em cada planilha</h3>
              <FaltasPlanilha linhas={noPeriodo} />
              {!periodo.from && !periodo.to && totalFora != null && totalFora > amostra ? (
                <p className="patio-note">
                  A última planilha de insucessos deixou {totalFora.toLocaleString("pt-BR")} IDs fora da agenda. O
                  log guardou {amostra.toLocaleString("pt-BR")} números, e a tabela mostra esses.
                </p>
              ) : null}
            </section>

            <div className="patio-band">
              <QuadroCruzamento linhas={visible} onId={(id) => setQuery(id)} />
            </div>

            <section className="patio-band">
              <header className="patio-band-head">
                <h2>
                  {categoria === "todos"
                    ? "Onde cada ID está"
                    : ERRO_CATEGORIAS.find((item) => item.id === categoria)?.label}
                  <InfoTip>
                    Verde: o ID está nessa planilha. Vermelho: não está, e essa falta é o erro. Cinza: não está, e o
                    erro deste ID está em outra coluna. Sucesso fica só na planilha de sucessos: o traço em
                    Insucessos não é erro.
                  </InfoTip>
                </h2>
              </header>
              <p className="erro-legenda">
                <span className="num-ok">Está</span>
                <span className="num-bad">Não está</span>
                <span className="muted">Não está, sem ser o erro</span>
                <span className="muted">— sucesso, insucesso não se aplica</span>
              </p>
              <div className="erro-toolbar">
                <label>
                  Buscar
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ID, nome ou planilha"
                  />
                </label>
                <Button type="button" variant="secondary" onClick={() => setCategoria("todos")}>
                  Ver todos
                </Button>
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
            </section>
          </>
        ) : null}

        <footer className="patio-rodape">
          <span>BellosCar · Erros · Curitiba</span>
          <SiteCredit />
        </footer>
      </div>
    </div>
  );
}

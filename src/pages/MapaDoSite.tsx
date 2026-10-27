import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { GateLogin } from "../components/GateLogin";
import { AtlasGraph } from "../components/mapa/AtlasGraph";
import { SiteCredit } from "../components/SiteCredit";
import { isGateAuthed } from "../lib/gateAuth";
import { MODULES } from "../modules/registry";

type AtlasNode = {
  id: string;
  hash: string;
  label: string;
  kind: "hub" | "module" | "gate" | "admin" | "data";
  line: string;
  data?: string;
  children?: { hash: string; label: string; admin?: boolean }[];
};

const EXTRA: AtlasNode[] = [
  {
    id: "hub",
    hash: "/indice",
    label: "Índice Geral",
    kind: "hub",
    line: "Hub Análise de Resultados · mapa de clientes · portas",
    data: "negociacoes-dataset (ranking) + mapa no índice",
  },
  {
    id: "erros",
    hash: "/erros",
    label: "Erros",
    kind: "gate",
    line: "Cruzamento de IDs entre planilhas",
    data: "agendamentos-dataset.json",
  },
  {
    id: "mapa",
    hash: "/mapa",
    label: "Mapa do Site",
    kind: "gate",
    line: "Atlas de rotas e fontes (esta página)",
    data: ".nexus-map · SYSTEM.md · repo.md",
  },
  {
    id: "gestao",
    hash: "/indice/gestao",
    label: "Gestão do Índice",
    kind: "admin",
    line: "Upload e publicação das planilhas",
    data: "public/data/*.json",
  },
  {
    id: "data-ag",
    hash: "#",
    label: "agendamentos-dataset.json",
    kind: "data",
    line: "Campanhas vivo · Agendamentos · Erros",
  },
  {
    id: "data-neg",
    hash: "#",
    label: "negociacoes-dataset.json",
    kind: "data",
    line: "Negociações · ranking do índice",
  },
  {
    id: "data-leg",
    hash: "#",
    label: "dataset.json (legado)",
    kind: "data",
    line: "Só histórico admin campanhas — não é o dashboard vivo",
  },
];

export function MapaDoSite() {
  const [authed, setAuthed] = useState(isGateAuthed);
  if (!authed) {
    return (
      <GateLogin
        title="Mapa do Site"
        blurb="Mesmo PIN da página Erros. Abrir o atlas de rotas e dados."
        onSuccess={() => setAuthed(true)}
      />
    );
  }
  return <MapaDoSiteConteudo />;
}

function MapaDoSiteConteudo() {
  const [active, setActive] = useState("hub");
  const [entered, setEntered] = useState(false);

  const nodes = useMemo<AtlasNode[]>(() => {
    const fromModules: AtlasNode[] = MODULES.map((mod) => ({
      id: mod.id,
      hash: mod.publicPath,
      label: mod.name.replace(/^Análise de /, "").replace(/^Perfil de /, "Perfil · "),
      kind: "module" as const,
      line: mod.tagline,
      data:
        mod.id === "negociacoes"
          ? "negociacoes-dataset.json"
          : mod.id === "perfil"
            ? "derivado de negociações + filtros"
            : "agendamentos-dataset.json",
      children: mod.nav.map((item) => ({
        hash: item.to,
        label: item.label,
        admin: item.adminOnly,
      })),
    }));
    return [...EXTRA.filter((n) => n.kind === "hub"), ...fromModules, ...EXTRA.filter((n) => n.kind !== "hub")];
  }, []);

  const selected = nodes.find((n) => n.id === active) ?? nodes[0];

  useEffect(() => {
    document.title = "BellosCar · Mapa do Site";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = window.setTimeout(() => setEntered(true), reduce ? 0 : 40);
    return () => {
      window.clearTimeout(id);
      document.title = "BellosCar · Análise de Resultados";
    };
  }, []);

  return (
    <div className={`atlas-page${entered ? " is-in" : ""}`}>
      <div className="atlas-grid" aria-hidden="true" />
      <header className="atlas-top">
        <Link className="atlas-back" to="/indice">
          Índice
        </Link>
        <p className="atlas-kicker">BellosCar · orientação</p>
      </header>

      <div className="atlas-stage">
        <div className="atlas-hero">
          <p className="atlas-eyebrow">Atlas do produto</p>
          <h1 className="atlas-title">
            Mapa
            <span>do Site</span>
          </h1>
          <p className="atlas-lede">
            Rotas, módulos e arquivos de dados — para não recriar o que já existe. O mapa de clientes
            continua no Índice; aqui é o esquema do painel.
          </p>
        </div>

        <nav className="atlas-spine" aria-label="Nós do atlas">
          {nodes.map((node, index) => (
            <button
              key={node.id}
              type="button"
              className={`atlas-node atlas-node--${node.kind}${active === node.id ? " is-active" : ""}`}
              style={{ ["--i" as string]: index }}
              onClick={() => setActive(node.id)}
            >
              <span className="atlas-node-dot" />
              <span className="atlas-node-label">{node.label}</span>
            </button>
          ))}
        </nav>

        <aside className="atlas-panel" aria-live="polite">
          <p className={`atlas-kind atlas-kind--${selected.kind}`}>{rotuloKind(selected.kind)}</p>
          <h2>{selected.label}</h2>
          <p>{selected.line}</p>
          {selected.data ? (
            <p className="atlas-data">
              <span>Dados</span> {selected.data}
            </p>
          ) : null}
          {selected.children && selected.children.length > 0 ? (
            <ul className="atlas-children">
              {selected.children.map((child) => (
                <li key={child.hash}>
                  {child.hash === "#" ? (
                    <span>{child.label}</span>
                  ) : (
                    <Link to={child.hash}>
                      {child.label}
                      {child.admin ? " · gestão" : ""}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          ) : null}
          {selected.hash !== "#" ? (
            <Link className="atlas-go" to={selected.hash}>
              Abrir {selected.label}
            </Link>
          ) : null}
        </aside>
      </div>

      <section className="atlas-legend" aria-label="Fontes de verdade">
        <h3>Fontes de verdade</h3>
        <div className="atlas-legend-row">
          <div>
            <strong>agendamentos-dataset.json</strong>
            <span>Campanhas vivo · Agendamentos · Erros</span>
          </div>
          <div>
            <strong>negociacoes-dataset.json</strong>
            <span>Negociações · ranking do Índice</span>
          </div>
          <div>
            <strong>dataset.json</strong>
            <span>Legado — não usar como dashboard vivo</span>
          </div>
        </div>
        <p className="atlas-refs">
          Agentes: <code>.nexus-map/INDEX.md</code> · <code>SYSTEM.md</code> · <code>repo.md</code>
        </p>
      </section>

      <AtlasGraph
        nodes={nodes.map((n) => ({
          id: n.id,
          label: n.label,
          kind: n.kind,
          hash: n.hash,
        }))}
        activeId={active}
        onSelect={setActive}
      />

      <footer className="atlas-foot">
        <span>BellosCar · Mapa do Site · Curitiba</span>
        <SiteCredit />
      </footer>
    </div>
  );
}

function rotuloKind(kind: AtlasNode["kind"]): string {
  switch (kind) {
    case "hub":
      return "Hub";
    case "module":
      return "Módulo";
    case "gate":
      return "PIN gate";
    case "admin":
      return "PIN gestão";
    case "data":
      return "Arquivo";
    default:
      return kind;
  }
}

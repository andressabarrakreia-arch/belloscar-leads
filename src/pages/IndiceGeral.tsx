import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MarketStrip } from "../components/MarketStrip";
import { SiteCredit } from "../components/SiteCredit";
import { useCampanhas } from "../hooks/useCampanhas";
import { useNegociacoesAnalytics, useNegociacoesStore } from "../hooks/useNegociacoesStore";
import { useSchedulingAnalytics, useSchedulingStore } from "../hooks/useSchedulingStore";
import { sliceCampanhas } from "../lib/campanhas/analytics";
import { agendaPeople, campanhaPeople, lojaPeople, type SectorPeople } from "../lib/indice/destaques";
import type { NegociacoesFilters } from "../lib/negociacoes/types";

const brandLogo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;
const fundo = `${import.meta.env.BASE_URL}brand/indice-fundo.jpg`;

const NEGOCIACOES_TODOS: NegociacoesFilters = {
  month: "all",
  period: "all",
  vendedor: "all",
  tipo: "all",
  status: "all",
  tipoVenda: "all",
};

const DOORS = [
  {
    to: "/campanhas",
    label: "Campanhas",
    line: "Facebook e Instagram",
    summary:
      "Atendimentos, visitas, agendamentos e sucessos. Dentro: painel, atendentes e comparação de períodos.",
  },
  {
    to: "/agendamentos",
    label: "Agendamentos",
    line: "Vendas Web",
    summary:
      "Pré-venda e recepção: visitas, sucessos, vendedores, portais e motivos de insucesso.",
  },
  {
    to: "/negociacoes",
    label: "Negociações",
    line: "Loja",
    summary: "Vendas, trocas, compras e consignações, com lançamentos e resultado por vendedor.",
  },
];

function n(value: number | undefined): string {
  if (value == null) return "…";
  return value.toLocaleString("pt-BR");
}

function baseLabel(iso?: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `Base de ${date.toLocaleDateString("pt-BR")}`;
}

type Fact = { label: string; value: string; highlight?: boolean };

function PersonRow({
  tone,
  label,
  spot,
}: {
  tone: "up" | "down";
  label: string;
  spot: SectorPeople["positive"];
}) {
  if (!spot) return null;
  return (
    <button type="button" className={`indice-person indice-person--${tone}`}>
      <span>{label}</span>
      <strong>{spot.name}</strong>
      <em>{spot.headline}</em>
      <span className="indice-person-tip" role="tooltip">
        {spot.detail}
      </span>
    </button>
  );
}

export function IndiceGeral() {
  const campanhas = useCampanhas();
  const agendamentos = useSchedulingStore();
  const negociacoes = useNegociacoesStore();
  const agenda = useSchedulingAnalytics(agendamentos.dataset, {});
  const loja = useNegociacoesAnalytics(negociacoes.dataset, NEGOCIACOES_TODOS);
  const campanhaKpis = useMemo(
    () => sliceCampanhas(campanhas.rows, {}).kpis,
    [campanhas.rows]
  );
  const people = useMemo(
    () => ({
      campanhas: campanhas.rows.length ? campanhaPeople(campanhas.rows) : null,
      agendamentos: agendamentos.dataset ? agendaPeople(agendamentos.dataset.items) : null,
      negociacoes: negociacoes.dataset ? lojaPeople(negociacoes.dataset.lines) : null,
    }),
    [agendamentos.dataset, campanhas.rows, negociacoes.dataset]
  );

  useEffect(() => {
    document.title = "BellosCar · Índice Geral";
    return () => {
      document.title = "BellosCar · Análise de Resultados";
    };
  }, []);

  const cards: { id: string; title: string; base: string; facts: Fact[]; people: SectorPeople | null }[] = [
    {
      id: "campanhas",
      title: "Campanhas",
      base: campanhas.loading ? "" : baseLabel(campanhas.dataset?.updatedAt),
      facts: [
        { label: "Atendimentos", value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.atendimentos) },
        { label: "Visitas", value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.visitas) },
        { label: "Agendamentos", value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.agendamentos) },
        { label: "Sucessos", value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.sucessos), highlight: true },
      ],
      people: people.campanhas,
    },
    {
      id: "agendamentos",
      title: "Agendamentos",
      base: agendamentos.loading ? "" : baseLabel(agendamentos.dataset?.updatedAt),
      facts: [
        { label: "Agend. pré-venda", value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.total) : "—" },
        { label: "Visitas", value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.visitas) : "—" },
        { label: "Insucessos", value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.insucessos) : "—" },
        { label: "Sucessos", value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.sucessos) : "—", highlight: true },
      ],
      people: people.agendamentos,
    },
    {
      id: "negociacoes",
      title: "Negociações",
      base: negociacoes.loading ? "" : baseLabel(negociacoes.dataset?.updatedAt),
      facts: [
        { label: "Negócios", value: negociacoes.loading ? "…" : loja ? n(loja.kpis.total) : "—" },
        { label: "Trocas", value: negociacoes.loading ? "…" : loja ? n(loja.kpis.trocas) : "—" },
        { label: "Consignações", value: negociacoes.loading ? "…" : loja ? n(loja.kpis.consignacoes) : "—" },
        { label: "Vendas", value: negociacoes.loading ? "…" : loja ? n(loja.kpis.vendas) : "—", highlight: true },
      ],
      people: people.negociacoes,
    },
  ];

  return (
    <div className="indice">
      <div className="indice-bg" style={{ backgroundImage: `url("${fundo}")` }} aria-hidden="true" />
      <div className="indice-content">
        <header className="indice-hero">
          <img className="indice-logo" src={brandLogo} alt="Andressa Car Metrics" />
          <h1>
            Bellos<span>Car</span>
          </h1>
          <p>Índice Geral</p>
        </header>

        <nav className="indice-doors" aria-label="Páginas principais">
          {DOORS.map((door) => (
            <Link key={door.to} to={door.to} className="indice-door">
              <strong>{door.label}</strong>
              <small>{door.line}</small>
              <span className="indice-door-tip" role="tooltip">
                {door.summary}
              </span>
            </Link>
          ))}
        </nav>

        <MarketStrip />

        <section className="indice-grid" aria-label="Destaques">
          {cards.map((card) => (
            <article key={card.id} className="indice-card">
              <header>
                <h2>{card.title}</h2>
                {card.base ? <p>{card.base}</p> : null}
              </header>
              <dl className="indice-facts">
                {card.facts.map((fact) => (
                  <div key={fact.label} className={fact.highlight ? "is-highlight" : undefined}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              {card.people ? (
                <div className="indice-people">
                  <PersonRow tone="up" label="Em alta" spot={card.people.positive} />
                  <PersonRow tone="down" label="Em atenção" spot={card.people.negative} />
                </div>
              ) : null}
            </article>
          ))}
        </section>

        <footer className="indice-foot">
          <p>BellosCar · Índice Geral · Curitiba</p>
          <SiteCredit />
        </footer>
      </div>
    </div>
  );
}

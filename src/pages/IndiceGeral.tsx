import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { IndiceAbertura } from "../components/IndiceAbertura";
import { MapaClientes } from "../components/viz/MapaClientes";
import { MarketStrip } from "../components/MarketStrip";
import { SiteCredit } from "../components/SiteCredit";
import { useCampanhas } from "../hooks/useCampanhas";
import { useNegociacoesAnalytics, useNegociacoesStore } from "../hooks/useNegociacoesStore";
import { useSchedulingAnalytics, useSchedulingStore } from "../hooks/useSchedulingStore";
import { sliceCampanhas } from "../lib/campanhas/analytics";
import { SinalTendencia } from "../components/SinalTendencia";
import { currentMonthKey, currentMonthRange, previousMonthSameSpan } from "../lib/dates";
import { buildNegociacoesKpis, dealsFromLines } from "../lib/negociacoes/metrics";
import { tendenciaDe, type Tendencia } from "../lib/tendencia";
import { FILTRO_MAPA_INICIAL, buildMapaClientes, indiceVeiculos, opcoesMapa, type FiltroMapa } from "../lib/geo/clientesMapa";
import { agendaPeople, campanhaPeople, lojaPeople, topFaturamento, type SectorPeople } from "../lib/indice/destaques";
import type { NegociacoesFilters } from "../lib/negociacoes/types";

const brandLogo = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;
const fundo = `${import.meta.env.BASE_URL}brand/indice-fundo.jpg`;

const MES_ATUAL = currentMonthRange();
const MES_ANTERIOR = previousMonthSameSpan();

const NEGOCIACOES_MES: NegociacoesFilters = {
  month: currentMonthKey(),
  period: "all",
  vendedor: "all",
  tipo: "all",
  status: "all",
  tipoVenda: "all",
};

const DOORS: {
  to: string;
  label: string;
  line: string;
  summary: string;
  tone?: "red" | "atlas" | "show";
}[] = [
  {
    to: "/campanhas",
    label: "Campanhas",
    line: "Facebook Ads e Instagram Ads",
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
  {
    to: "/perfil",
    label: "Perfil",
    line: "Marcas e clientes",
    summary: "Marcas, modelos, gênero dos clientes e os principais motivos de não fechar o negócio.",
  },
  {
    to: "/erros",
    label: "Erros",
    line: "Cruzamento",
    summary: "ID que está numa planilha e falta na outra, com a base e o número.",
    tone: "red",
  },
  {
    to: "/mapa",
    label: "Mapa do Site",
    line: "Atlas",
    summary: "Rotas, módulos e fontes de dados do painel — PIN igual ao de Erros.",
    tone: "atlas",
  },
  {
    to: "/apresentacao",
    label: "Apresentação",
    line: "Resultados",
    summary: "Cards individuais e coletivos da equipe, com números vivos — PIN do gate.",
    tone: "show",
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

type Fact = {
  label: string;
  value: string;
  tone?: "ok" | "bad";
  tendencia: Tendencia | null;
  sobeAjuda: boolean;
};

function sinal(atual: number | undefined, anterior: number | undefined): Tendencia | null {
  if (atual == null || anterior == null) return null;
  return tendenciaDe(atual, anterior);
}

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
      <em>
        {spot.headline}
        <SinalTendencia
          tendencia={tone === "up" ? "alta" : "baixa"}
          sobeAjuda
          contra="neste destaque"
        />
      </em>
      <span className="indice-person-tip" role="tooltip">
        {spot.detail}
      </span>
    </button>
  );
}

export function IndiceGeral() {
  const [filtroMapa, setFiltroMapa] = useState<FiltroMapa>(FILTRO_MAPA_INICIAL);
  const campanhas = useCampanhas();
  const agendamentos = useSchedulingStore();
  const negociacoes = useNegociacoesStore();
  const agenda = useSchedulingAnalytics(agendamentos.dataset, MES_ATUAL);
  const agendaAnterior = useSchedulingAnalytics(agendamentos.dataset, MES_ANTERIOR);
  const loja = useNegociacoesAnalytics(negociacoes.dataset, NEGOCIACOES_MES);
  const campanhaKpis = useMemo(
    () => sliceCampanhas(campanhas.rows, MES_ATUAL).kpis,
    [campanhas.rows]
  );
  const campanhaAnterior = useMemo(
    () => sliceCampanhas(campanhas.rows, MES_ANTERIOR).kpis,
    [campanhas.rows]
  );
  const lojaAnterior = useMemo(() => {
    if (!negociacoes.dataset) return null;
    const limite = Number(MES_ANTERIOR.to.slice(8, 10));
    const deals = dealsFromLines(negociacoes.dataset.lines).filter((deal) => {
      if (!deal.dataEntrada.startsWith(MES_ANTERIOR.month)) return false;
      const dia = Number(deal.dataEntrada.slice(8, 10));
      return dia >= 1 && dia <= limite;
    });
    return buildNegociacoesKpis(deals);
  }, [negociacoes.dataset]);
  const mesLabel = new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  const mesTitulo = mesLabel.charAt(0).toUpperCase() + mesLabel.slice(1);
  const people = useMemo(
    () => ({
      campanhas: campanhas.rows.length ? campanhaPeople(campanhas.rows) : null,
      agendamentos: agendamentos.dataset ? agendaPeople(agendamentos.dataset.items) : null,
      negociacoes: negociacoes.dataset ? lojaPeople(negociacoes.dataset.lines) : null,
    }),
    [agendamentos.dataset, campanhas.rows, negociacoes.dataset]
  );
  const ranking = useMemo(
    () => (negociacoes.dataset ? topFaturamento(negociacoes.dataset.lines) : { people: [], web: null }),
    [negociacoes.dataset]
  );
  const veiculos = useMemo(() => indiceVeiculos(negociacoes.dataset?.lines || []), [negociacoes.dataset]);
  const opcoesDoMapa = useMemo(
    () => opcoesMapa(agendamentos.dataset, negociacoes.dataset?.lines || []),
    [agendamentos.dataset, negociacoes.dataset]
  );
  const mapa = useMemo(
    () => (agendamentos.dataset ? buildMapaClientes(agendamentos.dataset, filtroMapa, veiculos) : null),
    [agendamentos.dataset, filtroMapa, veiculos]
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
        {
          label: "Atendimentos",
          value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.atendimentos),
          tendencia: campanhas.loading || campanhas.error ? null : sinal(campanhaKpis.atendimentos, campanhaAnterior.atendimentos),
          sobeAjuda: true,
        },
        {
          label: "Visitas",
          value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.visitas),
          tendencia: campanhas.loading || campanhas.error ? null : sinal(campanhaKpis.visitas, campanhaAnterior.visitas),
          sobeAjuda: true,
        },
        {
          label: "Agendamentos",
          value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.agendamentos),
          tendencia: campanhas.loading || campanhas.error ? null : sinal(campanhaKpis.agendamentos, campanhaAnterior.agendamentos),
          sobeAjuda: true,
        },
        {
          label: "Sucessos",
          value: campanhas.loading ? "…" : campanhas.error ? "—" : n(campanhaKpis.sucessos),
          tone: "ok",
          tendencia: campanhas.loading || campanhas.error ? null : sinal(campanhaKpis.sucessos, campanhaAnterior.sucessos),
          sobeAjuda: true,
        },
      ],
      people: people.campanhas,
    },
    {
      id: "agendamentos",
      title: "Agendamentos",
      base: agendamentos.loading ? "" : baseLabel(agendamentos.dataset?.updatedAt),
      facts: [
        {
          label: "Agend. pré-venda",
          value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.total) : "—",
          tendencia: agendamentos.loading || !agenda || !agendaAnterior ? null : sinal(agenda.kpisPreVenda.total, agendaAnterior.kpisPreVenda.total),
          sobeAjuda: true,
        },
        {
          label: "Visitas",
          value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.visitas) : "—",
          tendencia: agendamentos.loading || !agenda || !agendaAnterior ? null : sinal(agenda.kpisPreVenda.visitas, agendaAnterior.kpisPreVenda.visitas),
          sobeAjuda: true,
        },
        {
          label: "Insucessos",
          value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.insucessos) : "—",
          tone: "bad",
          tendencia: agendamentos.loading || !agenda || !agendaAnterior ? null : sinal(agenda.kpisPreVenda.insucessos, agendaAnterior.kpisPreVenda.insucessos),
          sobeAjuda: false,
        },
        {
          label: "Sucessos",
          value: agendamentos.loading ? "…" : agenda ? n(agenda.kpisPreVenda.sucessos) : "—",
          tone: "ok",
          tendencia: agendamentos.loading || !agenda || !agendaAnterior ? null : sinal(agenda.kpisPreVenda.sucessos, agendaAnterior.kpisPreVenda.sucessos),
          sobeAjuda: true,
        },
      ],
      people: people.agendamentos,
    },
    {
      id: "negociacoes",
      title: "Negociações",
      base: negociacoes.loading ? "" : baseLabel(negociacoes.dataset?.updatedAt),
      facts: [
        {
          label: "Negócios",
          value: negociacoes.loading ? "…" : loja ? n(loja.kpis.total) : "—",
          tendencia: negociacoes.loading || !loja || !lojaAnterior ? null : sinal(loja.kpis.total, lojaAnterior.total),
          sobeAjuda: true,
        },
        {
          label: "Trocas",
          value: negociacoes.loading ? "…" : loja ? n(loja.kpis.trocas) : "—",
          tendencia: negociacoes.loading || !loja || !lojaAnterior ? null : sinal(loja.kpis.trocas, lojaAnterior.trocas),
          sobeAjuda: true,
        },
        {
          label: "Consignações",
          value: negociacoes.loading ? "…" : loja ? n(loja.kpis.consignacoes) : "—",
          tendencia: negociacoes.loading || !loja || !lojaAnterior ? null : sinal(loja.kpis.consignacoes, lojaAnterior.consignacoes),
          sobeAjuda: true,
        },
        {
          label: "Vendas",
          value: negociacoes.loading ? "…" : loja ? n(loja.kpis.vendas) : "—",
          tone: "ok",
          tendencia: negociacoes.loading || !loja || !lojaAnterior ? null : sinal(loja.kpis.vendas, lojaAnterior.vendas),
          sobeAjuda: true,
        },
      ],
      people: people.negociacoes,
    },
  ];

  return (
    <div className="indice">
      <IndiceAbertura />
      <div className="indice-bg" style={{ backgroundImage: `url("${fundo}")` }} aria-hidden="true" />
      <div className="indice-content">
        <header className="indice-hero">
          <img className="indice-logo" src={brandLogo} alt="Andressa Car Metrics" />
          <h1>
            Bellos<span>Car</span>
          </h1>
          <p>Índice Geral · {mesTitulo}</p>
        </header>

        <nav className="indice-doors" aria-label="Páginas principais">
          {DOORS.map((door) => (
            <Link
              key={door.to}
              to={door.to}
              className={
                door.tone === "red"
                  ? "indice-door indice-door--erros"
                  : door.tone === "atlas"
                    ? "indice-door indice-door--atlas"
                    : door.tone === "show"
                      ? "indice-door indice-door--show"
                      : "indice-door"
              }
            >
              {door.label}
              <span className="indice-door-tip" role="tooltip">
                <strong>{door.line}</strong>
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
                  <div
                    key={fact.label}
                    className={fact.tone === "ok" ? "is-highlight" : fact.tone === "bad" ? "is-negative" : undefined}
                  >
                    <dt>{fact.label}</dt>
                    <dd>
                      {fact.value}
                      <SinalTendencia
                        tendencia={fact.tendencia}
                        sobeAjuda={fact.sobeAjuda}
                        contra="contra o mesmo intervalo do mês anterior"
                      />
                    </dd>
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

        {mapa ? <MapaClientes mapa={mapa} filtro={filtroMapa} opcoes={opcoesDoMapa} onFiltro={setFiltroMapa} /> : null}

        <section className="indice-rank indice-card" aria-label="Quem mais faturou no mês">
          <header className="indice-rank-head">
            <h2>Faturamento do mês</h2>
            <p>Participação no faturamento. Passe o mouse para ver o valor.</p>
          </header>
          {negociacoes.loading ? (
            <p className="indice-rank-empty">Carregando…</p>
          ) : ranking.people.length === 0 ? (
            <p className="indice-rank-empty">Sem vendas com valor neste mês.</p>
          ) : (
            <>
              <ol>
                {ranking.people.map((spot) => (
                  <li key={spot.name}>
                    <button type="button" className="indice-rank-item">
                      <span>{spot.place}</span>
                      <strong>{spot.name}</strong>
                      <em>{spot.value}</em>
                      <span className="indice-person-tip" role="tooltip">
                        {spot.detail}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              {ranking.web ? (
                <button type="button" className="indice-rank-item indice-rank-total">
                  <span>{ranking.web.place}</span>
                  <strong>{ranking.web.name}</strong>
                  <em>{ranking.web.value}</em>
                  <span className="indice-person-tip" role="tooltip">
                    {ranking.web.detail}
                  </span>
                </button>
              ) : null}
            </>
          )}
        </section>

        <footer className="indice-foot">
          <p>BellosCar · Índice Geral · Curitiba</p>
          <Link className="indice-gestao-link" to="/indice/gestao">
            Gestão
          </Link>
          <SiteCredit />
        </footer>
      </div>
    </div>
  );
}

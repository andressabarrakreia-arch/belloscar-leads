import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { GateLogin } from "../components/GateLogin";
import { ShowCard } from "../components/apresentacao/ShowCard";
import { SiteCredit } from "../components/SiteCredit";
import { useCampanhas } from "../hooks/useCampanhas";
import { useNegociacoesStore } from "../hooks/useNegociacoesStore";
import { useSchedulingStore, useSchedulingAnalytics } from "../hooks/useSchedulingStore";
import { isGateAuthed } from "../lib/gateAuth";
import {
  buildSdrRows,
  buildVendedorRows,
  sliceCampanhas,
} from "../lib/campanhas/analytics";
import {
  buildNegociacoesKpis,
  buildVendedorRows as buildNegVendedores,
  dealsFromLines,
} from "../lib/negociacoes/metrics";
import { buildGlobalKpis } from "../lib/scheduling/metrics";
import type { ShowPerson, ShowSection } from "../lib/apresentacao/types";

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function pct(n: number): string {
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function ApresentacaoResultados() {
  const [authed, setAuthed] = useState(isGateAuthed);
  if (!authed) {
    return (
      <GateLogin
        title="Apresentação"
        blurb="Mesmo PIN de Erros e Mapa do Site. Resultados individuais e coletivos."
        onSuccess={() => setAuthed(true)}
      />
    );
  }
  return <ApresentacaoConteudo />;
}

function ApresentacaoConteudo() {
  const campanhas = useCampanhas();
  const scheduling = useSchedulingStore();
  const negociacoes = useNegociacoesStore();
  const schedAnalytics = useSchedulingAnalytics(scheduling.dataset, {});
  const stageRef = useRef<HTMLDivElement>(null);
  const [sectionIx, setSectionIx] = useState(0);
  const [cardIx, setCardIx] = useState(0);

  const sections = useMemo<ShowSection[]>(() => {
    const list: ShowSection[] = [];

    const campSlice = sliceCampanhas(campanhas.rows, {});
    const sdrCamp = buildSdrRows(campSlice);
    const vendCamp = buildVendedorRows(campSlice);

    const deals = negociacoes.dataset
      ? dealsFromLines(negociacoes.dataset.lines)
      : [];
    const negKpis = buildNegociacoesKpis(deals);
    const negVend = buildNegVendedores(deals);

    const coletivoPeople: ShowPerson[] = [
      {
        id: "coletivo-camp",
        nome: "Campanhas Meta",
        cargo: "Coletivo",
        setor: "coletivo",
        kpis: [
          { label: "Atendimentos", value: fmt(campSlice.kpis.atendimentos) },
          { label: "Visitas", value: fmt(campSlice.kpis.visitas) },
          { label: "Agendamentos", value: fmt(campSlice.kpis.agendamentos) },
          { label: "Sucessos", value: fmt(campSlice.kpis.sucessos) },
        ],
      },
      {
        id: "coletivo-agenda",
        nome: "Agendamentos",
        cargo: "Coletivo",
        setor: "coletivo",
        kpis: (() => {
          const g = scheduling.dataset
            ? buildGlobalKpis(scheduling.dataset.items)
            : { total: 0, visitas: 0, sucessos: 0 };
          return [
            { label: "Agendamentos", value: fmt(g.total) },
            { label: "Visitas", value: fmt(g.visitas) },
            { label: "Sucesso", value: fmt(g.sucessos) },
          ];
        })(),
      },
      {
        id: "coletivo-loja",
        nome: "Negociações · Loja",
        cargo: "Coletivo",
        setor: "coletivo",
        kpis: [
          { label: "Total", value: fmt(negKpis.total) },
          { label: "Vendas", value: fmt(negKpis.vendas) },
          { label: "Trocas", value: fmt(negKpis.trocas) },
          { label: "Consignações", value: fmt(negKpis.consignacoes) },
        ],
      },
    ];

    list.push({
      id: "coletivo",
      title: "Coletivo BellosCar",
      blurb: "Totais da casa — todos os períodos importados.",
      people: coletivoPeople,
    });

    const prevenda =
      schedAnalytics?.sdrPreVendaRows?.map(
        (row): ShowPerson => ({
          id: `pv-${row.sdr}`,
          nome: row.sdr,
          cargo: "Pré-venda · SDR",
          setor: "prevenda",
          kpis: [
            { label: "Atend.", value: fmt(row.totalAtendimentos) },
            { label: "Agend.", value: fmt(row.totalAgendamentos) },
            { label: "Visitas", value: fmt(row.totalVisitas) },
            { label: "Sucesso", value: fmt(row.totalSucesso) },
          ],
        })
      ) ?? [];

    if (prevenda.length) {
      list.push({
        id: "prevenda",
        title: "Pré-venda",
        blurb: "Do menor ao destaque — SDRs com números vivos de agendamentos.",
        people: prevenda,
      });
    }

    const atendentes = sdrCamp
      .filter((r) => r.atendimentos > 0 || r.sucessos > 0)
      .slice(0, 24)
      .map(
        (row): ShowPerson => ({
          id: `camp-sdr-${row.sdr}`,
          nome: row.sdr,
          cargo: "Campanhas · Atendente",
          setor: "campanhas",
          kpis: [
            { label: "Atend.", value: fmt(row.atendimentos) },
            { label: "Visitas", value: fmt(row.visitas) },
            { label: "Agend.", value: fmt(row.agendamentos) },
            { label: "Sucesso", value: pct(row.taxaSucesso) },
          ],
        })
      );

    if (atendentes.length) {
      list.push({
        id: "campanhas",
        title: "Campanhas · Atendentes",
        blurb: "Facebook e Instagram — desempenho por atendente.",
        people: atendentes,
      });
    }

    const vendAgenda =
      schedAnalytics?.vendedorMetrics
        ?.filter((v) => v.totalRecebidos > 0 || v.totalSucesso > 0)
        .slice(0, 24)
        .map(
          (row): ShowPerson => ({
            id: `vend-ag-${row.vendedor}`,
            nome: row.vendedor,
            cargo: "Vendedor · Agendamentos",
            setor: "vendedores",
            kpis: [
              { label: "Recebidos", value: fmt(row.totalRecebidos) },
              { label: "Visitas", value: fmt(row.totalVisitas) },
              { label: "Sucesso", value: fmt(row.totalSucesso) },
              { label: "Conv.", value: pct(row.conversaoGeral) },
            ],
          })
        ) ?? [];

    const vendCampanha = vendCamp.slice(0, 16).map(
      (row): ShowPerson => ({
        id: `vend-camp-${row.vendedor}`,
        nome: row.vendedor,
        cargo: "Vendedor · Campanhas",
        setor: "vendedores",
        kpis: [
          { label: "Agend.", value: fmt(row.agendamentos) },
          { label: "Sucesso", value: fmt(row.sucessos) },
          { label: "Taxa", value: pct(row.taxaSucesso) },
        ],
      })
    );

    const vendedoresMerged = mergeByName([...vendAgenda, ...vendCampanha]);
    if (vendedoresMerged.length) {
      list.push({
        id: "vendedores",
        title: "Vendedores",
        blurb: "Agendamentos e campanhas — conversão e volume.",
        people: vendedoresMerged,
      });
    }

    const loja = negVend.slice(0, 24).map(
      (row): ShowPerson => ({
        id: `loja-${row.vendedor}`,
        nome: row.vendedor,
        cargo: "Vendedor · Loja",
        setor: "loja",
        kpis: [
          { label: "Total", value: fmt(row.total) },
          { label: "Venda+Troca", value: fmt(row.vendasMaisTrocas) },
          { label: "Compra", value: fmt(row.compras) },
          { label: "Consignação", value: fmt(row.consignacoes) },
        ],
      })
    );

    if (loja.length) {
      list.push({
        id: "loja",
        title: "Loja · Negociações",
        blurb: "Resultado por vendedor nas negociações da casa.",
        people: loja,
      });
    }

    return list;
  }, [campanhas.rows, scheduling.dataset, negociacoes.dataset, schedAnalytics]);

  const loading = campanhas.loading || scheduling.loading || negociacoes.loading;
  const error = campanhas.error || scheduling.error || negociacoes.error;

  useEffect(() => {
    document.title = "BellosCar · Apresentação";
    return () => {
      document.title = "BellosCar · Análise de Resultados";
    };
  }, []);

  useEffect(() => {
    setCardIx(0);
  }, [sectionIx]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || loading) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cards = el.querySelectorAll(".show-card");
    if (!cards.length) return;
    if (reduce) {
      gsap.set(cards, { opacity: 1, y: 0 });
      return;
    }
    gsap.fromTo(
      cards,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.05, ease: "power2.out" }
    );
  }, [sectionIx, loading, sections]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!sections.length) return;
      const section = sections[sectionIx];
      const maxCard = Math.max(0, (section?.people.length ?? 1) - 1);
      if (event.key === "ArrowRight" || event.key === " ") {
        event.preventDefault();
        if (cardIx < maxCard) setCardIx((c) => c + 1);
        else if (sectionIx < sections.length - 1) setSectionIx((s) => s + 1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        if (cardIx > 0) setCardIx((c) => c - 1);
        else if (sectionIx > 0) {
          setSectionIx((s) => s - 1);
          setCardIx(9999);
        }
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        if (sectionIx < sections.length - 1) setSectionIx((s) => s + 1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        if (sectionIx > 0) setSectionIx((s) => s - 1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sections, sectionIx, cardIx]);

  useEffect(() => {
    if (!sections.length) return;
    const max = Math.max(0, sections[sectionIx].people.length - 1);
    if (cardIx > max) setCardIx(max);
  }, [sections, sectionIx, cardIx]);

  const current = sections[sectionIx];

  return (
    <div className="show-page">
      <header className="show-top">
        <Link className="show-back" to="/indice">
          Índice
        </Link>
        <div className="show-brand">
          <p>BellosCar</p>
          <h1>Apresentação de resultados</h1>
        </div>
        <p className="show-hint">← → espaço · ↑ ↓ setores</p>
      </header>

      {loading ? <p className="show-status">Carregando números vivos…</p> : null}
      {error ? <p className="show-status show-status--err">{error}</p> : null}

      {!loading && !error && current ? (
        <>
          <nav className="show-tabs" aria-label="Setores">
            {sections.map((sec, ix) => (
              <button
                key={sec.id}
                type="button"
                className={ix === sectionIx ? "is-active" : undefined}
                onClick={() => setSectionIx(ix)}
              >
                {sec.title}
              </button>
            ))}
          </nav>

          <section className="show-sector" ref={stageRef}>
            <header className="show-sector-head">
              <h2>{current.title}</h2>
              <p>{current.blurb}</p>
            </header>
            <div className="show-grid">
              {current.people.map((person, ix) => (
                <ShowCard key={person.id} person={person} focused={ix === cardIx} />
              ))}
            </div>
          </section>
        </>
      ) : null}

      <footer className="show-foot">
        <span>BellosCar · Apresentação · Curitiba</span>
        <SiteCredit />
      </footer>
    </div>
  );
}

function mergeByName(people: ShowPerson[]): ShowPerson[] {
  const map = new Map<string, ShowPerson>();
  for (const p of people) {
    const key = p.nome.trim().toLowerCase();
    const prev = map.get(key);
    if (!prev) {
      map.set(key, p);
      continue;
    }
    map.set(key, {
      ...prev,
      cargo: prev.cargo.includes("Campanhas") ? prev.cargo : `${prev.cargo} · Campanhas`,
      kpis: [...prev.kpis, ...p.kpis].slice(0, 4),
    });
  }
  return [...map.values()];
}

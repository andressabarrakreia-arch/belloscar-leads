import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { GateLogin } from "../components/GateLogin";
import { ShowCard } from "../components/apresentacao/ShowCard";
import { ShowFilterTip } from "../components/apresentacao/ShowFilterTip";
import { ShowPeriodFilter } from "../components/apresentacao/ShowPeriodFilter";
import { ShowPersonModal } from "../components/apresentacao/ShowPersonModal";
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
import type { NegociacaoDeal } from "../lib/negociacoes/types";
import { buildGlobalKpis } from "../lib/scheduling/metrics";
import {
  formatDateRangeLabel,
  monthToDateRange,
} from "../lib/dates";
import type { ShowPeriod, ShowPerson, ShowSection } from "../lib/apresentacao/types";

function fmt(n: number): string {
  return n.toLocaleString("pt-BR");
}

function pct(n: number): string {
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

function filterDealsByRange(deals: NegociacaoDeal[], from: string, to: string): NegociacaoDeal[] {
  return deals.filter((d) => {
    const day = (d.dataEntrada || "").slice(0, 10);
    if (day.length === 10) {
      if (from && day < from) return false;
      if (to && day > to) return false;
      return true;
    }
    if (from && to) {
      const startM = from.slice(0, 7);
      const endM = to.slice(0, 7);
      return d.monthKey >= startM && d.monthKey <= endM;
    }
    return true;
  });
}

export function ApresentacaoResultados() {
  const [authed, setAuthed] = useState(isGateAuthed);

  useEffect(() => {
    const prev = document.documentElement.dataset.theme;
    document.documentElement.dataset.theme = "dark";
    return () => {
      if (prev) document.documentElement.dataset.theme = prev;
      else delete document.documentElement.dataset.theme;
    };
  }, []);

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
  const [period, setPeriod] = useState<ShowPeriod>(() => monthToDateRange());
  const campanhas = useCampanhas();
  const scheduling = useSchedulingStore();
  const negociacoes = useNegociacoesStore();
  const schedAnalytics = useSchedulingAnalytics(scheduling.dataset, {
    from: period.from,
    to: period.to,
  });
  const stageRef = useRef<HTMLDivElement>(null);
  const [sectionIx, setSectionIx] = useState(0);
  const [cardIx, setCardIx] = useState(0);
  const [modalPerson, setModalPerson] = useState<ShowPerson | null>(null);

  const periodoLabel = formatDateRangeLabel(period.from, period.to);

  const sections = useMemo<ShowSection[]>(() => {
    const list: ShowSection[] = [];
    const range = { from: period.from, to: period.to };

    const campSlice = sliceCampanhas(campanhas.rows, range);
    const sdrCamp = buildSdrRows(campSlice);
    const vendCamp = buildVendedorRows(campSlice);

    const allDeals = negociacoes.dataset
      ? dealsFromLines(negociacoes.dataset.lines)
      : [];
    const deals = filterDealsByRange(allDeals, period.from, period.to);
    const negKpis = buildNegociacoesKpis(deals);
    const negVend = buildNegVendedores(deals);

    const agendaItems = schedAnalytics?.filtered ?? [];
    const gAgenda = agendaItems.length
      ? buildGlobalKpis(agendaItems)
      : { total: 0, visitas: 0, sucessos: 0, insucessos: 0 };

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
        detalhe: {
          positivos: [
            { label: "Sucessos", value: fmt(campSlice.kpis.sucessos) },
            { label: "Taxa sucesso", value: pct(campSlice.kpis.taxaSucesso) },
            { label: "Visitas", value: fmt(campSlice.kpis.visitas) },
          ],
          negativos: [
            {
              label: "Sem visita (est.)",
              value: fmt(Math.max(0, campSlice.kpis.atendimentos - campSlice.kpis.visitas)),
            },
            {
              label: "Sem sucesso (est.)",
              value: fmt(Math.max(0, campSlice.kpis.atendimentos - campSlice.kpis.sucessos)),
            },
            { label: "Taxa visita", value: pct(campSlice.kpis.taxaVisita) },
          ],
          notas: [`Período ${periodoLabel}`, "Universo Meta (Facebook/Instagram)."],
        },
      },
      {
        id: "coletivo-agenda",
        nome: "Agendamentos",
        cargo: "Coletivo",
        setor: "coletivo",
        kpis: [
          { label: "Agendamentos", value: fmt(gAgenda.total) },
          { label: "Visitas", value: fmt(gAgenda.visitas) },
          { label: "Sucesso", value: fmt(gAgenda.sucessos) },
        ],
        detalhe: {
          positivos: [
            { label: "Sucessos", value: fmt(gAgenda.sucessos) },
            { label: "Visitas", value: fmt(gAgenda.visitas) },
            { label: "Agendamentos", value: fmt(gAgenda.total) },
          ],
          negativos: [
            { label: "Insucessos", value: fmt(gAgenda.insucessos ?? 0) },
            {
              label: "Sem visita",
              value: fmt(Math.max(0, gAgenda.total - gAgenda.visitas)),
            },
          ],
          notas: [`Período ${periodoLabel}`],
        },
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
        detalhe: {
          positivos: [
            { label: "Vendas", value: fmt(negKpis.vendas) },
            { label: "Trocas", value: fmt(negKpis.trocas) },
            { label: "Total", value: fmt(negKpis.total) },
          ],
          negativos: [
            { label: "Compras", value: fmt(negKpis.compras) },
            { label: "Outros", value: fmt(negKpis.outros) },
          ],
          notas: [
            `Período ${periodoLabel}`,
            "Filtro por data de entrada da negociação quando disponível.",
          ],
        },
      },
    ];

    list.push({
      id: "coletivo",
      title: "Coletivo BellosCar",
      blurb: `Totais da casa no período ${periodoLabel}.`,
      people: coletivoPeople,
    });

    const prevenda =
      schedAnalytics?.sdrPreVendaRows?.map((row): ShowPerson => {
        const gapVisita = Math.max(0, row.totalAgendamentos - row.totalVisitas);
        const gapSucesso = Math.max(0, row.totalVisitas - row.totalSucesso);
        return {
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
          detalhe: {
            positivos: [
              { label: "Sucessos", value: fmt(row.totalSucesso) },
              { label: "Conv. visita", value: pct(row.taxaConversaoVisita) },
              { label: "Conv. sucesso", value: pct(row.taxaConversaoSucesso) },
              { label: "Atendimentos", value: fmt(row.totalAtendimentos) },
            ],
            negativos: [
              { label: "Insucessos", value: fmt(row.totalInsucesso) },
              { label: "Ag. sem visita", value: fmt(gapVisita) },
              { label: "Visita sem sucesso", value: fmt(gapSucesso) },
            ],
            notas: [`Período ${periodoLabel}`],
          },
        };
      }) ?? [];

    if (prevenda.length) {
      list.push({
        id: "prevenda",
        title: "Pré-venda",
        blurb: "SDRs com números do período filtrado.",
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
          detalhe: {
            positivos: [
              { label: "Sucessos", value: fmt(row.sucessos) },
              { label: "Taxa sucesso", value: pct(row.taxaSucesso) },
              { label: "Taxa visita→sucesso", value: pct(row.taxaVisitaParaSucesso) },
            ],
            negativos: [
              {
                label: "Sem visita",
                value: fmt(Math.max(0, row.atendimentos - row.visitas)),
              },
              {
                label: "Sem sucesso",
                value: fmt(Math.max(0, row.atendimentos - row.sucessos)),
              },
              { label: "Taxa visita", value: pct(row.taxaVisita) },
            ],
            notas: [`Período ${periodoLabel}`],
          },
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
        .map((row): ShowPerson => {
          const topMotivo = row.motivosInsucesso?.[0];
          return {
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
            detalhe: {
              positivos: [
                { label: "Sucessos", value: fmt(row.totalSucesso) },
                { label: "Conv. geral", value: pct(row.conversaoGeral) },
                { label: "Conv. pré-venda", value: pct(row.conversaoPreVenda) },
              ],
              negativos: [
                { label: "Insucessos", value: fmt(row.totalInsucesso) },
                {
                  label: "Motivo top",
                  value: topMotivo
                    ? `${topMotivo.motivo} (${fmt(topMotivo.quantidade)})`
                    : "—",
                },
                { label: "Conv. recepção", value: pct(row.conversaoRecepcao) },
              ],
              notas: [`Período ${periodoLabel}`],
            },
          };
        }) ?? [];

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
        detalhe: {
          positivos: [
            { label: "Sucessos", value: fmt(row.sucessos) },
            { label: "Taxa sucesso", value: pct(row.taxaSucesso) },
          ],
          negativos: [
            {
              label: "Ag. sem sucesso",
              value: fmt(Math.max(0, row.agendamentos - row.sucessos)),
            },
          ],
          notas: [`Período ${periodoLabel}`, "Origem: campanhas Meta."],
        },
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
        detalhe: {
          positivos: [
            { label: "Vendas", value: fmt(row.vendas) },
            { label: "Trocas", value: fmt(row.trocas) },
            { label: "Venda+Troca", value: fmt(row.vendasMaisTrocas) },
          ],
          negativos: [
            { label: "Compras", value: fmt(row.compras) },
            { label: "Consignações", value: fmt(row.consignacoes) },
          ],
          notas: [`Período ${periodoLabel}`],
        },
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
  }, [
    campanhas.rows,
    negociacoes.dataset,
    schedAnalytics,
    period.from,
    period.to,
    periodoLabel,
  ]);

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
    setModalPerson(null);
  }, [sectionIx, period.from, period.to]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el || loading || modalPerson) return;
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
  }, [sectionIx, loading, sections, modalPerson]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (modalPerson) return;
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
      } else if (event.key === "Enter" && section?.people[cardIx]) {
        event.preventDefault();
        setModalPerson(section.people[cardIx]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sections, sectionIx, cardIx, modalPerson]);

  useEffect(() => {
    if (!sections.length) return;
    const max = Math.max(0, sections[sectionIx].people.length - 1);
    if (cardIx > max) setCardIx(max);
  }, [sections, sectionIx, cardIx]);

  const current = sections[sectionIx];
  const featured = current?.people[cardIx] ?? current?.people[0] ?? null;

  return (
    <div className="show-page">
      <header className="show-masthead">
        <div className="show-masthead-left">
          <Link className="show-back" to="/indice">
            Índice
          </Link>
          <div className="show-brand">
            <p>Sala de resultados</p>
            <h1>Apresentação</h1>
          </div>
        </div>
        <div className="show-masthead-score" aria-label="Período ativo">
          <span>Período</span>
          <strong>{periodoLabel}</strong>
        </div>
        <p className="show-hint">← → navega · Enter abre · Esc fecha</p>
      </header>

      <ShowPeriodFilter period={period} onChange={setPeriod} />
      <ShowFilterTip period={period} periodoLabel={periodoLabel} />

      {loading ? <p className="show-status">Carregando números vivos…</p> : null}
      {error ? <p className="show-status show-status--err">{error}</p> : null}

      {!loading && !error && current && featured ? (
        <>
          <nav className="show-sectors" aria-label="Setores">
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

          <section className="show-stage" ref={stageRef}>
            <header className="show-stage-head">
              <h2>{current.title}</h2>
              <p>{current.blurb}</p>
            </header>

            <ShowCard
              person={featured}
              variant="featured"
              focused
              onOpen={() => setModalPerson(featured)}
            />

            <div className="show-rail" aria-label="Equipe do setor">
              {current.people.map((person, ix) => (
                <ShowCard
                  key={person.id}
                  person={person}
                  variant="rail"
                  focused={ix === cardIx}
                  onSelect={() => setCardIx(ix)}
                />
              ))}
            </div>
          </section>
        </>
      ) : null}

      {modalPerson ? (
        <ShowPersonModal
          person={modalPerson}
          periodoLabel={periodoLabel}
          onClose={() => setModalPerson(null)}
        />
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
      detalhe: {
        positivos: [
          ...(prev.detalhe?.positivos ?? []),
          ...(p.detalhe?.positivos ?? []),
        ].slice(0, 6),
        negativos: [
          ...(prev.detalhe?.negativos ?? []),
          ...(p.detalhe?.negativos ?? []),
        ].slice(0, 6),
        notas: [...(prev.detalhe?.notas ?? []), ...(p.detalhe?.notas ?? [])].slice(0, 4),
      },
    });
  }
  return [...map.values()];
}

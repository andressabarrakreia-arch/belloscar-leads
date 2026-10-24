import { useEffect, useMemo, useState } from "react";
import { useModuleTicker } from "../context/ModuleTickerContext";
import { indexCampanhas, sliceCampanhas } from "../lib/campanhas/analytics";
import { currentMonthRange } from "../lib/dates";
import { normalizeSchedulingDataset } from "../lib/scheduling/mergeById";
import { SCHEDULING_DATA_URL } from "../lib/scheduling/storage";
import type { SchedulingDataset } from "../lib/scheduling/types";
import { dealsFromLines } from "../lib/negociacoes/metrics";
import { loadNegociacoesDataset } from "../lib/negociacoes/storage";
import {
  filterAgendamentos,
  filterRealizadosAtendimentos,
  filterRealizadosVisitas,
  filterSucessosEventos,
} from "../lib/scheduling/metrics";
import { loadSchedulingDataset } from "../lib/scheduling/storage";
import {
  buildAgendamentosTickerItems,
  buildCampanhasTickerItems,
  buildNegociacoesTickerItems,
} from "../lib/tickerItems";
import type { LeadAtendimentoItem } from "../lib/scheduling/types";

type Props = {
  /** id do módulo no registry: campanhas | agendamentos | negociacoes */
  moduleId: string;
};

const EMPTY_NEGO_FILTERS = {
  month: "all",
  period: "all",
  vendedor: "all",
  tipo: "all",
  status: "all",
  tipoVenda: "all",
} as const;

export function KeyTicker({ moduleId }: Props) {
  const { overrideItems } = useModuleTicker();
  const [fallbackItems, setFallbackItems] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFallbackItems(null);

    async function load() {
      try {
        if (moduleId === "negociacoes") {
          const ds = await loadNegociacoesDataset();
          if (!cancelled) {
            setFallbackItems(
              buildNegociacoesTickerItems(
                dealsFromLines(ds.lines),
                ds.avaliacoes || [],
                { ...EMPTY_NEGO_FILTERS },
                ds.updatedAt
              )
            );
          }
          return;
        }
        if (moduleId === "perfil") return;
        if (moduleId === "agendamentos") {
          const ds = await loadSchedulingDataset();
          if (!cancelled) {
            const items = filterAgendamentos(ds.items, {});
            const realizados = ds.realizados || [];
            const leadsAsAtend: LeadAtendimentoItem[] =
              realizados.length > 0
                ? filterRealizadosAtendimentos(realizados, {}).map((r) => ({
                    id: r.id,
                    data: r.dataAtendido,
                    sdr: r.sdr,
                    origem: r.origem,
                    tipoProposta: r.tipoProposta,
                  }))
                : ds.leadsAtendimentos || [];
            setFallbackItems(
              buildAgendamentosTickerItems(
                items,
                leadsAsAtend,
                ds.updatedAt,
                undefined,
                {
                  visitas: filterRealizadosVisitas(realizados, {}).length,
                  sucessos: filterSucessosEventos(ds.sucessosEventos || [], {})
                    .length,
                }
              )
            );
          }
          return;
        }
        const res = await fetch(SCHEDULING_DATA_URL, { cache: "no-store" });
        if (!res.ok) throw new Error("base");
        const published = normalizeSchedulingDataset((await res.json()) as SchedulingDataset);
        const campanhaRows = indexCampanhas(published);
        if (!cancelled) {
          setFallbackItems(
            buildCampanhasTickerItems(
              campanhaRows,
              published.updatedAt,
              sliceCampanhas(campanhaRows, currentMonthRange()).kpis
            )
          );
        }
      } catch {
        if (!cancelled) setFallbackItems(null);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [moduleId]);

  const items = overrideItems ?? fallbackItems;
  const sequence = useMemo(
    () => (items && items.length ? [...items, ...items] : null),
    [items]
  );

  if (!sequence) return null;

  return (
    <div className="key-ticker" aria-label="Indicadores principais em destaque">
      <div className="key-ticker-track" key={sequence.join("|")}>
        {sequence.map((text, i) => (
          <span className="key-ticker-item" key={`${moduleId}-${text}-${i}`}>
            <span className="key-ticker-dot" aria-hidden="true" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}

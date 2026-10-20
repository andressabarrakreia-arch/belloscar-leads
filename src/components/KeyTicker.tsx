import { useEffect, useMemo, useState } from "react";
import { useModuleTicker } from "../context/ModuleTickerContext";
import { loadDataset } from "../lib/dataset";
import { dealsFromLines } from "../lib/negociacoes/metrics";
import { loadNegociacoesDataset } from "../lib/negociacoes/storage";
import { filterAgendamentos } from "../lib/scheduling/metrics";
import { loadSchedulingDataset } from "../lib/scheduling/storage";
import {
  buildAgendamentosTickerItems,
  buildCampanhasTickerItems,
  buildNegociacoesTickerItems,
} from "../lib/tickerItems";

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
        if (moduleId === "agendamentos") {
          const ds = await loadSchedulingDataset();
          if (!cancelled) {
            const items = filterAgendamentos(ds.items, {});
            setFallbackItems(
              buildAgendamentosTickerItems(
                items,
                ds.leadsAtendimentos || [],
                ds.updatedAt
              )
            );
          }
          return;
        }
        const ds = await loadDataset();
        if (!cancelled) setFallbackItems(buildCampanhasTickerItems(ds));
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

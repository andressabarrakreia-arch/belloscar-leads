import { useEffect, useState } from "react";
import { loadMarketQuotes, type MarketQuote } from "../lib/market/quotes";
import { SinalTendencia } from "./SinalTendencia";

export function MarketStrip() {
  const [quotes, setQuotes] = useState<MarketQuote[] | null>(null);
  const [checkedAt, setCheckedAt] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadMarketQuotes().then((next) => {
      if (cancelled) return;
      setQuotes(next);
      setCheckedAt(
        new Date().toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="indice-market" aria-label="Indicadores de mercado">
      <div className="indice-market-head">
        <h2>Mercado</h2>
        <p>{checkedAt ? `Atualizado ao abrir · ${checkedAt}` : "Atualizando ao abrir…"}</p>
      </div>
      <div className="indice-market-grid">
        {(quotes ?? placeholders()).map((quote) => (
          <article key={quote.id} className="indice-quote">
            <span>{quote.label}</span>
            <strong>
              {quote.value}
              <SinalTendencia tendencia={quote.tendencia} sobeAjuda={quote.sobeAjuda} contra={quote.contra} />
            </strong>
            <small>{quote.detail}</small>
            {quote.source ? <em>{quote.source}</em> : null}
          </article>
        ))}
      </div>
    </section>
  );
}

function placeholders(): MarketQuote[] {
  return ["Dólar", "Selic", "Inflação (IPCA)", "Juros de veículos"].map((label) => ({
    id: label,
    label,
    value: "…",
    detail: "Consultando",
    source: "",
    tendencia: null,
    sobeAjuda: false,
    contra: "",
  }));
}

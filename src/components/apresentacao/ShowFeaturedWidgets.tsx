import type { ShowKpi, ShowPerson } from "../../lib/apresentacao/types";

type Tile = ShowKpi & { tone: "ok" | "bad" };

function buildTiles(person: ShowPerson): Tile[] {
  const detalhe = person.detalhe;
  if (detalhe) {
    const ok = detalhe.positivos.map((k) => ({ ...k, tone: "ok" as const }));
    const bad = detalhe.negativos.map((k) => ({ ...k, tone: "bad" as const }));
    const mixed = [...ok, ...bad];
    if (mixed.length > 0) return mixed.slice(0, 4);
  }
  return person.kpis.slice(0, 4).map((k) => ({ ...k, tone: "ok" as const }));
}

function IconOk() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function IconBad() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 8v5m0 3h.01M12 3a9 9 0 100 18 9 9 0 000-18z"
      />
    </svg>
  );
}

type Props = { person: ShowPerson };

export function ShowFeaturedWidgets({ person }: Props) {
  const tiles = buildTiles(person);
  if (tiles.length === 0) return null;

  return (
    <aside className="show-featured-widgets" aria-label="Desempenho do período">
      {tiles.map((tile) => (
        <div key={`${tile.tone}-${tile.label}`} className={`show-widget show-kpi--${tile.tone}`}>
          <span className="show-widget-icon" aria-hidden="true">
            {tile.tone === "ok" ? <IconOk /> : <IconBad />}
          </span>
          <div className="show-widget-copy">
            <span className="show-widget-label">{tile.label}</span>
            <strong className="show-widget-value">{tile.value}</strong>
          </div>
        </div>
      ))}
    </aside>
  );
}

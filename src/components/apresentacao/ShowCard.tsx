import { corSetor, type SetorId } from "../../lib/apresentacao/avatar";
import type { ShowPerson } from "../../lib/apresentacao/types";
import { ShowAvatar } from "./ShowAvatar";

type ShowCardProps = {
  person: ShowPerson;
  focused?: boolean;
  variant?: "featured" | "rail";
  onOpen: () => void;
};

export function ShowCard({ person, focused, variant = "rail", onOpen }: ShowCardProps) {
  const hue = corSetor(person.setor as SetorId);
  const featured = variant === "featured";
  return (
    <article
      className={`show-card show-card--${variant}${focused ? " is-focused" : ""}`}
      style={{ ["--show-accent" as string]: hue }}
      data-person-id={person.id}
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <ShowAvatar nome={person.nome} size={featured ? "lg" : "sm"} strikeOnMount={featured} />
      <div className="show-card-body">
        <p className="show-role">{person.cargo}</p>
        <h3 className="show-name">{person.nome}</h3>
        <dl className="show-kpis show-kpis--score">
          {person.kpis.map((kpi) => (
            <div key={kpi.label}>
              <dt>{kpi.label}</dt>
              <dd>{kpi.value}</dd>
            </div>
          ))}
        </dl>
        {featured ? <span className="show-card-cta">Abrir briefing</span> : null}
      </div>
    </article>
  );
}

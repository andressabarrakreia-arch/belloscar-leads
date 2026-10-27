import { avatarIniciais, corSetor, fotoEquipe, type SetorId } from "../../lib/apresentacao/avatar";
import type { ShowPerson } from "../../lib/apresentacao/types";

type ShowCardProps = {
  person: ShowPerson;
  focused?: boolean;
  variant?: "featured" | "rail";
  onOpen: () => void;
};

export function ShowCard({ person, focused, variant = "rail", onOpen }: ShowCardProps) {
  const hue = corSetor(person.setor as SetorId);
  const featured = variant === "featured";
  const foto = fotoEquipe(person.nome);
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
      <div className={`show-avatar${featured ? " show-avatar--lg" : ""}`} aria-hidden="true">
        {foto ? <img src={foto} alt="" /> : avatarIniciais(person.nome)}
      </div>
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

import { avatarIniciais, corSetor, type SetorId } from "../../lib/apresentacao/avatar";
import type { ShowPerson } from "../../lib/apresentacao/types";

type ShowCardProps = {
  person: ShowPerson;
  focused?: boolean;
};

export function ShowCard({ person, focused }: ShowCardProps) {
  const hue = corSetor(person.setor as SetorId);
  return (
    <article
      className={`show-card${focused ? " is-focused" : ""}`}
      style={{ ["--show-accent" as string]: hue }}
      data-person-id={person.id}
    >
      <div className="show-avatar" aria-hidden="true">
        {avatarIniciais(person.nome)}
      </div>
      <div className="show-card-body">
        <p className="show-role">{person.cargo}</p>
        <h3 className="show-name">{person.nome}</h3>
        <dl className="show-kpis">
          {person.kpis.map((kpi) => (
            <div key={kpi.label}>
              <dt>{kpi.label}</dt>
              <dd>{kpi.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

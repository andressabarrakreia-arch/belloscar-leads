import { useEffect, useRef } from "react";
import gsap from "gsap";
import { corSetor, type SetorId } from "../../lib/apresentacao/avatar";
import type { ShowPerson } from "../../lib/apresentacao/types";
import { ShowAvatar } from "./ShowAvatar";
import { ShowFeaturedWidgets } from "./ShowFeaturedWidgets";

type ShowCardProps = {
  person: ShowPerson;
  focused?: boolean;
  variant?: "featured" | "rail";
  /** Featured: abre briefing. Rail: promove ao topo. */
  onOpen?: () => void;
  onSelect?: () => void;
};

function kpiTone(person: ShowPerson, label: string): "ok" | "bad" | undefined {
  const detalhe = person.detalhe;
  if (!detalhe) return undefined;
  const norm = label.trim().toLowerCase();
  if (detalhe.positivos.some((k) => k.label.trim().toLowerCase() === norm || labelIncludes(norm, k.label))) {
    return "ok";
  }
  if (detalhe.negativos.some((k) => k.label.trim().toLowerCase() === norm || labelIncludes(norm, k.label))) {
    return "bad";
  }
  return undefined;
}

function labelIncludes(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.trim().toLowerCase();
  return x.includes(y) || y.includes(x);
}

export function ShowCard({ person, focused, variant = "rail", onOpen, onSelect }: ShowCardProps) {
  const hue = corSetor(person.setor as SetorId);
  const featured = variant === "featured";
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!featured || !rootRef.current) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    gsap.fromTo(
      rootRef.current,
      { opacity: 0.55, y: 10 },
      { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" }
    );
  }, [featured, person.id]);

  function activate() {
    if (featured) onOpen?.();
    else onSelect?.();
  }

  return (
    <article
      ref={rootRef}
      className={`show-card show-card--${variant}${focused ? " is-focused" : ""}`}
      style={{ ["--show-accent" as string]: hue }}
      data-person-id={person.id}
      role="button"
      tabIndex={0}
      onClick={activate}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          activate();
        }
      }}
    >
      <ShowAvatar nome={person.nome} size={featured ? "lg" : "sm"} strikeOnMount={featured} />
      <div className="show-card-body">
        <p className="show-role">{person.cargo}</p>
        <h3 className="show-name">{person.nome}</h3>
        <dl className="show-kpis show-kpis--score">
          {person.kpis.map((kpi) => {
            const tone = kpiTone(person, kpi.label);
            return (
              <div key={kpi.label} className={tone ? `show-kpi show-kpi--${tone}` : undefined}>
                <dt>{kpi.label}</dt>
                <dd>{kpi.value}</dd>
              </div>
            );
          })}
        </dl>
        {featured ? <span className="show-card-cta">Abrir briefing</span> : null}
      </div>
      {featured ? <ShowFeaturedWidgets person={person} /> : null}
    </article>
  );
}

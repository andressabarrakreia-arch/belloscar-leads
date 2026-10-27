import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import gsap from "gsap";
import {
  avatarIniciais,
  fotoEquipe,
  isBadgeEquipe,
  isLogoEquipe,
} from "../../lib/apresentacao/avatar";

type Size = "sm" | "lg" | "xl";

type ShowAvatarProps = {
  nome: string;
  size?: Size;
  /** Dispara o segundo nível (flash) ao montar — útil no modal. */
  strikeOnMount?: boolean;
};

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ShowAvatar({ nome, size = "sm", strikeOnMount = false }: ShowAvatarProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLSpanElement>(null);
  const foto = fotoEquipe(nome);
  const logo = isLogoEquipe(nome);
  const badge = isBadgeEquipe(nome);

  const sizeClass =
    size === "xl" ? " show-avatar--xl" : size === "lg" ? " show-avatar--lg" : "";
  let kindClass = "";
  if (foto) {
    kindClass = " show-avatar--photo";
    if (logo) kindClass += " show-avatar--logo";
    else if (badge) kindClass += " show-avatar--badge";
  }

  const runStrike = useCallback(() => {
    const shine = shineRef.current;
    const root = rootRef.current;
    if (!shine || !root || prefersReducedMotion()) return;
    root.classList.add("is-struck");
    gsap.killTweensOf(shine);
    gsap.fromTo(
      shine,
      { opacity: 0, xPercent: -120, yPercent: -40 },
      {
        opacity: 1,
        xPercent: 120,
        yPercent: 40,
        duration: 0.45,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(shine, {
            opacity: 0,
            duration: 0.2,
            ease: "power1.in",
            onComplete: () => root.classList.remove("is-struck"),
          });
        },
      }
    );
  }, []);

  useEffect(() => {
    if (strikeOnMount) runStrike();
  }, [strikeOnMount, nome, runStrike]);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const root = rootRef.current;
    const shine = shineRef.current;
    if (!root || !shine || prefersReducedMotion()) return;
    const rect = root.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    root.style.setProperty("--shine-x", `${x}%`);
    root.style.setProperty("--shine-y", `${y}%`);
    gsap.to(shine, { opacity: 0.85, duration: 0.18, overwrite: "auto", ease: "power1.out" });
  }

  function onPointerLeave() {
    const shine = shineRef.current;
    const root = rootRef.current;
    if (!shine || !root || prefersReducedMotion()) return;
    gsap.to(shine, { opacity: 0, duration: 0.35, overwrite: "auto", ease: "power1.in" });
  }

  function onPointerDown() {
    runStrike();
  }

  let content: ReactNode;
  if (foto) {
    content = <img src={foto} alt="" />;
  } else {
    content = avatarIniciais(nome);
  }

  return (
    <div
      ref={rootRef}
      className={`show-avatar${sizeClass}${kindClass}`}
      aria-hidden="true"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
    >
      {content}
      <span ref={shineRef} className="show-avatar__shine" />
    </div>
  );
}

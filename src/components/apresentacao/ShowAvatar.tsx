import { useCallback, useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import gsap from "gsap";
import {
  avatarIniciais,
  fotoEquipe,
  isBadgeEquipe,
  isLogoEquipe,
  isTransparentEquipe,
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
  const struckRef = useRef(false);
  const foto = fotoEquipe(nome);
  const logo = isLogoEquipe(nome);
  const transparent = isTransparentEquipe(nome);
  const badge = isBadgeEquipe(nome);

  const sizeClass =
    size === "xl" ? " show-avatar--xl" : size === "lg" ? " show-avatar--lg" : "";
  let kindClass = "";
  if (foto) {
    kindClass = " show-avatar--photo";
    if (transparent) kindClass += " show-avatar--logo-clear";
    else if (logo) kindClass += " show-avatar--logo";
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
      { opacity: 0, xPercent: -130, yPercent: -50 },
      {
        opacity: 1,
        xPercent: 130,
        yPercent: 50,
        duration: 0.55,
        ease: "power2.out",
        onComplete: () => {
          gsap.to(shine, {
            opacity: 0,
            duration: 0.25,
            ease: "power1.in",
            onComplete: () => root.classList.remove("is-struck"),
          });
        },
      }
    );
  }, []);

  const triggerMountShine = useCallback(() => {
    if (!strikeOnMount || struckRef.current) return;
    struckRef.current = true;
    // defer so layout/paint + imagem já estão no DOM
    requestAnimationFrame(() => {
      runStrike();
      window.setTimeout(() => runStrike(), 420);
    });
  }, [strikeOnMount, runStrike]);

  useEffect(() => {
    struckRef.current = false;
    if (!strikeOnMount) return;
    if (!foto) {
      triggerMountShine();
      return;
    }
    // se a img já estiver em cache, onLoad pode não disparar — fallback
    const t = window.setTimeout(triggerMountShine, 80);
    return () => window.clearTimeout(t);
  }, [strikeOnMount, nome, foto, triggerMountShine]);

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
    content = (
      <img
        src={foto}
        alt=""
        onLoad={() => {
          if (strikeOnMount) triggerMountShine();
        }}
      />
    );
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

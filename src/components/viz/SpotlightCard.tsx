import { useRef, useState, type PointerEvent, type ReactNode } from "react";

/** Luz que segue o ponteiro, no mesmo espírito do spotlight do Aceternity. */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const [pos, setPos] = useState({ x: -240, y: -240 });
  const caixa = useRef<DOMRect | null>(null);

  function medir(event: PointerEvent<HTMLDivElement>) {
    caixa.current = event.currentTarget.getBoundingClientRect();
  }

  function mover(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = caixa.current;
    if (!rect) return;
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  return (
    <div className={`spotlight-card ${className || ""}`} onPointerEnter={medir} onPointerMove={mover}>
      <div className="spotlight-luz" style={{ left: pos.x, top: pos.y }} />
      <div className="spotlight-miolo">{children}</div>
    </div>
  );
}

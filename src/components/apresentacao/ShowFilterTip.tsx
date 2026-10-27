import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { monthToDateRange } from "../../lib/dates";
import type { ShowPeriod } from "../../lib/apresentacao/types";

type Props = {
  period: ShowPeriod;
  periodoLabel: string;
};

export function isDefaultMtd(period: ShowPeriod): boolean {
  const mtd = monthToDateRange();
  return period.from === mtd.from && period.to === mtd.to;
}

/** Balão discreto junto ao ponteiro quando o filtro de período não é o MTD. */
export function ShowFilterTip({ period, periodoLabel }: Props) {
  const [visible, setVisible] = useState(false);
  const tipRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    if (isDefaultMtd(period)) {
      setVisible(false);
      return;
    }

    setVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setVisible(false), 2800);

    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [period.from, period.to]);

  useEffect(() => {
    if (!visible) return;

    function onMove(event: PointerEvent) {
      pos.current = { x: event.clientX + 14, y: event.clientY + 16 };
      const el = tipRef.current;
      if (!el) return;
      el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [visible]);

  useEffect(() => {
    const el = tipRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (visible) {
      if (reduce) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      gsap.fromTo(el, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: 0.22, ease: "power2.out" });
    } else {
      gsap.to(el, { autoAlpha: 0, duration: reduce ? 0 : 0.18, ease: "power1.in" });
    }
  }, [visible]);

  if (isDefaultMtd(period) && !visible) return null;

  return (
    <div
      ref={tipRef}
      className="show-filter-tip"
      role="status"
      aria-live="polite"
      style={{
        opacity: 0,
        transform: `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`,
      }}
    >
      Filtro: {periodoLabel}
    </div>
  );
}

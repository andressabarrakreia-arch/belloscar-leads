import { useEffect, useRef } from "react";

const COLORS = [
  "192, 32, 38",
  "226, 30, 38",
  "158, 24, 29",
  "196, 112, 104",
  "176, 124, 90",
];

type Particle = {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
};

function makeParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    r: 1.2 + Math.random() * 2.6,
    vx: (Math.random() - 0.5) * 0.22,
    vy: -0.08 - Math.random() * 0.22,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    alpha: 0.12 + Math.random() * 0.22,
  };
}

/** Partículas lentas, atrás do conteúdo. Some se o sistema pedir menos movimento. */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(42, Math.max(18, Math.round((width * height) / 42000)));
      particles = Array.from({ length: count }, () => makeParticle(width, height));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -8) p.y = height + 8;
        if (p.x < -8) p.x = width + 8;
        if (p.x > width + 8) p.x = -8;
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.color}, ${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = window.requestAnimationFrame(draw);
    };

    resize();
    frame = window.requestAnimationFrame(draw);
    window.addEventListener("resize", resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="particle-field" aria-hidden="true" />;
}

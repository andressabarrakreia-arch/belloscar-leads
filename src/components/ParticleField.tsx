import { useEffect, useRef } from "react";

const spriteUrl = `${import.meta.env.BASE_URL}brand/bc-particle.png`;

type Particle = {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  alpha: number;
};

function makeParticle(width: number, height: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    size: 22 + Math.random() * 16,
    vx: (Math.random() - 0.5) * 0.12,
    vy: -0.04 - Math.random() * 0.1,
    alpha: 0.07 + Math.random() * 0.08,
  };
}

/** Logos BC pequenas e lentas, atrás do conteúdo. O Índice não usa este campo. */
export function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sprite = new Image();
    sprite.src = spriteUrl;
    let ready = false;
    sprite.onload = () => {
      ready = true;
    };

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
      const count = Math.min(16, Math.max(8, Math.round((width * height) / 140000)));
      particles = Array.from({ length: count }, () => makeParticle(width, height));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      if (ready) {
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -p.size) p.y = height + p.size;
          if (p.x < -p.size) p.x = width + p.size;
          if (p.x > width + p.size) p.x = -p.size;
          ctx.globalAlpha = p.alpha;
          ctx.drawImage(sprite, p.x, p.y, p.size, p.size * (sprite.height / sprite.width));
        }
        ctx.globalAlpha = 1;
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

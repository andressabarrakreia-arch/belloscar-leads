import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import gsap from "gsap";

const fundo = `${import.meta.env.BASE_URL}brand/indice-fundo.jpg`;
const marca = `${import.meta.env.BASE_URL}brand/belloscar-logo.png`;
const metrics = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;
const bcLogo = `${import.meta.env.BASE_URL}brand/bc-logo-red.jpg`;

/** Logo BC em 2.5D HD (GSAP) — substitui o torus vermelho. */
function BcLogoSpin() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const img = imgRef.current;
    if (!wrap || !img) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.set(wrap, { transformPerspective: 900, transformStyle: "preserve-3d" });
    gsap.set(img, { transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    tl.to(wrap, { rotationY: 18, rotationX: -10, duration: 1.6 })
      .to(wrap, { rotationY: -18, rotationX: 8, duration: 1.8 })
      .to(wrap, { rotationY: 0, rotationX: 0, duration: 1.4 });

    const pulse = gsap.to(img, {
      scale: 1.06,
      duration: 1.35,
      yoyo: true,
      repeat: -1,
      ease: "power1.inOut",
    });

    const shine = wrap.querySelector(".indice-abertura-bc-shine");
    let shineTween: gsap.core.Tween | null = null;
    if (shine) {
      shineTween = gsap.fromTo(
        shine,
        { xPercent: -120, opacity: 0 },
        {
          xPercent: 120,
          opacity: 0.75,
          duration: 2.2,
          repeat: -1,
          repeatDelay: 0.9,
          ease: "power2.inOut",
        }
      );
    }

    return () => {
      tl.kill();
      pulse.kill();
      shineTween?.kill();
    };
  }, []);

  return (
    <div ref={wrapRef} className="indice-abertura-bc" aria-hidden="true">
      <img ref={imgRef} src={bcLogo} alt="" className="indice-abertura-bc-img" />
      <span className="indice-abertura-bc-shine" />
    </div>
  );
}

/** Abertura do pátio: sempre monta; só fecha no clique (ou Escape). */
export function IndiceAbertura() {
  const [ativa, setAtiva] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  const [luz, setLuz] = useState({ x: -200, y: -200 });

  function fechar() {
    setAtiva(false);
  }

  useLayoutEffect(() => {
    if (!ativa || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".indice-abertura-placa", { autoAlpha: 0, y: 18, duration: 0.7, ease: "power2.out" });
      gsap.from(".indice-abertura-foto", { scale: 1.06, duration: 3.2, ease: "power1.out" });
      gsap.from(".indice-abertura-bc", {
        autoAlpha: 0,
        scale: 0.82,
        rotationY: -40,
        duration: 0.9,
        ease: "power3.out",
        delay: 0.12,
      });
    }, root);
    return () => {
      ctx.revert();
    };
  }, [ativa]);

  useEffect(() => {
    if (!ativa) return;
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      fechar();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ativa]);

  if (!ativa) return null;

  function moverLuz(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setLuz({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  return (
    <div
      ref={root}
      className="indice-abertura"
      role="dialog"
      aria-label="Abertura BellosCar"
      aria-modal="true"
      onClick={fechar}
      style={{ cursor: "pointer" }}
    >
      <div className="indice-abertura-foto" style={{ backgroundImage: `url("${fundo}")` }} />
      <div className="indice-abertura-placa">
        <div className="indice-abertura-giro" aria-hidden="true" />
        <div className="indice-abertura-miolo" onPointerMove={moverLuz}>
          <div className="spotlight-luz" style={{ left: luz.x, top: luz.y }} />
          <BcLogoSpin />
          <img src={marca} alt="BellosCar, veículos seminovos e usados" />
          <img src={metrics} alt="Andressa Car Metrics" />
          <motion.button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              fechar();
            }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
          >
            Entrar
          </motion.button>
        </div>
      </div>
    </div>
  );
}

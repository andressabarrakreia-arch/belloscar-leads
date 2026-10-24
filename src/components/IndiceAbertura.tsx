import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import * as THREE from "three";

const fundo = `${import.meta.env.BASE_URL}brand/indice-fundo.jpg`;
const marca = `${import.meta.env.BASE_URL}brand/belloscar-logo.png`;
const metrics = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=2`;
const SESSAO = "belloscar-abertura";

function deveAbrir(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  return sessionStorage.getItem(SESSAO) !== "1";
}

function Roda() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    } catch {
      return;
    }
    renderer.setSize(160, 160, false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
    camera.position.z = 3.2;
    const geometry = new THREE.TorusGeometry(0.85, 0.14, 16, 48);
    const material = new THREE.MeshStandardMaterial({ color: 0xc02026, metalness: 0.35, roughness: 0.4 });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(2, 2, 3);
    scene.add(key);
    let frame = 0;
    const start = performance.now();
    const loop = (now: number) => {
      mesh.rotation.x = (now - start) / 1700;
      mesh.rotation.y = (now - start) / 1100;
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={ref} className="indice-abertura-roda" width={160} height={160} aria-hidden="true" />;
}

/** Uma entrada no pátio, uma vez por sessão. */
export function IndiceAbertura() {
  const [ativa, setAtiva] = useState(deveAbrir);
  const root = useRef<HTMLDivElement>(null);
  const [luz, setLuz] = useState({ x: -200, y: -200 });

  function fechar() {
    sessionStorage.setItem(SESSAO, "1");
    setAtiva(false);
  }

  useLayoutEffect(() => {
    if (!ativa || !root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".indice-abertura-placa", { autoAlpha: 0, y: 18, duration: 0.7, ease: "power2.out" });
      gsap.from(".indice-abertura-foto", { scale: 1.06, duration: 3.2, ease: "power1.out" });
    }, root);
    const timer = window.setTimeout(fechar, 3400);
    return () => {
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, [ativa]);

  if (!ativa) return null;

  function moverLuz(event: PointerEvent<HTMLDivElement>) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setLuz({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  }

  return (
    <div ref={root} className="indice-abertura" role="dialog" aria-label="Abertura BellosCar">
      <div className="indice-abertura-foto" style={{ backgroundImage: `url("${fundo}")` }} />
      <div className="indice-abertura-placa">
        <div className="indice-abertura-giro" aria-hidden="true" />
        <div className="indice-abertura-miolo" onPointerMove={moverLuz}>
          <div className="spotlight-luz" style={{ left: luz.x, top: luz.y }} />
          <Roda />
          <img src={marca} alt="BellosCar, veículos seminovos e usados" />
          <img src={metrics} alt="Andressa Car Metrics" />
          <motion.button
            type="button"
            onClick={fechar}
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

import { useTema } from "../theme";

const logoClara = `${import.meta.env.BASE_URL}brand/acm-logo.png?v=5`;
const logoEscura = `${import.meta.env.BASE_URL}brand/acm-logo-dark.png?v=5`;

type Props = {
  className?: string;
  /** Força variante (ex.: logo clara na sidebar escura). */
  force?: "light" | "dark";
};

/** Logo MetriCar: variante clara no tema light, tagline clara no dark. */
export function MetriCarLogo({ className = "", force }: Props) {
  const { tema } = useTema();
  const mode = force ?? tema;
  const src = mode === "dark" ? logoEscura : logoClara;
  return <img className={`metricar-logo ${className}`.trim()} src={src} alt="MetriCar" />;
}

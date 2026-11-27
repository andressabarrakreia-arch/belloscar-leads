import { AppShell } from "./shell/AppShell";
import type { AppModule } from "../modules/registry";

type Props = {
  module: AppModule;
  /** Mantido por compatibilidade; a sidebar unificada não filtra admin aqui. */
  showAdminNav?: boolean;
};

/**
 * @deprecated Preferir `AppShell`. Mantido para imports antigos.
 * Campanhas → shell isolado; demais módulos → shell unificado.
 */
export function ModuleLayout({ module }: Props) {
  const mode = module.id === "campanhas" ? "campanhas" : "unified";
  return <AppShell mode={mode} />;
}

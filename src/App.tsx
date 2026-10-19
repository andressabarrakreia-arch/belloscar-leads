import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ModuleLayout } from "./components/ModuleLayout";
import { AGENDAMENTOS, CAMPANHAS } from "./modules/registry";
import { Admin } from "./pages/Admin";
import { Attendants } from "./pages/Attendants";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { SchedulingAdmin } from "./pages/agendamentos/SchedulingAdmin";
import { SchedulingDetalhe } from "./pages/agendamentos/SchedulingDetalhe";
import { SchedulingInsucessos } from "./pages/agendamentos/SchedulingInsucessos";
import { SchedulingOverview } from "./pages/agendamentos/SchedulingOverview";
import { SchedulingPortais } from "./pages/agendamentos/SchedulingPortais";
import { SchedulingPreVendas } from "./pages/agendamentos/SchedulingPreVendas";
import { SchedulingShell } from "./pages/agendamentos/SchedulingShell";
import { SchedulingVendedores } from "./pages/agendamentos/SchedulingVendedores";

/**
 * Módulos com rotas e links distintos.
 * Análise de Campanhas: #/campanhas
 * Análise de Agendamentos: #/agendamentos (+ abas internas)
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route index element={<Navigate to="/campanhas" replace />} />

        <Route path="campanhas" element={<ModuleLayout module={CAMPANHAS} />}>
          <Route index element={<Dashboard />} />
          <Route path="atendentes" element={<Attendants />} />
          <Route path="comparar" element={<Compare />} />
          <Route path="admin" element={<Admin />} />
        </Route>

        <Route path="agendamentos" element={<ModuleLayout module={AGENDAMENTOS} />}>
          <Route element={<SchedulingShell />}>
            <Route index element={<SchedulingOverview />} />
            <Route path="pre-vendas" element={<SchedulingPreVendas />} />
            <Route path="vendedores" element={<SchedulingVendedores />} />
            <Route path="detalhe" element={<SchedulingDetalhe />} />
            <Route path="portais" element={<SchedulingPortais />} />
            <Route path="insucessos" element={<SchedulingInsucessos />} />
          </Route>
          <Route path="admin" element={<SchedulingAdmin />} />
        </Route>

        {/* Compatibilidade com links antigos */}
        <Route path="atendentes" element={<Navigate to="/campanhas/atendentes" replace />} />
        <Route path="comparar" element={<Navigate to="/campanhas/comparar" replace />} />
        <Route path="admin" element={<Navigate to="/campanhas/admin" replace />} />

        <Route path="*" element={<Navigate to="/campanhas" replace />} />
      </Routes>
    </HashRouter>
  );
}

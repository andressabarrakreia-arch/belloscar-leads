import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { ModuleLayout } from "./components/ModuleLayout";
import { AGENDAMENTOS, CAMPANHAS } from "./modules/registry";
import { Admin } from "./pages/Admin";
import { Attendants } from "./pages/Attendants";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";
import { SchedulingAdmin } from "./pages/agendamentos/SchedulingAdmin";
import { SchedulingAnalysis } from "./pages/agendamentos/SchedulingAnalysis";

/**
 * Módulos com rotas e links distintos.
 * Análise de Campanhas: #/campanhas
 * Análise de Agendamentos: #/agendamentos
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
          <Route index element={<SchedulingAnalysis />} />
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

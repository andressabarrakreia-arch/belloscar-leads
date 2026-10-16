import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { Admin } from "./pages/Admin";
import { Attendants } from "./pages/Attendants";
import { Compare } from "./pages/Compare";
import { Dashboard } from "./pages/Dashboard";

/**
 * HashRouter evita 404 no GitHub Pages em rotas diretas (/admin, /atendentes, etc.).
 * URLs: https://user.github.io/belloscar-leads/#/admin
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="atendentes" element={<Attendants />} />
          <Route path="comparar" element={<Compare />} />
          <Route path="admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

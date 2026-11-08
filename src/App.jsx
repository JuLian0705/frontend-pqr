import { Navigate, Route, Routes } from "react-router-dom";
import { rutaInicio, useAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import { Cargando } from "./ui.jsx";
import Login from "./pages/Login.jsx";
import Registro from "./pages/Registro.jsx";
import MisPqrs from "./pages/cliente/MisPqrs.jsx";
import NuevaPqrs from "./pages/cliente/NuevaPqrs.jsx";
import DetallePqrs from "./pages/cliente/DetallePqrs.jsx";
import Bandeja from "./pages/gestion/Bandejausuarios.jsx";
import DetalleGestion from "./pages/gestion/DetalleGestionusuarios.jsx";
import Metricas from "./pages/gestion/Metricasadministrador.jsx";

function Protegida({ roles, children }) {
  const { usuario, verificando } = useAuth();
  if (verificando) return <Cargando texto="Verificando sesión…" />;
  if (!usuario) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(usuario.rol)) return <Navigate to={rutaInicio(usuario)} replace />;
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { usuario } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={usuario ? <Navigate to={rutaInicio(usuario)} replace /> : <Login />} />
      <Route path="/registro" element={usuario ? <Navigate to={rutaInicio(usuario)} replace /> : <Registro />} />

      <Route path="/mis-pqrs" element={<Protegida roles={["cliente"]}><MisPqrs /></Protegida>} />
      <Route path="/mis-pqrs/nueva" element={<Protegida roles={["cliente"]}><NuevaPqrs /></Protegida>} />
      <Route path="/mis-pqrs/:id" element={<Protegida roles={["cliente"]}><DetallePqrs /></Protegida>} />

      <Route path="/gestion" element={<Protegida roles={["empleado", "admin"]}><Bandeja /></Protegida>} />
      <Route path="/gestion/:id" element={<Protegida roles={["empleado", "admin"]}><DetalleGestion /></Protegida>} />
      <Route path="/metricas" element={<Protegida roles={["admin"]}><Metricas /></Protegida>} />

      <Route path="*" element={<Navigate to={rutaInicio(usuario)} replace />} />
    </Routes>
  );
}

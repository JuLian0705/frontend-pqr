import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import { ROLES } from "../constantes.js";
import { clases } from "../ui.jsx";
import logoValdren from "../img/valdren-logo.png";
import Footer from "./footer.jsx";

/* ------------------------------------------------------------------ */
/* Íconos SVG inline (sin dependencias extra)                          */
/* ------------------------------------------------------------------ */
const ICONOS = {
  solicitudes: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M16 13H8",
    "M16 17H8",
  ],
  radicar: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 8v8", "M8 12h8"],
  bandeja: [
    "M22 12h-6l-2 3h-4l-2-3H2",
    "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  ],
  metricas: ["M3 3v18h18", "M18 17V9", "M13 17V5", "M8 17v-3"],
  salir: ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "m16 17 5-5-5-5", "M21 12H9"],
};

function Icono({ nombre, className = "h-4 w-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {(ICONOS[nombre] ?? []).map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/* Anillo de foco accesible y consistente en toda la barra */
const FOCO =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500";

const MENU = {
  cliente: [
    { a: "/mis-pqrs", texto: "Mis solicitudes", icono: "solicitudes", fin: true },
    { a: "/mis-pqrs/nueva", texto: "Radicar PQRS", icono: "radicar" },
  ],
  empleado: [{ a: "/gestion", texto: "Bandeja", icono: "bandeja" }],
  admin: [
    { a: "/gestion", texto: "Bandeja", icono: "bandeja" },
    { a: "/metricas", texto: "Métricas", icono: "metricas" },
  ],
};

function iniciales(nombre = "") {
  return (
    nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/* ------------------------------------------------------------------ */
/* Indicador de estado de la IA                                        */
/* ------------------------------------------------------------------ */
function EstadoIA() {
  const [salud, setSalud] = useState(null);

  useEffect(() => {
    let activo = true;
    const consultar = () =>
      api("/api/salud")
        .then((s) => activo && setSalud(s))
        .catch(() => activo && setSalud(null));
    consultar();
    const id = setInterval(consultar, 30_000);
    return () => {
      activo = false;
      clearInterval(id);
    };
  }, []);

  if (!salud) return null;
  const { ia } = salud;
  const lista = ia.habilitada && ia.ollama_disponible && ia.modelo_descargado;

  return (
    <span
      className={clases(
        "hidden items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset md:inline-flex",
        lista
          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
          : "bg-amber-50 text-amber-700 ring-amber-600/20",
      )}
      title={lista ? `Modelo ${ia.modelo} listo` : "Las PQRS se clasifican con reglas de respaldo"}
      data-testid="estado-ia"
    >
      <span className="relative flex h-2 w-2">
        {lista && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={clases(
            "relative inline-flex h-2 w-2 rounded-full",
            lista ? "bg-emerald-500" : "bg-amber-500",
          )}
        />
      </span>
      {lista ? `IA local · ${ia.modelo}` : "IA no disponible · respaldo por reglas"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Layout principal                                                    */
/* ------------------------------------------------------------------ */
export default function Layout({ children }) {
  const { usuario, cerrarSesion } = useAuth();
  const navegar = useNavigate();

  const salir = () => {
    cerrarSesion();
    navegar("/login", { replace: true });
  };

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-slate-50 text-slate-800">
      {/* Fondo decorativo azul cielo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem] overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100/70 via-cyan-50/50 to-transparent" />
        <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-blue-300/25 blur-3xl" />
        <div className="absolute -top-24 -left-32 h-80 w-80 rounded-full bg-cyan-200/40 blur-3xl" />
      </div>

      {/* Encabezado */}
      <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/85 shadow-sm shadow-blue-900/5 backdrop-blur-xl">
        <div className="h-1 bg-gradient-to-r from-blue-700 via-cyan-400 to-blue-600" />

        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:px-6 md:gap-x-8">
          {/* Marca */}
          <div className="flex min-w-0 items-center">
            <img
              src={logoValdren}
              alt="Valdren AI"
              className="h-10 w-auto max-w-[190px] shrink-0 select-none object-contain sm:h-11 sm:max-w-[220px]"
              draggable="false"
            />
          </div>

          {/* Navegación (en móvil baja a su propia fila con scroll horizontal) */}
          <nav
            aria-label="Principal"
            className="order-last -mx-1 flex w-full gap-1 overflow-x-auto px-1 pb-1 md:order-none md:w-auto md:pb-0"
          >
            {(MENU[usuario.rol] ?? []).map((item) => (
              <NavLink
                key={item.a}
                to={item.a}
                end={item.fin}
                className={({ isActive }) =>
                  clases(
                    "inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200"
                      : "text-slate-600 hover:bg-cyan-50 hover:text-blue-800",
                    FOCO,
                  )
                }
              >
                <Icono nombre={item.icono} />
                {item.texto}
              </NavLink>
            ))}
          </nav>

          {/* Usuario y acciones */}
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            {usuario.rol !== "cliente" && <EstadoIA />}

            <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-4">
              <span
                aria-hidden="true"
                className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-200 text-sm font-semibold text-blue-800 shadow-sm ring-2 ring-white sm:grid"
              >
                {iniciales(usuario.nombre)}
              </span>
              <div className="min-w-0 leading-tight">
                <p
                  className="max-w-[6.5rem] truncate text-sm font-semibold text-slate-900 sm:max-w-[14rem]"
                  data-testid="usuario-nombre"
                >
                  {usuario.nombre}
                </p>
                <p className="max-w-[6.5rem] truncate text-xs text-slate-500 sm:max-w-[14rem]">
                  <span className="font-medium text-blue-700">{ROLES[usuario.rol]}</span>
                  {usuario.area ? ` · ${usuario.area.nombre}` : ""}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={salir}
              title="Cerrar sesión"
              data-testid="btn-salir"
              className={clases(
                "inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700",
                FOCO,
              )}
            >
              <Icono nombre="salir" />
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <Footer />
    </div>
  );
}
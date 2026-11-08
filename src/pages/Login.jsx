import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { rutaInicio, useAuth } from "../auth.jsx";
import { USUARIOS_DEMO } from "../constantes.js";
import { Alerta, clases } from "../ui.jsx";
import mascotaValdren from "../img/Mascota robótica orbital en neón.png";
import logoValdren from "../img/valdren-logo.png";
import logoValdrenBlanco from "../img/valdren-logo-blanco.png";

/* ------------------------------------------------------------------ */
/* Íconos SVG inline (sin dependencias extra)                          */
/* ------------------------------------------------------------------ */
const ICONOS = {
  marca: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", "M8 9h8", "M8 13h5"],
  usuario: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"],
  usuarioMas: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M19 8v6",
    "M22 11h-6",
  ],
  correo: ["M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z", "m22 6-10 7L2 6"],
  candado: [
    "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
    "M7 11V7a5 5 0 0 1 10 0v4",
  ],
  ojo: ["M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z", "M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  ojoTachado: [
    "M17.94 17.94A10.07 10.07 0 0 1 12 19c-6.5 0-10-7-10-7a18.45 18.45 0 0 1 5.06-5.94",
    "M9.9 4.24A9.12 9.12 0 0 1 12 4c6.5 0 10 7 10 7a18.5 18.5 0 0 1-2.16 3.19",
    "M14.12 14.12a3 3 0 1 1-4.24-4.24",
    "M2 2l20 20",
  ],
  flecha: ["M5 12h14", "m12 5 7 7-7 7"],
  escudo: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "m9 12 2 2 4-4"],
  terminal: ["m4 17 6-6-6-6", "M12 19h8"],
  check: ["M20 6 9 17l-5-5"],
  bot: [
    "M12 8V4H8",
    "M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z",
    "M2 14h2",
    "M20 14h2",
    "M15 13v2",
    "M9 13v2",
  ],
  flujo: [
    "M5 3h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
    "M7 11v4a2 2 0 0 0 2 2h4",
    "M15 13h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z",
  ],
  equipo: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "M22 21v-2a4 4 0 0 0-3-3.87",
    "M16 3.13a4 4 0 0 1 0 7.75",
  ],
};

export function Icono({ nombre, className = "h-4 w-4" }) {
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

export function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4z" />
    </svg>
  );
}

/* Fondo de puntos igual al del sitio de Valcode (blanco + puntos grises suaves) */
const PUNTOS_VALCODE = "bg-[radial-gradient(#dfe3ea_1.2px,transparent_1.2px)] [background-size:24px_24px]";

const CAMPO =
  "h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#2B5BFF] focus:outline-none focus:ring-4 focus:ring-[#2B5BFF]/15";

/* Logo de Valdren, usado en el encabezado y en el acceso móvil. */
export function Logo({ oscuro = false }) {
  return (
    <img
      src={oscuro ? logoValdrenBlanco : logoValdren}
      alt="Valdren AI"
      className="h-12 w-auto max-w-[220px] select-none object-contain"
      draggable="false"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Panel de marca (izquierda)                                          */
/* ------------------------------------------------------------------ */
export function PanelMarca() {
  return (
    <div className="relative hidden flex-col justify-between gap-8 border-r border-slate-200/80 p-10 lg:flex xl:p-14">
      {/* Resplandor azul muy sutil detrás del titular */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/4 top-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
      />

      {/* Encabezado: logo de Valdren */}
      <div className="relative flex items-center justify-between">
        <Logo />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Operativo
        </span>
      </div>

      <div className="relative flex flex-1 flex-col items-center justify-center py-8 text-center">
        <img
          src={mascotaValdren}
          alt="Mascota robótica de Valdren AI"
          className="h-auto w-full max-w-sm select-none object-contain drop-shadow-2xl"
          draggable="false"
        />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950 xl:text-5xl">
          PQRS<span className="text-blue-600">·</span>IA
        </h1>
        <p className="mt-2 font-mono text-sm uppercase tracking-[0.25em] text-slate-500">
          Gestión inteligente
        </p>
      </div>

      <div className="relative flex justify-end">
        <p className="pb-1 font-mono text-[11px] text-slate-400">Prototipo · Proyecto de Software</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Pantalla de inicio de sesión                                        */
/* ------------------------------------------------------------------ */
export default function Login() {
  const { iniciarSesion } = useAuth();
  const navegar = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const usuario = await iniciarSesion(email, password);
      navegar(rutaInicio(usuario), { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    // Fondo de puntos Valcode de arriba a abajo en toda la pantalla
    <div className={clases("relative grid min-h-screen bg-white lg:grid-cols-2", PUNTOS_VALCODE)}>
      <PanelMarca />

      <div className="relative flex items-center justify-center bg-[#2B5BFF] px-4 py-12 sm:px-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="relative w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Logo oscuro />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-md">
            <Icono nombre="escudo" className="h-3.5 w-3.5 text-white" />
            Acceso seguro
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">Bienvenido de nuevo</h2>
          <p className="mt-3 text-[15px] text-white/75">Ingresa para radicar o gestionar solicitudes.</p>

          {/* Tarjeta del formulario */}
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-2xl shadow-[#0A1F8F]/40 ring-1 ring-black/5 sm:p-8">
            <form onSubmit={enviar} className="space-y-5" noValidate>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Correo
                </label>
                <div className="relative">
                  <Icono
                    nombre="correo"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    type="email"
                    className={clases(CAMPO, "pr-3")}
                    placeholder="Tu direccion de correo electronico"
                    value={email}
                    autoComplete="username"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    data-testid="login-email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Contraseña
                </label>
                <div className="relative">
                  <Icono
                    nombre="candado"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={verClave ? "text" : "password"}
                    className={clases(CAMPO, "pr-11")}
                    placeholder="••••••••"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    data-testid="login-password"
                  />
                  <button
                    type="button"
                    onClick={() => setVerClave((v) => !v)}
                    aria-label={verClave ? "Ocultar clave" : "Ver clave"}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
                  >
                    <Icono nombre={verClave ? "ojoTachado" : "ojo"} />
                  </button>
                </div>
              </div>

              <Alerta>{error}</Alerta>

              <button
                type="submit"
                disabled={cargando}
                aria-busy={cargando}
                data-testid="login-enviar"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-slate-800 hover:shadow-slate-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cargando && <Spinner />}
                Ingresar
                {!cargando && (
                  <Icono nombre="flecha" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/75">
            ¿No tienes cuenta?{" "}
            <Link to="/registro" className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white">
              Regístrate
            </Link>
          </p>

          {/* Usuarios de prueba: tarjetas claras compactas */}
          <div className="mt-8">
            <div className="mb-3 flex items-center gap-3">
              <span className="h-px flex-1 bg-white/20" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Usuarios demo</span>
              <span className="h-px flex-1 bg-white/20" />
            </div>
            <ul className="grid grid-cols-2 gap-2">
              {USUARIOS_DEMO.map((u) => {
                const elegido = email === u.email;
                return (
                  <li key={u.email}>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail(u.email);
                        setPassword(u.password);
                      }}
                      title={u.email}
                      className={clases(
                        "flex w-full items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left ring-1 ring-inset backdrop-blur-md transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-white",
                        elegido
                          ? "bg-white ring-white shadow-lg shadow-[#0A1F8F]/30"
                          : "bg-white/10 ring-white/20 hover:bg-white/15 hover:ring-white/35",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={clases(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-semibold",
                          elegido ? "bg-[#2B5BFF] text-white" : "bg-white text-[#2B5BFF]",
                        )}
                      >
                        {elegido ? <Icono nombre="check" className="h-3.5 w-3.5" /> : String(u.rol ?? "?")[0]}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={clases("block truncate text-xs font-semibold", elegido ? "text-slate-900" : "text-white")}>{u.rol}</span>
                        <span className={clases("block truncate font-mono text-[10.5px]", elegido ? "text-slate-500" : "text-white/65")}>{u.email}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="mt-3 text-center text-xs text-white/60">Clic en un usuario para llenar el formulario.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth.jsx";
import { Alerta, clases } from "../ui.jsx";
import { Icono, Logo, PanelMarca, Spinner } from "./Login.jsx";

const CAMPO =
  "h-11 w-full rounded-xl border bg-slate-50/60 pl-10 text-sm text-slate-900 placeholder:text-slate-400 transition focus:bg-white focus:outline-none focus:ring-4";
const ESTADO_CAMPO = {
  normal: "border-slate-200 focus:border-[#2B5BFF] focus:ring-[#2B5BFF]/15",
  error: "border-rose-300 focus:border-rose-500 focus:ring-rose-500/15",
  ok: "border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/15",
};

const ICONO_CAMPO = "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400";
const ETIQUETA = "mb-1.5 block text-sm font-medium text-slate-700";

function BotonVerClave({ visible, alternar }) {
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={visible ? "Ocultar clave" : "Ver clave"}
      className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600"
    >
      <Icono nombre={visible ? "ojoTachado" : "ojo"} />
    </button>
  );
}

const COLOR_NIVEL = ["bg-slate-200", "bg-rose-400", "bg-amber-400", "bg-emerald-500"];

export default function Registro() {
  const { registrarse } = useAuth();
  const navegar = useNavigate();
  const [datos, setDatos] = useState({ nombre: "", email: "", password: "", confirmacion: "" });
  const [acepta, setAcepta] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const cambiar = (campo) => (e) => setDatos({ ...datos, [campo]: e.target.value });

  /* Requisitos de la contraseña, evaluados en vivo */
  const reglas = [
    { ok: datos.password.length >= 8, texto: "8+ caracteres" },
    { ok: /[a-záéíóúñ]/i.test(datos.password), texto: "Letras" },
    { ok: /\d/.test(datos.password), texto: "Números" },
  ];
  const nivel = reglas.filter((r) => r.ok).length;
  const coincide = datos.confirmacion !== "" && datos.confirmacion === datos.password;
  const noCoincide = datos.confirmacion !== "" && !coincide;

  async function enviar(e) {
    e.preventDefault();
    setError("");
    if (datos.password !== datos.confirmacion) return setError("Las contraseñas no coinciden");
    if (!acepta) return setError("Debes autorizar el tratamiento de tus datos personales");
    setCargando(true);
    try {
      await registrarse({ nombre: datos.nombre, email: datos.email, password: datos.password });
      navegar("/mis-pqrs", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <PanelMarca />

      <div className="relative flex items-center justify-center overflow-hidden bg-[#2B5BFF] px-4 py-12 sm:px-6">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1.2px,transparent_1.2px)] [background-size:24px_24px]" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo oscuro />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white ring-1 ring-inset ring-white/25 backdrop-blur-md">
            <Icono nombre="usuarioMas" className="h-3.5 w-3.5 text-white" />
            Nueva cuenta
          </span>
          <h2 className="mt-5 text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">Crear cuenta</h2>
          <p className="mt-3 text-[15px] text-white/75">Regístrate para radicar y hacer seguimiento a tus PQRS.</p>

          {/* Tarjeta del formulario */}
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-2xl shadow-[#0A1F8F]/40 ring-1 ring-black/5 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-inset ring-blue-100">
                <Icono nombre="usuarioMas" className="h-5 w-5" />
              </span>
              <span className="font-mono text-[11px] tracking-[0.15em] text-slate-400">AUTH_02</span>
            </div>

            <form onSubmit={enviar} className="space-y-5" noValidate>
              {/* Nombre */}
              <div>
                <label htmlFor="nombre" className={ETIQUETA}>
                  Nombre completo
                </label>
                <div className="relative">
                  <Icono nombre="usuario" className={ICONO_CAMPO} />
                  <input
                    id="nombre"
                    className={clases(CAMPO, ESTADO_CAMPO.normal, "pr-3")}
                    placeholder="Nombres"
                    value={datos.nombre}
                    onChange={cambiar("nombre")}
                    autoComplete="name"
                    data-testid="registro-nombre"
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="email" className={ETIQUETA}>
                  Correo
                </label>
                <div className="relative">
                  <Icono nombre="correo" className={ICONO_CAMPO} />
                  <input
                    id="email"
                    type="email"
                    className={clases(CAMPO, ESTADO_CAMPO.normal, "pr-3")}
                    placeholder="Tu direccion de correo electronico"
                    value={datos.email}
                    onChange={cambiar("email")}
                    autoComplete="email"
                    data-testid="registro-email"
                  />
                </div>
              </div>

              {/* Contraseña + medidor de seguridad */}
              <div>
                <label htmlFor="password" className={ETIQUETA}>
                  Contraseña
                </label>
                <div className="relative">
                  <Icono nombre="candado" className={ICONO_CAMPO} />
                  <input
                    id="password"
                    type={verClave ? "text" : "password"}
                    className={clases(CAMPO, ESTADO_CAMPO.normal, "pr-11")}
                    placeholder="••••••••"
                    value={datos.password}
                    onChange={cambiar("password")}
                    autoComplete="new-password"
                    data-testid="registro-password"
                  />
                  <BotonVerClave visible={verClave} alternar={() => setVerClave((v) => !v)} />
                </div>

                <div className="mt-2.5 flex gap-1.5" aria-hidden="true">
                  {[1, 2, 3].map((n) => (
                    <span
                      key={n}
                      className={clases(
                        "h-1 flex-1 rounded-full transition-colors duration-300",
                        nivel >= n ? COLOR_NIVEL[nivel] : COLOR_NIVEL[0],
                      )}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {reglas.map((r) => (
                    <span
                      key={r.texto}
                      className={clases(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset transition-colors",
                        r.ok
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
                          : "bg-slate-50 text-slate-500 ring-slate-200",
                      )}
                    >
                      {r.ok && <Icono nombre="check" className="h-3 w-3" />}
                      {r.texto}
                    </span>
                  ))}
                </div>
                <p className="mt-1.5 text-xs text-slate-400">Mínimo 8 caracteres, con letras y números.</p>
              </div>

              {/* Confirmación */}
              <div>
                <label htmlFor="confirmacion" className={ETIQUETA}>
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Icono nombre="candado" className={ICONO_CAMPO} />
                  <input
                    id="confirmacion"
                    type={verClave ? "text" : "password"}
                    className={clases(
                      CAMPO,
                      noCoincide ? ESTADO_CAMPO.error : coincide ? ESTADO_CAMPO.ok : ESTADO_CAMPO.normal,
                      "pr-11",
                    )}
                    placeholder="••••••••"
                    value={datos.confirmacion}
                    onChange={cambiar("confirmacion")}
                    autoComplete="new-password"
                    aria-invalid={noCoincide || undefined}
                    data-testid="registro-confirmacion"
                  />
                  <BotonVerClave visible={verClave} alternar={() => setVerClave((v) => !v)} />
                </div>
                {coincide && (
                  <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-emerald-600">
                    <Icono nombre="check" className="h-3.5 w-3.5" />
                    Las contraseñas coinciden
                  </p>
                )}
              </div>

              {/* Autorización de datos (Ley 1581) */}
              <label
                className={clases(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 text-xs leading-relaxed transition-colors",
                  acepta ? "border-blue-200 bg-blue-50/60 text-slate-700" : "border-slate-200 bg-slate-50/60 text-slate-600 hover:border-slate-300",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-[#2B5BFF]"
                  checked={acepta}
                  onChange={(e) => setAcepta(e.target.checked)}
                  data-testid="registro-acepta"
                />
                <span>
                  Autorizo el tratamiento de mis datos personales para gestionar mis solicitudes, conforme a la{" "}
                  <span className="font-semibold text-slate-900">Ley 1581 de 2012</span>.
                </span>
              </label>

              <Alerta>{error}</Alerta>

              <button
                type="submit"
                disabled={cargando}
                aria-busy={cargando}
                data-testid="registro-enviar"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 hover:shadow-slate-950/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {cargando && <Spinner />}
                Crear cuenta
                {!cargando && (
                  <Icono nombre="flecha" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-white/75">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-semibold text-white underline decoration-white/40 underline-offset-4 transition hover:decoration-white">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
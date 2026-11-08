import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { Alerta, clases } from "../../ui.jsx";
import { Icono, Spinner } from "../Login.jsx";

const MIN = 20;
const MAX = 4000;
const MIN_ASUNTO = 5;
const AZUL = "#2B5BFF";

const CAMPO =
  "w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 transition focus:border-[#2B5BFF] focus:outline-none focus:ring-4 focus:ring-[#2B5BFF]/15";

/* Pasos que se muestran en el panel lateral */
const PASOS = [
  { icono: "marca", titulo: "Describe tu caso", texto: "Con tus palabras, sin formularios largos." },
  { icono: "bot", titulo: "La IA lo clasifica", texto: "Identifica tipo, prioridad y área en segundos." },
  { icono: "equipo", titulo: "Un asesor responde", texto: "Te avisamos cada avance de tu solicitud." },
];

export default function NuevaPqrs() {
  const navegar = useNavigate();
  const { state } = useLocation();
  const [asunto, setAsunto] = useState("");
  const [descripcion, setDescripcion] = useState(state?.descripcionSugerida ?? "");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const largoAsunto = asunto.trim().length;
  const largo = descripcion.trim().length;
  const asuntoOk = largoAsunto >= MIN_ASUNTO;
  const descripcionOk = largo >= MIN && largo <= MAX;
  const valido = asuntoOk && descripcionOk;
  const progreso = Math.min(100, Math.round((largo / MIN) * 100));

  async function enviar(e) {
    e.preventDefault();
    if (!valido) return;
    setError("");
    setCargando(true);
    try {
      const creada = await api("/api/pqrs", { method: "POST", body: { asunto, descripcion } });
      navegar(`/mis-pqrs/${creada.id}`, { state: { recienCreada: true } });
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2B5BFF]" />
            Nueva solicitud
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Radicar una PQRS</h1>
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-slate-500">
            Cuéntanos tu caso. No necesitas elegir el tipo ni el área: el sistema lo identifica y lo envía al equipo
            correcto.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-sm sm:self-auto">
          <Icono nombre="escudo" className="h-4 w-4 text-[#2B5BFF]" />
          Respuesta en máx. <span className="font-semibold text-slate-900">15 días hábiles</span>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Formulario */}
        <form
          onSubmit={enviar}
          noValidate
          className="rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/[0.04]"
        >
          <div className="space-y-6 p-6 sm:p-8">
            {/* Asunto */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="asunto" className="text-sm font-semibold text-slate-900">
                  Asunto
                </label>
                <span className={clases("text-xs tabular-nums", asuntoOk ? "text-emerald-600" : "text-slate-400")}>
                  {asuntoOk ? "✓ Listo" : `${largoAsunto}/150`}
                </span>
              </div>
              <input
                id="asunto"
                className={clases(CAMPO, "h-12")}
                maxLength={150}
                value={asunto}
                placeholder="Ej.: Cobro duplicado en la factura de octubre"
                onChange={(e) => setAsunto(e.target.value)}
                data-testid="pqrs-asunto"
              />
              <p className="mt-1.5 text-xs text-slate-400">Un título corto que resuma tu solicitud.</p>
            </div>

            {/* Descripción */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="descripcion" className="text-sm font-semibold text-slate-900">
                  Descripción
                </label>
                <span
                  className={clases(
                    "text-xs tabular-nums",
                    largo < MIN ? "text-amber-600" : largo > MAX ? "text-rose-600" : "text-slate-400",
                  )}
                >
                  {largo.toLocaleString("es-CO")}/{MAX.toLocaleString("es-CO")}
                </span>
              </div>
              <textarea
                id="descripcion"
                rows={9}
                className={clases(CAMPO, "resize-y py-3 leading-relaxed")}
                maxLength={MAX}
                value={descripcion}
                placeholder="Cuéntanos qué pasó, cuándo ocurrió y qué solución esperas."
                onChange={(e) => setDescripcion(e.target.value)}
                data-testid="pqrs-descripcion"
              />

              {/* Barra de progreso hacia el mínimo */}
              <div className="mt-3 flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={clases(
                      "h-full rounded-full transition-all duration-300",
                      descripcionOk ? "bg-emerald-500" : "bg-[#2B5BFF]",
                    )}
                    style={{ width: `${progreso}%` }}
                  />
                </div>
                <span className={clases("shrink-0 text-xs", descripcionOk ? "text-emerald-600" : "text-slate-500")}>
                  {descripcionOk ? "✓ Suficiente detalle" : `Mínimo ${MIN} caracteres`}
                </span>
              </div>
            </div>

            {/* Aviso de seguridad */}
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 ring-1 ring-inset ring-amber-200/70">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white text-amber-600 ring-1 ring-inset ring-amber-200">
                <Icono nombre="candado" className="h-4 w-4" />
              </span>
              <p className="text-xs leading-relaxed text-amber-900">
                <span className="font-semibold">Por tu seguridad,</span> no escribas números de tarjeta, cuentas
                bancarias ni contraseñas.
              </p>
            </div>

            <Alerta>{error}</Alerta>
          </div>

          {/* Pie del formulario */}
          <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <p className="text-xs text-slate-400">Recibirás un número de radicado para el seguimiento.</p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navegar("/mis-pqrs")}
                className="h-11 rounded-full px-5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B5BFF]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!valido || cargando}
                aria-busy={cargando}
                data-testid="pqrs-enviar"
                className="group inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-6 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-[#2B5BFF] hover:shadow-[#2B5BFF]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B5BFF] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
              >
                {cargando && <Spinner />}
                Radicar solicitud
                {!cargando && (
                  <Icono nombre="flecha" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Panel lateral: cómo funciona */}
        <aside className="space-y-4">
          <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{ backgroundColor: AZUL }}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.16)_1.2px,transparent_1.2px)] [background-size:20px_20px]"
            />
            <div className="relative">
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">Cómo funciona</p>
              <ol className="mt-5 space-y-5">
                {PASOS.map((p, i) => (
                  <li key={p.titulo} className="flex gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
                      <Icono nombre={p.icono} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        <span className="mr-1.5 font-mono text-xs text-white/60">0{i + 1}</span>
                        {p.titulo}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-white/75">{p.texto}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">Consejos para una respuesta rápida</p>
            <ul className="mt-3 space-y-2.5 text-xs leading-relaxed text-slate-600">
              {[
                "Incluye fechas y números de factura o pedido.",
                "Explica qué esperas que hagamos.",
                "Una solicitud por cada caso.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Icono nombre="check" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2B5BFF]" />
                  {t}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-slate-100 pt-4 text-[11px] text-slate-400">
              Plazo según la Ley 1755 de 2015.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
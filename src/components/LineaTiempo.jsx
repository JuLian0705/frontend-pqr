import { ESTADOS, EVENTOS } from "../constantes.js";
import { clases, fecha } from "../ui.jsx";

/* ------------------------------------------------------------------ */
/* Íconos SVG inline (sin dependencias extra)                          */
/* ------------------------------------------------------------------ */
const ICONOS = {
  creada: [
    "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
    "M14 2v6h6",
    "M12 18v-6",
    "M9 15h6",
  ],
  ia: [
    "M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z",
    "M20 3v4",
    "M22 5h-4",
  ],
  asignada: [
    "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2",
    "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
    "m16 11 2 2 4-4",
  ],
  estado: ["m16 3 4 4-4 4", "M20 7H4", "m8 21-4-4 4-4", "M4 17h16"],
  respuesta: ["M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", "m9 10 2 2 4-4"],
  nota: ["M12 20h9", "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"],
  reclasificada: [
    "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8",
    "M21 3v5h-5",
    "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16",
    "M8 16H3v5",
  ],
  punto: ["M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"],
  candado: [
    "M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z",
    "M7 11V7a5 5 0 0 1 10 0v4",
  ],
  reloj: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z", "M12 6v6l4 2"],
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

/* ------------------------------------------------------------------ */
/* Estilo visual por tipo de evento                                    */
/* ------------------------------------------------------------------ */
const TIPO = {
  creada: { icono: "creada", chip: "bg-sky-50 text-sky-600 ring-sky-200" },
  clasificada: {
    icono: "ia",
    chip: "bg-gradient-to-br from-sky-400 to-cyan-500 text-white ring-sky-300 shadow-md shadow-sky-500/25",
  },
  asignada: { icono: "asignada", chip: "bg-slate-50 text-slate-600 ring-slate-200" },
  estado: { icono: "estado", chip: "bg-violet-50 text-violet-600 ring-violet-200" },
  respuesta: { icono: "respuesta", chip: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  nota: { icono: "nota", chip: "bg-amber-50 text-amber-600 ring-amber-200" },
  reclasificada: { icono: "reclasificada", chip: "bg-indigo-50 text-indigo-600 ring-indigo-200" },
};
const TIPO_DEFECTO = { icono: "punto", chip: "bg-slate-50 text-slate-500 ring-slate-200" };

function iniciales(nombre = "") {
  return (
    String(nombre ?? "")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase() ?? "")
      .join("") || "?"
  );
}

/* ------------------------------------------------------------------ */
/* Línea de tiempo                                                     */
/* ------------------------------------------------------------------ */
export default function LineaTiempo({ eventos, mostrarInternos = false }) {
  if (!eventos?.length) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
        <span className="grid h-11 w-11 place-items-center rounded-full bg-white text-sky-500 shadow-sm ring-1 ring-slate-200">
          <Icono nombre="reloj" className="h-5 w-5" />
        </span>
        <p className="text-sm text-slate-500">Sin movimientos todavía.</p>
      </div>
    );
  }

  return (
    <ol className="relative" data-testid="linea-tiempo">
      {eventos.map((e, i) => {
        const tipo = TIPO[e.evento] ?? TIPO_DEFECTO;
        const interna = mostrarInternos && !e.visible_cliente;
        const esRespuesta = e.evento === "respuesta";
        const ultimo = i === eventos.length - 1;

        return (
          <li key={e.id} className={clases("group relative flex gap-4", ultimo ? "" : "pb-7")}>
            {/* Conector vertical hacia el siguiente evento */}
            {!ultimo && (
              <span
                aria-hidden="true"
                className="absolute bottom-1 left-[17px] top-11 w-0.5 rounded-full bg-gradient-to-b from-slate-200 to-slate-100"
              />
            )}

            {/* Ícono del evento */}
            <span
              className={clases(
                "relative z-10 grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105",
                tipo.chip,
              )}
            >
              <Icono nombre={tipo.icono} />
            </span>

            <div className="min-w-0 flex-1 pt-1.5">
              {/* Título + transición de estado + etiqueta interna */}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                <p className="text-sm font-semibold text-slate-900">{EVENTOS[e.evento] ?? e.evento}</p>

                {e.estado_nuevo && e.evento !== "creada" && (
                  <span className="inline-flex flex-wrap items-center gap-1.5 text-xs">
                    {e.estado_anterior && (
                      <>
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium text-slate-600 ring-1 ring-inset ring-slate-200">
                          {ESTADOS[e.estado_anterior]}
                        </span>
                        <span className="text-slate-400"> → </span>
                      </>
                    )}
                    <span className="rounded-md bg-sky-50 px-2 py-0.5 font-medium text-sky-700 ring-1 ring-inset ring-sky-200">
                      {ESTADOS[e.estado_nuevo]}
                    </span>
                  </span>
                )}

                {interna && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-600/20">
                    <Icono nombre="candado" className="h-3 w-3" />
                    Interna
                  </span>
                )}
              </div>

              {/* Detalle */}
              {e.detalle && (
                <p
                  className={clases(
                    "mt-2 whitespace-pre-line text-sm leading-relaxed",
                    esRespuesta
                      ? "rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white px-4 py-3 text-emerald-900 shadow-sm"
                      : interna
                        ? "rounded-xl border border-dashed border-amber-200 bg-amber-50/50 px-4 py-3 text-slate-700"
                        : "text-slate-600",
                  )}
                >
                  {e.detalle}
                </p>
              )}

              {/* Autor y fecha */}
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                <span
                  aria-hidden="true"
                  className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-sky-200 text-[10px] font-semibold text-sky-700"
                >
                  {iniciales(e.autor)}
                </span>
                <p>
                  <span className="font-medium text-slate-700">{e.autor}</span> ·{" "}
                  <time dateTime={e.creado_en}>{fecha(e.creado_en)}</time>
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
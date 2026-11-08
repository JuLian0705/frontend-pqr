import { Link, useLocation, useParams } from "react-router-dom";
import { api } from "../../api.js";
import LineaTiempo from "../../components/LineaTiempo.jsx";
import { useCarga } from "../../hooks.js";
import {
  Alerta,
  Cargando,
  InsigniaEstado,
  Spinner,
  clases,
  dia,
  diasRestantes,
  etiquetaTipo,
  fecha,
} from "../../ui.jsx";

/* Estilos de la tabla (basados en el diseño de referencia, con clases estándar de Tailwind) */
const TH = "px-6 py-3 font-medium whitespace-nowrap";
const TD = "px-6 py-4 align-top";

export default function DetallePqrs() {
  const { id } = useParams();
  const { state } = useLocation();
  const { datos: p, error, cargando } = useCarga(() => api(`/api/pqrs/${id}`), [id], {
    seguirConsultando: (d) => d?.estado_ia === "pendiente",
  });

  if (cargando && !p) return <Cargando />;
  if (!p) return <Alerta>{error || "No se encontró la solicitud"}</Alerta>;

  const restantes = diasRestantes(p.fecha_vencimiento);
  const resuelta = p.estado === "resuelto";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Volver */}
      <Link
        to="/mis-pqrs"
        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-900"
      >
        <span aria-hidden="true">←</span> Mis solicitudes
      </Link>

      {state?.recienCreada && (
        <Alerta tipo="exito">
          Tu solicitud fue radicada con el número <b>{p.radicado}</b>. Guárdalo para hacer seguimiento.
        </Alerta>
      )}

      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 font-mono text-xs font-semibold text-[#2B5BFF] shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2B5BFF]" />
            <span data-testid="detalle-radicado">{p.radicado}</span>
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">{p.asunto}</h1>
        </div>
        <InsigniaEstado valor={p.estado} />
      </div>

      {/* Tabla de datos de la solicitud */}
      <div className="relative overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className={TH}>Radicado</th>
              <th scope="col" className={TH}>Tipo</th>
              <th scope="col" className={TH}>Área responsable</th>
              <th scope="col" className={TH}>Radicada</th>
              <th scope="col" className={TH}>Respuesta a más tardar</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-white transition-colors hover:bg-slate-50/70">
              <th scope="row" className={clases(TD, "whitespace-nowrap font-mono font-semibold text-slate-950")}>
                {p.radicado}
              </th>
              <td className={TD}>
                {p.estado_ia === "pendiente" ? (
                  <span className="inline-flex items-center gap-2 text-slate-500" data-testid="analizando">
                    <Spinner pequeno /> Analizando…
                  </span>
                ) : (
                  <span
                    className="inline-flex rounded-md bg-[#2B5BFF]/10 px-2 py-0.5 text-xs font-semibold text-[#2B5BFF] ring-1 ring-inset ring-[#2B5BFF]/20"
                    data-testid="detalle-tipo"
                  >
                    {etiquetaTipo(p.tipo)}
                  </span>
                )}
              </td>
              <td className={clases(TD, "font-medium text-slate-900")}>
                {p.area_nombre ?? <span className="text-slate-400">Por asignar</span>}
              </td>
              <td className={clases(TD, "whitespace-nowrap")}>{fecha(p.creado_en)}</td>
              <td className={clases(TD, "whitespace-nowrap")}>
                {resuelta ? (
                  <span className="font-medium text-emerald-700">Respondida el {dia(p.resuelto_en)}</span>
                ) : (
                  <>
                    <span className="font-medium text-slate-900">{dia(p.fecha_vencimiento)}</span>
                    <span
                      className={clases(
                        "mt-1 block text-xs",
                        restantes < 0 ? "text-rose-600" : restantes <= 3 ? "text-amber-600" : "text-slate-400",
                      )}
                    >
                      {restantes >= 0 ? `${restantes} días calendario restantes` : "Plazo vencido"}
                    </span>
                  </>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Descripción y seguimiento */}
      <div className="grid gap-6 md:grid-cols-5">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm md:col-span-2">
          <h2 className="border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Tu solicitud
          </h2>
          <p className="whitespace-pre-line px-6 py-5 text-sm leading-relaxed text-slate-700">{p.descripcion}</p>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm md:col-span-3">
          <h2 className="border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Seguimiento
          </h2>
          <div className="px-6 py-5">
            <LineaTiempo eventos={p.historial} />
          </div>
        </section>
      </div>
    </div>
  );
}
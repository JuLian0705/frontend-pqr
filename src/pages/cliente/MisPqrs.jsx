import { Link, useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useCarga } from "../../hooks.js";
import AsistentePqrs from "../asistente/asistenteAI.jsx";
import {
  Alerta,
  Cargando,
  InsigniaEstado,
  InsigniaVencimiento,
  Spinner,
  Vacio,
  clases,
  dia,
  etiquetaTipo,
} from "../../ui.jsx";

/* Estilos de la tabla (mismo diseño que el detalle) */
const TH = "px-6 py-3 font-medium whitespace-nowrap";
const TD = "px-6 py-4";

export default function MisPqrs() {
  const navegar = useNavigate();
  const { datos, error, cargando } = useCarga(() => api("/api/pqrs/mias"), [], {
    intervalo: 3000,
    seguirConsultando: (lista) => Boolean(lista?.some((p) => p.estado_ia === "pendiente")),
  });

  const lista = datos ?? [];
  const resueltas = lista.filter((p) => p.estado === "resuelto").length;
  const resumen = [
    { etiqueta: "Total", valor: lista.length, punto: "bg-slate-950" },
    { etiqueta: "En curso", valor: lista.length - resueltas, punto: "bg-[#2B5BFF]" },
    { etiqueta: "Resueltas", valor: resueltas, punto: "bg-emerald-500" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#2B5BFF]" />
            Panel del ciudadano
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Mis solicitudes</h1>
          <p className="mt-2 text-[15px] text-slate-500">
            Consulta el estado de tus peticiones, quejas, reclamos y sugerencias.
          </p>
        </div>
        <Link
          to="/mis-pqrs/nueva"
          className="group inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white shadow-lg shadow-slate-950/15 transition hover:bg-[#2B5BFF] hover:shadow-[#2B5BFF]/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2B5BFF]"
          data-testid="btn-nueva-pqrs"
        >
          <span className="text-base leading-none">+</span>
          Radicar PQRS
        </Link>
      </div>

      {/* Resumen rápido */}
      {lista.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {resumen.map((r) => (
            <div key={r.etiqueta} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <span className={clases("h-1.5 w-1.5 rounded-full", r.punto)} />
                {r.etiqueta}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950 tabular-nums">{r.valor}</p>
            </div>
          ))}
        </div>
      )}

      <Alerta>{error}</Alerta>

      {cargando && !datos ? (
        <Cargando />
      ) : !lista.length ? (
        <Vacio titulo="Aún no has radicado solicitudes">
          Usa el botón <b>Radicar PQRS</b> para enviar la primera.
        </Vacio>
      ) : (
        <div className="relative overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm text-slate-600" data-testid="tabla-mis-pqrs">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className={TH}>Radicado</th>
                <th scope="col" className={TH}>Asunto</th>
                <th scope="col" className={TH}>Tipo</th>
                <th scope="col" className={TH}>Área</th>
                <th scope="col" className={TH}>Estado</th>
                <th scope="col" className={TH}>Radicada</th>
                <th scope="col" className={TH}>Respuesta a más tardar</th>
                <th scope="col" className="px-4 py-3">
                  <span className="sr-only">Ver</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lista.map((p, i) => (
                <tr
                  key={p.id}
                  onClick={() => navegar(`/mis-pqrs/${p.id}`)}
                  className={clases(
                    "group cursor-pointer bg-white transition-colors hover:bg-[#2B5BFF]/[0.04]",
                    i < lista.length - 1 && "border-b border-slate-200",
                  )}
                >
                  <th scope="row" className={clases(TD, "whitespace-nowrap font-mono text-xs font-semibold text-slate-950")}>
                    <Link
                      to={`/mis-pqrs/${p.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded hover:text-[#2B5BFF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B5BFF]"
                    >
                      {p.radicado}
                    </Link>
                  </th>
                  <td className={clases(TD, "max-w-xs")}>
                    <span className="line-clamp-1 font-medium text-slate-900">{p.asunto}</span>
                  </td>
                  <td className={TD}>
                    {p.estado_ia === "pendiente" ? (
                      <span className="inline-flex items-center gap-2 whitespace-nowrap text-slate-400">
                        <Spinner pequeno /> Analizando…
                      </span>
                    ) : (
                      <span className="inline-flex whitespace-nowrap rounded-md bg-[#2B5BFF]/10 px-2 py-0.5 text-xs font-semibold text-[#2B5BFF] ring-1 ring-inset ring-[#2B5BFF]/20">
                        {etiquetaTipo(p.tipo)}
                      </span>
                    )}
                  </td>
                  <td className={clases(TD, "whitespace-nowrap")}>
                    {p.area_nombre ?? <span className="text-slate-400">Por asignar</span>}
                  </td>
                  <td className={TD}>
                    <InsigniaEstado valor={p.estado} />
                  </td>
                  <td className={clases(TD, "whitespace-nowrap")}>{dia(p.creado_en)}</td>
                  <td className={clases(TD, "whitespace-nowrap")}>
                    {p.estado === "resuelto" ? (
                      <span className="font-medium text-emerald-700">Respondida</span>
                    ) : (
                      <div className="space-y-1">
                        <span className="block font-medium text-slate-900">{dia(p.fecha_vencimiento)}</span>
                        <InsigniaVencimiento limite={p.fecha_vencimiento} />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      aria-hidden="true"
                      className="inline-block text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#2B5BFF]"
                    >
                      →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AsistentePqrs />
    </div>
  );
}
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../api.js";
import { useAuth } from "../../auth.jsx";
import { CATEGORIAS, ESTADOS, PRIORIDADES, TIPOS } from "../../constantes.js";
import { useCarga } from "../../hooks.js";
import {
  Alerta,
  Cargando,
  InsigniaEstado,
  InsigniaOrigen,
  InsigniaPrioridad,
  Vacio,
  clases,
  dia,
  etiquetaCategoria,
  etiquetaTipo,
} from "../../ui.jsx";

/* Estilo de campos de filtro (basado en el select de referencia, con clases estándar de Tailwind) */
const ETIQUETA_FILTRO = "mb-2.5 block text-sm font-medium text-slate-900";
const CAMPO_FILTRO =
  "block w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-[#2B5BFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2B5BFF]/30 disabled:cursor-not-allowed disabled:text-slate-400";

const FILTROS_INICIALES = { q: "", estado: "", prioridad: "", tipo: "", categoria: "", area_id: "", solo_mias: false };

function Indicador({ titulo, valor, tono = "slate", testid }) {
  const tonos = {
    slate: "text-slate-900",
    rojo: "text-red-600",
    naranja: "text-orange-600",
    violeta: "text-violet-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titulo}</p>
      <p className={clases("mt-1 text-2xl font-bold", tonos[tono])} data-testid={testid}>{valor}</p>
    </div>
  );
}

export default function Bandeja() {
  const { usuario } = useAuth();
  const navegar = useNavigate();
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [busqueda, setBusqueda] = useState("");
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    const id = setTimeout(() => setFiltros((f) => ({ ...f, q: busqueda })), 350);
    return () => clearTimeout(id);
  }, [busqueda]);

  useEffect(() => {
    api("/api/catalogo").then((c) => setAreas(c.areas)).catch(() => setAreas([]));
  }, []);

  const consulta = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== "" && v !== false) params.set(k, String(v));
    });
    return params.toString();
  }, [filtros]);

  const { datos, error, cargando } = useCarga(() => api(`/api/gestion/pqrs?${consulta}`), [consulta], {
    intervalo: 5000,
    seguirConsultando: () => true, // la bandeja se actualiza sola
  });

  const lista = datos ?? [];
  const resumen = {
    abiertas: lista.filter((p) => p.estado === "abierto").length,
    proceso: lista.filter((p) => p.estado === "en_proceso").length,
    criticas: lista.filter((p) => p.prioridad === "critica" && p.estado !== "resuelto").length,
    vencidas: lista.filter((p) => p.vencida).length,
  };
  const cambiar = (campo) => (e) =>
    setFiltros({ ...filtros, [campo]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Bandeja de PQRS</h1>
        <p className="text-sm text-slate-500">
          {usuario.rol === "admin"
            ? "Todas las áreas. Ordenada por urgencia: críticas primero, luego por antigüedad."
            : `Solicitudes del área ${usuario.area?.nombre ?? ""}, ordenadas por urgencia.`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Indicador titulo="Abiertas" valor={resumen.abiertas} testid="kpi-abiertas" />
        <Indicador titulo="En proceso" valor={resumen.proceso} tono="violeta" />
        <Indicador titulo="Críticas pendientes" valor={resumen.criticas} tono="rojo" testid="kpi-criticas" />
        <Indicador titulo="Vencidas" valor={resumen.vencidas} tono="naranja" />
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-3 lg:grid-cols-6">
        <div className="col-span-2 sm:col-span-3 lg:col-span-2">
          <label className={ETIQUETA_FILTRO} htmlFor="buscar">Buscar</label>
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input id="buscar" className={clases(CAMPO_FILTRO, "pl-9")} placeholder="Radicado, asunto o texto…"
              value={busqueda} onChange={(e) => setBusqueda(e.target.value)} data-testid="filtro-buscar" />
          </div>
        </div>
        <Selector etiqueta="Estado" valor={filtros.estado} onChange={cambiar("estado")} opciones={ESTADOS} />
        <Selector etiqueta="Prioridad" valor={filtros.prioridad} onChange={cambiar("prioridad")} opciones={PRIORIDADES}
          testid="filtro-prioridad" />
        <Selector etiqueta="Tipo" valor={filtros.tipo} onChange={cambiar("tipo")} opciones={TIPOS} />
        <Selector etiqueta="Categoría" valor={filtros.categoria} onChange={cambiar("categoria")} opciones={CATEGORIAS} />
        {usuario.rol === "admin" && (
          <Selector etiqueta="Área" valor={filtros.area_id} onChange={cambiar("area_id")}
            opciones={Object.fromEntries(areas.map((a) => [a.id, a.nombre]))} />
        )}
        <div className="col-span-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 sm:col-span-3 lg:col-span-6">
          <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 cursor-pointer rounded border-slate-300 accent-[#2B5BFF]"
              checked={filtros.solo_mias}
              onChange={cambiar("solo_mias")}
            />
            Asignadas a mí
          </label>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-[#2B5BFF] transition hover:bg-[#2B5BFF]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2B5BFF]"
            onClick={() => {
              setFiltros(FILTROS_INICIALES);
              setBusqueda("");
            }}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <Alerta>{error}</Alerta>
      {cargando && !datos ? (
        <Cargando />
      ) : !lista.length ? (
        <Vacio titulo="No hay solicitudes con estos filtros" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm" data-testid="tabla-bandeja">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Prioridad</th>
                <th className="px-4 py-3">Radicado / asunto</th>
                <th className="px-4 py-3">Tipo y categoría</th>
                <th className="px-4 py-3">Área</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Clasificó</th>
                <th className="px-4 py-3">Vence</th>
                <th className="px-4 py-3">Asignado a</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {lista.map((p) => (
                <tr
                  key={p.id}
                  className={clases(
                    "cursor-pointer hover:bg-slate-50",
                    p.prioridad === "critica" && p.estado !== "resuelto" && "bg-red-50/50",
                  )}
                  onClick={() => navegar(`/gestion/${p.id}`)}
                  data-testid="fila-pqrs"
                  data-radicado={p.radicado}
                >
                  <td className="px-4 py-3">
                    {p.estado_ia === "pendiente" ? (
                      <span className="text-xs text-slate-400">Analizando…</span>
                    ) : (
                      <InsigniaPrioridad valor={p.prioridad} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-xs font-semibold text-[#2B5BFF]">{p.radicado}</p>
                    <p className="font-medium text-slate-800">{p.asunto}</p>
                    <p className="text-xs text-slate-400">{p.cliente_nombre}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{etiquetaTipo(p.tipo)}</p>
                    <p className="text-xs text-slate-500">{etiquetaCategoria(p.categoria)}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.area_nombre ?? "—"}</td>
                  <td className="px-4 py-3"><InsigniaEstado valor={p.estado} /></td>
                  <td className="px-4 py-3"><InsigniaOrigen valor={p.clasificado_por} /></td>
                  <td className={clases("px-4 py-3", p.vencida ? "font-semibold text-red-600" : "text-slate-600")}>
                    {p.estado === "resuelto" ? "—" : dia(p.fecha_vencimiento)}
                    {p.vencida && <span className="block text-xs">Vencida</span>}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.asignado_a_nombre ?? "Sin asignar"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/*
 * Selector personalizado con Tailwind (el menú de un <select> nativo lo dibuja el
 * navegador y no se puede redondear ni cambiar de color).
 * Se conserva un <select> nativo oculto con el data-testid para que las pruebas
 * de Playwright (selectOption) sigan funcionando.
 */
function Selector({ etiqueta, valor, onChange, opciones, testid }) {
  const id = `filtro-${etiqueta.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")}`;
  const lista = [["", "Todos"], ...Object.entries(opciones)];
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const caja = useRef(null);

  const actual = lista.find(([k]) => String(k) === String(valor)) ?? lista[0];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => caja.current && !caja.current.contains(e.target) && setAbierto(false);
    document.addEventListener("mousedown", fuera);
    return () => document.removeEventListener("mousedown", fuera);
  }, [abierto]);

  function elegir(k) {
    onChange({ target: { type: "select-one", value: k } });
    setAbierto(false);
  }

  function abrir() {
    setActivo(Math.max(0, lista.findIndex(([k]) => String(k) === String(valor))));
    setAbierto(true);
  }

  function teclado(e) {
    if (!abierto && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      abrir();
      return;
    }
    if (!abierto) return;
    if (e.key === "Escape") setAbierto(false);
    else if (e.key === "ArrowDown") setActivo((a) => Math.min(lista.length - 1, a + 1));
    else if (e.key === "ArrowUp") setActivo((a) => Math.max(0, a - 1));
    else if (e.key === "Enter" || e.key === " ") elegir(lista[activo][0]);
    else return;
    e.preventDefault();
  }

  return (
    <div ref={caja} className="relative">
      <label className={ETIQUETA_FILTRO} id={`${id}-etiqueta`} htmlFor={id}>
        {etiqueta}
      </label>

      {/* Botón visible */}
      <button
        id={id}
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={teclado}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-labelledby={`${id}-etiqueta ${id}`}
        className={clases(
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-slate-50 px-3.5 py-2.5 text-left text-sm shadow-sm transition",
          "hover:border-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B5BFF]/30",
          abierto ? "border-[#2B5BFF] bg-white ring-2 ring-[#2B5BFF]/20" : "border-slate-300",
          valor ? "font-medium text-slate-900" : "text-slate-500",
        )}
      >
        <span className="truncate">{actual[1]}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={clases("h-4 w-4 shrink-0 text-slate-400 transition-transform", abierto && "rotate-180 text-[#2B5BFF]")}
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      {/* Menú desplegable */}
      {abierto && (
        <ul
          role="listbox"
          aria-labelledby={`${id}-etiqueta`}
          className="absolute left-0 right-0 z-30 mt-2 max-h-64 min-w-[10rem] overflow-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10"
        >
          {lista.map(([k, v], i) => {
            const elegido = String(k) === String(valor);
            return (
              <li
                key={k}
                role="option"
                aria-selected={elegido}
                onMouseEnter={() => setActivo(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(k)}
                className={clases(
                  "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm transition-colors",
                  elegido ? "font-semibold text-[#2B5BFF]" : "text-slate-700",
                  i === activo && (elegido ? "bg-[#2B5BFF]/10" : "bg-slate-100"),
                )}
              >
                <span className="truncate">{v}</span>
                {elegido && (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0" aria-hidden="true">
                    <path d="m5 10.5 3.2 3.2L15 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Select nativo oculto: solo para pruebas automatizadas */}
      {testid && (
        <select
          aria-hidden="true"
          tabIndex={-1}
          className="sr-only"
          value={valor}
          onChange={onChange}
          data-testid={testid}
        >
          {lista.map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
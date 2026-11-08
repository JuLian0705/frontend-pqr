import { useEffect, useId, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api.js";
import { useAuth } from "../../auth.jsx";
import LineaTiempo from "../../components/LineaTiempo.jsx";
import { CATEGORIAS, ESTADOS, PRIORIDADES, TIPOS, TRANSICIONES } from "../../constantes.js";
import { useCarga } from "../../hooks.js";
import {
  Alerta,
  Boton,
  Cargando,
  Dato,
  InsigniaEstado,
  InsigniaOrigen,
  InsigniaPrioridad,
  Tarjeta,
  dia,
  etiquetaCategoria,
  etiquetaTipo,
  fecha,
} from "../../ui.jsx";

export default function DetalleGestion() {
  const { id } = useParams();
  const { usuario } = useAuth();
  const { datos: p, setDatos, error, cargando } = useCarga(() => api(`/api/gestion/pqrs/${id}`), [id], {
    seguirConsultando: (d) => d?.estado_ia === "pendiente",
  });
  const [aviso, setAviso] = useState({ tipo: "", texto: "" });
  const [ocupado, setOcupado] = useState("");

  async function ejecutar(clave, ruta, opciones, mensajeExito) {
    setAviso({ tipo: "", texto: "" });
    setOcupado(clave);
    try {
      const actualizada = await api(ruta, opciones);
      setDatos(actualizada);
      setAviso({ tipo: "exito", texto: mensajeExito });
      return true;
    } catch (e) {
      setAviso({ tipo: "error", texto: e.message });
      return false;
    } finally {
      setOcupado("");
    }
  }

  if (cargando && !p) return <Cargando />;
  if (!p) return <Alerta>{error || "No se encontró la PQRS"}</Alerta>;

  const base = `/api/gestion/pqrs/${p.id}`;
  const pendiente = p.estado_ia === "pendiente";

  return (
    <div className="space-y-6">
      <Link to="/gestion" className="text-sm font-medium text-marca-700 hover:underline">← Bandeja</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm font-semibold text-marca-700">{p.radicado}</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{p.asunto}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {p.cliente_nombre} · {p.cliente_email} · radicada el {fecha(p.creado_en)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!pendiente && <InsigniaPrioridad valor={p.prioridad} />}
          <InsigniaEstado valor={p.estado} />
        </div>
      </div>

      {aviso.texto && <Alerta tipo={aviso.tipo}>{aviso.texto}</Alerta>}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <PanelIA p={p} pendiente={pendiente} />

          <Tarjeta titulo="Texto original del ciudadano">
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{p.descripcion}</p>
          </Tarjeta>

          <Tarjeta titulo="Historial y trazabilidad">
            <LineaTiempo eventos={p.historial} mostrarInternos />
          </Tarjeta>
        </div>

        <div className="space-y-6">
          <Tarjeta titulo="Gestión del caso">
            <dl className="mb-4 grid grid-cols-2 gap-4">
              <Dato etiqueta="Área">{p.area_nombre ?? "—"}</Dato>
              <Dato etiqueta="Asignado a">{p.asignado_a_nombre ?? "Sin asignar"}</Dato>
              <Dato etiqueta="Vence">
                <span className={p.vencida ? "font-semibold text-red-600" : ""}>{dia(p.fecha_vencimiento)}</span>
              </Dato>
              <Dato etiqueta="Resuelta">{p.resuelto_en ? dia(p.resuelto_en) : "—"}</Dato>
            </dl>
            {p.asignado_a_id !== usuario.id && (
              <Boton className="w-full" cargando={ocupado === "tomar"} data-testid="btn-tomar"
                onClick={() => ejecutar("tomar", `${base}/tomar`, { method: "POST" }, "Caso asignado a ti.")}>
                Tomar caso
              </Boton>
            )}
          </Tarjeta>

          <Responder
            ocupado={ocupado === "responder"}
            onEnviar={(mensaje, visible) =>
              ejecutar("responder", `${base}/comentarios`, { method: "POST", body: { mensaje, visible_cliente: visible } },
                visible ? "Respuesta enviada al ciudadano." : "Nota interna guardada.")
            }
          />

          <CambiarEstado
            estado={p.estado}
            ocupado={ocupado === "estado"}
            onCambiar={(estado, comentario) =>
              ejecutar("estado", `${base}/estado`, { method: "PATCH", body: { estado, comentario: comentario || null } },
                `Estado actualizado a ${ESTADOS[estado]}.`)
            }
          />

          <CorregirClasificacion
            p={p}
            ocupado={ocupado}
            onCorregir={(cuerpo) =>
              ejecutar("corregir", `${base}/clasificacion`, { method: "PATCH", body: cuerpo },
                "Clasificación corregida. El cambio quedó en el historial.")
            }
            onReclasificarIA={() =>
              ejecutar("reia", `${base}/reclasificar-ia`, { method: "POST" }, "Se envió de nuevo al modelo de IA.")
            }
          />
        </div>
      </div>
    </div>
  );
}

function PanelIA({ p, pendiente }) {
  return (
    <Tarjeta
      titulo="Análisis automático"
      accion={!pendiente && <InsigniaOrigen valor={p.clasificado_por} />}
      className="border-marca-100"
    >
      {pendiente ? (
        <div className="py-1" data-testid="ia-pendiente">
          <ChipAnalizando />
        </div>
      ) : (
        <div className="space-y-4" data-testid="panel-ia">
          <dl className="grid gap-4 sm:grid-cols-3">
            <Dato etiqueta="Tipo"><span data-testid="ia-tipo">{etiquetaTipo(p.tipo)}</span></Dato>
            <Dato etiqueta="Categoría">{etiquetaCategoria(p.categoria)}</Dato>
            <Dato etiqueta="Prioridad"><InsigniaPrioridad valor={p.prioridad} /></Dato>
          </dl>
          <div>
            <p className="etiqueta">Resumen</p>
            <p className="rounded-lg bg-marca-50 px-3 py-2 text-sm text-slate-800" data-testid="ia-resumen">
              {p.resumen}
            </p>
          </div>
          {p.justificacion && (
            <div>
              <p className="etiqueta">Justificación</p>
              <p className="text-sm text-slate-600">{p.justificacion}</p>
            </div>
          )}
          <p className="text-xs text-slate-400">
            {p.modelo_ia ? `Modelo ${p.modelo_ia}` : "Sin modelo de IA"}
            {p.duracion_ia_ms != null && ` · ${(p.duracion_ia_ms / 1000).toFixed(1)} s`}
          </p>
          {p.error_ia && p.clasificado_por === "reglas" && (
            <Alerta tipo="aviso">
              La IA no estuvo disponible y se usaron las reglas de respaldo. Revisa la clasificación.
              <span className="mt-1 block break-all text-xs opacity-75">{p.error_ia}</span>
            </Alerta>
          )}
        </div>
      )}
    </Tarjeta>
  );
}

function Responder({ ocupado, onEnviar }) {
  const [mensaje, setMensaje] = useState("");
  const [interna, setInterna] = useState(false);
  return (
    <Tarjeta titulo="Responder">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await onEnviar(mensaje, !interna)) setMensaje("");
        }}
      >
        <textarea className="campo" rows={4} value={mensaje} onChange={(e) => setMensaje(e.target.value)}
          placeholder={interna ? "Nota para el equipo (el ciudadano no la ve)" : "Respuesta para el ciudadano"}
          data-testid="respuesta-texto" />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={interna} onChange={(e) => setInterna(e.target.checked)} />
          Nota interna
        </label>
        <Boton type="submit" className="w-full" variante={interna ? "secundario" : "primario"} cargando={ocupado}
          disabled={mensaje.trim().length < 2} data-testid="respuesta-enviar">
          {interna ? "Guardar nota" : "Enviar respuesta"}
        </Boton>
      </form>
    </Tarjeta>
  );
}

function CambiarEstado({ estado, ocupado, onCambiar }) {
  const opciones = TRANSICIONES[estado] ?? [];
  const [nuevo, setNuevo] = useState(opciones[0] ?? "");
  const [comentario, setComentario] = useState("");

  useEffect(() => {
    setNuevo(opciones[0] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado]);

  return (
    <Tarjeta titulo="Cambiar estado">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (await onCambiar(nuevo, comentario.trim())) setComentario("");
        }}
      >
        <SelectorEstado estado={estado} opciones={opciones} valor={nuevo} onChange={setNuevo} />
        <textarea className="campo" rows={2} value={comentario} onChange={(e) => setComentario(e.target.value)}
          placeholder={nuevo === "resuelto" ? "Respuesta final al ciudadano (obligatoria si no has respondido)" : "Comentario opcional"}
          data-testid="estado-comentario" />
        <Boton type="submit" variante="secundario" className="w-full" cargando={ocupado} disabled={!nuevo}
          data-testid="estado-guardar">
          Actualizar estado
        </Boton>
      </form>
    </Tarjeta>
  );
}

function SelectorEstado({ estado, opciones, valor, onChange }) {
  const id = `estado-opciones-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const caja = useRef(null);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(0);
  const actual = opciones.find((opcion) => opcion === valor) ?? opciones[0];
  const etiqueta = (opcion) =>
    opcion === "en_proceso" && estado === "resuelto" ? "Reabrir (En proceso)" : ESTADOS[opcion];

  useEffect(() => {
    if (!abierto) return undefined;
    const cerrarFuera = (e) => {
      if (caja.current && !caja.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener("mousedown", cerrarFuera);
    return () => document.removeEventListener("mousedown", cerrarFuera);
  }, [abierto]);

  function abrir() {
    setActivo(Math.max(0, opciones.indexOf(valor)));
    setAbierto(true);
  }

  function elegir(opcion) {
    onChange(opcion);
    setAbierto(false);
  }

  function manejarTeclado(e) {
    if (!abierto && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      abrir();
      return;
    }
    if (!abierto) return;
    if (e.key === "Escape") setAbierto(false);
    else if (e.key === "ArrowDown") setActivo((i) => Math.min(opciones.length - 1, i + 1));
    else if (e.key === "ArrowUp") setActivo((i) => Math.max(0, i - 1));
    else if (e.key === "Enter" || e.key === " ") elegir(opciones[activo]);
    else return;
    e.preventDefault();
  }

  return (
    <div ref={caja} className="relative">
      <button
        type="button"
        onClick={() => (abierto ? setAbierto(false) : abrir())}
        onKeyDown={manejarTeclado}
        aria-label="Nuevo estado"
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-controls={id}
        className={[
          "flex w-full items-center justify-between gap-2 rounded-xl border bg-white px-3 py-2 text-left text-sm shadow-sm transition",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2B5BFF]/20",
          abierto ? "border-[#2B5BFF] ring-2 ring-[#2B5BFF]/15" : "border-slate-300 hover:border-slate-400",
        ].join(" ")}
      >
        <span className="truncate text-slate-700">{etiqueta(actual)}</span>
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${abierto ? "rotate-180 text-[#2B5BFF]" : ""}`}
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>

      {abierto && (
        <ul
          id={id}
          role="listbox"
          aria-label="Opciones de estado"
          className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10"
        >
          {opciones.map((opcion, indice) => {
            const seleccionado = opcion === valor;
            return (
              <li
                key={opcion}
                role="option"
                aria-selected={seleccionado}
                onMouseEnter={() => setActivo(indice)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(opcion)}
                className={[
                  "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  seleccionado ? "font-semibold text-[#2B5BFF]" : "text-slate-700",
                  indice === activo ? "bg-slate-100" : "hover:bg-slate-50",
                ].join(" ")}
              >
                <span className="truncate">{etiqueta(opcion)}</span>
                {seleccionado && (
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} className="h-4 w-4 shrink-0" aria-hidden="true">
                    <path d="m5 10.5 3.2 3.2L15 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <select
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        data-testid="estado-nuevo"
      >
        {opciones.map((opcion) => (
          <option key={opcion} value={opcion}>{etiqueta(opcion)}</option>
        ))}
      </select>
    </div>
  );
}

function CorregirClasificacion({ p, ocupado, onCorregir, onReclasificarIA }) {
  const [abierto, setAbierto] = useState(false);
  const [valores, setValores] = useState({ tipo: "", categoria: "", prioridad: "", motivo: "" });

  useEffect(() => {
    setValores({ tipo: p.tipo ?? "P", categoria: p.categoria ?? "otro", prioridad: p.prioridad ?? "media", motivo: "" });
  }, [p.tipo, p.categoria, p.prioridad]);

  const cambiar = (campo) => (e) => setValores({ ...valores, [campo]: e.target.value });

  return (
    <Tarjeta
      titulo="Clasificación"
      accion={
        <button className="text-xs font-semibold text-marca-700 hover:underline" onClick={() => setAbierto(!abierto)}>
          {abierto ? "Cerrar" : "Corregir"}
        </button>
      }
    >
      {!abierto ? (
        <p className="text-sm text-slate-500">
          Si la IA se equivocó, corrige la clasificación. El área se recalcula y la corrección queda registrada.
        </p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await onCorregir({ ...valores, motivo: valores.motivo || null })) setAbierto(false);
          }}
        >
          <select className="campo" value={valores.tipo} onChange={cambiar("tipo")}>
            {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="campo" value={valores.categoria} onChange={cambiar("categoria")}>
            {Object.entries(CATEGORIAS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select className="campo" value={valores.prioridad} onChange={cambiar("prioridad")}>
            {Object.entries(PRIORIDADES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input className="campo" placeholder="Motivo de la corrección" value={valores.motivo} onChange={cambiar("motivo")} />
          <Boton type="submit" variante="secundario" className="w-full" cargando={ocupado === "corregir"}>
            Guardar corrección
          </Boton>
        </form>
      )}
      <Boton variante="secundario" className="mt-3 w-full" cargando={ocupado === "reia"} onClick={onReclasificarIA}>
        Volver a clasificar con IA
      </Boton>
    </Tarjeta>
  );
}

// Píldora "Analizando con IA…" con borde de colores girando y halo difuminado.
const ESTILOS_CHIP_IA = `
@keyframes chip-ia-girar {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
@keyframes chip-ia-pulso {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.25); opacity: 0.75; }
}
@keyframes chip-ia-respirar {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.85; }
}
.chip-ia-halo { position: relative; isolation: isolate; display: inline-flex; }
.chip-ia-halo::after {
  content: ""; position: absolute; left: 14%; right: 14%; bottom: -5px; height: 10px; z-index: -1;
  border-radius: 9999px; filter: blur(8px);
  background: linear-gradient(90deg, #22d3ee, #6366f1, #a855f7, #ec4899, #f59e0b);
  animation: chip-ia-respirar 2.6s ease-in-out infinite;
}
.chip-ia-borde {
  position: relative; isolation: isolate; display: inline-flex; overflow: hidden;
  border-radius: 9999px; padding: 1.5px;
}
.chip-ia-borde::before {
  content: ""; position: absolute; left: 50%; top: 50%; width: 250%; aspect-ratio: 1; z-index: -1;
  transform: translate(-50%, -50%);
  background: conic-gradient(from 0deg, #22d3ee, #6366f1, #a855f7, #ec4899, #f59e0b, #22d3ee);
  animation: chip-ia-girar 3s linear infinite;
}
.chip-ia-pulso { animation: chip-ia-pulso 1.4s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .chip-ia-halo::after, .chip-ia-borde::before, .chip-ia-pulso { animation: none; }
}
`;

function ChipAnalizando() {
  const id = `chispa-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  return (
    <>
      <style>{ESTILOS_CHIP_IA}</style>
      <span className="chip-ia-halo">
        <span className="chip-ia-borde">
          <span className="relative inline-flex items-center gap-2 rounded-full bg-[#0b1020] px-4 py-2 text-sm font-semibold text-white">
            <svg viewBox="0 0 24 24" className="chip-ia-pulso h-4 w-4" aria-hidden="true">
              <defs>
                <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="50%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#e879f9" />
                </linearGradient>
              </defs>
              <path fill={`url(#${id})`} d="M10 3c.5 4.2 2.8 6.5 7 7-4.2.5-6.5 2.8-7 7-.5-4.2-2.8-6.5-7-7 4.2-.5 6.5-2.8 7-7Z" />
              <path fill={`url(#${id})`} d="M18.5 13c.25 1.9 1.1 2.75 3 3-1.9.25-2.75 1.1-3 3-.25-1.9-1.1-2.75-3-3 1.9-.25 2.75-1.1 3-3Z" />
            </svg>
            Analizando con IA…
          </span>
        </span>
      </span>
    </>
  );
}
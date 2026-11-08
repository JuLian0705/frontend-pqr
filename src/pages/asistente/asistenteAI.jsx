import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { leerSesion } from "../../api.js";
import { useAuth } from "../../auth.jsx";

/* ------------------------------------------------------------------ */
/* Asistente de redacción de PQRS (chat con IA local)                  */
/* Uso: <AsistentePqrs /> debajo de la tabla de "Mis solicitudes".      */
/* ------------------------------------------------------------------ */

const BASE = import.meta.env.VITE_API_URL || "";

const SUGERENCIAS = [
  "¿Mi texto está bien escrito?",
  "¿Es una queja o un reclamo?",
  "¿Cuánto tardan en responderme?",
  "Ayúdame a redactar un reclamo por un cobro doble",
];

/* ---------------------------- utilidades ---------------------------- */

const nuevoId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

function leerHistorial(clave) {
  try {
    const guardado = JSON.parse(sessionStorage.getItem(clave) || "null");
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

function guardarHistorial(clave, mensajes) {
  try {
    sessionStorage.setItem(clave, JSON.stringify(mensajes.slice(-30)));
  } catch {
    /* sin almacenamiento: el chat vive solo en memoria */
  }
}

/** Separa el bloque "TEXTO MEJORADO: … FIN" del resto de la respuesta. */
function separarTextoMejorado(texto) {
  const marca = texto.match(/\**\s*TEXTO MEJORADO\s*\**\s*:?\s*\**/i);
  if (!marca) return { antes: texto, mejorado: null, despues: "" };
  const resto = texto.slice(marca.index + marca[0].length);
  const fin = resto.search(/\n\s*\**\s*FIN\s*\**\s*(\n|$)/i);
  const mejorado = (fin === -1 ? resto : resto.slice(0, fin)).trim().replace(/^["“]|["”]$/g, "");
  const despues = fin === -1 ? "" : resto.slice(fin).replace(/^\s*\**\s*FIN\s*\**/i, "").trim();
  return { antes: texto.slice(0, marca.index).trim(), mejorado, despues };
}

/** Negritas **así** dentro de una línea. */
function Linea({ texto }) {
  return texto.split(/(\*\*[^*]+\*\*)/g).map((parte, i) =>
    parte.startsWith("**") && parte.endsWith("**") ? (
      <strong key={i} className="font-semibold text-slate-900">
        {parte.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{parte.replace(/^_(.*)_$/, "$1")}</span>
    ),
  );
}

/** Markdown mínimo: párrafos y viñetas. */
function TextoFormateado({ texto }) {
  const bloques = [];
  let lista = null;
  texto.split("\n").forEach((cruda, i) => {
    const linea = cruda.trim();
    const vineta = linea.match(/^(?:[-*•]|\d+[.)])\s+(.*)$/);
    if (vineta) {
      if (!lista) {
        lista = [];
        bloques.push({ tipo: "lista", items: lista, clave: i });
      }
      lista.push(vineta[1]);
    } else {
      lista = null;
      if (linea) bloques.push({ tipo: "parrafo", texto: linea, clave: i });
    }
  });
  return (
    <div className="space-y-2.5">
      {bloques.map((b) =>
        b.tipo === "lista" ? (
          <ul key={b.clave} className="space-y-1.5 pl-1">
            {b.items.map((item, j) => (
              <li key={j} className="flex gap-2.5">
                <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400" />
                <span>
                  <Linea texto={item} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={b.clave}>
            <Linea texto={b.texto} />
          </p>
        ),
      )}
    </div>
  );
}

/* ---------------------------- iconos ---------------------------- */

const IconoAsistente = ({ className = "h-5 w-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M10 3c.5 4.2 2.8 6.5 7 7-4.2.5-6.5 2.8-7 7-.5-4.2-2.8-6.5-7-7 4.2-.5 6.5-2.8 7-7Z" />
    <path d="M18.5 13c.25 1.9 1.1 2.75 3 3-1.9.25-2.75 1.1-3 3-.25-1.9-1.1-2.75-3-3 1.9-.25 2.75-1.1 3-3Z" />
  </svg>
);

const trazo = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

const IconoMas = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...trazo} aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconoMicro = () => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" {...trazo} aria-hidden="true">
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
);
const IconoEnviar = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" {...trazo} strokeWidth={2.2} aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
const IconoDetener = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="2" />
  </svg>
);
const IconoCopiar = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...trazo} aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V6a2 2 0 0 1 2-2h9" />
  </svg>
);
const IconoCheck = () => (
  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" {...trazo} strokeWidth={2.4} aria-hidden="true">
    <path d="m5 12 5 5 9-10" />
  </svg>
);

/* ---------------------------- piezas visuales ---------------------------- */

function Pensando() {
  return (
    <span className="inline-flex items-center gap-2 text-sm text-slate-400" aria-label="El asistente está pensando">
      <span className="flex gap-1">
        {[0, 160, 320].map((d) => (
          <span
            key={d}
            className="h-1.5 w-1.5 rounded-full bg-violet-400 motion-safe:animate-[pqrsPulso_1.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </span>
      Pensando…
    </span>
  );
}

function TarjetaTextoMejorado({ texto, completo }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
    } catch {
      const area = document.createElement("textarea");
      area.value = texto;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="relative my-4 overflow-hidden rounded-2xl border border-violet-200/80 bg-white shadow-[0_8px_30px_-12px_rgba(124,58,237,0.25)]">
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-400 to-violet-500" />
      <div className="flex items-center justify-between gap-2 px-5 pt-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700">
          <IconoAsistente className="h-3.5 w-3.5" />
          Versión sugerida
        </span>
        {!completo && <span className="text-[11px] text-slate-400">Escribiendo…</span>}
      </div>
      <p className="whitespace-pre-line px-5 pb-4 pt-2 text-[15px] leading-7 text-slate-800">{texto}</p>
      {completo && (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
          <button
            type="button"
            onClick={copiar}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-white hover:text-slate-900 hover:shadow-sm"
          >
            {copiado ? <IconoCheck /> : <IconoCopiar />}
            {copiado ? "Copiado" : "Copiar"}
          </button>
          <Link
            to="/mis-pqrs/nueva"
            state={{ descripcionSugerida: texto }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700"
          >
            Usar y radicar →
          </Link>
        </div>
      )}
    </div>
  );
}

const Burbuja = memo(function Burbuja({ rol, texto, error, escribiendo }) {
  if (rol === "usuario") {
    return (
      <div className="flex justify-end motion-safe:animate-[pqrsAparecer_.25s_ease-out]">
        <div className="max-w-[80%] whitespace-pre-line rounded-3xl rounded-br-lg bg-slate-100 px-4 py-2.5 text-[15px] leading-relaxed text-slate-800">
          {texto}
        </div>
      </div>
    );
  }

  const { antes, mejorado, despues } = separarTextoMejorado(texto);
  return (
    <div className="flex items-start gap-3 motion-safe:animate-[pqrsAparecer_.25s_ease-out]">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-sky-400 to-violet-600 text-white">
        <IconoAsistente className="h-3.5 w-3.5" />
      </span>
      <div
        className={`min-w-0 flex-1 text-[15px] leading-7 ${
          error ? "rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-red-700" : "text-slate-700"
        }`}
      >
        {!texto && escribiendo ? (
          <Pensando />
        ) : (
          <>
            {antes && <TextoFormateado texto={antes} />}
            {mejorado !== null && <TarjetaTextoMejorado texto={mejorado} completo={!escribiendo} />}
            {despues && <TextoFormateado texto={despues} />}
            {escribiendo && (
              <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] bg-violet-500 motion-safe:animate-[pqrsCursor_1s_steps(1)_infinite]" />
            )}
          </>
        )}
      </div>
    </div>
  );
});

/* ---------------------------- dictado por voz ---------------------------- */

const Reconocimiento = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);

function useDictado(alTexto) {
  const [escuchando, setEscuchando] = useState(false);
  const rec = useRef(null);

  const alternar = useCallback(() => {
    if (!Reconocimiento) return;
    if (escuchando) {
      rec.current?.stop();
      return;
    }
    const r = new Reconocimiento();
    r.lang = "es-CO";
    r.interimResults = false;
    r.onresult = (e) => alTexto(Array.from(e.results).map((x) => x[0].transcript).join(" "));
    r.onend = () => setEscuchando(false);
    r.onerror = () => setEscuchando(false);
    rec.current = r;
    r.start();
    setEscuchando(true);
  }, [escuchando, alTexto]);

  useEffect(() => () => rec.current?.abort(), []);
  return { disponible: Boolean(Reconocimiento), escuchando, alternar };
}

/* ---------------------------- componente principal ---------------------------- */

export default function AsistentePqrs() {
  const { usuario } = useAuth();
  const clave = `pqrs_asistente_${usuario?.id ?? "anonimo"}`;

  const [mensajes, setMensajes] = useState(() => leerHistorial(clave));
  const [vivo, setVivo] = useState(null); // texto que se está escribiendo (null = nada en curso)
  const [texto, setTexto] = useState("");
  const [menuAbierto, setMenuAbierto] = useState(false);

  const zonaMensajes = useRef(null);
  const areaTexto = useRef(null);
  const pegadoAbajo = useRef(true);
  const cancelador = useRef(null);

  // Estado del "escritor" suave: el stream llena `objetivo`, la animación revela a 60 fps.
  const objetivo = useRef("");
  const mostrado = useRef(0);
  const raf = useRef(null);
  const alAlcanzar = useRef(null);

  const respondiendo = vivo !== null;

  useEffect(() => guardarHistorial(clave, mensajes), [clave, mensajes]);

  // Scroll pegado al fondo sin "smooth" por frame (eso era lo que se veía entrecortado).
  useLayoutEffect(() => {
    const zona = zonaMensajes.current;
    if (zona && pegadoAbajo.current) zona.scrollTop = zona.scrollHeight;
  }, [mensajes, vivo]);

  // Textarea que crece con el contenido.
  useLayoutEffect(() => {
    const el = areaTexto.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [texto]);

  useEffect(
    () => () => {
      cancelador.current?.abort();
      cancelAnimationFrame(raf.current);
    },
    [],
  );

  const animar = useCallback(() => {
    const total = objetivo.current;
    if (mostrado.current < total.length) {
      const pendiente = total.length - mostrado.current;
      // Se adapta a la velocidad del modelo: alcanza lo recibido en ~8 frames sin saltos bruscos.
      mostrado.current += Math.max(1, Math.ceil(pendiente / 8));
      setVivo(total.slice(0, mostrado.current));
    } else if (alAlcanzar.current) {
      const resolver = alAlcanzar.current;
      alAlcanzar.current = null;
      raf.current = null;
      resolver();
      return;
    }
    raf.current = requestAnimationFrame(animar);
  }, []);

  const cerrarRespuesta = useCallback((final) => {
    cancelAnimationFrame(raf.current);
    raf.current = null;
    alAlcanzar.current = null;
    if (final?.texto) setMensajes((l) => [...l, { id: nuevoId(), rol: "asistente", ...final }]);
    setVivo(null);
    cancelador.current = null;
  }, []);

  async function enviar(contenido) {
    const limpio = contenido.trim();
    if (!limpio || respondiendo) return;

    const conversacion = [...mensajes, { id: nuevoId(), rol: "usuario", texto: limpio }];
    setMensajes(conversacion);
    setTexto("");
    setMenuAbierto(false);
    pegadoAbajo.current = true;

    objetivo.current = "";
    mostrado.current = 0;
    setVivo("");
    raf.current = requestAnimationFrame(animar);

    const control = new AbortController();
    cancelador.current = control;
    try {
      const sesion = leerSesion();
      const respuesta = await fetch(`${BASE}/api/asistente/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(sesion?.token ? { Authorization: `Bearer ${sesion.token}` } : {}),
        },
        body: JSON.stringify({
          mensajes: conversacion.filter((m) => !m.error && m.texto).map(({ rol, texto: t }) => ({ rol, texto: t })),
        }),
        signal: control.signal,
      });
      if (!respuesta.ok || !respuesta.body) {
        throw new Error(
          respuesta.status === 401 ? "Tu sesión expiró. Vuelve a iniciar sesión." : "El asistente no pudo responder.",
        );
      }

      const lector = respuesta.body.getReader();
      const decodificador = new TextDecoder();
      for (;;) {
        const { done, value } = await lector.read();
        if (done) break;
        objetivo.current += decodificador.decode(value, { stream: true }); // sin setState por chunk
      }

      // Espera a que la animación termine de mostrar todo antes de cerrar.
      await new Promise((resolver) => {
        alAlcanzar.current = resolver;
      });
      const final = objetivo.current.trim();
      cerrarRespuesta(final ? { texto: objetivo.current } : { texto: "No recibí respuesta. Intenta de nuevo.", error: true });
    } catch (e) {
      if (e.name === "AbortError") {
        cerrarRespuesta(mostrado.current ? { texto: objetivo.current.slice(0, mostrado.current) } : null);
      } else {
        cerrarRespuesta({
          texto: e.message === "Failed to fetch" ? "No hay conexión con el servidor." : e.message,
          error: true,
        });
      }
    }
  }

  const reiniciar = () => {
    cancelador.current?.abort();
    cerrarRespuesta(null);
    setMensajes([]);
  };

  const agregarDictado = useCallback((dicho) => setTexto((t) => (t ? `${t} ${dicho}` : dicho)), []);
  const dictado = useDictado(agregarDictado);

  const vacio = mensajes.length === 0 && !respondiendo;

  return (
    <section
      className="relative isolate overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm"
      aria-label="Asistente de redacción de PQRS"
      data-testid="asistente-pqrs"
    >
      <style>{`
        @keyframes pqrsAparecer { from { opacity: 0; transform: translateY(6px) } to { opacity: 1; transform: none } }
        @keyframes pqrsCursor { 50% { opacity: 0 } }
        @keyframes pqrsPulso { 0%, 100% { opacity: .3; transform: scale(.85) } 50% { opacity: 1; transform: scale(1) } }
      `}</style>

      {/* Fondo degradado suave, como el de la referencia */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky-100/80 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-violet-200/60 blur-3xl" />
      </div>

      {/* Encabezado compacto */}
      <header className="flex items-center justify-between gap-3 px-6 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-violet-600 text-white">
            <IconoAsistente className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Asistente de redacción</h2>
            <p className="text-xs text-slate-500">Revisa y mejora tu PQRS antes de radicarla</p>
          </div>
        </div>
        {!vacio && (
          <button
            type="button"
            onClick={reiniciar}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
          >
            Nueva conversación
          </button>
        )}
      </header>

      {/* Cuerpo */}
      {vacio ? (
        <div className="px-6 pb-2 pt-10 text-center">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">¿En qué te ayudo con tu PQRS?</h3>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Pega tu petición, queja, reclamo o sugerencia y te digo cómo dejarla clara antes de radicarla.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => enviar(s)}
                className="rounded-full border border-slate-200 bg-white/80 px-3.5 py-1.5 text-xs font-medium text-slate-600 backdrop-blur transition hover:border-violet-300 hover:text-violet-700"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={zonaMensajes}
          onScroll={(e) => {
            const z = e.currentTarget;
            pegadoAbajo.current = z.scrollHeight - z.scrollTop - z.clientHeight < 80;
          }}
          className="h-[420px] space-y-6 overflow-y-auto px-6 py-6 [scrollbar-width:thin]"
          aria-live="polite"
        >
          {mensajes.map((m) => (
            <Burbuja key={m.id} rol={m.rol} texto={m.texto} error={m.error} />
          ))}
          {respondiendo && <Burbuja rol="asistente" texto={vivo} escribiendo />}
        </div>
      )}

      {/* Caja de texto estilo referencia */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
        className="px-6 pb-5 pt-4"
      >
        <div className="relative rounded-2xl border border-violet-400/70 bg-white shadow-[0_4px_24px_-8px_rgba(124,58,237,0.18)] transition focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
          <textarea
            ref={areaTexto}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                enviar(texto);
              }
            }}
            rows={1}
            maxLength={4000}
            placeholder="¿Qué quieres revisar de tu PQRS?"
            className="block w-full resize-none border-0 bg-transparent px-5 pb-2 pt-4 text-[15px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-0"
            data-testid="asistente-texto"
          />

          <div className="flex items-center justify-between px-3 pb-3">
            {/* Botón + con sugerencias */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuAbierto((v) => !v)}
                aria-label="Más opciones"
                aria-expanded={menuAbierto}
                className={`grid h-9 w-9 place-items-center rounded-full text-slate-700 transition hover:bg-slate-100 ${
                  menuAbierto ? "rotate-45 bg-slate-100" : ""
                }`}
              >
                <IconoMas />
              </button>
              {menuAbierto && (
                <div className="absolute bottom-11 left-0 z-10 w-72 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl motion-safe:animate-[pqrsAparecer_.15s_ease-out]">
                  {SUGERENCIAS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => enviar(s)}
                      disabled={respondiendo}
                      className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-violet-50 hover:text-violet-700 disabled:opacity-40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Acción principal: detener / enviar / micrófono */}
            {respondiendo ? (
              <button
                type="button"
                onClick={() => cancelador.current?.abort()}
                aria-label="Detener respuesta"
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700"
              >
                <IconoDetener />
              </button>
            ) : texto.trim() ? (
              <button
                type="submit"
                aria-label="Enviar"
                className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-sky-500 to-violet-600 text-white shadow-md shadow-violet-500/25 transition hover:scale-105"
                data-testid="asistente-enviar"
              >
                <IconoEnviar />
              </button>
            ) : dictado.disponible ? (
              <button
                type="button"
                onClick={dictado.alternar}
                aria-label={dictado.escuchando ? "Detener dictado" : "Dictar por voz"}
                className={`grid h-9 w-9 place-items-center rounded-full transition ${
                  dictado.escuchando ? "bg-red-50 text-red-600 ring-4 ring-red-100" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <IconoMicro />
              </button>
            ) : (
              <button
                type="submit"
                disabled
                aria-label="Enviar"
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-400"
                data-testid="asistente-enviar"
              >
                <IconoEnviar />
              </button>
            )}
          </div>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Orientación automática: la respuesta oficial la da el equipo de atención. No escribas números de tarjeta ni
          contraseñas.
        </p>
      </form>
    </section>
  );
}
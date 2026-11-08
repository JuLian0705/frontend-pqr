import { CATEGORIAS, ESTADOS, ORIGEN, PRIORIDADES, TIPOS } from "./constantes.js";

/*
 * Sistema de componentes UI — estilo SaaS empresarial.
 *
 * Reemplazo directo del archivo anterior: mismas exportaciones, mismas props
 * y mismos data-testid (las pruebas de Playwright siguen funcionando).
 * Props nuevas opcionales y componentes nuevos marcados con  ✦
 *
 * Paleta Valcode / Valdren: blanco, negro (slate-950) y azul eléctrico #2B5BFF.
 * ✦ Nuevo: componentes de tabla (Tabla, Columna, Fila, Celda) con el mismo
 *   diseño en todas las pantallas.
 */

/** ✦ Azul de marca (úsalo en clases como bg-[#2B5BFF] o text-[#2B5BFF]). */
export const AZUL = "#2B5BFF";

// =============================================================================
// Formato
// =============================================================================
const formatoFecha = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Bogota",
});
const formatoDia = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeZone: "America/Bogota" });

export const fecha = (iso) => (iso ? formatoFecha.format(new Date(iso)) : "—");
export const dia = (iso) => (iso ? formatoDia.format(new Date(iso)) : "—");

export function diasRestantes(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export const clases = (...lista) => lista.filter(Boolean).join(" ");

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

// =============================================================================
// Íconos (SVG en línea, sin dependencias)
// =============================================================================
function Icono({ className = "h-4 w-4", children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={clases("shrink-0", className)}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const IconoInfo = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icono>
);
const IconoExito = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m8.5 12.5 2.5 2.5 4.5-5" />
  </Icono>
);
const IconoError = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m9.5 9.5 5 5m0-5-5 5" />
  </Icono>
);
const IconoAviso = (p) => (
  <Icono {...p}>
    <path d="M12 3.5 2.5 20h19L12 3.5Z" />
    <path d="M12 10v4M12 17h.01" />
  </Icono>
);
const IconoIA = (p) => (
  <Icono {...p}>
    <path d="M11 3c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5C8.8 8.9 10.4 7.3 11 3Z" />
    <path d="M18.5 14.5c.3 1.9 1 2.6 2.9 2.9-1.9.3-2.6 1-2.9 2.9-.3-1.9-1-2.6-2.9-2.9 1.9-.3 2.6-1 2.9-2.9Z" />
  </Icono>
);
const IconoReglas = (p) => (
  <Icono {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <path d="M6.5 10v4a3 3 0 0 0 3 3H14" />
  </Icono>
);
const IconoPersona = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Icono>
);
const IconoBandeja = (p) => (
  <Icono {...p}>
    <path d="M3 13 6 5h12l3 8v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" />
    <path d="M3 13h5l1.5 3h5l1.5-3h5" />
  </Icono>
);
const IconoReloj = (p) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Icono>
);
const IconoChevron = (p) => (
  <Icono {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icono>
);
const IconoSube = (p) => (
  <Icono {...p}>
    <path d="M7 17 17 7M9 7h8v8" />
  </Icono>
);
const IconoBaja = (p) => (
  <Icono {...p}>
    <path d="m7 7 10 10M17 9v8H9" />
  </Icono>
);

/** Barras de señal (baja → alta) y cuadro con "!" para crítica. */
function IconoPrioridad({ valor }) {
  if (valor === "critica") {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
        <rect x="1" y="1" width="14" height="14" rx="3.5" fill="currentColor" />
        <path d="M8 4.5v4.25M8 11.25v.25" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" />
      </svg>
    );
  }
  const nivel = { baja: 1, media: 2, alta: 3 }[valor] ?? 0;
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={1.5 + i * 5}
          y={10 - i * 3.5}
          width="3"
          height={4.5 + i * 3.5}
          rx="1"
          fill="currentColor"
          opacity={i < nivel ? 1 : 0.25}
        />
      ))}
    </svg>
  );
}

// =============================================================================
// Insignias
// =============================================================================
const COLOR_PRIORIDAD = {
  critica: "bg-red-50 text-red-700 ring-red-600/20",
  alta: "bg-orange-50 text-orange-700 ring-orange-600/20",
  media: "bg-amber-50 text-amber-800 ring-amber-600/20",
  baja: "bg-slate-50 text-slate-600 ring-slate-500/20",
};

const COLOR_ESTADO = {
  abierto: { caja: "bg-sky-50 text-sky-700 ring-sky-600/20", punto: "bg-sky-500" },
  en_proceso: { caja: "bg-violet-50 text-violet-700 ring-violet-600/20", punto: "bg-violet-500 animate-pulse" },
  resuelto: { caja: "bg-emerald-50 text-emerald-700 ring-emerald-600/20", punto: "bg-emerald-500" },
};
const ESTADO_NEUTRO = { caja: "bg-slate-50 text-slate-600 ring-slate-500/20", punto: "bg-slate-400" };

const ESTILO_ORIGEN = {
  ia: { caja: "bg-[#2B5BFF]/10 text-[#2B5BFF] ring-[#2B5BFF]/20", Icono: IconoIA },
  reglas: { caja: "bg-amber-50 text-amber-800 ring-amber-600/20", Icono: IconoReglas },
  humano: { caja: "bg-slate-50 text-slate-700 ring-slate-500/20", Icono: IconoPersona },
};

export function Insignia({ className, children, ...resto }) {
  return (
    <span
      className={clases(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5",
        "text-xs font-medium leading-5 ring-1 ring-inset",
        className,
      )}
      {...resto}
    >
      {children}
    </span>
  );
}

export const InsigniaPrioridad = ({ valor }) =>
  valor ? (
    <Insignia className={COLOR_PRIORIDAD[valor] ?? COLOR_PRIORIDAD.baja} data-testid="insignia-prioridad">
      <IconoPrioridad valor={valor} />
      {PRIORIDADES[valor]}
    </Insignia>
  ) : (
    <Insignia className="bg-white text-slate-400 ring-slate-200">Sin prioridad</Insignia>
  );

export const InsigniaEstado = ({ valor }) => {
  const estilo = COLOR_ESTADO[valor] ?? ESTADO_NEUTRO;
  return (
    <Insignia className={estilo.caja} data-testid="insignia-estado">
      <span className={clases("h-1.5 w-1.5 rounded-full", estilo.punto)} aria-hidden="true" />
      {ESTADOS[valor] ?? valor}
    </Insignia>
  );
};

export const InsigniaOrigen = ({ valor }) => {
  if (!valor) return null;
  const estilo = ESTILO_ORIGEN[valor] ?? { caja: ESTADO_NEUTRO.caja, Icono: IconoInfo };
  return (
    <Insignia className={estilo.caja}>
      <estilo.Icono className="h-3.5 w-3.5" />
      {ORIGEN[valor] ?? valor}
    </Insignia>
  );
};

/** ✦ Semáforo de vencimiento a partir de la fecha límite (ISO). */
export function InsigniaVencimiento({ limite }) {
  if (!limite) return null;
  const d = diasRestantes(limite);
  let estilo;
  let texto;
  if (d < 0) {
    estilo = "bg-red-50 text-red-700 ring-red-600/20";
    texto = `Vencida hace ${plural(-d, "día", "días")}`;
  } else if (d === 0) {
    estilo = "bg-orange-50 text-orange-700 ring-orange-600/20";
    texto = "Vence hoy";
  } else if (d <= 3) {
    estilo = "bg-amber-50 text-amber-800 ring-amber-600/20";
    texto = `Vence en ${plural(d, "día", "días")}`;
  } else {
    estilo = "bg-slate-50 text-slate-600 ring-slate-500/20";
    texto = `${plural(d, "día", "días")} restantes`;
  }
  return (
    <Insignia className={estilo} title={fecha(limite)} data-testid="insignia-vencimiento">
      <IconoReloj className="h-3.5 w-3.5" />
      {texto}
    </Insignia>
  );
}

export const etiquetaTipo = (t) => (t ? TIPOS[t] : "—");
export const etiquetaCategoria = (c) => (c ? CATEGORIAS[c] : "—");

// =============================================================================
// Estructura
// =============================================================================

/** ✦ Encabezado de página: migas de pan, título, descripción y acciones. */
export function EncabezadoPagina({ titulo, descripcion, migas, acciones }) {
  return (
    <div className="mb-8">
      {migas?.length > 0 && (
        <nav aria-label="Ruta" className="mb-3 flex flex-wrap items-center gap-1.5 text-xs font-medium text-slate-500">
          {migas.map((miga, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <IconoChevron className="h-3.5 w-3.5 text-slate-300" />}
              <span className={i === migas.length - 1 ? "text-[#2B5BFF]" : undefined}>{miga}</span>
            </span>
          ))}
        </nav>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">{titulo}</h1>
          {descripcion && <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-slate-500">{descripcion}</p>}
        </div>
        {acciones && <div className="flex shrink-0 flex-wrap items-center gap-2">{acciones}</div>}
      </div>
    </div>
  );
}

/**
 * Contenedor principal.
 * ✦ descripcion: subtítulo bajo el título · pie: barra inferior · sinRelleno: para tablas a sangre.
 */
export function Tarjeta({ titulo, descripcion, accion, pie, sinRelleno, className, children }) {
  return (
    <section className={clases("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      {(titulo || accion) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-6 py-3">
          <div className="min-w-0">
            <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</h2>
            {descripcion && <p className="mt-0.5 text-sm text-slate-500">{descripcion}</p>}
          </div>
          {accion && <div className="flex shrink-0 items-center gap-2">{accion}</div>}
        </header>
      )}
      <div className={sinRelleno ? undefined : "px-6 py-5"}>{children}</div>
      {pie && (
        <footer className="border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm text-slate-600">
          {pie}
        </footer>
      )}
    </section>
  );
}

/** ✦ Tarjeta de indicador (KPI). variacion en %, mejorSiBaja invierte los colores. */
export function Metrica({ etiqueta, valor, variacion, detalle, icono, mejorSiBaja }) {
  const hayVariacion = typeof variacion === "number";
  const sube = hayVariacion && variacion >= 0;
  const esBueno = mejorSiBaja ? !sube : sube;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{etiqueta}</p>
        {icono && (
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2B5BFF] text-white shadow-sm shadow-[#2B5BFF]/30">
            {icono}
          </span>
        )}
      </div>
      <p className="mt-2 text-3xl font-bold tracking-[-0.03em] tabular-nums text-slate-950">{valor}</p>
      {(hayVariacion || detalle) && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {hayVariacion && (
            <span
              className={clases(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold tabular-nums",
                esBueno ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
              )}
            >
              {sube ? <IconoSube className="h-3 w-3" /> : <IconoBaja className="h-3 w-3" />}
              {Math.abs(variacion)}%
            </span>
          )}
          {detalle && <span className="text-slate-500">{detalle}</span>}
        </div>
      )}
    </div>
  );
}

/** Par etiqueta / valor dentro de un <dl>. */
export function Dato({ etiqueta, className, children }) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{etiqueta}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

// =============================================================================
// Acciones
// =============================================================================
const BASE_BOTON = clases(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
);

const VARIANTES_BOTON = {
  primario:
    "bg-slate-950 text-white shadow-lg shadow-slate-950/15 hover:bg-[#2B5BFF] hover:shadow-[#2B5BFF]/30 focus-visible:outline-[#2B5BFF]",
  secundario:
    "bg-white text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:ring-slate-300 focus-visible:outline-[#2B5BFF]",
  peligro: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:outline-red-600",
  sutil: "bg-[#2B5BFF]/10 text-[#2B5BFF] hover:bg-[#2B5BFF]/15 focus-visible:outline-[#2B5BFF]", // ✦
  fantasma: "text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-[#2B5BFF]", // ✦
};

const TAMANOS_BOTON = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-sm",
};

/** ✦ tamano: "sm" | "md" | "lg" · icono: elemento que se muestra antes del texto. */
export function Boton({ variante = "primario", tamano = "md", icono, cargando, disabled, className, children, ...resto }) {
  return (
    <button
      className={clases(
        BASE_BOTON,
        VARIANTES_BOTON[variante] ?? VARIANTES_BOTON.primario,
        TAMANOS_BOTON[tamano] ?? TAMANOS_BOTON.md,
        className,
      )}
      {...resto}
      disabled={cargando || disabled}
      aria-busy={cargando || undefined}
    >
      {cargando ? <Spinner pequeno /> : icono}
      {children}
    </button>
  );
}

// =============================================================================
// Retroalimentación
// =============================================================================
export function Spinner({ pequeno, className }) {
  return (
    <span role="status" aria-label="Cargando" className={clases("inline-flex", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={clases("animate-spin", pequeno ? "h-4 w-4" : "h-6 w-6")}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

const ESTILOS_ALERTA = {
  error: {
    caja: "bg-red-50 ring-red-600/15",
    icono: "text-red-500",
    titulo: "text-red-800",
    texto: "text-red-700",
    Icono: IconoError,
  },
  exito: {
    caja: "bg-emerald-50 ring-emerald-600/15",
    icono: "text-emerald-500",
    titulo: "text-emerald-800",
    texto: "text-emerald-700",
    Icono: IconoExito,
  },
  info: {
    caja: "bg-sky-50 ring-sky-600/15",
    icono: "text-sky-500",
    titulo: "text-sky-800",
    texto: "text-sky-700",
    Icono: IconoInfo,
  },
  aviso: {
    caja: "bg-amber-50 ring-amber-600/20",
    icono: "text-amber-500",
    titulo: "text-amber-900",
    texto: "text-amber-800",
    Icono: IconoAviso,
  },
};

/** ✦ titulo: línea en negrita sobre el mensaje. */
export function Alerta({ tipo = "error", titulo, className, children }) {
  if (!children) return null;
  const estilo = ESTILOS_ALERTA[tipo] ?? ESTILOS_ALERTA.info;
  return (
    <div
      className={clases("flex gap-3 rounded-2xl p-4 ring-1 ring-inset", estilo.caja, className)}
      role="alert"
      data-testid={`alerta-${tipo}`}
    >
      <estilo.Icono className={clases("h-5 w-5", estilo.icono)} />
      <div className="min-w-0 text-sm">
        {titulo && <p className={clases("font-semibold", estilo.titulo)}>{titulo}</p>}
        <div className={clases(estilo.texto, titulo && "mt-1")}>{children}</div>
      </div>
    </div>
  );
}

export function Cargando({ texto = "Cargando…" }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20">
      <Spinner className="text-[#2B5BFF]" />
      <span className="text-sm font-medium text-slate-500">{texto}</span>
    </div>
  );
}

/** ✦ Bloque gris animado para estados de carga (pásale alto y ancho por className). */
export function Esqueleto({ className }) {
  return <div className={clases("animate-pulse rounded-md bg-slate-200/70", className)} aria-hidden="true" />;
}

/** ✦ icono: reemplaza el ícono por defecto · accion: botón bajo el texto. */
export function Vacio({ titulo, icono, accion, children }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#2B5BFF]/10 text-[#2B5BFF] ring-8 ring-[#2B5BFF]/5">
        {icono ?? <IconoBandeja className="h-6 w-6" />}
      </div>
      <p className="mt-5 text-sm font-semibold text-slate-900">{titulo}</p>
      {children && <div className="mt-1 max-w-sm text-sm text-slate-500">{children}</div>}
      {accion && <div className="mt-6">{accion}</div>}
    </div>
  );
}

// =============================================================================
// ✦ Tablas (mismo diseño en todas las pantallas)
// =============================================================================
/*
 * Uso:
 *   <Tabla data-testid="tabla-x">
 *     <thead>
 *       <tr><Columna>Radicado</Columna><Columna>Estado</Columna></tr>
 *     </thead>
 *     <tbody>
 *       <Fila onClick={...}>
 *         <Celda encabezado mono>{p.radicado}</Celda>
 *         <Celda><InsigniaEstado valor={p.estado} /></Celda>
 *       </Fila>
 *     </tbody>
 *   </Tabla>
 */

/** ✦ Contenedor con borde redondeado y scroll horizontal en pantallas pequeñas. */
export function Tabla({ className, children, ...resto }) {
  return (
    <div className={clases("relative overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <table className="w-full text-left text-sm text-slate-600" {...resto}>
        {children}
      </table>
    </div>
  );
}

/** ✦ Encabezado de columna. Pon las <Columna> dentro de <thead><tr>. alinear: "izquierda" | "derecha". */
export function Columna({ alinear = "izquierda", className, children, ...resto }) {
  return (
    <th
      scope="col"
      className={clases(
        "whitespace-nowrap border-b border-slate-200 bg-slate-50 px-6 py-3",
        "text-xs font-medium uppercase tracking-wide text-slate-500",
        alinear === "derecha" && "text-right",
        className,
      )}
      {...resto}
    >
      {children}
    </th>
  );
}

/** ✦ Fila. Con onClick se vuelve clicable (resaltado azul suave al pasar el mouse). */
export function Fila({ onClick, seleccionada, className, children, ...resto }) {
  return (
    <tr
      onClick={onClick}
      className={clases(
        "group border-b border-slate-200 bg-white transition-colors last:border-b-0",
        onClick && "cursor-pointer hover:bg-[#2B5BFF]/[0.04]",
        seleccionada && "bg-[#2B5BFF]/[0.06]",
        className,
      )}
      {...resto}
    >
      {children}
    </tr>
  );
}

/**
 * ✦ Celda. encabezado: celda principal de la fila (texto oscuro, <th scope="row">).
 * mono: fuente monoespaciada (radicados, códigos) · alinear: "izquierda" | "derecha".
 */
export function Celda({ encabezado, mono, alinear = "izquierda", className, children, ...resto }) {
  const Etiqueta = encabezado ? "th" : "td";
  return (
    <Etiqueta
      scope={encabezado ? "row" : undefined}
      className={clases(
        "px-6 py-4 align-middle",
        encabezado && "whitespace-nowrap font-medium text-slate-950",
        mono && "font-mono text-xs font-semibold",
        alinear === "derecha" && "text-right",
        className,
      )}
      {...resto}
    >
      {children}
    </Etiqueta>
  );
}

/** ✦ Flecha que aparece al final de una fila clicable. */
export function FlechaFila() {
  return (
    <IconoChevron className="ml-auto h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#2B5BFF]" />
  );
}
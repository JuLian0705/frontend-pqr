import { BarChart } from "@mui/x-charts/BarChart";
import { api } from "../../api.js";
import { CATEGORIAS, ESTADOS, ORIGEN, PRIORIDADES, TIPOS } from "../../constantes.js";
import { useCarga } from "../../hooks.js";
import { Alerta, Cargando, clases } from "../../ui.jsx";

/* Paleta Valcode / Valdren */
const AZUL = "#2B5BFF";
const COLOR_PRIORIDAD = { critica: "#EF4444", alta: "#FB923C", media: "#FBBF24", baja: "#CBD5E1" };
const COLOR_ESTADO = { abierto: "#0EA5E9", en_proceso: "#8B5CF6", resuelto: "#10B981" };
const COLOR_ORIGEN = { ia: AZUL, reglas: "#F59E0B", humano: "#0F172A" };

/* Estilo común de las gráficas: tipografía de la app, ejes suaves y sin líneas de borde */
const ESTILO_GRAFICA = {
  fontFamily: "inherit",
  "& .MuiChartsAxis-line, & .MuiChartsAxis-tick": { stroke: "#E2E8F0" },
  "& .MuiChartsAxis-tickLabel": { fill: "#64748B", fontSize: 12 },
  "& .MuiChartsGrid-line": { stroke: "#F1F5F9" },
};

function Kpi({ titulo, valor, detalle, tono, punto = "bg-slate-950" }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
        <span className={clases("h-1.5 w-1.5 rounded-full", punto)} />
        {titulo}
      </p>
      <p className={clases("mt-2 text-3xl font-bold tracking-[-0.03em] tabular-nums", tono ?? "text-slate-950")}>
        {valor}
      </p>
      {detalle && <p className="mt-1 text-xs text-slate-400">{detalle}</p>}
    </div>
  );
}

function Panel({ titulo, descripcion, className, children }) {
  return (
    <section className={clases("overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm", className)}>
      <header className="border-b border-slate-200 bg-slate-50 px-6 py-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</h2>
        {descripcion && <p className="mt-0.5 text-xs text-slate-400">{descripcion}</p>}
      </header>
      <div className="px-3 py-4">{children}</div>
    </section>
  );
}

/**
 * Barras horizontales con MUI X Charts.
 * datos: { clave: cantidad } · etiquetas: { clave: texto } · colores: { clave: "#hex" }
 */
function Barras({ datos, etiquetas, colores }) {
  const filas = Object.entries(datos ?? {}).sort((a, b) => b[1] - a[1]);
  if (!filas.length) return <p className="px-3 py-8 text-center text-sm text-slate-400">Sin datos</p>;

  const claves = filas.map(([k]) => k);
  const nombres = filas.map(([k]) => etiquetas?.[k] ?? k);
  const valores = filas.map(([, v]) => v);

  return (
    <BarChart
      layout="horizontal"
      height={Math.max(160, filas.length * 44 + 40)}
      borderRadius={8}
      hideLegend
      grid={{ vertical: true }}
      margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
      yAxis={[
        {
          scaleType: "band",
          data: nombres,
          width: 120,
          disableLine: true,
          disableTicks: true,
          categoryGapRatio: 0.45,
          colorMap: {
            type: "ordinal",
            values: nombres,
            colors: claves.map((k) => colores?.[k] ?? AZUL),
          },
        },
      ]}
      xAxis={[{ tickMinStep: 1, disableLine: true, height: 24 }]}
      series={[{ data: valores, valueFormatter: (v) => `${v} PQRS` }]}
      sx={ESTILO_GRAFICA}
    />
  );
}

export default function Metricas() {
  const { datos: m, error, cargando } = useCarga(() => api("/api/gestion/metricas"), [], {
    intervalo: 15000,
    seguirConsultando: () => true,
  });

  if (cargando && !m) return <Cargando />;
  if (!m) return <Alerta>{error}</Alerta>;

  const c = m.clasificacion;
  const dias = m.ultimos_7_dias;

  return (
    <div className="mx-auto max-w-7xl space-y-6" data-testid="metricas">
      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2B5BFF] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2B5BFF]" />
            </span>
            En vivo · cada 15 s
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-slate-950 sm:text-4xl">Métricas de atención</h1>
          <p className="mt-2 text-[15px] text-slate-500">Indicadores para la gerencia sobre el flujo de PQRS.</p>
        </div>
      </div>

      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi titulo="PQRS recibidas" valor={m.total} detalle={`${m.abiertas} sin resolver`} />
        <Kpi titulo="Críticas pendientes" valor={m.criticas_pendientes} tono="text-red-600" punto="bg-red-500" />
        <Kpi
          titulo="Vencidas"
          valor={m.vencidas}
          tono={m.vencidas ? "text-orange-600" : undefined}
          punto="bg-orange-400"
        />
        <Kpi
          titulo="Tiempo de resolución"
          valor={m.tiempo_promedio_resolucion_h != null ? `${m.tiempo_promedio_resolucion_h} h` : "—"}
          detalle="Promedio desde la radicación"
          punto="bg-emerald-500"
        />
        <Kpi
          titulo="Clasificación con IA"
          valor={c.tiempo_promedio_ia_ms != null ? `${(c.tiempo_promedio_ia_ms / 1000).toFixed(1)} s` : "—"}
          detalle="Tiempo promedio por PQRS"
          punto="bg-[#2B5BFF]"
        />
        <Kpi
          titulo="Corrección humana"
          valor={`${c.tasa_correccion_pct} %`}
          detalle={`${c.corregidas_por_humano} PQRS corregidas por un empleado`}
          punto="bg-[#2B5BFF]"
        />
        <Kpi titulo="Pendientes de análisis" valor={c.pendientes} punto="bg-amber-400" />
        <Kpi
          titulo="Clasificadas por IA"
          valor={c.por_origen?.ia ?? 0}
          detalle={`${c.por_origen?.reglas ?? 0} por reglas · ${c.por_origen?.humano ?? 0} corregidas`}
          punto="bg-[#2B5BFF]"
        />
      </div>

      {/* Radicaciones de los últimos 7 días */}
      <Panel titulo="Radicaciones de los últimos 7 días" descripcion="Cantidad de PQRS radicadas por día">
        <BarChart
          height={280}
          borderRadius={10}
          hideLegend
          grid={{ horizontal: true }}
          margin={{ top: 16, right: 16, bottom: 8, left: 8 }}
          xAxis={[
            {
              scaleType: "band",
              data: dias.map((d) => d.fecha.slice(5)),
              disableLine: true,
              disableTicks: true,
              categoryGapRatio: 0.5,
            },
          ]}
          yAxis={[{ tickMinStep: 1, disableLine: true, disableTicks: true, width: 36 }]}
          series={[{ data: dias.map((d) => d.cantidad), color: AZUL, valueFormatter: (v) => `${v} PQRS` }]}
          sx={ESTILO_GRAFICA}
        />
      </Panel>

      {/* Distribuciones */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel titulo="Por tipo">
          <Barras datos={m.por_tipo} etiquetas={TIPOS} />
        </Panel>
        <Panel titulo="Por prioridad">
          <Barras datos={m.por_prioridad} etiquetas={PRIORIDADES} colores={COLOR_PRIORIDAD} />
        </Panel>
        <Panel titulo="Por estado">
          <Barras datos={m.por_estado} etiquetas={ESTADOS} colores={COLOR_ESTADO} />
        </Panel>
        <Panel titulo="Por área">
          <Barras datos={m.por_area} />
        </Panel>
        <Panel titulo="Por categoría">
          <Barras datos={m.por_categoria} etiquetas={CATEGORIAS} />
        </Panel>
        <Panel titulo="Origen de la clasificación">
          <Barras datos={c.por_origen} etiquetas={ORIGEN} colores={COLOR_ORIGEN} />
        </Panel>
      </div>
    </div>
  );
}
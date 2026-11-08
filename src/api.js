// Cliente HTTP de la API. En desarrollo Vite redirige /api al backend.
const BASE = import.meta.env.VITE_API_URL || "";
const CLAVE_SESION = "pqrs_sesion";

export class ApiError extends Error {
  constructor(status, mensaje, datos) {
    super(mensaje);
    this.status = status;
    this.datos = datos;
  }
}

export function leerSesion() {
  try {
    const crudo = localStorage.getItem(CLAVE_SESION);
    return crudo ? JSON.parse(crudo) : null;
  } catch {
    return null;
  }
}

export function guardarSesion(sesion) {
  try {
    if (sesion) localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
    else localStorage.removeItem(CLAVE_SESION);
  } catch {
    /* almacenamiento no disponible: la sesión vive solo en memoria */
  }
}

let alExpirarSesion = null;
export function onSesionExpirada(fn) {
  alExpirarSesion = fn;
}

const NOMBRES_CAMPO = {
  nombre: "Nombre",
  email: "Correo",
  password: "Contraseña",
  asunto: "Asunto",
  descripcion: "Descripción",
  mensaje: "Mensaje",
  comentario: "Comentario",
};

function traducirError(e) {
  const campo = NOMBRES_CAMPO[e.loc?.[e.loc.length - 1]] || "Dato";
  switch (e.type) {
    case "string_too_short":
      return `${campo}: mínimo ${e.ctx?.min_length} caracteres`;
    case "string_too_long":
      return `${campo}: máximo ${e.ctx?.max_length} caracteres`;
    case "missing":
      return `${campo}: es obligatorio`;
    case "value_error":
      if (String(e.msg).toLowerCase().includes("email")) return `${campo}: no es un correo válido`;
      return `${campo}: ${String(e.msg).replace("Value error, ", "")}`;
    default:
      return `${campo}: valor no válido`;
  }
}

function mensajeDeError(datos, status) {
  if (!datos) return status >= 500 ? "El servidor no respondió correctamente" : "Error de conexión";
  if (typeof datos.detail === "string") return datos.detail;
  if (Array.isArray(datos.detail)) return datos.detail.map(traducirError).join(" · ");
  return "Ocurrió un error inesperado";
}

export async function api(ruta, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const sesion = leerSesion();
  if (sesion?.token) headers.Authorization = `Bearer ${sesion.token}`;

  let respuesta;
  try {
    respuesta = await fetch(`${BASE}${ruta}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(0, "No hay conexión con el servidor. ¿Está corriendo el backend?", null);
  }

  const texto = await respuesta.text();
  let datos = null;
  if (texto) {
    try {
      datos = JSON.parse(texto);
    } catch {
      datos = { detail: texto };
    }
  }

  if (!respuesta.ok) {
    if (respuesta.status === 401 && !ruta.startsWith("/api/auth/") && alExpirarSesion) alExpirarSesion();
    throw new ApiError(respuesta.status, mensajeDeError(datos, respuesta.status), datos);
  }
  return datos;
}

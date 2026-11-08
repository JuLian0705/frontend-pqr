// Etiquetas del catálogo (espejo de backend/app/services/catalogo.py)
export const TIPOS = { P: "Petición", Q: "Queja", R: "Reclamo", S: "Sugerencia" };

export const CATEGORIAS = {
  facturacion: "Facturación y pagos",
  soporte_tecnico: "Soporte técnico",
  entregas: "Entregas y logística",
  calidad_producto: "Calidad del producto",
  atencion_servicio: "Atención al cliente",
  datos_personales: "Datos personales",
  otro: "Otro",
};

export const PRIORIDADES = { critica: "Crítica", alta: "Alta", media: "Media", baja: "Baja" };

export const ESTADOS = { abierto: "Abierto", en_proceso: "En proceso", resuelto: "Resuelto" };

export const TRANSICIONES = {
  abierto: ["en_proceso", "resuelto"],
  en_proceso: ["resuelto"],
  resuelto: ["en_proceso"],
};

export const ROLES = { cliente: "Ciudadano", empleado: "Empleado", admin: "Administrador" };

export const EVENTOS = {
  creada: "Radicada",
  clasificada: "Clasificación automática",
  asignada: "Asignación",
  estado: "Cambio de estado",
  respuesta: "Respuesta",
  nota: "Nota interna",
  reclasificada: "Corrección de clasificación",
};

export const ORIGEN = { ia: "IA (Llama)", reglas: "Reglas de respaldo", humano: "Corregido por humano" };

export const USUARIOS_DEMO = [
  { rol: "Ciudadano", email: "cliente@demo-pqrs.co", password: "Cliente123*" },
  { rol: "Empleado · Facturación", email: "facturacion@demo-pqrs.co", password: "Empleado123*" },
  { rol: "Empleado · Soporte", email: "soporte@demo-pqrs.co", password: "Empleado123*" },
  { rol: "Administrador", email: "admin@demo-pqrs.co", password: "Admin123*" },
];

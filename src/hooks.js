import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Carga datos de la API y, opcionalmente, vuelve a consultar cada `intervalo` ms
 * mientras `seguirConsultando(datos)` sea verdadero (p. ej. mientras la IA clasifica).
 */
export function useCarga(cargar, deps, { intervalo = 2000, seguirConsultando } = {}) {
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  const recargar = useCallback(async () => {
    try {
      const resultado = await cargarRef.current();
      setDatos(resultado);
      setError("");
      return resultado;
    } catch (e) {
      setError(e.message);
      return null;
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    setCargando(true);
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const consultar = seguirConsultando ? seguirConsultando(datos) : false;
  useEffect(() => {
    if (!consultar) return undefined;
    const id = setInterval(recargar, intervalo);
    return () => clearInterval(id);
  }, [consultar, intervalo, recargar]);

  return { datos, setDatos, error, cargando, recargar };
}

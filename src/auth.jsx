import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, guardarSesion, leerSesion, onSesionExpirada } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sesion, setSesion] = useState(() => leerSesion());
  const [verificando, setVerificando] = useState(() => Boolean(leerSesion()));

  const cerrarSesion = useCallback(() => {
    guardarSesion(null);
    setSesion(null);
  }, []);

  const abrirSesion = useCallback((respuesta) => {
    const nueva = { token: respuesta.access_token, usuario: respuesta.usuario };
    guardarSesion(nueva);
    setSesion(nueva);
    return nueva.usuario;
  }, []);

  useEffect(() => onSesionExpirada(cerrarSesion), [cerrarSesion]);

  // Valida el token guardado al recargar la página
  useEffect(() => {
    if (!leerSesion()) return;
    api("/api/auth/me")
      .then((usuario) => {
        const actual = { ...leerSesion(), usuario };
        guardarSesion(actual);
        setSesion(actual);
      })
      .catch(() => cerrarSesion())
      .finally(() => setVerificando(false));
  }, [cerrarSesion]);

  const valor = useMemo(
    () => ({
      usuario: sesion?.usuario ?? null,
      verificando,
      async iniciarSesion(email, password) {
        return abrirSesion(await api("/api/auth/login", { method: "POST", body: { email, password } }));
      },
      async registrarse(datos) {
        return abrirSesion(await api("/api/auth/registro", { method: "POST", body: datos }));
      },
      cerrarSesion,
    }),
    [sesion, verificando, abrirSesion, cerrarSesion],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

export function rutaInicio(usuario) {
  if (!usuario) return "/login";
  return usuario.rol === "cliente" ? "/mis-pqrs" : "/gestion";
}

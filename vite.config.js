import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// En desarrollo, /api se redirige al backend FastAPI (puerto 8000).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
       //para correr en desarrollo en la computadora, se puede usar localhost, ya que el navegador puede acceder a localhost 
      "/api": process.env.VITE_PROXY_API || "http://localhost:8000",

     // para correr en dispositivos moviles, se debe usar la url del tunel de devtunnels, ya que localhost no es accesible desde el movil 
     //"/api": process.env.VITE_PROXY_API || "http://localhost:8000",
    },
  },
});

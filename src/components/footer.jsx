import mascota from "../img/Mascota robótica orbital en neón.png";

export default function Footer() {
  return (
    <footer className="relative mt-auto border-t border-slate-200/80 bg-white/90">
      <div aria-hidden="true" className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={mascota}
            alt="Mascota robótica de Valdren AI"
            className="h-12 w-12 object-contain"
            draggable="false"
          />
          <span aria-hidden="true" className="hidden h-9 w-px bg-slate-200 sm:block" />
          <p className="max-w-xs text-xs leading-relaxed text-slate-500">
            Gestión inteligente y seguimiento confiable de tus solicitudes.
          </p>
        </div>

        <div className="flex flex-col gap-1 text-xs md:items-end">
          <p className="font-medium tracking-wide text-slate-600">
            Peticiones <span className="text-blue-500">·</span> Quejas{" "}
            <span className="text-blue-500">·</span> Reclamos{" "}
            <span className="text-blue-500">·</span> Sugerencias
          </p>
          <p className="text-slate-400">© {new Date().getFullYear()} Valdren AI. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

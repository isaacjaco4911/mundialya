import type { Metadata } from "next";
import { adminStats } from "@/lib/db";
import { SUPPORT_WA } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Métricas para anunciantes",
  description: "Alcance de MundialYa durante el Mundial 2026: visitas, votos y predicciones. Banners, popups, sitios destacados y ligas patrocinadas.",
};

/** Página pública para vender publicidad con métricas reales del sitio. */
export default async function MetricasPage() {
  const s = await adminStats();
  const cards: [string, number][] = [
    ["Visitas del sitio", s.siteVisits],
    ["Vistas de partidos", s.matchViews],
    ["Votos en encuestas", s.votes],
    ["Predicciones en la polla", s.predictions],
    ["Jugadores en pollas", s.users],
    ["Sitios en el directorio", s.venues],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-title text-2xl font-extrabold sm:text-3xl">Anuncia tu marca en MundialYa 📣</h1>
      <p className="mt-2 text-sm text-muted">
        Durante el Mundial 2026, los colombianos viven los partidos aquí: horarios
        en hora local, polla con amigos y dónde ver cada juego. Pon tu marca en el
        centro de esa conversación.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-4 text-center">
            <p className="scoreboard text-3xl font-bold text-primary">{value.toLocaleString("es-CO")}</p>
            <p className="mt-1 text-xs font-semibold text-muted">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-title text-xl font-bold">Formatos disponibles</h2>
      <div className="mt-3 space-y-3">
        {[
          ["⭐ Sitio destacado", "Tu negocio sale de primero en 'Dónde ver', con distintivo dorado y vigencia configurable."],
          ["📣 Banners", "Slots en el home, el detalle de partido y la barra lateral, programables por fecha y prioridad."],
          ["🪟 Popups", "Mensaje destacado al entrar al sitio, con tope de frecuencia por usuario para no saturar."],
          ["🏆 Liga patrocinada", "Tu marca le pone nombre y premios a una polla pública con miles de predicciones."],
        ].map(([title, desc]) => (
          <div key={title} className="card p-4">
            <p className="font-bold">{title}</p>
            <p className="mt-1 text-sm text-muted">{desc}</p>
          </div>
        ))}
      </div>

      <a
        href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent("Hola, quiero anunciar mi marca en MundialYa 📣")}`}
        target="_blank"
        rel="noopener"
        className="btn-accent mt-6 w-full"
      >
        💬 Hablemos por WhatsApp
      </a>
    </div>
  );
}

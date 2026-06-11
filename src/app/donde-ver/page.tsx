import type { Metadata } from "next";
import Link from "next/link";
import { getVenues, getMatches } from "@/lib/db";
import { fmtDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dónde ver el Mundial 2026 en Bogotá",
  description: "Cafés, restaurantes y plazas que proyectan los partidos del Mundial 2026: pantallas, promos del día y reserva por WhatsApp.",
};

export default async function DondeVerPage({
  searchParams,
}: {
  searchParams: { barrio?: string; partido?: string };
}) {
  const [venues, matches] = await Promise.all([
    getVenues({ neighborhood: searchParams.barrio || undefined, matchId: searchParams.partido || undefined }),
    getMatches(),
  ]);
  const allVenues = await getVenues();
  const neighborhoods = Array.from(new Set(allVenues.map((v) => v.neighborhood))).sort();
  const matchById = new Map(matches.map((m) => [m.id, m]));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-title text-2xl font-extrabold sm:text-3xl">¿Dónde ver los partidos? 📺</h1>
          <p className="mt-1 text-sm text-muted">Sitios que proyectan el Mundial: promos, pantallas y reserva por WhatsApp.</p>
        </div>
        <Link href="/donde-ver/registrar" className="btn-accent">+ Registrar mi sitio</Link>
      </div>

      {/* Filtros */}
      <form className="card mt-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-3" method="get">
        <div>
          <label className="label" htmlFor="barrio">Barrio</label>
          <select id="barrio" name="barrio" defaultValue={searchParams.barrio || ""} className="input">
            <option value="">Todos</option>
            {neighborhoods.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="partido">Partido</label>
          <select id="partido" name="partido" defaultValue={searchParams.partido || ""} className="input">
            <option value="">Todos</option>
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.home_team?.name} vs {m.away_team?.name} ({fmtDate(m.kickoff)})
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full">Filtrar</button>
        </div>
      </form>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {venues.map((v) => {
          const showing = v.showing_match_id ? matchById.get(v.showing_match_id) : null;
          return (
            <Link key={v.id} href={`/sitio/${v.id}`} className="card overflow-hidden transition hover:border-primary/40 hover:shadow-md">
              <div className="relative">
                {v.photo_url ? (
                  <img src={v.photo_url} alt={v.name} className="h-40 w-full object-cover" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center bg-primary/10 text-4xl">📺</div>
                )}
                <div className="absolute left-2 top-2 flex gap-1.5">
                  {v.is_featured && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-[#0c1b12]">⭐ DESTACADO</span>}
                  {v.is_verified && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">✅ Verificado</span>}
                </div>
              </div>
              <div className="p-4">
                <p className="font-title text-base font-bold">{v.name}</p>
                <p className="text-xs text-muted">{v.neighborhood}, {v.city} · {v.screens} pantalla{v.screens !== 1 ? "s" : ""}</p>
                {v.review_count > 0 && (
                  <p className="mt-1 text-xs">
                    <span className="text-accent">{"★".repeat(Math.round(v.avg_rating))}</span>{" "}
                    <span className="text-muted">{v.avg_rating} ({v.review_count} reseñas)</span>
                  </p>
                )}
                {showing && (
                  <p className="mt-2 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                    📡 Proyecta: {showing.home_team?.name} vs {showing.away_team?.name}
                  </p>
                )}
                {v.promos && <p className="mt-2 line-clamp-2 text-xs text-muted">🎉 {v.promos}</p>}
              </div>
            </Link>
          );
        })}
      </div>

      {venues.length === 0 && (
        <div className="card mt-5 p-8 text-center text-sm text-muted">
          No hay sitios con esos filtros todavía. ¿Tienes un negocio?{" "}
          <Link href="/donde-ver/registrar" className="font-semibold text-primary hover:underline">Regístralo gratis</Link>.
        </div>
      )}
    </div>
  );
}

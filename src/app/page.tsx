import Link from "next/link";
import MatchCard from "@/components/MatchCard";
import BannerSlot from "@/components/BannerSlot";
import { upcomingMatches, getMatches, globalBoard, isDemo } from "@/lib/db";
import { isToday, initials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [next, all, board] = await Promise.all([
    upcomingMatches(2),
    getMatches(),
    globalBoard(5),
  ]);
  const today = all.filter((m) => isToday(m.kickoff) || m.status === "live");

  return (
    <div className="space-y-8">
      {isDemo && (
        <p className="rounded-xl bg-accent/15 px-3 py-2 text-center text-xs font-semibold text-ink">
          🧪 Modo demo: datos de ejemplo en memoria. Configura Supabase en .env.local para persistir.
        </p>
      )}

      <BannerSlot placement="home_top" />

      {/* Banner: próximos partidos con cuenta regresiva */}
      <section>
        <h1 className="font-title text-2xl font-extrabold sm:text-3xl">
          El Mundial 2026, <span className="text-primary">en tu hora</span> 🇨🇴
        </h1>
        <p className="mt-1 text-sm text-muted">
          48 selecciones · USA, Canadá y México · Todo en hora de Bogotá.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {next.length > 0 ? (
            next.map((m) => <MatchCard key={m.id} match={m} withCountdown big />)
          ) : (
            <div className="card p-6 text-center text-sm text-muted sm:col-span-2">
              Pronto se anunciarán los próximos partidos. ⚽
            </div>
          )}
        </div>
      </section>

      {/* Partidos de hoy */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="font-title text-xl font-bold">Partidos de hoy</h2>
          <Link href="/calendario" className="text-sm font-semibold text-primary hover:underline">
            Ver calendario →
          </Link>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {today.length > 0 ? (
            today.map((m) => <MatchCard key={m.id} match={m} />)
          ) : (
            <div className="card p-6 text-center text-sm text-muted sm:col-span-2">
              Hoy no hay partidos programados. Mira el{" "}
              <Link href="/calendario" className="font-semibold text-primary hover:underline">calendario completo</Link>.
            </div>
          )}
        </div>
      </section>

      {/* CTA Polla */}
      <section className="card overflow-hidden bg-gradient-to-br from-primary to-primary-dark p-6 text-white sm:p-8">
        <h2 className="font-title text-2xl font-extrabold">Crea tu polla con el parche 🎉</h2>
        <p className="mt-2 max-w-md text-sm text-white/85">
          Predice los marcadores, suma puntos y demuestra quién sabe más de fútbol.
          100% gratis, sin apuestas. Invita a tus amigos por WhatsApp con un código.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/polla" className="btn-accent">Crear mi polla</Link>
          <Link href="/polla" className="btn border border-white/60 text-white hover:bg-white/10">
            Tengo un código
          </Link>
        </div>
      </section>

      {/* Líderes polla global + dónde ver */}
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-title text-lg font-bold">🏆 Líderes de la polla global</h2>
            <Link href="/polla" className="text-xs font-semibold text-primary hover:underline">Jugar →</Link>
          </div>
          <ol className="mt-3 space-y-2">
            {board.map((m, i) => (
              <li key={m.id} className="flex items-center gap-3 text-sm">
                <span className="scoreboard w-5 text-center font-bold text-muted">{i + 1}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {initials(m.display_name)}
                </span>
                <span className="flex-1 truncate font-semibold">{m.display_name}</span>
                <span className="scoreboard font-bold text-primary">{m.total_points} pts</span>
              </li>
            ))}
            {board.length === 0 && <p className="text-sm text-muted">Sé el primero en predecir. ⚽</p>}
          </ol>
        </section>

        <section className="card flex flex-col justify-between p-5">
          <div>
            <h2 className="font-title text-lg font-bold">📺 ¿Dónde ver los partidos?</h2>
            <p className="mt-2 text-sm text-muted">
              Cafés, restaurantes y plazas en Bogotá que proyectan el Mundial.
              Con promos, pantallas gigantes y reserva por WhatsApp.
            </p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/donde-ver" className="btn-primary">Explorar sitios</Link>
            <Link href="/donde-ver/registrar" className="btn-outline">Registrar mi sitio</Link>
          </div>
        </section>
      </div>

      <BannerSlot placement="sidebar" />
    </div>
  );
}

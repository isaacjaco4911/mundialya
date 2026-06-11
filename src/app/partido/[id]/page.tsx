import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Flag from "@/components/Flag";
import Countdown from "@/components/Countdown";
import PollWidget from "@/components/PollWidget";
import QuickPrediction from "@/components/QuickPrediction";
import ShareButtons from "@/components/ShareButtons";
import TrackView from "@/components/TrackView";
import BannerSlot from "@/components/BannerSlot";
import { getMatch, getOrCreateMatchPoll, getVenues } from "@/lib/db";
import { fmtDate, fmtTime, fmtDateTime, SITE_URL } from "@/lib/utils";
import { STAGE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const m = await getMatch(params.id);
  if (!m) return { title: "Partido no encontrado" };
  const title = `${m.home_team?.name} vs ${m.away_team?.name} — ${fmtDate(m.kickoff)}`;
  const description = `${m.group_label ? `Grupo ${m.group_label}` : STAGE_LABELS[m.stage]} · ${m.stadium}, ${m.host_city} · ${fmtTime(m.kickoff)} hora Colombia. Vota, predice y mira dónde verlo.`;
  return {
    title,
    description,
    openGraph: { title, description, url: `${SITE_URL}/partido/${m.id}` },
  };
}

export default async function PartidoPage({ params }: { params: { id: string } }) {
  const match = await getMatch(params.id);
  if (!match) notFound();

  const [poll, venues] = await Promise.all([
    getOrCreateMatchPoll(match.id),
    getVenues({ matchId: match.id }),
  ]);

  const title = `${match.home_team?.name} vs ${match.away_team?.name}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${title} — Mundial 2026`,
    startDate: match.kickoff,
    location: { "@type": "Place", name: match.stadium, address: match.host_city },
    competitor: [
      { "@type": "SportsTeam", name: match.home_team?.name },
      { "@type": "SportsTeam", name: match.away_team?.name },
    ],
    eventStatus: match.status === "live" ? "https://schema.org/EventScheduled" : undefined,
  };

  return (
    <div className="space-y-6">
      <TrackView kind="match" id={match.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cabecera del partido */}
      <section className="card p-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {match.group_label ? `Grupo ${match.group_label}` : STAGE_LABELS[match.stage]} · {fmtDateTime(match.kickoff)}
        </p>
        <div className="mt-4 flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex w-28 flex-col items-center gap-2">
            <Flag team={match.home_team} size={64} />
            <Link href={`/equipo/${match.home_team?.id}`} className="text-sm font-bold hover:text-primary">
              {match.home_team?.name}
            </Link>
          </div>
          <div>
            {match.status === "scheduled" ? (
              <span className="scoreboard text-3xl font-bold text-muted">VS</span>
            ) : (
              <div>
                {match.status === "live" && <span className="badge-live mb-2"><span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" /> En vivo</span>}
                <p className={`scoreboard text-5xl font-bold ${match.status === "live" ? "text-live" : ""}`}>
                  {match.home_score ?? 0} - {match.away_score ?? 0}
                </p>
                {match.status === "finished" && <p className="mt-1 text-xs font-bold uppercase text-muted">Final</p>}
              </div>
            )}
          </div>
          <div className="flex w-28 flex-col items-center gap-2">
            <Flag team={match.away_team} size={64} />
            <Link href={`/equipo/${match.away_team?.id}`} className="text-sm font-bold hover:text-primary">
              {match.away_team?.name}
            </Link>
          </div>
        </div>
        <p className="mt-4 text-sm text-muted">🏟️ {match.stadium} · {match.host_city}</p>
        {match.status === "scheduled" && (
          <div className="mt-4 flex justify-center">
            <Countdown target={match.kickoff} big />
          </div>
        )}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <ShareButtons text={`⚽ ${title} — ${fmtDateTime(match.kickoff)} (hora Colombia). ¡Míralo en MundialYa!`} />
          <span className="text-xs text-muted">👀 {match.views.toLocaleString("es-CO")} visitas</span>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Votación ¿quién gana? */}
        <section className="card p-5">
          <PollWidget pollId={poll.id} question={poll.question} options={poll.options} />
        </section>

        {/* Predicción rápida */}
        <section className="card p-5">
          <h2 className="mb-3 font-title text-sm font-bold">🔮 Predicción de marcador</h2>
          <QuickPrediction
            matchId={match.id}
            kickoff={match.kickoff}
            homeName={match.home_team?.name || "Local"}
            awayName={match.away_team?.name || "Visitante"}
          />
        </section>
      </div>

      <BannerSlot placement="match" />

      {/* Dónde ver este partido */}
      <section>
        <h2 className="font-title text-xl font-bold">📺 ¿Dónde ver este partido?</h2>
        {venues.length > 0 ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {venues.map((v) => (
              <Link key={v.id} href={`/sitio/${v.id}`} className="card flex gap-3 p-3 transition hover:border-primary/40">
                {v.photo_url && <img src={v.photo_url} alt={v.name} className="h-20 w-24 rounded-xl object-cover" />}
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">
                    {v.is_featured && "⭐ "}{v.name} {v.is_verified && <span title="Verificado">✅</span>}
                  </p>
                  <p className="text-xs text-muted">{v.neighborhood} · {v.screens} pantallas</p>
                  {v.promos && <p className="mt-1 line-clamp-2 text-xs text-primary">{v.promos}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card mt-3 p-5 text-sm text-muted">
            Aún no hay sitios confirmados para este partido.{" "}
            <Link href="/donde-ver" className="font-semibold text-primary hover:underline">Explora el directorio</Link>{" "}
            o <Link href="/donde-ver/registrar" className="font-semibold text-primary hover:underline">registra tu sitio</Link>.
          </div>
        )}
      </section>
    </div>
  );
}

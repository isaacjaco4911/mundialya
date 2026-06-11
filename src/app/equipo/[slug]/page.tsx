import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Flag from "@/components/Flag";
import MatchCard from "@/components/MatchCard";
import PollWidget from "@/components/PollWidget";
import ShareButtons from "@/components/ShareButtons";
import TrackView from "@/components/TrackView";
import { getTeamBySlug, getMatches, getPolls, adminUpsert } from "@/lib/db";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const team = await getTeamBySlug(params.slug);
  if (!team) return { title: "Selección no encontrada" };
  const title = `${team.name} en el Mundial 2026 — partidos y horarios`;
  const description = `Calendario, resultados y predicciones de ${team.name} (Grupo ${team.group_label}) en el Mundial 2026, con horas de Colombia.`;
  return { title, description, openGraph: { title, description, url: `${SITE_URL}/equipo/${params.slug}` } };
}

/** Encuesta de fans "¿llega a la final?" por selección (se crea si no existe). */
async function getFanPoll(teamId: string, teamName: string) {
  const polls = await getPolls();
  const q = `¿${teamName} llega a la final?`;
  const existing = polls.find((p) => p.match_id === null && p.question === q);
  if (existing) return existing;
  return adminUpsert("polls", { match_id: null, question: q, options: ["¡Sí, de una! 🏆", "Llega lejos, pero no", "No creo"] });
}

export default async function EquipoPage({ params }: { params: { slug: string } }) {
  const team = await getTeamBySlug(params.slug);
  if (!team) notFound();

  const [matches, poll] = await Promise.all([
    getMatches({ teamId: team.id }),
    getFanPoll(team.id, team.name),
  ]);
  const next = matches.filter((m) => m.status !== "finished");
  const played = matches.filter((m) => m.status === "finished");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsTeam",
    name: `Selección de ${team.name}`,
    sport: "Fútbol",
    memberOf: { "@type": "SportsOrganization", name: "FIFA" },
  };

  return (
    <div className="space-y-6">
      <TrackView kind="team" id={team.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="card flex flex-wrap items-center gap-4 p-6">
        <Flag team={team} size={80} />
        <div className="flex-1">
          <h1 className="font-title text-2xl font-extrabold sm:text-3xl">{team.name}</h1>
          <p className="text-sm text-muted">
            {team.code} · Grupo {team.group_label}
            {team.fifa_rank ? ` · Ranking FIFA #${team.fifa_rank}` : ""}
          </p>
        </div>
        <ShareButtons text={`⚽ Sigue a ${team.name} en el Mundial 2026 con horarios de Colombia:`} />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="font-title text-lg font-bold">Próximos partidos</h2>
          <div className="mt-3 space-y-3">
            {next.length ? next.map((m) => <MatchCard key={m.id} match={m} withCountdown={m.status === "scheduled"} />) : (
              <p className="card p-5 text-sm text-muted">Sin partidos pendientes por ahora.</p>
            )}
          </div>
          {played.length > 0 && (
            <>
              <h2 className="mt-6 font-title text-lg font-bold">Resultados</h2>
              <div className="mt-3 space-y-3">
                {played.map((m) => <MatchCard key={m.id} match={m} />)}
              </div>
            </>
          )}
        </section>

        <section className="card h-fit p-5">
          <PollWidget pollId={poll.id} question={poll.question} options={poll.options} />
        </section>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import MatchCard from "@/components/MatchCard";
import { getMatches, getTeams } from "@/lib/db";
import { dayKey, fmtDate } from "@/lib/utils";
import { STAGE_LABELS, type Stage } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Calendario del Mundial 2026 — hora colombiana",
  description: "Todos los partidos del Mundial 2026 con hora de Bogotá, agrupados por fecha y fase. Filtra por selección, grupo y fecha.",
};

const GROUPS = "ABCDEFGHIJKL".split("");
const STAGES: Stage[] = ["group", "r32", "r16", "qf", "sf", "final"];

export default async function CalendarioPage({
  searchParams,
}: {
  searchParams: { equipo?: string; grupo?: string; fecha?: string };
}) {
  const teams = await getTeams();
  const matches = await getMatches({
    group: searchParams.grupo || undefined,
    teamId: searchParams.equipo || undefined,
  });
  const filtered = searchParams.fecha
    ? matches.filter((m) => dayKey(m.kickoff) === searchParams.fecha)
    : matches;

  const dates = Array.from(new Set(matches.map((m) => dayKey(m.kickoff)))).sort();

  // Agrupar por fase y luego por día
  const byStage = new Map<Stage, Map<string, typeof filtered>>();
  for (const m of filtered) {
    const stage = byStage.get(m.stage) || new Map();
    const day = dayKey(m.kickoff);
    stage.set(day, [...(stage.get(day) || []), m]);
    byStage.set(m.stage, stage);
  }

  return (
    <div>
      <h1 className="font-title text-2xl font-extrabold sm:text-3xl">Calendario</h1>
      <p className="mt-1 text-sm text-muted">
        Del 11 de junio al 19 de julio de 2026 · Horas en Bogotá (COT).
      </p>

      {/* Filtros */}
      <form className="card mt-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-4" method="get">
        <div>
          <label className="label" htmlFor="equipo">Selección</label>
          <select id="equipo" name="equipo" defaultValue={searchParams.equipo || ""} className="input">
            <option value="">Todas</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="grupo">Grupo</label>
          <select id="grupo" name="grupo" defaultValue={searchParams.grupo || ""} className="input">
            <option value="">Todos</option>
            {GROUPS.map((gl) => <option key={gl} value={gl}>Grupo {gl}</option>)}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="fecha">Fecha</label>
          <select id="fecha" name="fecha" defaultValue={searchParams.fecha || ""} className="input">
            <option value="">Todas</option>
            {dates.map((d) => (
              <option key={d} value={d}>{fmtDate(`${d}T12:00:00-05:00`)}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button className="btn-primary w-full">Filtrar</button>
        </div>
      </form>

      {filtered.length === 0 && (
        <div className="card mt-6 p-8 text-center text-sm text-muted">
          No hay partidos con esos filtros. Prueba con otros. ⚽
        </div>
      )}

      {STAGES.map((stage) => {
        const days = byStage.get(stage);
        if (!days) return null;
        return (
          <section key={stage} className="mt-8">
            <h2 className="font-title text-xl font-bold text-primary">{STAGE_LABELS[stage]}</h2>
            {Array.from(days.entries()).map(([day, ms]) => (
              <div key={day} className="mt-4">
                <h3 className="text-xs font-bold uppercase tracking-wide text-muted">
                  {fmtDate(ms[0].kickoff)}
                </h3>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {ms.map((m) => <MatchCard key={m.id} match={m} withCountdown={m.status === "scheduled"} />)}
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}

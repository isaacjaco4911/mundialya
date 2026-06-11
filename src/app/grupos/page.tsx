import type { Metadata } from "next";
import Link from "next/link";
import Flag from "@/components/Flag";
import { groupStandings, getMatches } from "@/lib/db";
import { STAGE_LABELS, type Stage } from "@/lib/types";
import MatchCard from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grupos y eliminatorias del Mundial 2026",
  description: "Tablas de los 12 grupos (A–L) del Mundial 2026 actualizadas con cada resultado, y el bracket de eliminatorias desde 32avos hasta la final.",
};

const KO_STAGES: Stage[] = ["r32", "r16", "qf", "sf", "final"];

export default async function GruposPage() {
  const [groups, all] = await Promise.all([groupStandings(), getMatches()]);
  const koMatches = all.filter((m) => m.stage !== "group");

  return (
    <div>
      <h1 className="font-title text-2xl font-extrabold sm:text-3xl">Grupos y eliminatorias</h1>
      <p className="mt-1 text-sm text-muted">
        12 grupos de 4 · Avanzan los 2 primeros de cada grupo y los 8 mejores terceros a 32avos.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)).map(([label, rows]) => (
          <section key={label} className="card overflow-hidden">
            <h2 className="bg-primary px-4 py-2 font-title text-sm font-bold text-white">Grupo {label}</h2>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10 text-muted">
                  <th className="py-2 pl-3 text-left font-semibold">Selección</th>
                  <th className="px-1 font-semibold" title="Partidos jugados">PJ</th>
                  <th className="px-1 font-semibold" title="Ganados">G</th>
                  <th className="px-1 font-semibold" title="Empatados">E</th>
                  <th className="px-1 font-semibold" title="Perdidos">P</th>
                  <th className="px-1 font-semibold" title="Diferencia de gol">DIF</th>
                  <th className="px-2 font-semibold" title="Puntos">Pts</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.team.id} className={`border-b border-black/5 dark:border-white/10 last:border-0 ${i < 2 ? "bg-primary/5" : ""}`}>
                    <td className="py-2 pl-3">
                      <Link href={`/equipo/${r.team.id}`} className="flex items-center gap-2 font-semibold hover:text-primary">
                        <Flag team={r.team} size={20} />
                        <span className="truncate">{r.team.name}</span>
                      </Link>
                    </td>
                    <td className="scoreboard text-center">{r.pj}</td>
                    <td className="scoreboard text-center">{r.g}</td>
                    <td className="scoreboard text-center">{r.e}</td>
                    <td className="scoreboard text-center">{r.p}</td>
                    <td className="scoreboard text-center">{r.dif > 0 ? `+${r.dif}` : r.dif}</td>
                    <td className="scoreboard px-2 text-center font-bold text-primary">{r.pts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>

      {/* Bracket de eliminatorias */}
      <section className="mt-10">
        <h2 className="font-title text-xl font-bold">🏆 Eliminatorias</h2>
        {koMatches.length === 0 ? (
          <div className="card mt-3 p-6 text-center text-sm text-muted">
            El bracket se llenará cuando termine la fase de grupos (los cruces de
            32avos se definen con los clasificados). ¡Atento del 28 de junio en adelante!
          </div>
        ) : (
          <div className="mt-3 flex gap-4 overflow-x-auto pb-3">
            {KO_STAGES.map((stage) => {
              const ms = koMatches.filter((m) => m.stage === stage);
              if (!ms.length) return null;
              return (
                <div key={stage} className="min-w-[280px] flex-1 space-y-3">
                  <h3 className="text-center text-xs font-bold uppercase tracking-wide text-muted">{STAGE_LABELS[stage]}</h3>
                  {ms.map((m) => <MatchCard key={m.id} match={m} />)}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

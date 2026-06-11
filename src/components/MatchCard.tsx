import Link from "next/link";
import Flag from "./Flag";
import Countdown from "./Countdown";
import { fmtDate, fmtTime } from "@/lib/utils";
import { STAGE_LABELS } from "@/lib/types";
import type { Match } from "@/lib/types";

/** Tarjeta de partido: banderas, marcador/hora, estado y cuenta regresiva. */
export default function MatchCard({ match, withCountdown = false, big = false }: { match: Match; withCountdown?: boolean; big?: boolean }) {
  const label = match.group_label ? `Grupo ${match.group_label}` : STAGE_LABELS[match.stage];

  return (
    <Link href={`/partido/${match.id}`} className="card block p-4 transition hover:border-primary/40 hover:shadow-md">
      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-muted">
        <span>{label} · {match.host_city}</span>
        {match.status === "live" && (
          <span className="badge-live">
            <span className="h-1.5 w-1.5 animate-pulse-live rounded-full bg-white" /> En vivo
          </span>
        )}
        {match.status === "finished" && <span className="rounded-full bg-black/10 dark:bg-white/10 px-2 py-0.5">Final</span>}
        {match.status === "scheduled" && <span>{fmtDate(match.kickoff)}</span>}
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Flag team={match.home_team} size={big ? 44 : 32} />
          <span className={`truncate font-semibold ${big ? "text-lg" : "text-sm"}`}>
            {match.home_team?.name || "Por definir"}
          </span>
        </div>

        <div className="shrink-0 px-2 text-center">
          {match.status === "scheduled" ? (
            <span className={`scoreboard font-bold text-primary ${big ? "text-xl" : "text-base"}`}>
              {fmtTime(match.kickoff)}
            </span>
          ) : (
            <span className={`scoreboard font-bold ${big ? "text-3xl" : "text-xl"} ${match.status === "live" ? "text-live" : ""}`}>
              {match.home_score ?? 0} - {match.away_score ?? 0}
            </span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <span className={`truncate text-right font-semibold ${big ? "text-lg" : "text-sm"}`}>
            {match.away_team?.name || "Por definir"}
          </span>
          <Flag team={match.away_team} size={big ? 44 : 32} />
        </div>
      </div>

      {withCountdown && match.status === "scheduled" && (
        <div className="mt-3 flex justify-center border-t border-black/5 dark:border-white/10 pt-3">
          <Countdown target={match.kickoff} big={big} />
        </div>
      )}
    </Link>
  );
}

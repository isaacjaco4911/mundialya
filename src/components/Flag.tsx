import type { Team } from "@/lib/types";

/** Bandera de selección con fallback (repechajes sin bandera → código). */
export default function Flag({ team, size = 32 }: { team?: Team; size?: number }) {
  if (!team) return <span style={{ width: size, height: size * 0.75 }} className="inline-block rounded bg-black/10" />;
  if (!team.flag_url) {
    return (
      <span
        style={{ width: size, height: size * 0.75, fontSize: size * 0.28 }}
        className="inline-flex items-center justify-center rounded bg-primary/15 font-bold text-primary"
        title={team.name}
      >
        {team.code}
      </span>
    );
  }
  return (
    <img
      src={team.flag_url}
      alt={`Bandera de ${team.name}`}
      width={size}
      height={Math.round(size * 0.75)}
      loading="lazy"
      className="rounded object-cover shadow-sm"
      style={{ width: size, height: size * 0.75 }}
    />
  );
}

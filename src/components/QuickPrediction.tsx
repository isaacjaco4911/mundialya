"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLocked } from "@/lib/scoring";

/**
 * Predicción rápida del marcador desde el detalle del partido.
 * Usa la identidad ligera y la liga activa guardadas por /polla.
 */
export default function QuickPrediction({ matchId, kickoff, homeName, awayName }: { matchId: string; kickoff: string; homeName: string; awayName: string }) {
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [leagueId, setLeagueId] = useState<string | null>(null);
  const [home, setHome] = useState(0);
  const [away, setAway] = useState(0);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const locked = isLocked(kickoff);

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("my_user") || "null");
      setUser(u);
      setLeagueId(localStorage.getItem("my_league"));
    } catch {}
  }, []);

  if (!user || !leagueId) {
    return (
      <div className="rounded-xl bg-primary/10 p-4 text-sm">
        <p className="font-semibold">¿Te atreves a predecir el marcador? 🔮</p>
        <p className="mt-1 text-muted">Únete a la polla (gratis) y suma puntos con cada acierto.</p>
        <Link href="/polla" className="btn-primary mt-3">Ir a la polla</Link>
      </div>
    );
  }

  if (locked) {
    return <p className="rounded-xl bg-black/5 dark:bg-white/10 p-4 text-sm text-muted">🔒 Las predicciones se bloquearon al pitazo inicial.</p>;
  }

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId, userId: user!.id, displayName: user!.name, matchId, predHome: home, predAway: away }),
      });
      const data = await r.json();
      setMsg(r.ok ? "✅ ¡Predicción guardada!" : `⚠️ ${data.error || "Error"}`);
    } catch {
      setMsg("⚠️ Error de conexión");
    } finally {
      setBusy(false);
    }
  }

  const ScoreInput = ({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) => (
    <div className="flex flex-col items-center gap-1">
      <span className="max-w-[90px] truncate text-xs font-semibold text-muted">{label}</span>
      <input
        type="number" min={0} max={20} value={value}
        onChange={(e) => onChange(Math.max(0, Math.min(20, Number(e.target.value))))}
        className="input scoreboard w-16 text-center text-xl font-bold"
        aria-label={`Goles de ${label}`}
      />
    </div>
  );

  return (
    <div className="rounded-xl bg-primary/10 p-4">
      <p className="text-sm font-bold">Tu predicción ({user.name})</p>
      <div className="mt-3 flex items-center justify-center gap-4">
        <ScoreInput value={home} onChange={setHome} label={homeName} />
        <span className="scoreboard text-xl font-bold text-muted">-</span>
        <ScoreInput value={away} onChange={setAway} label={awayName} />
      </div>
      <button onClick={save} disabled={busy} className="btn-primary mt-3 w-full">
        {busy ? "Guardando…" : "Guardar predicción"}
      </button>
      {msg && <p className="mt-2 text-center text-xs font-semibold">{msg}</p>}
    </div>
  );
}

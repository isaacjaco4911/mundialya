"use client";

import { useCallback, useEffect, useState } from "react";

interface Results { counts: Record<number, number>; total: number; myVote: number | null }

/**
 * Votación con porcentajes en vivo. Un voto por persona (hash de IP en el
 * servidor), modificable. `hp` es un honeypot anti-bots.
 */
export default function PollWidget({ pollId, question, options }: { pollId: string; question: string; options: string[] }) {
  const [res, setRes] = useState<Results | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/votes?poll=${pollId}`, { cache: "no-store" });
      if (r.ok) setRes(await r.json());
    } catch {}
  }, [pollId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // refresco "en vivo"
    return () => clearInterval(id);
  }, [load]);

  async function vote(i: number) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, optionIndex: i, hp: "" }),
      });
      if (r.ok) await load();
    } finally {
      setBusy(false);
    }
  }

  if (!res) {
    return (
      <div className="space-y-2">
        <div className="skeleton h-5 w-40" />
        {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 w-full" />)}
      </div>
    );
  }

  return (
    <div>
      <p className="font-title text-sm font-bold">{question}</p>
      <p className="mb-3 text-xs text-muted">
        {res.total.toLocaleString("es-CO")} votos · {res.myVote != null ? "Ya votaste (puedes cambiarlo)" : "Toca para votar"}
      </p>
      <div className="space-y-2">
        {options.map((opt, i) => {
          const count = res.counts[i] || 0;
          const pct = res.total ? Math.round((count / res.total) * 100) : 0;
          const mine = res.myVote === i;
          return (
            <button
              key={i}
              onClick={() => vote(i)}
              disabled={busy}
              className={`relative block w-full overflow-hidden rounded-xl border p-0 text-left transition ${
                mine ? "border-primary ring-1 ring-primary" : "border-black/10 dark:border-white/15 hover:border-primary/50"
              }`}
            >
              <span className="absolute inset-y-0 left-0 bg-primary/15 transition-all duration-500" style={{ width: `${pct}%` }} />
              <span className="relative flex items-center justify-between px-3.5 py-2.5 text-sm">
                <span className="font-semibold">{mine && "✓ "}{opt}</span>
                <span className="scoreboard font-bold text-primary">{pct}%</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

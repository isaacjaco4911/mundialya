"use client";

import { useEffect, useState } from "react";

function parts(target: string) {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  return {
    d: Math.floor(diff / 86400_000),
    h: Math.floor((diff % 86400_000) / 3600_000),
    m: Math.floor((diff % 3600_000) / 60_000),
    s: Math.floor((diff % 60_000) / 1000),
  };
}

/** Cuenta regresiva en vivo (días/horas/min/seg) hasta el kickoff. */
export default function Countdown({ target, big = false }: { target: string; big?: boolean }) {
  const [t, setT] = useState<ReturnType<typeof parts>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setT(parts(target));
    const id = setInterval(() => setT(parts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (!mounted) return <span className="skeleton inline-block h-6 w-32" />;
  if (!t) return <span className="text-sm font-semibold text-live">¡Ya comenzó!</span>;

  const cell = big
    ? "flex flex-col items-center rounded-xl bg-primary/10 px-2.5 py-1.5 min-w-[58px]"
    : "flex flex-col items-center min-w-[40px]";
  const num = big ? "scoreboard text-2xl font-bold text-primary" : "scoreboard text-base font-bold";

  return (
    <span className="inline-flex items-end gap-1.5" suppressHydrationWarning>
      {[
        [t.d, "días"], [t.h, "hrs"], [t.m, "min"], [t.s, "seg"],
      ].map(([v, label]) => (
        <span key={label as string} className={cell}>
          <span className={num}>{String(v).padStart(2, "0")}</span>
          <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
        </span>
      ))}
    </span>
  );
}

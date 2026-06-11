"use client";

import { useState } from "react";

/** Formulario de reseña con honeypot anti-spam. Queda pendiente de moderación. */
export default function ReviewForm({ venueId }: { venueId: string }) {
  const [rating, setRating] = useState(5);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId,
          name: fd.get("name"),
          comment: fd.get("comment"),
          rating,
          hp: fd.get("website") || "",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error");
      setMsg("✅ ¡Gracias! Tu reseña será publicada tras moderación.");
      (e.target as HTMLFormElement).reset();
    } catch (err: any) {
      setMsg(`⚠️ ${err.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} estrellas`} className={`text-2xl transition ${n <= rating ? "text-accent" : "text-black/20 dark:text-white/20"}`}>
            ★
          </button>
        ))}
      </div>
      <input name="name" required maxLength={50} className="input" placeholder="Tu nombre" />
      <textarea name="comment" required maxLength={300} rows={3} className="input" placeholder="¿Cómo estuvo el ambiente?" />
      {msg && <p className="text-xs font-semibold">{msg}</p>}
      <button disabled={busy} className="btn-primary">{busy ? "Enviando…" : "Enviar reseña"}</button>
    </form>
  );
}

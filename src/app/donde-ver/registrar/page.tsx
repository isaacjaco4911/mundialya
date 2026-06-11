"use client";

import { useState } from "react";
import Link from "next/link";

export default function RegistrarSitioPage() {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const r = await fetch("/api/venues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error al registrar");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card mx-auto max-w-md p-8 text-center">
        <p className="text-4xl">🎉</p>
        <h1 className="mt-3 font-title text-xl font-bold">¡Sitio registrado!</h1>
        <p className="mt-2 text-sm text-muted">
          Tu sitio quedó en el directorio. Nuestro equipo lo verificará pronto
          para darle el distintivo ✅. ¿Quieres salir DESTACADO arriba de todos?
          Escríbenos.
        </p>
        <Link href="/donde-ver" className="btn-primary mt-4">Ver directorio</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-title text-2xl font-extrabold">Registra tu sitio 📍</h1>
      <p className="mt-1 text-sm text-muted">
        ¿Tu café, restaurante o plaza proyecta los partidos? Sal gratis en el
        directorio y recibe reservas por WhatsApp.
      </p>

      <form onSubmit={submit} className="card mt-4 space-y-4 p-5">
        {/* Honeypot anti-spam: oculto para humanos */}
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <div>
          <label className="label" htmlFor="name">Nombre del sitio *</label>
          <input id="name" name="name" required maxLength={80} className="input" placeholder="Café La Tribuna" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="neighborhood">Barrio *</label>
            <input id="neighborhood" name="neighborhood" required maxLength={50} className="input" placeholder="Chapinero" />
          </div>
          <div>
            <label className="label" htmlFor="city">Ciudad *</label>
            <input id="city" name="city" required maxLength={50} defaultValue="Bogotá" className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="address">Dirección *</label>
          <input id="address" name="address" required maxLength={120} className="input" placeholder="Cra 7 # 53-40" />
        </div>
        <div>
          <label className="label" htmlFor="phone">WhatsApp (con indicativo) *</label>
          <input id="phone" name="phone" required maxLength={20} className="input" placeholder="+57 300 123 4567" />
        </div>
        <div>
          <label className="label" htmlFor="photo_url">Foto (URL, opcional)</label>
          <input id="photo_url" name="photo_url" type="url" className="input" placeholder="https://…" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="screens"># de pantallas</label>
            <input id="screens" name="screens" type="number" min={1} max={50} defaultValue={1} className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="description">Descripción *</label>
          <textarea id="description" name="description" required maxLength={400} rows={3} className="input" placeholder="Ambiente futbolero, pantalla gigante, menú mundialista…" />
        </div>
        {error && <p className="text-sm font-semibold text-live">⚠️ {error}</p>}
        <button disabled={busy} className="btn-primary w-full">
          {busy ? "Registrando…" : "Registrar gratis"}
        </button>
      </form>
    </div>
  );
}

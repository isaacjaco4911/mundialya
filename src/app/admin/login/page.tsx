"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (r.ok) router.push("/admin");
    else setError("Contraseña incorrecta");
  }

  return (
    <div className="mx-auto max-w-sm py-12">
      <form onSubmit={submit} className="card space-y-4 p-6">
        <h1 className="font-title text-xl font-bold">Panel de administración 🔐</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
          placeholder="Contraseña"
          autoFocus
        />
        {error && <p className="text-sm font-semibold text-live">{error}</p>}
        <button disabled={busy || !password} className="btn-primary w-full">
          {busy ? "Verificando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}

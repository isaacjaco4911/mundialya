"use client";

// Panel de administración de MundialYa.
// Editor genérico por recurso: cada pestaña define sus campos y el CRUD
// va contra /api/admin/<recurso> (protegido por middleware + cookie).

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Field = {
  key: string;
  label: string;
  type?: "text" | "number" | "datetime" | "checkbox" | "select" | "textarea" | "json";
  options?: string[];
  width?: string;
};

const RESOURCES: Record<string, { title: string; fields: Field[]; hint?: string }> = {
  matches: {
    title: "⚽ Partidos",
    hint: "Al marcar un partido como 'finished' con marcador, se recalculan los puntos de la polla y las tablas de grupo automáticamente.",
    fields: [
      { key: "stage", label: "Fase", type: "select", options: ["group", "r32", "r16", "qf", "sf", "final"] },
      { key: "group_label", label: "Grupo (A–L)" },
      { key: "home_team_id", label: "ID local" },
      { key: "away_team_id", label: "ID visitante" },
      { key: "kickoff", label: "Kickoff (ISO UTC)", type: "datetime" },
      { key: "stadium", label: "Estadio" },
      { key: "host_city", label: "Ciudad" },
      { key: "status", label: "Estado", type: "select", options: ["scheduled", "live", "finished"] },
      { key: "home_score", label: "Goles local", type: "number" },
      { key: "away_score", label: "Goles visitante", type: "number" },
    ],
  },
  teams: {
    title: "🏳️ Selecciones",
    fields: [
      { key: "name", label: "Nombre" },
      { key: "code", label: "Código FIFA" },
      { key: "flag_url", label: "URL bandera" },
      { key: "group_label", label: "Grupo (A–L)" },
      { key: "fifa_rank", label: "Ranking FIFA", type: "number" },
    ],
  },
  venues: {
    title: "📺 Sitios",
    hint: "Verifica sitios legítimos y destácalos (pago) con fecha de vencimiento para que salgan de primeros.",
    fields: [
      { key: "name", label: "Nombre" },
      { key: "neighborhood", label: "Barrio" },
      { key: "city", label: "Ciudad" },
      { key: "phone", label: "WhatsApp" },
      { key: "screens", label: "Pantallas", type: "number" },
      { key: "promos", label: "Promo del día", type: "textarea" },
      { key: "showing_match_id", label: "ID partido que proyecta" },
      { key: "is_verified", label: "Verificado ✅", type: "checkbox" },
      { key: "is_featured", label: "Destacado ⭐", type: "checkbox" },
      { key: "featured_until", label: "Destacado hasta (ISO)", type: "datetime" },
    ],
  },
  venue_reviews: {
    title: "💬 Reseñas",
    hint: "Modera: solo las reseñas 'approved' se publican y cuentan para el rating.",
    fields: [
      { key: "venue_id", label: "ID sitio" },
      { key: "reviewer_name", label: "Autor" },
      { key: "rating", label: "Estrellas", type: "number" },
      { key: "comment", label: "Comentario", type: "textarea" },
      { key: "status", label: "Estado", type: "select", options: ["pending", "approved", "rejected"] },
    ],
  },
  banners: {
    title: "📣 Banners",
    fields: [
      { key: "title", label: "Título" },
      { key: "image_url", label: "URL imagen" },
      { key: "link", label: "Enlace" },
      { key: "placement", label: "Ubicación", type: "select", options: ["home_top", "sidebar", "match"] },
      { key: "priority", label: "Prioridad", type: "number" },
      { key: "active", label: "Activo", type: "checkbox" },
      { key: "starts_at", label: "Desde (ISO)", type: "datetime" },
      { key: "ends_at", label: "Hasta (ISO)", type: "datetime" },
    ],
  },
  popups: {
    title: "🪟 Popups",
    fields: [
      { key: "title", label: "Título" },
      { key: "body", label: "Texto", type: "textarea" },
      { key: "image_url", label: "URL imagen" },
      { key: "link", label: "Enlace" },
      { key: "frequency_hours", label: "Frecuencia (horas)", type: "number" },
      { key: "active", label: "Activo", type: "checkbox" },
      { key: "starts_at", label: "Desde (ISO)", type: "datetime" },
      { key: "ends_at", label: "Hasta (ISO)", type: "datetime" },
    ],
  },
  polls: {
    title: "🗳️ Encuestas",
    hint: "match_id vacío = encuesta global. Opciones como lista JSON.",
    fields: [
      { key: "match_id", label: "ID partido (vacío = global)" },
      { key: "question", label: "Pregunta" },
      { key: "options", label: 'Opciones (ej: ["Sí","No"])', type: "json" },
    ],
  },
  leagues: {
    title: "🏆 Ligas",
    hint: "Modera las pollas: puedes renombrar o eliminar ligas problemáticas.",
    fields: [
      { key: "name", label: "Nombre" },
      { key: "code", label: "Código" },
      { key: "is_public", label: "Pública", type: "checkbox" },
    ],
  },
};

const TABS = ["stats", ...Object.keys(RESOURCES)];

export default function AdminPage() {
  const [tab, setTab] = useState("stats");
  const [rows, setRows] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [msg, setMsg] = useState("");
  const router = useRouter();

  const load = useCallback(async () => {
    setMsg("");
    const r = await fetch(`/api/admin/${tab}`, { cache: "no-store" });
    if (r.status === 401) { router.push("/admin/login"); return; }
    const data = await r.json();
    if (tab === "stats") setStats(data);
    else setRows(data.rows || []);
  }, [tab, router]);

  useEffect(() => { setEditing(null); load(); }, [load]);

  async function save() {
    const cfg = RESOURCES[tab];
    const row = { ...editing };
    for (const f of cfg.fields) {
      if (f.type === "number" && row[f.key] !== null && row[f.key] !== "") row[f.key] = Number(row[f.key]);
      if (f.type === "json" && typeof row[f.key] === "string") {
        try { row[f.key] = JSON.parse(row[f.key]); } catch { setMsg("⚠️ JSON inválido"); return; }
      }
      if (row[f.key] === "") row[f.key] = null;
    }
    const r = await fetch(`/api/admin/${tab}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    const data = await r.json();
    if (!r.ok) { setMsg(`⚠️ ${data.error}`); return; }
    setMsg("✅ Guardado");
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;
    await fetch(`/api/admin/${tab}?id=${id}`, { method: "DELETE" });
    load();
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/");
  }

  const cfg = RESOURCES[tab];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-title text-2xl font-extrabold">Admin MundialYa</h1>
        <button onClick={logout} className="btn-outline">Salir</button>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${tab === t ? "bg-primary text-white" : "bg-black/5 dark:bg-white/10 hover:bg-primary/20"}`}
          >
            {t === "stats" ? "📊 Estadísticas" : RESOURCES[t].title}
          </button>
        ))}
      </div>

      {msg && <p className="mt-3 text-sm font-semibold">{msg}</p>}

      {/* Estadísticas */}
      {tab === "stats" && stats && (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Visitas del sitio", stats.siteVisits], ["Vistas de partidos", stats.matchViews],
            ["Vistas de sitios", stats.venueViews], ["Votos", stats.votes],
            ["Predicciones", stats.predictions], ["Ligas", stats.leagues],
            ["Usuarios polla", stats.users], ["Sitios", stats.venues],
          ].map(([label, value]) => (
            <div key={label as string} className="card p-4 text-center">
              <p className="scoreboard text-3xl font-bold text-primary">{Number(value).toLocaleString("es-CO")}</p>
              <p className="mt-1 text-xs font-semibold text-muted">{label}</p>
            </div>
          ))}
          <p className="col-span-2 text-xs text-muted sm:col-span-4">
            💡 Usa estas métricas para vender publicidad: banners, popups, sitios destacados y ligas patrocinadas.
          </p>
        </div>
      )}

      {/* Editor de recurso */}
      {cfg && (
        <div className="mt-5">
          {cfg.hint && <p className="mb-3 rounded-xl bg-accent/15 p-3 text-xs">{cfg.hint}</p>}
          <button onClick={() => setEditing({})} className="btn-primary mb-3">+ Nuevo</button>

          {editing && (
            <div className="card mb-4 grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
              {cfg.fields.map((f) => (
                <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                  <label className="label">{f.label}</label>
                  {f.type === "checkbox" ? (
                    <input type="checkbox" checked={!!editing[f.key]} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} className="h-5 w-5 accent-[#11A14A]" />
                  ) : f.type === "select" ? (
                    <select value={editing[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} className="input">
                      <option value="">—</option>
                      {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea value={editing[f.key] ?? ""} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })} rows={2} className="input" />
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : "text"}
                      value={f.type === "json" && typeof editing[f.key] === "object" ? JSON.stringify(editing[f.key]) : editing[f.key] ?? ""}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      placeholder={f.type === "datetime" ? "2026-06-14T18:00:00Z" : ""}
                      className="input"
                    />
                  )}
                </div>
              ))}
              <div className="flex gap-2 sm:col-span-2">
                <button onClick={save} className="btn-primary">Guardar</button>
                <button onClick={() => setEditing(null)} className="btn-outline">Cancelar</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="card flex flex-wrap items-center gap-2 p-3 text-xs">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {row.name || row.title || row.question || row.reviewer_name ||
                      (row.home_team?.name ? `${row.home_team.name} vs ${row.away_team?.name}` : row.id)}
                  </p>
                  <p className="truncate text-muted">
                    {cfg.fields.slice(0, 5).map((f) => `${f.key}: ${typeof row[f.key] === "object" ? JSON.stringify(row[f.key]) : row[f.key] ?? "—"}`).join(" · ")}
                  </p>
                </div>
                <span className="text-muted">id: {row.id}</span>
                <button onClick={() => setEditing(row)} className="btn-outline !px-3 !py-1.5">Editar</button>
                <button onClick={() => remove(row.id)} className="btn !px-3 !py-1.5 bg-live/10 text-live hover:bg-live hover:text-white">Eliminar</button>
              </div>
            ))}
            {rows.length === 0 && <p className="card p-5 text-center text-sm text-muted">Sin registros.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

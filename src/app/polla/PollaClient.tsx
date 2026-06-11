"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Flag from "@/components/Flag";
import { isLocked } from "@/lib/scoring";
import { initials, fmtDateTime } from "@/lib/utils";
import type { Match, League, LeagueMember, Prediction } from "@/lib/types";

interface User { id: string; name: string }
interface SavedLeague { id: string; name: string; code: string }

const uid = () => "u-" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export default function PollaClient({ matches, globalLeague, initialCode }: { matches: Match[]; globalLeague: League | null; initialCode?: string }) {
  const [user, setUser] = useState<User | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [leagues, setLeagues] = useState<SavedLeague[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [board, setBoard] = useState<LeagueMember[]>([]);
  const [preds, setPreds] = useState<Record<string, { h: number; a: number; saved?: boolean; points?: number | null }>>({});
  const [joinCode, setJoinCode] = useState(initialCode || "");
  const [newName, setNewName] = useState("");
  const [msg, setMsg] = useState("");
  const [tab, setTab] = useState<"predecir" | "tabla">("predecir");

  // --- cargar identidad y ligas de localStorage ---
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("my_user") || "null");
      if (u) setUser(u);
      let saved: SavedLeague[] = JSON.parse(localStorage.getItem("my_leagues") || "[]");
      if (globalLeague && !saved.find((l) => l.id === globalLeague.id)) {
        saved = [{ id: globalLeague.id, name: globalLeague.name, code: globalLeague.code }, ...saved];
      }
      setLeagues(saved);
      const act = localStorage.getItem("my_league") || saved[0]?.id || null;
      setActiveId(act);
    } catch {}
  }, [globalLeague]);

  const active = leagues.find((l) => l.id === activeId) || leagues[0];

  const loadBoard = useCallback(async () => {
    if (!active) return;
    try {
      const r = await fetch(`/api/leagues?board=${active.id}`, { cache: "no-store" });
      if (r.ok) setBoard((await r.json()).board);
    } catch {}
  }, [active?.id]);

  const loadPreds = useCallback(async () => {
    if (!active || !user) return;
    try {
      const r = await fetch(`/api/predictions?league=${active.id}&user=${user.id}`, { cache: "no-store" });
      if (r.ok) {
        const data: Prediction[] = (await r.json()).predictions;
        const map: typeof preds = {};
        for (const p of data) map[p.match_id] = { h: p.pred_home, a: p.pred_away, saved: true, points: p.points };
        setPreds((prev) => ({ ...map, ...Object.fromEntries(Object.entries(prev).filter(([k, v]) => !v.saved && !map[k])) }));
      }
    } catch {}
  }, [active?.id, user?.id]);

  useEffect(() => { loadBoard(); loadPreds(); }, [loadBoard, loadPreds]);

  function saveLeagues(list: SavedLeague[], activate?: string) {
    setLeagues(list);
    localStorage.setItem("my_leagues", JSON.stringify(list.filter((l) => l.code !== "GLOBAL")));
    if (activate) {
      setActiveId(activate);
      localStorage.setItem("my_league", activate);
    }
  }

  function createUser() {
    const name = nameInput.trim();
    if (name.length < 2) return;
    const u = { id: uid(), name };
    localStorage.setItem("my_user", JSON.stringify(u));
    if (globalLeague) localStorage.setItem("my_league", globalLeague.id);
    setUser(u);
  }

  async function leagueAction(action: "create" | "join", payload: Record<string, string>) {
    if (!user) return;
    setMsg("");
    try {
      const r = await fetch("/api/leagues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, userId: user.id, displayName: user.name, ...payload }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error");
      const l: League = data.league;
      const entry = { id: l.id, name: l.name, code: l.code };
      saveLeagues([...leagues.filter((x) => x.id !== l.id), entry], l.id);
      setMsg(action === "create" ? `✅ Liga creada. Código: ${l.code}` : `✅ Te uniste a "${l.name}"`);
      setNewName(""); setJoinCode("");
    } catch (err: any) {
      setMsg(`⚠️ ${err.message}`);
    }
  }

  async function savePred(matchId: string) {
    if (!user || !active) return;
    const p = preds[matchId] || { h: 0, a: 0 };
    try {
      const r = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leagueId: active.id, userId: user.id, displayName: user.name, matchId, predHome: p.h, predAway: p.a }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Error");
      setPreds({ ...preds, [matchId]: { ...p, saved: true } });
      loadBoard();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function shareLeague() {
    if (!active) return;
    const url = `${window.location.origin}/polla?codigo=${active.code}`;
    const text = `⚽ ¡Únete a mi polla "${active.name}" en MundialYa! Es gratis. Código: ${active.code} → ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function challenge(m: Match) {
    const url = `${window.location.origin}/partido/${m.id}`;
    const text = `🔥 ¡Te reto! ¿Cuánto queda ${m.home_team?.name} vs ${m.away_team?.name}? Deja tu predicción en MundialYa y vemos quién sabe más: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  function shareBoard() {
    if (!active) return;
    const top = board.slice(0, 5).map((m, i) => `${i + 1}. ${m.display_name} — ${m.total_points} pts`).join("\n");
    const text = `🏆 Así va la polla "${active.name}" en MundialYa:\n${top}\n¿Me la vas a ganar? ${window.location.origin}/polla?codigo=${active.code}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }

  // ----- Paso 1: identidad ligera -----
  if (!user) {
    return (
      <div className="card mx-auto max-w-md p-6">
        <h2 className="font-title text-lg font-bold">¿Cómo te llamamos? 👋</h2>
        <p className="mt-1 text-sm text-muted">
          Solo necesitas un nombre visible para jugar. Sin registro, sin correo, sin pago.
        </p>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createUser()}
          maxLength={25}
          className="input mt-4"
          placeholder="Ej: Juancho10"
        />
        <button onClick={createUser} disabled={nameInput.trim().length < 2} className="btn-primary mt-3 w-full">
          ¡A jugar! ⚽
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Selector de liga + acciones */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user.name}</p>
            <p className="text-xs text-muted">Liga activa:</p>
          </div>
          <select
            value={active?.id || ""}
            onChange={(e) => { setActiveId(e.target.value); localStorage.setItem("my_league", e.target.value); }}
            className="input w-auto"
          >
            {leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        </div>
        {active && active.code !== "GLOBAL" && (
          <button onClick={shareLeague} className="btn mt-3 w-full bg-[#25D366] text-white hover:brightness-95">
            💬 Invitar al parche por WhatsApp (código {active.code})
          </button>
        )}
      </div>

      {/* Crear / unirse */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card p-4">
          <p className="text-sm font-bold">Crear liga privada</p>
          <div className="mt-2 flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} maxLength={40} className="input" placeholder="Polla de la oficina" />
            <button onClick={() => newName.trim() && leagueAction("create", { name: newName.trim() })} className="btn-primary shrink-0">Crear</button>
          </div>
        </div>
        <div className="card p-4">
          <p className="text-sm font-bold">Unirme con código</p>
          <div className="mt-2 flex gap-2">
            <input value={joinCode} onChange={(e) => setJoinCode(e.target.value.toUpperCase())} maxLength={8} className="input uppercase" placeholder="ABC123" />
            <button onClick={() => joinCode.trim() && leagueAction("join", { code: joinCode.trim() })} className="btn-primary shrink-0">Unirme</button>
          </div>
        </div>
      </div>
      {msg && <p className="text-center text-sm font-semibold">{msg}</p>}

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab("predecir")} className={tab === "predecir" ? "btn-primary flex-1" : "btn-outline flex-1"}>🔮 Predecir</button>
        <button onClick={() => setTab("tabla")} className={tab === "tabla" ? "btn-primary flex-1" : "btn-outline flex-1"}>🏆 Tabla</button>
      </div>

      {tab === "predecir" && (
        <div className="space-y-3">
          {matches.map((m) => {
            const locked = isLocked(m.kickoff);
            const p = preds[m.id] || { h: 0, a: 0 };
            return (
              <div key={m.id} className="card p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  {m.group_label ? `Grupo ${m.group_label}` : "Eliminatoria"} · {fmtDateTime(m.kickoff)}
                </p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <Flag team={m.home_team} size={28} />
                    <span className="truncate text-sm font-semibold">{m.home_team?.name}</span>
                  </div>
                  {locked ? (
                    <span className="text-xs font-bold text-muted">
                      {p.saved ? `Tu predicción: ${p.h}-${p.a}${p.points != null ? ` (+${p.points} pts)` : " 🔒"}` : "🔒 Cerrado"}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <input type="number" min={0} max={20} value={p.h}
                        onChange={(e) => setPreds({ ...preds, [m.id]: { ...p, h: Math.max(0, Math.min(20, +e.target.value)), saved: false } })}
                        className="input scoreboard w-14 text-center font-bold" aria-label="Goles local" />
                      <span className="font-bold text-muted">-</span>
                      <input type="number" min={0} max={20} value={p.a}
                        onChange={(e) => setPreds({ ...preds, [m.id]: { ...p, a: Math.max(0, Math.min(20, +e.target.value)), saved: false } })}
                        className="input scoreboard w-14 text-center font-bold" aria-label="Goles visitante" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
                    <span className="truncate text-right text-sm font-semibold">{m.away_team?.name}</span>
                    <Flag team={m.away_team} size={28} />
                  </div>
                </div>
                {!locked && (
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => savePred(m.id)} className={`flex-1 ${p.saved ? "btn-outline" : "btn-primary"}`}>
                      {p.saved ? "✅ Guardada" : "Guardar"}
                    </button>
                    <button onClick={() => challenge(m)} className="btn bg-[#25D366] text-white hover:brightness-95" title="Reta a tu parche">
                      🔥 Retar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {matches.length === 0 && <p className="card p-6 text-center text-sm text-muted">No hay partidos abiertos para predecir.</p>}
        </div>
      )}

      {tab === "tabla" && (
        <div className="card p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-title text-base font-bold">Tabla — {active?.name}</h3>
            <button onClick={shareBoard} className="text-xs font-bold text-[#25D366] hover:underline">Compartir 💬</button>
          </div>
          <ol className="mt-3 space-y-2">
            {board.map((m, i) => (
              <li key={m.id} className={`flex items-center gap-3 rounded-xl p-2 text-sm ${m.user_id === user.id ? "bg-primary/10" : ""}`}>
                <span className="scoreboard w-6 text-center font-bold text-muted">
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                </span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                  {initials(m.display_name)}
                </span>
                <span className="flex-1 truncate font-semibold">{m.display_name}{m.user_id === user.id && " (tú)"}</span>
                <span className="scoreboard font-bold text-primary">{m.total_points} pts</span>
              </li>
            ))}
            {board.length === 0 && <p className="text-sm text-muted">Aún no hay participantes. ¡Invita a tu parche! 🎉</p>}
          </ol>
        </div>
      )}

      <p className="text-center text-[11px] text-muted">
        La polla es 100% gratis y sin apuestas de dinero. Reglas: marcador exacto = 5 pts ·
        resultado correcto = 2 pts. Las predicciones se cierran al pitazo inicial.
        {" "}<Link href="/calendario" className="text-primary hover:underline">Ver calendario</Link>
      </p>
    </div>
  );
}

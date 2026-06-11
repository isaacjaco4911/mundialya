// =====================================================================
// Capa de datos de MundialYa.
// - Con Supabase configurado: consulta/escribe en la base real.
// - Sin Supabase (MODO DEMO): opera sobre un store en memoria con los
//   datos de demo-data.ts (no persiste entre reinicios del servidor).
// Todas las escrituras pasan por API routes con el service role.
// =====================================================================

import { hasSupabase, sbAdmin, sbPublic } from "./supabase";
import { calcPoints, isLocked } from "./scoring";
import { randomCode, slugify } from "./utils";
import {
  DEMO_TEAMS, DEMO_MATCHES, DEMO_VENUES, DEMO_REVIEWS, DEMO_POLLS,
  DEMO_VOTES, DEMO_BANNERS, DEMO_POPUPS, DEMO_LEAGUES, DEMO_MEMBERS,
  DEMO_PREDICTIONS,
} from "./demo-data";
import type {
  Team, Match, Venue, VenueReview, Poll, Vote, Banner, Popup,
  League, LeagueMember, Prediction, GroupRow, Stage,
} from "./types";

export const isDemo = !hasSupabase;

// ---------------------------------------------------------------------
// Store en memoria para modo demo (sobrevive HMR vía globalThis).
// ---------------------------------------------------------------------
interface DemoStore {
  teams: Team[]; matches: Match[]; venues: Venue[]; reviews: VenueReview[];
  polls: Poll[]; votes: Vote[]; banners: Banner[]; popups: Popup[];
  leagues: League[]; members: LeagueMember[]; predictions: Prediction[];
  stats: Record<string, number>;
}

function newStore(): DemoStore {
  return {
    teams: structuredClone(DEMO_TEAMS),
    matches: structuredClone(DEMO_MATCHES),
    venues: structuredClone(DEMO_VENUES),
    reviews: structuredClone(DEMO_REVIEWS),
    polls: structuredClone(DEMO_POLLS),
    votes: structuredClone(DEMO_VOTES),
    banners: structuredClone(DEMO_BANNERS),
    popups: structuredClone(DEMO_POPUPS),
    leagues: structuredClone(DEMO_LEAGUES),
    members: structuredClone(DEMO_MEMBERS),
    predictions: structuredClone(DEMO_PREDICTIONS),
    stats: { site_visits: 1287 },
  };
}

const g = globalThis as unknown as { __mundialya?: DemoStore };
function store(): DemoStore {
  if (!g.__mundialya) g.__mundialya = newStore();
  return g.__mundialya;
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const now = () => new Date().toISOString();

// ---------------------------------------------------------------------
// Equipos
// ---------------------------------------------------------------------
export async function getTeams(): Promise<Team[]> {
  if (isDemo) return [...store().teams].sort((a, b) => (a.group_label || "").localeCompare(b.group_label || "") || a.name.localeCompare(b.name));
  const { data } = await sbPublic().from("teams").select("*").order("group_label").order("name");
  return data || [];
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const teams = await getTeams();
  return teams.find((t) => slugify(t.name) === slug || t.id === slug || t.code.toLowerCase() === slug.toLowerCase()) || null;
}

// ---------------------------------------------------------------------
// Partidos
// ---------------------------------------------------------------------
async function attachTeams(matches: Match[]): Promise<Match[]> {
  const teams = await getTeams();
  const map = new Map(teams.map((t) => [t.id, t]));
  return matches.map((m) => ({ ...m, home_team: map.get(m.home_team_id), away_team: map.get(m.away_team_id) }));
}

export async function getMatches(filter?: { stage?: Stage; group?: string; teamId?: string }): Promise<Match[]> {
  let rows: Match[];
  if (isDemo) {
    rows = [...store().matches];
  } else {
    const { data } = await sbPublic().from("matches").select("*").order("kickoff");
    rows = data || [];
  }
  if (filter?.stage) rows = rows.filter((m) => m.stage === filter.stage);
  if (filter?.group) rows = rows.filter((m) => m.group_label === filter.group);
  if (filter?.teamId) rows = rows.filter((m) => m.home_team_id === filter.teamId || m.away_team_id === filter.teamId);
  rows.sort((a, b) => a.kickoff.localeCompare(b.kickoff));
  return attachTeams(rows);
}

export async function getMatch(id: string): Promise<Match | null> {
  const all = await getMatches();
  return all.find((m) => m.id === id) || null;
}

/** Próximos partidos (en vivo primero, luego los más cercanos). */
export async function upcomingMatches(limit = 3): Promise<Match[]> {
  const all = await getMatches();
  const live = all.filter((m) => m.status === "live");
  const next = all.filter((m) => m.status === "scheduled" && new Date(m.kickoff).getTime() > Date.now() - 3 * 3600_000);
  return [...live, ...next].slice(0, limit);
}

export async function saveMatch(input: Partial<Match> & { id?: string }): Promise<Match> {
  if (isDemo) {
    const s = store();
    let m = input.id ? s.matches.find((x) => x.id === input.id) : undefined;
    if (m) {
      Object.assign(m, input);
    } else {
      m = { id: uid(), stage: "group", group_label: null, home_team_id: "", away_team_id: "", kickoff: now(), stadium: "", host_city: "", status: "scheduled", home_score: null, away_score: null, views: 0, ...input } as Match;
      s.matches.push(m);
    }
    if (m.status === "finished" && m.home_score != null && m.away_score != null) rescoreMatchDemo(m);
    return m;
  }
  const db = sbAdmin();
  const { home_team, away_team, ...row } = input as Match;
  if (input.id) {
    const { data, error } = await db.from("matches").update(row).eq("id", input.id).select().single();
    if (error) throw error;
    return data; // el trigger SQL recalcula puntos al pasar a 'finished'
  }
  const { data, error } = await db.from("matches").insert(row).select().single();
  if (error) throw error;
  return data;
}

/** Recalcula puntos de todas las predicciones de un partido (modo demo). */
function rescoreMatchDemo(m: Match) {
  const s = store();
  for (const p of s.predictions.filter((p) => p.match_id === m.id)) {
    p.points = calcPoints(p.pred_home, p.pred_away, m.home_score!, m.away_score!);
  }
  for (const mem of s.members) {
    mem.total_points = s.predictions
      .filter((p) => p.league_id === mem.league_id && p.user_id === mem.user_id)
      .reduce((sum, p) => sum + (p.points || 0), 0);
  }
}

// ---------------------------------------------------------------------
// Tablas de grupo (calculadas de los partidos finalizados)
// ---------------------------------------------------------------------
export async function groupStandings(): Promise<Record<string, GroupRow[]>> {
  const teams = await getTeams();
  const matches = await getMatches({ stage: "group" });
  const rows = new Map<string, GroupRow>();
  for (const t of teams) {
    if (t.group_label) rows.set(t.id, { team: t, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dif: 0, pts: 0 });
  }
  for (const m of matches) {
    if (m.status !== "finished" || m.home_score == null || m.away_score == null) continue;
    const h = rows.get(m.home_team_id), a = rows.get(m.away_team_id);
    if (!h || !a) continue;
    h.pj++; a.pj++;
    h.gf += m.home_score; h.gc += m.away_score;
    a.gf += m.away_score; a.gc += m.home_score;
    if (m.home_score > m.away_score) { h.g++; a.p++; h.pts += 3; }
    else if (m.home_score < m.away_score) { a.g++; h.p++; a.pts += 3; }
    else { h.e++; a.e++; h.pts++; a.pts++; }
  }
  const groups: Record<string, GroupRow[]> = {};
  for (const r of Array.from(rows.values())) {
    r.dif = r.gf - r.gc;
    const gl = r.team.group_label!;
    (groups[gl] ||= []).push(r);
  }
  for (const gl of Object.keys(groups)) {
    groups[gl].sort((x, y) => y.pts - x.pts || y.dif - x.dif || y.gf - x.gf || x.team.name.localeCompare(y.team.name));
  }
  return groups;
}

// ---------------------------------------------------------------------
// Encuestas y votos (1 voto por hash de IP, modificable)
// ---------------------------------------------------------------------
export async function getOrCreateMatchPoll(matchId: string): Promise<Poll | null> {
  const match = await getMatch(matchId);
  const question = "¿Quién gana?";
  const options = [match?.home_team?.name || "Local", "Empate", match?.away_team?.name || "Visitante"];
  if (isDemo) {
    const s = store();
    let poll = s.polls.find((p) => p.match_id === matchId);
    if (!poll) { poll = { id: uid(), match_id: matchId, question, options }; s.polls.push(poll); }
    return poll;
  }
  // Lectura con el cliente público (anon) — siempre disponible.
  const { data: existing } = await sbPublic().from("polls").select("*").eq("match_id", matchId).limit(1);
  if (existing?.length) return existing[0];
  // Crear requiere service role; si falta o falla, NO tumbamos la página:
  // devolvemos null y el detalle del partido se muestra sin la encuesta.
  try {
    const { data, error } = await sbAdmin().from("polls").insert({ match_id: matchId, question, options }).select().single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("No se pudo crear la encuesta del partido (¿falta SUPABASE_SERVICE_ROLE_KEY?):", e);
    return null;
  }
}

export async function getPolls(): Promise<Poll[]> {
  if (isDemo) return store().polls;
  const { data } = await sbPublic().from("polls").select("*");
  return data || [];
}

export async function pollResults(pollId: string, ipHash?: string) {
  let votes: Vote[];
  if (isDemo) votes = store().votes.filter((v) => v.poll_id === pollId);
  else {
    const { data } = await sbPublic().from("votes").select("*").eq("poll_id", pollId);
    votes = data || [];
  }
  const counts: Record<number, number> = {};
  for (const v of votes) counts[v.option_index] = (counts[v.option_index] || 0) + 1;
  const total = votes.length;
  const myVote = ipHash ? votes.find((v) => v.ip_hash === ipHash)?.option_index ?? null : null;
  return { counts, total, myVote };
}

export async function castVote(pollId: string, optionIndex: number, ipHash: string) {
  if (isDemo) {
    const s = store();
    const existing = s.votes.find((v) => v.poll_id === pollId && v.ip_hash === ipHash);
    if (existing) existing.option_index = optionIndex;
    else s.votes.push({ id: uid(), poll_id: pollId, option_index: optionIndex, ip_hash: ipHash });
    return;
  }
  await sbAdmin().from("votes").upsert(
    { poll_id: pollId, option_index: optionIndex, ip_hash: ipHash },
    { onConflict: "poll_id,ip_hash" }
  );
}

// ---------------------------------------------------------------------
// Polla: ligas, miembros, predicciones
// ---------------------------------------------------------------------
export async function createLeague(name: string, ownerId: string, displayName: string): Promise<League> {
  const code = randomCode();
  if (isDemo) {
    const s = store();
    const league: League = { id: uid(), name, code, owner_id: ownerId, is_public: false };
    s.leagues.push(league);
    s.members.push({ id: uid(), league_id: league.id, user_id: ownerId, display_name: displayName, total_points: 0 });
    return league;
  }
  const db = sbAdmin();
  const { data, error } = await db.from("leagues").insert({ name, code, owner_id: ownerId, is_public: false }).select().single();
  if (error) throw error;
  await db.from("league_members").insert({ league_id: data.id, user_id: ownerId, display_name: displayName });
  return data;
}

export async function joinLeague(code: string, userId: string, displayName: string): Promise<League> {
  const league = await getLeagueByCode(code);
  if (!league) throw new Error("Código de liga no válido");
  if (isDemo) {
    const s = store();
    if (!s.members.find((m) => m.league_id === league.id && m.user_id === userId)) {
      s.members.push({ id: uid(), league_id: league.id, user_id: userId, display_name: displayName, total_points: 0 });
    }
    return league;
  }
  await sbAdmin().from("league_members").upsert(
    { league_id: league.id, user_id: userId, display_name: displayName },
    { onConflict: "league_id,user_id", ignoreDuplicates: true }
  );
  return league;
}

/** Garantiza que el usuario sea miembro de la liga (para puntuar en la tabla). */
export async function ensureMember(leagueId: string, userId: string, displayName: string) {
  if (isDemo) {
    const s = store();
    if (!s.members.find((m) => m.league_id === leagueId && m.user_id === userId)) {
      s.members.push({ id: uid(), league_id: leagueId, user_id: userId, display_name: displayName, total_points: 0 });
    }
    return;
  }
  await sbAdmin().from("league_members").upsert(
    { league_id: leagueId, user_id: userId, display_name: displayName },
    { onConflict: "league_id,user_id", ignoreDuplicates: true }
  );
}

export async function getLeagueByCode(code: string): Promise<League | null> {
  if (isDemo) return store().leagues.find((l) => l.code.toUpperCase() === code.toUpperCase()) || null;
  const { data } = await sbPublic().from("leagues").select("*").ilike("code", code).limit(1);
  return data?.[0] || null;
}

export async function getUserLeagues(userId: string): Promise<League[]> {
  if (isDemo) {
    const s = store();
    const ids = s.members.filter((m) => m.user_id === userId).map((m) => m.league_id);
    return s.leagues.filter((l) => ids.includes(l.id) || l.is_public);
  }
  const db = sbPublic();
  const { data: mem } = await db.from("league_members").select("league_id").eq("user_id", userId);
  const ids = (mem || []).map((m) => m.league_id);
  const { data } = await db.from("leagues").select("*").or(`is_public.eq.true${ids.length ? `,id.in.(${ids.join(",")})` : ""}`);
  return data || [];
}

export async function leagueBoard(leagueId: string): Promise<LeagueMember[]> {
  if (isDemo) {
    return store().members
      .filter((m) => m.league_id === leagueId)
      .sort((a, b) => b.total_points - a.total_points);
  }
  const { data } = await sbPublic().from("league_members").select("*").eq("league_id", leagueId).order("total_points", { ascending: false }).limit(100);
  return data || [];
}

export async function globalBoard(limit = 5): Promise<LeagueMember[]> {
  const league = await getLeagueByCode("GLOBAL");
  if (!league) return [];
  return (await leagueBoard(league.id)).slice(0, limit);
}

export async function upsertPrediction(input: { leagueId: string; userId: string; matchId: string; predHome: number; predAway: number }) {
  const match = await getMatch(input.matchId);
  if (!match) throw new Error("Partido no encontrado");
  if (isLocked(match.kickoff) || match.status !== "scheduled") {
    throw new Error("Las predicciones se bloquean al pitazo inicial");
  }
  if (isDemo) {
    const s = store();
    const existing = s.predictions.find((p) => p.league_id === input.leagueId && p.user_id === input.userId && p.match_id === input.matchId);
    if (existing) { existing.pred_home = input.predHome; existing.pred_away = input.predAway; }
    else s.predictions.push({ id: uid(), league_id: input.leagueId, user_id: input.userId, match_id: input.matchId, pred_home: input.predHome, pred_away: input.predAway, points: null });
    return;
  }
  await sbAdmin().from("predictions").upsert(
    { league_id: input.leagueId, user_id: input.userId, match_id: input.matchId, pred_home: input.predHome, pred_away: input.predAway },
    { onConflict: "league_id,user_id,match_id" }
  );
}

export async function userPredictions(leagueId: string, userId: string): Promise<Prediction[]> {
  if (isDemo) return store().predictions.filter((p) => p.league_id === leagueId && p.user_id === userId);
  const { data } = await sbPublic().from("predictions").select("*").eq("league_id", leagueId).eq("user_id", userId);
  return data || [];
}

// ---------------------------------------------------------------------
// Sitios "dónde ver"
// ---------------------------------------------------------------------
function venueOrder(a: Venue, b: Venue): number {
  const feat = (v: Venue) => (v.is_featured && (!v.featured_until || new Date(v.featured_until) > new Date()) ? 1 : 0);
  return feat(b) - feat(a) || Number(b.is_verified) - Number(a.is_verified) || b.avg_rating - a.avg_rating;
}

export async function getVenues(filter?: { neighborhood?: string; matchId?: string }): Promise<Venue[]> {
  let rows: Venue[];
  if (isDemo) rows = [...store().venues];
  else {
    const { data } = await sbPublic().from("venues").select("*");
    rows = data || [];
  }
  if (filter?.neighborhood) rows = rows.filter((v) => v.neighborhood === filter.neighborhood);
  if (filter?.matchId) rows = rows.filter((v) => v.showing_match_id === filter.matchId);
  return rows.sort(venueOrder);
}

export async function getVenue(id: string): Promise<Venue | null> {
  if (isDemo) return store().venues.find((v) => v.id === id) || null;
  const { data } = await sbPublic().from("venues").select("*").eq("id", id).single();
  return data;
}

export async function registerVenue(input: Pick<Venue, "name" | "address" | "neighborhood" | "city" | "phone" | "description"> & { photo_url?: string | null; screens?: number }): Promise<Venue> {
  const row = {
    ...input,
    photo_url: input.photo_url || null,
    screens: input.screens || 1,
    promos: "", showing_match_id: null,
    is_verified: false, is_featured: false, featured_until: null,
    avg_rating: 0, review_count: 0, views: 0,
  };
  if (isDemo) {
    const v: Venue = { id: uid(), ...row };
    store().venues.push(v);
    return v;
  }
  const { data, error } = await sbAdmin().from("venues").insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function addReview(input: { venueId: string; name: string; rating: number; comment: string; ipHash: string }) {
  if (isDemo) {
    const s = store();
    if (s.reviews.some((r) => r.venue_id === input.venueId && r.ip_hash === input.ipHash)) {
      throw new Error("Ya enviaste una reseña para este sitio");
    }
    s.reviews.push({ id: uid(), venue_id: input.venueId, reviewer_name: input.name, rating: input.rating, comment: input.comment, status: "pending", ip_hash: input.ipHash });
    return;
  }
  const { error } = await sbAdmin().from("venue_reviews").insert({ venue_id: input.venueId, reviewer_name: input.name, rating: input.rating, comment: input.comment, ip_hash: input.ipHash });
  if (error) throw new Error("Ya enviaste una reseña para este sitio");
}

export async function venueReviews(venueId: string, status: VenueReview["status"] = "approved"): Promise<VenueReview[]> {
  if (isDemo) return store().reviews.filter((r) => r.venue_id === venueId && r.status === status);
  const { data } = await sbPublic().from("venue_reviews").select("*").eq("venue_id", venueId).eq("status", status).order("created_at", { ascending: false });
  return data || [];
}

// ---------------------------------------------------------------------
// Banners y popups activos
// ---------------------------------------------------------------------
function isActiveWindow(x: { active: boolean; starts_at: string | null; ends_at: string | null }) {
  const n = Date.now();
  return x.active &&
    (!x.starts_at || new Date(x.starts_at).getTime() <= n) &&
    (!x.ends_at || new Date(x.ends_at).getTime() >= n);
}

export async function activeBanners(placement: Banner["placement"]): Promise<Banner[]> {
  let rows: Banner[];
  if (isDemo) rows = store().banners;
  else {
    const { data } = await sbPublic().from("banners").select("*").eq("placement", placement);
    rows = data || [];
  }
  return rows.filter((b) => b.placement === placement && isActiveWindow(b)).sort((a, b) => a.priority - b.priority);
}

export async function activePopup(): Promise<Popup | null> {
  let rows: Popup[];
  if (isDemo) rows = store().popups;
  else {
    const { data } = await sbPublic().from("popups").select("*");
    rows = data || [];
  }
  return rows.find(isActiveWindow) || null;
}

// ---------------------------------------------------------------------
// Contadores de visitas
// ---------------------------------------------------------------------
export async function trackView(kind: "site" | "match" | "venue" | "team", id?: string) {
  if (isDemo) {
    const s = store();
    s.stats.site_visits = (s.stats.site_visits || 0) + (kind === "site" ? 1 : 0);
    if (kind === "match" && id) { const m = s.matches.find((x) => x.id === id); if (m) m.views++; }
    if (kind === "venue" && id) { const v = s.venues.find((x) => x.id === id); if (v) v.views++; }
    if (kind === "team" && id) s.stats[`team_${id}`] = (s.stats[`team_${id}`] || 0) + 1;
    if (kind !== "site") s.stats.site_visits = (s.stats.site_visits || 0) + 1;
    return;
  }
  const db = sbAdmin();
  await db.rpc("increment_stat", { stat_key: "site_visits" });
  if (kind === "match" && id) await db.rpc("increment_views", { table_name: "matches", row_id: id });
  if (kind === "venue" && id) await db.rpc("increment_views", { table_name: "venues", row_id: id });
  if (kind === "team" && id) await db.rpc("increment_stat", { stat_key: `team_${id}` });
}

export async function siteVisits(): Promise<number> {
  if (isDemo) return store().stats.site_visits || 0;
  const { data } = await sbPublic().from("site_stats").select("value").eq("key", "site_visits").single();
  return data?.value || 0;
}

// ---------------------------------------------------------------------
// Admin: CRUD genérico + estadísticas
// ---------------------------------------------------------------------
const ADMIN_TABLES = ["teams", "matches", "venues", "venue_reviews", "banners", "popups", "polls", "leagues"] as const;
export type AdminTable = (typeof ADMIN_TABLES)[number];

const DEMO_KEYS: Record<AdminTable, keyof DemoStore> = {
  teams: "teams", matches: "matches", venues: "venues", venue_reviews: "reviews",
  banners: "banners", popups: "popups", polls: "polls", leagues: "leagues",
};

export function isAdminTable(t: string): t is AdminTable {
  return (ADMIN_TABLES as readonly string[]).includes(t);
}

export async function adminList(table: AdminTable): Promise<any[]> {
  if (table === "matches") return getMatches();
  if (isDemo) return store()[DEMO_KEYS[table]] as any[];
  const { data } = await sbAdmin().from(table).select("*").order("created_at", { ascending: false }).limit(500);
  return data || [];
}

export async function adminUpsert(table: AdminTable, row: any): Promise<any> {
  if (table === "matches") return saveMatch(row);
  if (isDemo) {
    const list = store()[DEMO_KEYS[table]] as any[];
    if (row.id) {
      const existing = list.find((x) => x.id === row.id);
      if (existing) { Object.assign(existing, row); recomputeVenueRatings(); return existing; }
    }
    const created = { id: uid(), ...row };
    list.push(created);
    recomputeVenueRatings();
    return created;
  }
  const db = sbAdmin();
  if (row.id) {
    const { data, error } = await db.from(table).update(row).eq("id", row.id).select().single();
    if (error) throw error;
    return data;
  }
  const { id, ...rest } = row;
  const { data, error } = await db.from(table).insert(rest).select().single();
  if (error) throw error;
  return data;
}

export async function adminDelete(table: AdminTable, id: string) {
  if (isDemo) {
    const list = store()[DEMO_KEYS[table]] as any[];
    const i = list.findIndex((x) => x.id === id);
    if (i >= 0) list.splice(i, 1);
    return;
  }
  await sbAdmin().from(table).delete().eq("id", id);
}

/** Modo demo: recalcular rating promedio al aprobar reseñas. */
function recomputeVenueRatings() {
  const s = store();
  for (const v of s.venues) {
    const approved = s.reviews.filter((r) => r.venue_id === v.id && r.status === "approved");
    if (approved.length) {
      v.review_count = approved.length;
      v.avg_rating = Math.round((approved.reduce((sum, r) => sum + r.rating, 0) / approved.length) * 10) / 10;
    }
  }
}

export async function adminStats() {
  const [matches, venues, teams] = await Promise.all([getMatches(), getVenues(), getTeams()]);
  let votes = 0, predictions = 0, leagues = 0, users = 0;
  if (isDemo) {
    const s = store();
    votes = s.votes.length; predictions = s.predictions.length;
    leagues = s.leagues.length; users = new Set(s.members.map((m) => m.user_id)).size;
  } else {
    const db = sbAdmin();
    const count = async (t: string) => (await db.from(t).select("*", { count: "exact", head: true })).count || 0;
    [votes, predictions, leagues, users] = await Promise.all([count("votes"), count("predictions"), count("leagues"), count("league_members")]);
  }
  return {
    siteVisits: await siteVisits(),
    matchViews: matches.reduce((s, m) => s + (m.views || 0), 0),
    venueViews: venues.reduce((s, v) => s + (v.views || 0), 0),
    teams: teams.length, matches: matches.length, venues: venues.length,
    votes, predictions, leagues, users,
  };
}

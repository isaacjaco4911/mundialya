import { NextResponse } from "next/server";
import { upsertPrediction, userPredictions, ensureMember } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const league = url.searchParams.get("league");
  const user = url.searchParams.get("user");
  if (!league || !user) return NextResponse.json({ error: "league y user requeridos" }, { status: 400 });
  return NextResponse.json({ predictions: await userPredictions(league, user) });
}

/** Guardar/actualizar predicción. Se bloquea al pitazo inicial. */
export async function POST(req: Request) {
  try {
    const { leagueId, userId, displayName, matchId, predHome, predAway } = await req.json();
    if (!leagueId || !userId || !matchId) {
      return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
    }
    const h = Number(predHome), a = Number(predAway);
    if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0 || h > 20 || a > 20) {
      return NextResponse.json({ error: "Marcador inválido" }, { status: 400 });
    }
    await ensureMember(leagueId, userId, String(displayName || "Jugador").slice(0, 25));
    await upsertPrediction({ leagueId, userId, matchId, predHome: h, predAway: a });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error" }, { status: 400 });
  }
}

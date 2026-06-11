import { NextResponse } from "next/server";
import { createLeague, joinLeague, leagueBoard } from "@/lib/db";

export const dynamic = "force-dynamic";

/** GET ?board=<leagueId> → tabla de posiciones. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const boardId = url.searchParams.get("board");
  if (boardId) return NextResponse.json({ board: await leagueBoard(boardId) });
  return NextResponse.json({ error: "parámetro requerido" }, { status: 400 });
}

/** POST {action: 'create'|'join'} — crear liga privada o unirse con código. */
export async function POST(req: Request) {
  try {
    const { action, userId, displayName, name, code } = await req.json();
    if (!userId || !displayName) return NextResponse.json({ error: "Identifícate primero" }, { status: 400 });
    const dn = String(displayName).slice(0, 25);

    if (action === "create") {
      const cleanName = String(name || "").trim().slice(0, 40);
      if (cleanName.length < 3) return NextResponse.json({ error: "Nombre muy corto" }, { status: 400 });
      const league = await createLeague(cleanName, userId, dn);
      return NextResponse.json({ league });
    }
    if (action === "join") {
      const league = await joinLeague(String(code || "").trim(), userId, dn);
      return NextResponse.json({ league });
    }
    return NextResponse.json({ error: "Acción inválida" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error" }, { status: 400 });
  }
}

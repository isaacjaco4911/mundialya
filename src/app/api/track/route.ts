import { NextResponse } from "next/server";
import { trackView } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Contador de visitas (recibe beacons de TrackView). */
export async function POST(req: Request) {
  try {
    const { kind, id } = await req.json();
    if (!["site", "match", "venue", "team"].includes(kind)) {
      return NextResponse.json({ error: "kind inválido" }, { status: 400 });
    }
    await trackView(kind, typeof id === "string" ? id.slice(0, 60) : undefined);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

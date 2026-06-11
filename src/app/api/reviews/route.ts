import { NextResponse } from "next/server";
import { addReview } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

/** Reseñas de sitios: 1 por IP por sitio, quedan pendientes de moderación. */
export async function POST(req: Request) {
  try {
    const { venueId, name, rating, comment, hp } = await req.json();
    if (hp) return NextResponse.json({ ok: true }); // honeypot anti-spam
    const r = Number(rating);
    if (!venueId || !name || !comment || !Number.isInteger(r) || r < 1 || r > 5) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }
    await addReview({
      venueId,
      name: String(name).slice(0, 50),
      rating: r,
      comment: String(comment).slice(0, 300),
      ipHash: hashIp(getClientIp(req)),
    });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error" }, { status: 400 });
  }
}

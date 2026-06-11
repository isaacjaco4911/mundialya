import { NextResponse } from "next/server";
import { registerVenue } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Registro público de sitios "dónde ver" (quedan sin verificar). */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body.website) return NextResponse.json({ ok: true }); // honeypot
    const required = ["name", "address", "neighborhood", "city", "phone", "description"];
    for (const f of required) {
      if (!String(body[f] || "").trim()) {
        return NextResponse.json({ error: `Falta el campo ${f}` }, { status: 400 });
      }
    }
    const venue = await registerVenue({
      name: String(body.name).slice(0, 80),
      address: String(body.address).slice(0, 120),
      neighborhood: String(body.neighborhood).slice(0, 50),
      city: String(body.city).slice(0, 50),
      phone: String(body.phone).slice(0, 20),
      description: String(body.description).slice(0, 400),
      photo_url: body.photo_url ? String(body.photo_url).slice(0, 300) : null,
      screens: Math.max(1, Math.min(50, Number(body.screens) || 1)),
    });
    return NextResponse.json({ venue });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error" }, { status: 400 });
  }
}

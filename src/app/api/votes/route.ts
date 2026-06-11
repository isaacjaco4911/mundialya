import { NextResponse } from "next/server";
import { castVote, pollResults, getPolls } from "@/lib/db";
import { getClientIp, hashIp } from "@/lib/server-utils";

export const dynamic = "force-dynamic";

/** Resultados en vivo de una encuesta (incluye mi voto, por hash de IP). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const pollId = url.searchParams.get("poll");
  if (!pollId) return NextResponse.json({ error: "poll requerido" }, { status: 400 });
  const ipHash = hashIp(getClientIp(req));
  const results = await pollResults(pollId, ipHash);
  return NextResponse.json(results);
}

/** Votar (1 voto por IP, modificable). Honeypot `hp` anti-bots. */
export async function POST(req: Request) {
  try {
    const { pollId, optionIndex, hp } = await req.json();
    if (hp) return NextResponse.json({ ok: true }); // bot atrapado: fingir éxito
    const polls = await getPolls();
    const poll = polls.find((p) => p.id === pollId);
    if (!poll) return NextResponse.json({ error: "Encuesta no encontrada" }, { status: 404 });
    const i = Number(optionIndex);
    if (!Number.isInteger(i) || i < 0 || i >= poll.options.length) {
      return NextResponse.json({ error: "Opción inválida" }, { status: 400 });
    }
    await castVote(pollId, i, hashIp(getClientIp(req)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}

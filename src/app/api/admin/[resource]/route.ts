import { NextResponse } from "next/server";
import { adminList, adminUpsert, adminDelete, adminStats, isAdminTable } from "@/lib/db";

export const dynamic = "force-dynamic";

// CRUD genérico del panel admin (protegido por middleware).
// Recursos: teams, matches, venues, venue_reviews, banners, popups, polls, leagues
// + "stats" (solo lectura).

export async function GET(_req: Request, { params }: { params: { resource: string } }) {
  if (params.resource === "stats") return NextResponse.json(await adminStats());
  if (!isAdminTable(params.resource)) return NextResponse.json({ error: "Recurso inválido" }, { status: 404 });
  return NextResponse.json({ rows: await adminList(params.resource) });
}

export async function POST(req: Request, { params }: { params: { resource: string } }) {
  if (!isAdminTable(params.resource)) return NextResponse.json({ error: "Recurso inválido" }, { status: 404 });
  try {
    const row = await req.json();
    const saved = await adminUpsert(params.resource, row);
    return NextResponse.json({ row: saved });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Error" }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { resource: string } }) {
  if (!isAdminTable(params.resource)) return NextResponse.json({ error: "Recurso inválido" }, { status: 404 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id requerido" }, { status: 400 });
  await adminDelete(params.resource, id);
  return NextResponse.json({ ok: true });
}

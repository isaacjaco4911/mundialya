import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnóstico de despliegue. NO expone secretos: solo informa qué
 * variables están presentes y QUÉ TIPO de llave es cada una (el claim
 * "role" del JWT de Supabase, que no es secreto). Útil para detectar el
 * error común de pegar la llave anon donde va la service_role.
 * Visita: /api/health
 */
function jwtRole(key?: string): string {
  if (!key) return "AUSENTE";
  try {
    const part = key.split(".")[1];
    const json = Buffer.from(part, "base64").toString("utf8");
    return JSON.parse(json).role || "sin-claim-role";
  } catch {
    return "no-es-un-JWT-valido";
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const anonRole = jwtRole(anon);
  const serviceRole = jwtRole(service);
  const serviceOk = serviceRole === "service_role";

  return NextResponse.json({
    ok: Boolean(url && anon) && serviceOk,
    modo: url && anon ? "supabase" : "demo",
    url_host: url ? new URL(url).host : null,
    llaves: {
      anon_es: anonRole, // debe decir "anon"
      service_role_es: serviceRole, // DEBE decir "service_role"
    },
    diagnostico: !serviceOk
      ? serviceRole === "anon"
        ? "⚠️ ¡AQUÍ ESTÁ EL ERROR! En SUPABASE_SERVICE_ROLE_KEY pegaste la llave ANON. Reemplázala por la llave service_role (Supabase → Settings → API → service_role) y redespliega."
        : `⚠️ SUPABASE_SERVICE_ROLE_KEY no es una llave service_role válida (detectado: ${serviceRole}). Corrígela y redespliega.`
      : "✅ Llaves correctas. Las escrituras deberían funcionar.",
  });
}

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Diagnóstico de despliegue. NO expone secretos: solo informa qué
 * variables de entorno están presentes (true/false). Útil para verificar
 * la configuración en Vercel. Visita: /api/health
 */
export async function GET() {
  const hasUrl = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const hasAnon = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  return NextResponse.json({
    ok: hasUrl && hasAnon && hasServiceRole,
    NEXT_PUBLIC_SUPABASE_URL: hasUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon,
    SUPABASE_SERVICE_ROLE_KEY: hasServiceRole,
    modo: hasUrl && hasAnon ? "supabase" : "demo",
    ADMIN_PASSWORD: Boolean(process.env.ADMIN_PASSWORD),
    IP_HASH_SALT: Boolean(process.env.IP_HASH_SALT),
    // Pistas de errores comunes de configuración:
    pista:
      hasUrl && hasAnon && !hasServiceRole
        ? "Falta SUPABASE_SERVICE_ROLE_KEY → las escrituras (votos, polla, predicciones, admin) fallan. Agrégala en Vercel y redespliega."
        : !hasUrl || !hasAnon
        ? "Faltan las llaves públicas de Supabase → la app corre en modo demo (no persiste)."
        : "Configuración completa.",
  });
}

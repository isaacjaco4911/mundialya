import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** true cuando hay Supabase configurado; false → la app corre en MODO DEMO. */
export const hasSupabase = Boolean(url && anonKey);

let _public: SupabaseClient | null = null;
let _admin: SupabaseClient | null = null;

/** Cliente de solo lectura (clave anónima, respeta RLS). */
export function sbPublic(): SupabaseClient {
  if (!_public) _public = createClient(url!, anonKey!);
  return _public;
}

/** Cliente con service role — SOLO en el servidor (API routes). */
export function sbAdmin(): SupabaseClient {
  if (!_admin) _admin = createClient(url!, serviceKey || anonKey!);
  return _admin;
}

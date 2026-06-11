// Utilidades SOLO de servidor (usan node:crypto — no importar en cliente).
import { createHash } from "crypto";

/** Hash de IP con sal — un voto por persona sin guardar la IP real. */
export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT || "mundialya-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function getClientIp(req: Request): string {
  const h = (name: string) => (req.headers.get(name) || "").split(",")[0].trim();
  return h("x-forwarded-for") || h("x-real-ip") || "127.0.0.1";
}

// Autenticación simple del panel /admin: contraseña única (ADMIN_PASSWORD)
// → cookie httpOnly con un token derivado (sha256). Compatible con Edge
// (middleware) y Node (API routes) usando Web Crypto.

export const ADMIN_COOKIE = "my_admin";

export async function adminToken(): Promise<string> {
  const secret = `${process.env.ADMIN_PASSWORD || "admin"}::mundialya-admin-v1`;
  const data = new TextEncoder().encode(secret);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

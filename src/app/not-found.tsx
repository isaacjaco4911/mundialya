import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-20 text-center">
      <p className="text-6xl">🟥</p>
      <h1 className="mt-4 font-title text-2xl font-extrabold">¡Fuera de lugar!</h1>
      <p className="mt-2 text-sm text-muted">Esta página no existe o fue expulsada del partido.</p>
      <Link href="/" className="btn-primary mt-6">Volver al inicio</Link>
    </div>
  );
}

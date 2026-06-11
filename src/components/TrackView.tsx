"use client";

import { useEffect } from "react";

/**
 * Contador de visitas: envía un beacon a /api/track al montar.
 * Usa sendBeacon (no se infla con prefetch: solo corre en navegación real)
 * y deduplica por sesión+ruta con sessionStorage.
 */
export default function TrackView({ kind, id }: { kind: "site" | "match" | "venue" | "team"; id?: string }) {
  useEffect(() => {
    const key = `my_tracked_${kind}_${id || "global"}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    const body = JSON.stringify({ kind, id });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
    }
  }, [kind, id]);
  return null;
}

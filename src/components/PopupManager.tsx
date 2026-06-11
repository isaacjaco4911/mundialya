"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Popup } from "@/lib/types";

/**
 * Popup administrable desde /admin con tope de frecuencia por usuario:
 * se muestra máximo 1 vez cada `frequency_hours` horas (localStorage).
 */
export default function PopupManager({ popup }: { popup: Popup | null }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!popup) return;
    const key = `my_popup_${popup.id}`;
    const last = Number(localStorage.getItem(key) || 0);
    const freqMs = (popup.frequency_hours || 12) * 3600_000;
    if (Date.now() - last < freqMs) return;
    const timer = setTimeout(() => {
      setShow(true);
      localStorage.setItem(key, String(Date.now()));
    }, 1500);
    return () => clearTimeout(timer);
  }, [popup]);

  if (!popup || !show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setShow(false)}>
      <div className="card w-full max-w-sm overflow-hidden p-0" onClick={(e) => e.stopPropagation()}>
        {popup.image_url && <img src={popup.image_url} alt="" className="h-36 w-full object-cover" />}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-title text-lg font-bold">{popup.title}</h3>
            <button onClick={() => setShow(false)} aria-label="Cerrar" className="rounded-lg p-1 text-muted hover:bg-black/5">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <p className="mt-2 text-sm text-muted">{popup.body}</p>
          <div className="mt-4 flex gap-2">
            {popup.link && (
              <Link href={popup.link} onClick={() => setShow(false)} className="btn-primary flex-1">
                ¡Vamos! ⚽
              </Link>
            )}
            <button onClick={() => setShow(false)} className="btn-outline">Ahora no</button>
          </div>
        </div>
      </div>
    </div>
  );
}

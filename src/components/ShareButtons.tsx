"use client";

/** Compartir por WhatsApp + Web Share API. */
export default function ShareButtons({ text, url }: { text: string; url?: string }) {
  function fullUrl() {
    return url ? new URL(url, window.location.origin).toString() : window.location.href;
  }

  async function nativeShare() {
    const u = fullUrl();
    if (navigator.share) {
      try { await navigator.share({ title: "MundialYa", text, url: u }); } catch {}
    } else {
      await navigator.clipboard.writeText(`${text} ${u}`);
      alert("¡Enlace copiado!");
    }
  }

  function whatsapp() {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${fullUrl()}`)}`, "_blank");
  }

  return (
    <div className="flex gap-2">
      <button onClick={whatsapp} className="btn bg-[#25D366] text-white hover:brightness-95">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4l-2.1-1c-.3-.1-.5-.1-.7.1l-1 1.2c-.2.2-.4.2-.6.1-1.5-.7-2.9-2-3.7-3.6-.1-.2-.1-.4.1-.6l1-1.2c.2-.2.2-.5.1-.7l-1-2.1c-.2-.4-.6-.5-1-.4-1.2.5-2 1.7-1.8 3 .4 2.4 1.7 4.7 3.6 6.4 1.6 1.4 3.5 2.4 5.6 2.7 1.3.2 2.5-.6 3-1.8.1-.4-.1-.9-.5-1.1zM12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2zm0 18.3c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-3 .8.8-3-.2-.3A8.3 8.3 0 1 1 12 20.3z"/></svg>
        WhatsApp
      </button>
      <button onClick={nativeShare} className="btn-outline">Compartir 🔗</button>
    </div>
  );
}

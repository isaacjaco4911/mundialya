import Link from "next/link";
import { siteVisits } from "@/lib/db";
import { SUPPORT_WA, SUPPORT_PHONE } from "@/lib/utils";

export default async function Footer() {
  const visits = await siteVisits();
  return (
    <footer className="mt-12 border-t border-black/5 dark:border-white/10 bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="font-title text-lg font-extrabold">
              Mundial<span className="text-primary">Ya</span> ⚽
            </p>
            <p className="mt-1 text-xs text-muted">
              El hub social del Mundial 2026 para Colombia. Calendario, polla
              gratis con el parche y dónde ver los partidos.
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Mundial</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link className="hover:text-primary" href="/calendario">Calendario</Link></li>
              <li><Link className="hover:text-primary" href="/grupos">Grupos y bracket</Link></li>
              <li><Link className="hover:text-primary" href="/polla">Polla social</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Sitios</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li><Link className="hover:text-primary" href="/donde-ver">Dónde ver</Link></li>
              <li><Link className="hover:text-primary" href="/donde-ver/registrar">Registra tu sitio</Link></li>
              <li><Link className="hover:text-primary" href="/metricas">Anuncia tu marca</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-muted">Contacto</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <a className="hover:text-primary" href={`https://wa.me/${SUPPORT_WA}?text=${encodeURIComponent("Hola MundialYa 👋")}`} target="_blank" rel="noopener">
                  💬 WhatsApp {SUPPORT_PHONE}
                </a>
              </li>
              <li><a className="hover:text-primary" href="https://instagram.com" target="_blank" rel="noopener">Instagram</a></li>
              <li><a className="hover:text-primary" href="https://tiktok.com" target="_blank" rel="noopener">TikTok</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-black/5 dark:border-white/10 pt-4 text-xs text-muted sm:flex-row">
          <p>© 2026 MundialYa · Hecho en Colombia 🇨🇴 · Hora local: Bogotá</p>
          <p>
            👀 <span className="scoreboard font-bold text-primary">{visits.toLocaleString("es-CO")}</span> visitas
          </p>
        </div>
        <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">
          La polla de MundialYa es 100% gratuita, sin pozos de dinero ni apuestas:
          es un juego de predicciones entre amigos. Los premios, cuando existan,
          son cortesía de patrocinadores.
        </p>
      </div>
    </footer>
  );
}

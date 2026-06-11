import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "@/components/ShareButtons";
import TrackView from "@/components/TrackView";
import ReviewForm from "@/components/ReviewForm";
import { getVenue, venueReviews, getMatch } from "@/lib/db";
import { waChat, SITE_URL, fmtDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const v = await getVenue(params.id);
  if (!v) return { title: "Sitio no encontrado" };
  const title = `${v.name} — ver el Mundial en ${v.neighborhood}, ${v.city}`;
  return {
    title,
    description: v.description,
    openGraph: { title, description: v.description, url: `${SITE_URL}/sitio/${v.id}`, images: v.photo_url ? [v.photo_url] : undefined },
  };
}

export default async function SitioPage({ params }: { params: { id: string } }) {
  const venue = await getVenue(params.id);
  if (!venue) notFound();

  const [reviews, showing] = await Promise.all([
    venueReviews(venue.id),
    venue.showing_match_id ? getMatch(venue.showing_match_id) : Promise.resolve(null),
  ]);

  const waText = `Hola, vi ${venue.name} en MundialYa y quiero reservar para ver el Mundial 🙌⚽`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: venue.name,
    address: { "@type": "PostalAddress", streetAddress: venue.address, addressLocality: venue.city },
    telephone: venue.phone,
    aggregateRating: venue.review_count > 0 ? { "@type": "AggregateRating", ratingValue: venue.avg_rating, reviewCount: venue.review_count } : undefined,
  };

  return (
    <div className="space-y-6">
      <TrackView kind="venue" id={venue.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="card overflow-hidden">
        {venue.photo_url ? (
          <img src={venue.photo_url} alt={venue.name} className="h-52 w-full object-cover sm:h-64" />
        ) : (
          <div className="flex h-52 items-center justify-center bg-primary/10 text-6xl">📺</div>
        )}
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-title text-2xl font-extrabold">{venue.name}</h1>
                {venue.is_featured && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-[#0c1b12]">⭐ DESTACADO</span>}
                {venue.is_verified && <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">✅ Verificado</span>}
              </div>
              <p className="mt-1 text-sm text-muted">📍 {venue.address}, {venue.neighborhood} · {venue.city}</p>
              {venue.review_count > 0 && (
                <p className="mt-1 text-sm">
                  <span className="text-accent">{"★".repeat(Math.round(venue.avg_rating))}</span>{" "}
                  <span className="font-semibold">{venue.avg_rating}</span>{" "}
                  <span className="text-muted">({venue.review_count} reseñas) · 👀 {venue.views} visitas</span>
                </p>
              )}
            </div>
            <ShareButtons text={`📺 Mira el Mundial en ${venue.name} (${venue.neighborhood}). Lo encontré en MundialYa:`} />
          </div>

          <p className="mt-3 text-sm">{venue.description}</p>
          <p className="mt-2 text-sm text-muted">🖥️ {venue.screens} pantalla{venue.screens !== 1 ? "s" : ""}</p>

          {venue.promos && (
            <div className="mt-3 rounded-xl bg-accent/15 p-3 text-sm">
              <span className="font-bold">🎉 Promo:</span> {venue.promos}
            </div>
          )}

          {showing && (
            <Link href={`/partido/${showing.id}`} className="mt-3 block rounded-xl bg-primary/10 p-3 text-sm font-semibold text-primary hover:bg-primary/20">
              📡 Proyecta: {showing.home_team?.name} vs {showing.away_team?.name} — {fmtDateTime(showing.kickoff)}
            </Link>
          )}

          <a href={waChat(venue.phone, waText)} target="_blank" rel="noopener" className="btn mt-4 w-full bg-[#25D366] text-white hover:brightness-95">
            💬 Reservar por WhatsApp
          </a>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="font-title text-lg font-bold">Reseñas</h2>
          <div className="mt-3 space-y-3">
            {reviews.length ? reviews.map((r) => (
              <div key={r.id} className="rounded-xl bg-black/5 dark:bg-white/5 p-3">
                <p className="text-sm font-bold">{r.reviewer_name} <span className="text-accent">{"★".repeat(r.rating)}</span></p>
                <p className="mt-1 text-sm text-muted">{r.comment}</p>
              </div>
            )) : (
              <p className="text-sm text-muted">Aún no hay reseñas. ¡Sé el primero!</p>
            )}
          </div>
        </section>

        <section className="card p-5">
          <h2 className="font-title text-lg font-bold">Deja tu reseña</h2>
          <div className="mt-3">
            <ReviewForm venueId={venue.id} />
          </div>
        </section>
      </div>
    </div>
  );
}

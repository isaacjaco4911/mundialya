import { activeBanners } from "@/lib/db";
import type { Banner } from "@/lib/types";

/** Slot de banner de patrocinador, administrable desde /admin. */
export default async function BannerSlot({ placement }: { placement: Banner["placement"] }) {
  const banners = await activeBanners(placement);
  const b = banners[0];
  if (!b) return null;

  const inner = b.image_url ? (
    <img src={b.image_url} alt={b.title} className="h-full w-full rounded-2xl object-cover" />
  ) : (
    <div className="flex h-full w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-accent/60 bg-accent/10 px-4 text-center">
      <span className="text-sm font-bold text-ink">📣 {b.title}</span>
    </div>
  );

  return (
    <div className="h-20 w-full sm:h-24">
      {b.link ? (
        <a href={b.link} target={b.link.startsWith("/") ? undefined : "_blank"} rel="noopener" className="block h-full">
          {inner}
        </a>
      ) : (
        inner
      )}
    </div>
  );
}

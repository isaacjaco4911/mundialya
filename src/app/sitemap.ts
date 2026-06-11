import type { MetadataRoute } from "next";
import { getMatches, getTeams, getVenues } from "@/lib/db";
import { SITE_URL } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [matches, teams, venues] = await Promise.all([getMatches(), getTeams(), getVenues()]);
  const staticPages = ["", "/calendario", "/polla", "/grupos", "/donde-ver", "/donde-ver/registrar", "/metricas"];
  return [
    ...staticPages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "hourly" as const, priority: p === "" ? 1 : 0.8 })),
    ...matches.map((m) => ({ url: `${SITE_URL}/partido/${m.id}`, changeFrequency: "hourly" as const, priority: 0.9 })),
    ...teams.map((t) => ({ url: `${SITE_URL}/equipo/${t.id}`, changeFrequency: "daily" as const, priority: 0.7 })),
    ...venues.map((v) => ({ url: `${SITE_URL}/sitio/${v.id}`, changeFrequency: "daily" as const, priority: 0.6 })),
  ];
}

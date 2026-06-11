import { ImageResponse } from "next/og";
import { getMatch } from "@/lib/db";
import { fmtDate, fmtTime } from "@/lib/utils";

export const alt = "Partido del Mundial 2026 en MundialYa";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Imagen Open Graph dinámica por partido: banderas + hora colombiana.
export default async function OgImage({ params }: { params: { id: string } }) {
  const m = await getMatch(params.id);

  const TeamBlock = ({ name, flag }: { name?: string; flag?: string | null }) => (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: 380 }}>
      {flag ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={flag.replace("w160", "w320")} width={220} height={165} style={{ borderRadius: 16, objectFit: "cover" }} alt="" />
      ) : (
        <div style={{ width: 220, height: 165, borderRadius: 16, background: "#11A14A22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, color: "#11A14A", fontWeight: 700 }}>?</div>
      )}
      <div style={{ fontSize: 44, fontWeight: 700, color: "#0C1B12", textAlign: "center" }}>{name || "Por definir"}</div>
    </div>
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #F6FBF7 60%, #d9f2e2 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 800, color: "#11A14A", marginBottom: 30, display: "flex" }}>
          MundialYa ⚽ Mundial 2026
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <TeamBlock name={m?.home_team?.name} flag={m?.home_team?.flag_url} />
          <div style={{ fontSize: 72, fontWeight: 800, color: "#FFC11E", display: "flex" }}>VS</div>
          <TeamBlock name={m?.away_team?.name} flag={m?.away_team?.flag_url} />
        </div>
        {m && (
          <div style={{ marginTop: 40, fontSize: 34, color: "#5C6B61", display: "flex" }}>
            {fmtDate(m.kickoff)} · {fmtTime(m.kickoff)} hora Colombia · {m.stadium}
          </div>
        )}
      </div>
    ),
    size
  );
}

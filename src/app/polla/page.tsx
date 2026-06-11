import type { Metadata } from "next";
import PollaClient from "./PollaClient";
import { getMatches, getLeagueByCode } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Polla del Mundial 2026 — gratis con tu parche",
  description: "Crea tu polla privada del Mundial 2026, invita por WhatsApp y compite prediciendo marcadores. 100% gratis, sin apuestas.",
};

export default async function PollaPage({ searchParams }: { searchParams: { codigo?: string } }) {
  const [matches, globalLeague] = await Promise.all([getMatches(), getLeagueByCode("GLOBAL")]);
  const open = matches.filter((m) => m.status !== "finished");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-title text-2xl font-extrabold sm:text-3xl">Polla MundialYa 🏆</h1>
      <p className="mt-1 text-sm text-muted">
        Predice marcadores, suma puntos y gánale a tu parche. Gratis y sin apuestas.
      </p>
      <div className="mt-5">
        <PollaClient matches={open} globalLeague={globalLeague} initialCode={searchParams.codigo} />
      </div>
    </div>
  );
}

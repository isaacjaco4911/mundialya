// Reglas de puntaje de la polla (espejo del trigger SQL en Supabase).
// La polla es GRATIS: sin pozo de dinero ni comisiones (no es juego de azar
// según la ley colombiana). Premios, si los hay, son de patrocinadores.

export const SCORING = {
  exact: 5, // marcador exacto
  outcome: 2, // acertó ganador o empate
  miss: 0,
};

export function calcPoints(
  predHome: number,
  predAway: number,
  realHome: number,
  realAway: number
): number {
  if (predHome === realHome && predAway === realAway) return SCORING.exact;
  const predSign = Math.sign(predHome - predAway);
  const realSign = Math.sign(realHome - realAway);
  return predSign === realSign ? SCORING.outcome : SCORING.miss;
}

/** Las predicciones se bloquean al pitazo inicial. */
export function isLocked(kickoffIso: string): boolean {
  return Date.now() >= new Date(kickoffIso).getTime();
}

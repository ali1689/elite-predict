// Display-only helpers. These never choose a market or recalculate a prediction.
export const MARKET_FIELDS = {
  "Over 1.5 Goals": ["over15"],
  "Over 2.5 Goals": ["over25"],
  "Under 2.5 Goals": ["under25"],
  "Under 1.5 Goals": ["under15"],
  "Home Over 0.5 Goals": ["home_over05"],
  "Away Over 0.5 Goals": ["away_over05"],
  "Home Over 1.5 Goals": ["home_over15"],
  "Away Over 1.5 Goals": ["away_over15"],
  "Both Teams to Score": ["btts"],
  "Home Win (1)": ["home_win", "p_home_win"],
  "Home Win": ["home_win", "p_home_win"],
  "Away Win (2)": ["away_win", "p_away_win"],
  "Away Win": ["away_win", "p_away_win"],
  "Draw (X)": ["draw", "p_draw"],
  Draw: ["draw", "p_draw"],
  "Double Chance 1X": ["dc_1x", "p_1x"],
  "Double Chance X2": ["dc_x2", "p_x2"],
  "Double Chance 12": ["dc_12", "p_12"],
  "Home Clean Sheet": ["home_cs"],
  "Away Clean Sheet": ["away_cs"],
};
export const numeric = (value) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value))
    ? Number(value)
    : null;
export function pickProbabilityFromRow(row) {
  for (const field of MARKET_FIELDS[row.primary_signal] || [])
    if (numeric(row[field]) !== null) return numeric(row[field]);
  return null;
}
export function recommendation(m) {
  const signal =
    (typeof m.modelSignal === "string" ? m.modelSignal : m.signal) || "";
  const available =
    signal.trim() && !["No strong signal", "—"].includes(signal);
  const score = numeric(
    Object.hasOwn(m, "modelConfidence") ? m.modelConfidence : m.conf,
  );
  const validScore =
    score !== null && score >= 0 && score <= 100 ? score : null;
  return {
    signal,
    available: !!available,
    score: available ? validScore : null,
    level:
      !available || validScore === null
        ? "Unrated"
        : validScore >= 80
          ? "High"
          : validScore >= 65
            ? "Medium"
            : "Low",
    probability: numeric(m.modelPickProbability),
    expectedGoals: numeric(m.modelExpectedGoals),
  };
}
export function pickLabel(m) {
  const { signal, available } = recommendation(m);
  if (!available) return "No clear pick";
  return (
    {
      "Home Over 0.5 Goals": `${m.home} to score`,
      "Away Over 0.5 Goals": `${m.away} to score`,
      "Over 1.5 Goals": "Over 1.5 Goals",
      "Over 2.5 Goals": "Over 2.5 Goals",
      "Under 2.5 Goals": "Under 2.5 Goals",
      "Home Over 1.5 Goals": `${m.home} · Over 1.5 Goals`,
      "Away Over 1.5 Goals": `${m.away} · Over 1.5 Goals`,
      "Home Win (1)": `${m.home} to win`,
      "Home Win": `${m.home} to win`,
      "Away Win (2)": `${m.away} to win`,
      "Away Win": `${m.away} to win`,
    }[signal] || signal
  );
}

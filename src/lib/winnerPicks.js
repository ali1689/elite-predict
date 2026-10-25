import { matchKey } from "./presentation.js";

export const MIN_WIN_PROBABILITY = 70;

// Stored 1X2 probabilities use 0–100, independently of the primary signal score.
function probability(value) {
  if (value == null || value === "" || typeof value === "boolean") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 100
    ? number
    : null;
}

export function selectWinnerPicks(matches, now = Date.now()) {
  const picks = new Map();
  for (const match of matches) {
    const kickoff = Date.parse(match.utcDate);
    if (
      !/^\d{4}-\d{2}-\d{2}T.*(?:Z|[+-]\d{2}:?\d{2})$/.test(match.utcDate || "") ||
      !Number.isFinite(kickoff) || kickoff <= now ||
      match.homeScore != null || match.awayScore != null
    ) continue;

    const home = probability(match.homeWin);
    const away = probability(match.awayWin);
    const draw = probability(match.draw);
    if (home === null || away === null || draw === null) continue;

    const selection = home > away ? "1" : "2";
    const winProbability = Math.max(home, away);
    if (home === away || winProbability <= draw || winProbability < MIN_WIN_PROBABILITY) continue;

    const key = matchKey(match);
    // Keep a single selection per fixture, even if duplicate rows are returned.
    if (!picks.has(key)) picks.set(key, {
      match,
      selection,
      team: selection === "1" ? match.home : match.away,
      probability: winProbability,
    });
  }
  return [...picks.values()].sort((a, b) =>
    b.probability - a.probability || Date.parse(a.match.utcDate) - Date.parse(b.match.utcDate),
  );
}

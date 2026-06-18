// ── Betting-term glossary ─────────────────────────────────────────────────────
// Plain-language definitions surfaced via the InfoTip tooltip across the site.
// Keys cover both the short market labels (used on cards) and the long signal
// labels (used in Today's pick badges), so a single lookup works everywhere.

export const GLOSSARY = {
  // Goals — totals
  "O1.5":  { title: "Over 1.5 Goals",  desc: "3 or more goals are scored in the match by both teams combined." },
  "O2.5":  { title: "Over 2.5 Goals",  desc: "3 or more total goals in the match." },
  "U2.5":  { title: "Under 2.5 Goals", desc: "2 or fewer total goals in the match." },
  "U1.5":  { title: "Under 1.5 Goals", desc: "1 or fewer total goals in the match." },

  // Both teams to score
  "BTTS":    { title: "Both Teams To Score", desc: "Each team scores at least one goal during the match." },
  "BTTS No": { title: "Both Teams To Score — No", desc: "At least one team fails to score (a clean sheet for either side)." },

  // Team goals
  "H O0.5": { title: "Home Over 0.5", desc: "The home team scores at least 1 goal." },
  "H O1.5": { title: "Home Over 1.5", desc: "The home team scores 2 or more goals." },
  "A O0.5": { title: "Away Over 0.5", desc: "The away team scores at least 1 goal." },
  "A O1.5": { title: "Away Over 1.5", desc: "The away team scores 2 or more goals." },

  // Result / 1X2
  "Home":  { title: "Home Win", desc: "The home team wins the match (full time)." },
  "Draw":  { title: "Draw", desc: "The match ends level — same score for both teams." },
  "Away":  { title: "Away Win", desc: "The away team wins the match (full time)." },

  // Double chance
  "1X": { title: "Double Chance 1X", desc: "You win if the home team wins OR the match is a draw." },
  "X2": { title: "Double Chance X2", desc: "You win if the away team wins OR the match is a draw." },
  "12": { title: "Double Chance 12", desc: "You win if either team wins (no draw)." },

  // Models / metrics
  "xG":         { title: "Expected Goals", desc: "Model estimate of total goals based on chance quality — higher means a more open game." },
  "xG rem":     { title: "Expected Goals Remaining", desc: "Goals the model still expects from the current minute to full time." },
  "Conf":       { title: "Confidence", desc: "How strongly the model backs this pick. Higher = stronger signal." },
  "Confidence": { title: "Confidence", desc: "How strongly the model backs this pick. Higher = stronger signal." },
  "Tier":       { title: "Pick Tier", desc: "Quality grade from the model's 30-day accuracy: A (strongest), B (solid), C (speculative)." },
};

// Long signal labels → same definition (so Today's pick badges resolve too)
const LONG_ALIASES = {
  "Over 1.5 Goals": "O1.5", "Over 2.5 Goals": "O2.5",
  "Under 2.5 Goals": "U2.5", "Under 1.5 Goals": "U1.5",
  "Both Teams to Score": "BTTS",
  "Home Over 0.5 Goals": "H O0.5", "Home Over 1.5 Goals": "H O1.5",
  "Away Over 0.5 Goals": "A O0.5", "Away Over 1.5 Goals": "A O1.5",
  "Home Win": "Home", "Away Win": "Away",
  "Double Chance 1X": "1X", "Double Chance X2": "X2", "Double Chance 12": "12",
};

// Resolve a label (short or long) to its glossary entry, or null if unknown.
export function term(label = "") {
  if (GLOSSARY[label]) return GLOSSARY[label];
  const alias = LONG_ALIASES[label];
  return alias ? GLOSSARY[alias] : null;
}

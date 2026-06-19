// ── Shared helpers (no static JSON — data now comes from Supabase) ─────────

export function fmtDate(utcDate) {
  const d = new Date(utcDate);
  return d.toLocaleDateString("en-GB", {
    month: "short",
    day:   "2-digit",
    timeZone: "Europe/Warsaw",
  }).toUpperCase();
}

export function fmtTime(utcDate) {
  const d = new Date(utcDate);
  return d.toLocaleTimeString("en-GB", {
    hour:     "2-digit",
    minute:   "2-digit",
    timeZone: "Europe/Warsaw",
  });
}

export function abbr(name = "") {
  const stop = new Set(["FC", "AC", "SC", "RC", "EC", "CA", "CR", "FK", "NK",
                         "VfL", "VfB", "RB", "1.", "SV", "AS", "SS", "CD", "CF",
                         "UD", "SD", "GD", "RCD", "FSV"]);
  const words = name
    .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 1 && !stop.has(w));
  if (words.length === 0) return name.slice(0, 3).toUpperCase();
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words.slice(0, 3).map(w => w[0]).join("").toUpperCase();
}

// ── Signal visual config ───────────────────────────────────────────────────
export const SIG_STYLE = {
  "Home Over 0.5 Goals": { bg: "bg-emerald-500/15", text: "text-emerald-400",          dot: "bg-emerald-400"          },
  "Home Over 1.5 Goals": { bg: "bg-primary-container/10", text: "text-primary-container", dot: "bg-primary-container"  },
  "Away Over 0.5 Goals": { bg: "bg-sky-500/15",     text: "text-sky-400",              dot: "bg-sky-400"              },
  "Away Over 1.5 Goals": { bg: "bg-blue-500/15",    text: "text-blue-400",             dot: "bg-blue-400"             },
  "Over 1.5 Goals":      { bg: "bg-yellow-500/15",  text: "text-yellow-400",           dot: "bg-yellow-400"           },
  "Over 2.5 Goals":      { bg: "bg-primary-container/10", text: "text-primary-container", dot: "bg-primary-container" },
  "Under 2.5 Goals":     { bg: "bg-violet-500/15",  text: "text-violet-400",           dot: "bg-violet-400"           },
  "Both Teams to Score": { bg: "bg-blue-500/15",    text: "text-blue-400",             dot: "bg-blue-400"             },
  "No strong signal":    { bg: "bg-surface-container", text: "text-on-surface-variant", dot: "bg-zinc-500"             },
  // 1X2 match result signals
  "Home Win":            { bg: "bg-primary-container/10", text: "text-primary-container", dot: "bg-primary-container"    },
  "Away Win":            { bg: "bg-blue-500/15",    text: "text-blue-400",             dot: "bg-blue-400"             },
  "Draw":                { bg: "bg-yellow-500/15",  text: "text-yellow-500",           dot: "bg-yellow-500"           },
  // Double Chance
  "Double Chance 1X":    { bg: "bg-emerald-500/15", text: "text-emerald-400",          dot: "bg-emerald-400"          },
  "Double Chance X2":    { bg: "bg-sky-500/15",     text: "text-sky-400",              dot: "bg-sky-400"              },
  "Double Chance 12":    { bg: "bg-violet-500/15",  text: "text-violet-400",           dot: "bg-violet-400"           },
  "DC 1X":               { bg: "bg-emerald-500/15", text: "text-emerald-400",          dot: "bg-emerald-400"          },
  "DC X2":               { bg: "bg-sky-500/15",     text: "text-sky-400",              dot: "bg-sky-400"              },
  "DC 12":               { bg: "bg-violet-500/15",  text: "text-violet-400",           dot: "bg-violet-400"           },
  // Legacy fallbacks
  "HIGH SCORING":        { bg: "bg-primary-container/10", text: "text-primary-container", dot: "bg-primary-container" },
  "BTTS + O2.5":         { bg: "bg-primary-container/10", text: "text-primary-container", dot: "bg-primary-container" },
  "BTTS":                { bg: "bg-blue-500/15",    text: "text-blue-400",             dot: "bg-blue-400"             },
  "OVER 2.5":            { bg: "bg-blue-500/15",    text: "text-blue-400",             dot: "bg-blue-400"             },
  "BALANCED":            { bg: "bg-white/5",        text: "text-on-surface-variant",   dot: "bg-zinc-500"             },
};

export function sigStyle(signal) {
  return SIG_STYLE[signal] ?? SIG_STYLE["No strong signal"];
}

// ── Signal tier config ─────────────────────────────────────────────────────
export const TIER_STYLE = {
  A: { bg: "bg-primary-container/15", text: "text-primary-container", border: "border-primary-container/30", label: "Strong Pick" },
  B: { bg: "bg-blue-500/15",          text: "text-blue-400",          border: "border-blue-500/30",          label: "Good Pick"   },
  C: { bg: "bg-white/5",              text: "text-on-surface-variant", border: "border-white/10",            label: "Speculative" },
};

export function tierStyle(tier) {
  return TIER_STYLE[tier] ?? TIER_STYLE["B"];
}

// ── Donut chart colours for signal breakdown ───────────────────────────────
export const SIGNAL_DONUT_COLORS = {
  "Home Win":            "#39FF14",
  "Away Win":            "#60A5FA",
  "Draw":                "#facc15",
  "Double Chance 1X":    "#34d399",
  "Double Chance X2":    "#38bdf8",
  "Double Chance 12":    "#a78bfa",
  "DC 1X":               "#34d399",
  "DC X2":               "#38bdf8",
  "DC 12":               "#a78bfa",
  "Home Over 0.5 Goals": "#34d399",
  "Home Over 1.5 Goals": "#39FF14",
  "Away Over 0.5 Goals": "#38bdf8",
  "Away Over 1.5 Goals": "#60A5FA",
  "Over 1.5 Goals":      "#facc15",
  "Over 2.5 Goals":      "#7FFF00",
  "Under 2.5 Goals":     "#a78bfa",
  "Both Teams to Score": "#3B82F6",
  "No strong signal":    "#52525B",
};

export const testimonials = [
  {
    id:    1,
    name:  "Marcus Thorne",
    role:  "Pro Community Member",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIBylE-leFWRll7x5V17x-lN031HNALVCpi-JXQXOyi1rz5emZjbMl1KGkMuxnR0jT0lFZ3MRU63HSWBY6nysfB6bj9FWxMPB8gmxS5aHAhLxriaZpvxlxdYl0bIZn9f2jAtMkOrzaJX2qlFZA62CsJN_HPjURjtSj_e4LGCNV2rrOMw6SNkXAboXHcUl4rW0ytJ2KqvBnv3I2NKSRT-zrmBbATh31N8z1YAz4ZSxRWB9c_TNvM3ILoNPFMiuPhcuWB5JGTOZLRw",
    quote: "I used to juggle five different stats sites before every matchday. Now it's all in one place — the confidence scores and live in-play view completely changed how I pick my bets.",
    stars: 5,
  },
  {
    id:    2,
    name:  "Elena Rodriguez",
    role:  "Data Scientist",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2A_nyu2mTZXOtXMtfRf_4VXnQlkIDVZdcvlwvODK25xIUJv1LbmNvvdGa0eUFJJ54Ha0vMGWFfJ04kMayUEgY3WGjszCGqrfKl0iAKSAvXUPYJIMw255dbXBiXH51ZXxoWlqd2qmeO-OCJKMOhtRjmH1bj0f2WCY5-_5ZOyoqmWrer58hHS_hElIqR3a8n6TNpUn3tPzihd70x9bTKnsJNC9FyM-fqyTPeGKwACn1NY7s2e2YrQlDWnZkMYyI6HK6VnlORaCK4Q",
    quote: "As someone who builds models for a living, the calibration genuinely impressed me. The probabilities hold up over a full season, and the site makes the data effortless to read and act on.",
    stars: 5,
  },
];

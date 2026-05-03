import raw from "./predictions.json";

// ── Helpers ────────────────────────────────────────────────────────────────

export function fmtDate(utcDate) {
  const d = new Date(utcDate);
  return d.toLocaleDateString("en-GB", {
    month: "short",
    day:   "2-digit",
    timeZone: "UTC",
  }).toUpperCase();
}

export function fmtTime(utcDate) {
  const d = new Date(utcDate);
  return d.toLocaleTimeString("en-GB", {
    hour:   "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}

export function abbr(name) {
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

function signalToStatus(signal) {
  if (signal === "HIGH SCORING" || signal === "BTTS + O2.5") return "optimized";
  if (signal === "BTTS")      return "live";
  if (signal === "OVER 2.5")  return "live";
  return "finalizing";
}

// ── Sort all matches by date ────────────────────────────────────────────────
const upcoming = [...raw].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
const byConf   = [...upcoming].sort((a, b) => b.conf - a.conf);

// ── Transformers ────────────────────────────────────────────────────────────
function toCard(m) {
  return {
    id:         `${m.home}-${m.away}-${m.utcDate}`,
    home:       { abbr: abbr(m.home), name: m.home, logo: null },
    away:       { abbr: abbr(m.away), name: m.away, logo: null },
    prediction: m.signal,
    confidence: m.conf,
    status:     signalToStatus(m.signal),
    league:     m.comp,
    time:       fmtTime(m.utcDate),
    btts:       m.btts,
    over25:     m.over25,
    homeScore:  m.homeScore,
    awayScore:  m.awayScore,
    lH:         m.lH,
    lA:         m.lA,
    utcDate:    m.utcDate,
  };
}

function toFeatureCard(m) {
  const card = toCard(m);
  const isHigh = m.conf >= 70;
  card.badge      = isHigh ? "ELITE PICK" : m.signal === "BTTS + O2.5" ? "TOP SIGNAL" : "DATA SYNCED";
  card.badgeStyle = isHigh ? "neon"       : m.conf >= 60               ? "blue"       : "neutral";
  return card;
}

// ── Public exports ──────────────────────────────────────────────────────────
export const heroCards    = byConf.slice(0, 3).map(toCard);
export const featureCards = byConf.slice(0, 3).map(toFeatureCard);

export const schedule = upcoming.map(m => ({
  id:        `${m.home}-${m.away}-${m.utcDate}`,
  utcDate:   m.utcDate,
  date:      fmtDate(m.utcDate),
  time:      fmtTime(m.utcDate),
  home:      m.home,
  away:      m.away,
  league:    m.comp,
  market:    m.signal,
  signal:    m.signal,
  conf:      m.conf,
  btts:      m.btts,
  over25:    m.over25,
  homeScore: m.homeScore,
  awayScore: m.awayScore,
  lH:        m.lH,
  lA:        m.lA,
}));

export const testimonials = [
  {
    id:    1,
    name:  "Marcus Thorne",
    role:  "Pro Community Member",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAIBylE-leFWRll7x5V17x-lN031HNALVCpi-JXQXOyi1rz5emZjbMl1KGkMuxnR0jT0lFZ3MRU63HSWBY6nysfB6bj9FWxMPB8gmxS5aHAhLxriaZpvxlxdYl0bIZn9f2jAtMkOrzaJX2qlFZA62CsJN_HPjURjtSj_e4LGCNV2rrOMw6SNkXAboXHcUl4rW0ytJ2KqvBnv3I2NKSRT-zrmBbATh31N8z1YAz4ZSxRWB9c_TNvM3ILoNPFMiuPhcuWB5JGTOZLRw",
    quote: "I can't believe this level of data is free now. The Telegram alerts are literally worth thousands. My accuracy has peaked since joining.",
    stars: 5,
  },
  {
    id:    2,
    name:  "Elena Rodriguez",
    role:  "Data Scientist",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB2A_nyu2mTZXOtXMtfRf_4VXnQlkIDVZdcvlwvODK25xIUJv1LbmNvvdGa0eUFJJ54Ha0vMGWFfJ04kMayUEgY3WGjszCGqrfKl0iAKSAvXUPYJIMw255dbXBiXH51ZXxoWlqd2qmeO-OCJKMOhtRjmH1bj0f2WCY5-_5ZOyoqmWrer58hHS_hElIqR3a8n6TNpUn3tPzihd70x9bTKnsJNC9FyM-fqyTPeGKwACn1NY7s2e2YrQlDWnZkMYyI6HK6VnlORaCK4Q",
    quote: "The consistency of the AI model is world-class. Transitioning to a free model is a game changer for the betting community. Join the Telegram now.",
    stars: 5,
  },
];

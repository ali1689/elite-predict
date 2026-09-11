export const TIMEZONE = "Europe/Warsaw";
export const leagueName = (value) =>
  ({
    PL: "Premier League",
    BL1: "Bundesliga",
    FL1: "Ligue 1",
    PD: "La Liga",
    SA: "Serie A",
    DED: "Eredivisie",
    PPL: "Primeira Liga",
    ELC: "Championship",
    CL: "Champions League",
    BSA: "Brasileirão",
  })[value] ||
  value ||
  "Football";
export function dateKey(offset = 0) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(Date.now() + offset * 86400000));
}
export function dateLabel(value, withTime = true) {
  if (!value) return "Kickoff to be confirmed";
  const d = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
  if (!Number.isFinite(d.getTime())) return "Kickoff to be confirmed";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TIMEZONE,
    day: "numeric",
    month: "short",
    ...(withTime && value.length > 10
      ? { hour: "2-digit", minute: "2-digit" }
      : {}),
  }).format(d);
}
export function percent(value) {
  return value != null && Number.isFinite(Number(value))
    ? `${Math.min(100, Math.max(0, Number(value))).toFixed(0)}%`
    : "—";
}
export function matchKey(m) {
  return [
    m.matchId ?? `${m.home}|${m.away}|${m.comp ?? ""}`,
    m.matchDate || m.utcDate?.slice(0, 10) || "",
  ].join("::");
}
export function savedFixture(m) {
  return {
    key: matchKey(m),
    matchId: m.matchId,
    home: m.home,
    away: m.away,
    comp: m.comp,
    matchDate: m.matchDate,
    utcDate: m.utcDate,
    savedAt: new Date().toISOString(),
  };
}
export function readSaved(raw) {
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data)
      ? data
          .filter(
            (m) =>
              m &&
              typeof m.key === "string" &&
              typeof m.home === "string" &&
              typeof m.away === "string",
          )
          .slice(0, 300)
      : [];
  } catch {
    return [];
  }
}
export function filterMatches(
  matches,
  {
    search = "",
    league = "",
    date = "",
    tier = "",
    min = 0,
    market = "",
    sort = "date",
    saved = false,
    keys = new Set(),
  } = {},
) {
  const dates =
    date === "today"
      ? [dateKey()]
      : date === "tomorrow"
        ? [dateKey(1)]
        : date === "week"
          ? Array.from({ length: 7 }, (_, i) => dateKey(i))
          : null;
  return matches
    .filter(
      (m) =>
        (!search ||
          `${m.home} ${m.away}`.toLowerCase().includes(search.toLowerCase())) &&
        (!league || m.comp === league) &&
        (!tier || m.tier === tier) &&
        Number(m.conf) >= Number(min) &&
        (!dates || dates.includes(m.matchDate)) &&
        (!saved || keys.has(matchKey(m))) &&
        (!market || (market === "btts" ? m.btts >= 60 : m.over25 >= 60)),
    )
    .sort((a, b) =>
      sort === "conf"
        ? b.conf - a.conf
        : sort === "xg"
          ? b.xgTotal - a.xgTotal
          : sort === "over15"
            ? b.over15 - a.over15
            : (a.utcDate || a.matchDate || "").localeCompare(
                b.utcDate || b.matchDate || "",
              ),
    );
}
export function mergeResults(settled, past) {
  const rows = new Map(past.map((m) => [m.id, m]));
  settled.forEach((m) => rows.set(m.id, m));
  return [...rows.values()].sort((a, b) =>
    (b.matchDate || "").localeCompare(a.matchDate || ""),
  );
}
export const PACK_EVENT = "ep-pack-updated";
export function isPackOpenedToday(userId) {
  try {
    return (
      !!userId && localStorage.getItem(`ep_pack_opened_${userId}`) === dateKey()
    );
  } catch {
    return false;
  }
}
export function markPackOpened(userId) {
  if (!userId) return false;
  try {
    localStorage.setItem(`ep_pack_opened_${userId}`, dateKey());
    window.dispatchEvent(new Event(PACK_EVENT));
    return true;
  } catch {
    return false;
  }
}

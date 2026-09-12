export const badgeKey = (name) =>
  String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
export function safeBadgeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      ["crests.football-data.org", "upload.wikimedia.org"].includes(
        url.hostname,
      ) &&
      !url.username &&
      !url.password
      ? url.href
      : null;
  } catch {
    return null;
  }
}
export function teamIndex(teams) {
  const index = new Map();
  for (const t of teams)
    for (const alias of [t.name, t.shortName].filter(Boolean)) {
      const key = badgeKey(alias),
        existing = index.get(key);
      if (existing === null) continue;
      index.set(key, existing && existing.id !== t.id ? null : t);
    }
  return index;
}

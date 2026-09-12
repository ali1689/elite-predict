import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { LEAGUES } from "../src/lib/seo.js";
export async function refreshBadges(token) {
  if (!token)
    throw new Error(
      "Set FOOTBALL_DATA_TOKEN in your terminal, never a VITE_ variable.",
    );
  const teams = new Map(),
    competitions = [];
  for (const league of LEAGUES) {
    const response = await fetch(
      `https://api.football-data.org/v4/competitions/${league.code}/teams`,
      { headers: { "X-Auth-Token": token } },
    );
    if (!response.ok)
      throw new Error(
        `Provider returned ${response.status} for ${league.code}. Existing asset directory was kept.`,
      );
    const data = await response.json();
    if (!Array.isArray(data.teams) || !data.competition)
      throw new Error("Unexpected provider response; existing directory kept.");
    competitions.push({
      code: league.code,
      name: data.competition.name,
      emblem: data.competition.emblem || null,
    });
    for (const t of data.teams)
      teams.set(t.id, {
        id: t.id,
        name: t.name,
        shortName: t.shortName,
        crest: t.crest || null,
      });
  }
  const directory = {
    source: "https://api.football-data.org/v4/competitions/{code}/teams",
    fetchedAt: new Date().toISOString(),
    competitions,
    teams: [...teams.values()].sort((a, b) => a.id - b.id),
  };
  await writeFile(
    new URL("../src/data/football-badges.json", import.meta.url),
    JSON.stringify(directory, null, 2) + "\n",
  );
  console.log(
    `Updated ${directory.teams.length} club badges and ${competitions.length} competition emblems.`,
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  refreshBadges(process.env.FOOTBALL_DATA_TOKEN).catch(() => {
    console.error(
      "Badge refresh failed. Check your provider token, subscription and rate limit. Existing file is retained.",
    );
    process.exitCode = 1;
  });

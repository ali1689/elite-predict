import directory from "@/data/football-badges.json";
import { badgeKey, safeBadgeUrl, teamIndex } from "./badge-utils";
const teams = teamIndex(directory.teams);
export const teamCrest = (name) =>
  safeBadgeUrl(teams.get(badgeKey(name))?.crest);
export const leagueEmblem = (code) =>
  safeBadgeUrl(directory.competitions.find((c) => c.code === code)?.emblem);

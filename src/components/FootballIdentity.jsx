import { Link } from "react-router-dom";
import { LEAGUES, leagueFor } from "@/lib/seo";
import { leagueName } from "@/lib/presentation";
// Initials are a fallback identity marker, not a club crest. The current feed supplies no crest URLs.
export function TeamBadge({ name }) {
  const words = String(name || "")
    .split(/\s+/)
    .filter(
      (w) =>
        /\p{L}/u.test(w) && !["FC", "CF", "AFC", "SC", "AC", "1."].includes(w),
    );
  const initials = (
    words.length === 1
      ? words[0].slice(0, 2)
      : words
          .slice(0, 2)
          .map((w) => w[0])
          .join("")
  ).toUpperCase();
  const hue = [...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="v2-team-badge"
      style={{ "--team-hue": hue }}
      aria-hidden="true"
    >
      {initials || "?"}
    </span>
  );
}
export function Competition({ code }) {
  const league = leagueFor(code),
    content = (
      <>
        <span className="v2-league-mark" aria-hidden="true">
          {league?.short || "⚽"}
        </span>
        {leagueName(code)}
      </>
    );
  return league ? (
    <Link className="v2-competition" to={`/leagues/${league.slug}`}>
      {content}
    </Link>
  ) : (
    <span className="v2-competition">{content}</span>
  );
}
export function LeagueLinks() {
  return (
    <section className="v2-league-section">
      <div className="v2-section-title">
        <h2>Predictions by league</h2>
      </div>
      <nav
        className="v2-league-links"
        aria-label="Football predictions by league"
      >
        {LEAGUES.map((l) => (
          <Link to={`/leagues/${l.slug}`} key={l.code}>
            <span className="v2-league-mark" aria-hidden="true">
              {l.short}
            </span>
            <span>
              <strong>{l.name}</strong>
              <small>{l.country}</small>
            </span>
            <span aria-hidden="true">→</span>
          </Link>
        ))}
      </nav>
    </section>
  );
}
export function pickLabel(m) {
  return (
    {
      "Home Over 0.5 Goals": `${m.home} to score`,
      "Away Over 0.5 Goals": `${m.away} to score`,
      "Over 1.5 Goals": "2+ total goals",
      "Over 2.5 Goals": "3+ total goals",
      "Under 2.5 Goals": "Under 3 total goals",
      "Home Over 1.5 Goals": `${m.home}: 2+ goals`,
      "Away Over 1.5 Goals": `${m.away}: 2+ goals`,
    }[m.signal] || m.signal
  );
}

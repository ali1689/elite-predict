import { useState } from "react";
import { teamCrest, leagueEmblem } from "@/lib/badges";
export { pickLabel } from "@/lib/recommendation";
import { Link } from "react-router-dom";
import { LEAGUES, leagueFor } from "@/lib/seo";
import { leagueName } from "@/lib/presentation";
// Badges come from a generated directory of the existing provider's public asset URLs.
function AssetBadge({ src, name, className, style, children }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className={className + (src && !failed ? " has-image" : "")}
      style={style}
      aria-hidden={!src || failed ? true : undefined}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={name}
          loading="lazy"
          decoding="async"
          width="48"
          height="48"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        children
      )}
    </span>
  );
}
export function LeagueBadge({ code, name, short }) {
  const src = leagueEmblem(code);
  return (
    <AssetBadge
      key={src || code}
      src={src}
      name={name + " competition logo"}
      className="v2-league-mark"
    >
      {short || "⚽"}
    </AssetBadge>
  );
}
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
    <AssetBadge
      key={teamCrest(name) || name}
      src={teamCrest(name)}
      name={name + " club badge"}
      className="v2-team-badge"
      style={{ "--team-hue": hue }}
    >
      {initials || "?"}
    </AssetBadge>
  );
}
export function Competition({ code }) {
  const league = leagueFor(code),
    content = (
      <>
        <LeagueBadge
          code={league?.code || code}
          name={leagueName(code)}
          short={league?.short}
        />
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
            <LeagueBadge code={l.code} name={l.name} short={l.short} />
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

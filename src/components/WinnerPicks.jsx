import { Link } from "react-router-dom";
import { TeamBadge, Competition } from "./FootballIdentity";
import { Icon, SaveButton } from "./V2";
import { dateLabel, matchKey, percent } from "@/lib/presentation";
import { matchPath } from "@/lib/seo";
import { MIN_WIN_PROBABILITY } from "@/lib/winnerPicks";

export default function WinnerPicks({ picks }) {
  return (
    <section className="v2-winners" aria-labelledby="winner-picks-title">
      <div className="v2-section-title">
        <div>
          <p className="v2-eyebrow">Match winner · 1 or 2 only</p>
          <h2 id="winner-picks-title">High-probability winners</h2>
        </div>
        <span className="v2-badge">{MIN_WIN_PROBABILITY}%+ win probability</span>
      </div>
      <p className="v2-muted v2-winners-description">
        1 = home team wins · 2 = away team wins. Today’s upcoming matches,
        ranked by estimated win probability.
      </p>
      {picks.length ? (
        <div className="v2-winners-grid">
          {picks.map(({ match, selection, team, probability }) => (
            <article className="v2-winner-card" key={matchKey(match)}>
              <div className="v2-winner-meta">
                <Competition code={match.comp} />
                <SaveButton match={match} />
              </div>
              <p className="v2-fine">{dateLabel(match.utcDate)} · Warsaw</p>
              <Link className="v2-winner-fixture" to={matchPath(match)}>
                {match.home} <span>vs</span> {match.away}
              </Link>
              <div className="v2-winner-selection">
                <span className="v2-winner-number" aria-label={`Selection ${selection}`}>{selection}</span>
                <TeamBadge name={team} />
                <div className="v2-winner-team">
                  <small>{selection === "1" ? "Home win" : "Away win"}</small>
                  <h3>{team} to win</h3>
                </div>
                <div className="v2-winner-probability">
                  <strong>{percent(probability)}</strong>
                  <small>Win probability</small>
                </div>
              </div>
              <Link className="v2-match-permalink" to={matchPath(match)}>
                Match analysis <Icon>arrow_forward</Icon>
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="v2-winners-empty">
          No upcoming home or away wins reach {MIN_WIN_PROBABILITY}% today.
          Check again after the next update.
        </div>
      )}
    </section>
  );
}

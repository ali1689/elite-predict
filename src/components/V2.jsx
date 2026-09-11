import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Comparison, Kickoff } from "@/components/Discovery";
import { useSaved } from "@/context/SavedContext";
import { dateLabel, leagueName, percent, matchKey } from "@/lib/presentation";
import { TeamBadge, Competition, pickLabel } from "./FootballIdentity";
import { matchPath } from "@/lib/seo";
export function Icon({ children, ...props }) {
  return (
    <span className="material-symbols-outlined" aria-hidden="true" {...props}>
      {children}
    </span>
  );
}
export function PageHeading({ eyebrow, title, description, children }) {
  return (
    <header className="v2-page-heading">
      <div>
        <p className="v2-eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        {description && <p className="v2-muted">{description}</p>}
      </div>
      <div className="v2-heading-actions">{children}</div>
    </header>
  );
}
export function Empty({
  title = "No matches found",
  children,
  icon = "sports_soccer",
}) {
  return (
    <div className="v2-empty">
      <Icon>{icon}</Icon>
      <h3>{title}</h3>
      <div className="v2-muted">{children}</div>
    </div>
  );
}
export function Loading() {
  return (
    <div className="v2-loading" role="status" aria-label="Loading predictions">
      <div />
      <div />
      <div />
      <span>Loading match data…</span>
    </div>
  );
}
export function ErrorState({ retry }) {
  return (
    <div className="v2-error" role="alert">
      <Icon>cloud_off</Icon>
      <div>
        <strong>Match data is temporarily unavailable.</strong>
        <p>Please try again shortly. Saved fixtures remain on this browser.</p>
      </div>
      {retry && (
        <button className="v2-button secondary" onClick={retry}>
          Try again
        </button>
      )}
    </div>
  );
}
export function SaveButton({ match }) {
  const { toggle, isSaved } = useSaved(),
    active = isSaved(match);
  return (
    <button
      type="button"
      className={`v2-icon-button v2-save ${active ? "selected" : ""}`}
      aria-pressed={active}
      aria-label={`${active ? "Remove" : "Save"} ${match.home} vs ${match.away}${active ? " from saved matches" : ""}`}
      onClick={() => toggle(match)}
    >
      <Icon>{active ? "bookmark_added" : "bookmark_add"}</Icon>
    </button>
  );
}
export function Community() {
  return (
    <aside className="v2-community">
      <div>
        <p className="v2-eyebrow">ElitePredicts community</p>
        <h3>Talk football with us.</h3>
      </div>
      <a
        className="v2-button secondary"
        href="https://t.me/SmartBet_Signals"
        target="_blank"
        rel="noreferrer"
      >
        Join the community <Icon>north_east</Icon>
      </a>
    </aside>
  );
}
export function Metric({ label, value, note }) {
  return (
    <div className="v2-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}
export function MatchDetails({ match: m, odds }) {
  const groups = [
    [
      "Match result",
      [
        ["Home win", m.homeWin, odds?.oddsHome],
        ["Draw", m.draw, odds?.oddsDraw],
        ["Away win", m.awayWin, odds?.oddsAway],
      ],
    ],
    [
      "Team goals",
      [
        [`${m.home} to score`, m.homeOver05],
        [`${m.home} 2+ goals`, m.homeOver15],
        [`${m.away} to score`, m.awayOver05],
        [`${m.away} 2+ goals`, m.awayOver15],
      ],
    ],
    [
      "Match goals",
      [
        ["Both teams to score", m.btts, odds?.oddsBtts],
        ["Over 1.5 goals", m.over15, odds?.oddsOver15],
        ["Over 2.5 goals", m.over25, odds?.oddsOver25],
        ["Under 2.5 goals", m.under25, odds?.oddsUnder25],
      ],
    ],
    [
      "Double chance",
      [
        ["Home or draw", m.dc1X],
        ["Away or draw", m.dcX2],
        ["Home or away", m.dc12],
      ],
    ],
  ];
  return (
    <div className="v2-match-detail">
      {groups.map(([label, values]) => (
        <section key={label}>
          <h3>{label}</h3>
          <div className="v2-prob-grid">
            {values.map(([name, value, price]) => (
              <div key={name}>
                <span>{name}</span>
                <strong>{percent(value)}</strong>
                {value != null &&
                  value !== "" &&
                  Number.isFinite(Number(value)) && (
                    <div className="v2-market-meter" aria-hidden="true">
                      <i
                        style={{
                          width: `${Math.max(0, Math.min(100, Number(value)))}%`,
                        }}
                      />
                    </div>
                  )}
                {Number(price) > 1 && (
                  <small>Odds {Number(price).toFixed(2)}</small>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
      <div className="v2-detail-meta">
        <span>
          Expected goals:{" "}
          <b>{Number(m.xgTotal || m.lH + m.lA || 0).toFixed(2)}</b>
        </span>
        <span>
          Elo: {m.homeElo} / {m.awayElo}
        </span>
        <span>Tier {m.tier || "—"}</span>
      </div>
      {odds?.bestMarket && Number(odds.bestOdds) > 1 && (
        <p className="v2-odds">
          Available odds · {odds.bestMarket}:{" "}
          <strong>{Number(odds.bestOdds).toFixed(2)}</strong>. Prices may
          change.
        </p>
      )}
      <p className="v2-fine">
        Confidence is the existing model score. Market percentages are separate
        estimates and may differ. Over 1.5 means at least 2 goals; over 2.5
        means at least 3. Outcomes are uncertain.
      </p>
      <details className="v2-explainer">
        <summary>What do confidence, expected goals and Elo mean?</summary>
        <p>
          Confidence is the model’s score for its primary pick. Expected goals
          estimate the total scoring level, not the exact final score. Elo is a
          relative team-strength rating: a higher value indicates a stronger
          rating. These measures are different from the individual market
          probabilities above.
        </p>
      </details>
    </div>
  );
}
export function MatchCard({ match, spotlight = false, odds, showLink = true }) {
  return (
    <article className={`v2-match-card ${spotlight ? "spotlight" : ""}`}>
      <div className="v2-card-top">
        <span className="v2-badge">
          {spotlight ? "Match spotlight" : `Tier ${match.tier || "—"}`}
        </span>
        <SaveButton match={match} />
      </div>
      <p className="v2-match-time">
        <Competition code={match.comp} /> ·{" "}
        {dateLabel(match.utcDate || match.matchDate)} · Warsaw
      </p>
      <Kickoff value={match.utcDate} />
      <div className="v2-teams">
        <h2>
          <TeamBadge name={match.home} />
          {match.home}
        </h2>
        <span>vs</span>
        <h2>
          <TeamBadge name={match.away} />
          {match.away}
        </h2>
      </div>
      <div className="v2-signal">
        <div>
          <small>AI prediction</small>
          <strong>{pickLabel(match)}</strong>
        </div>
        <div className="v2-confidence">
          <strong>{percent(match.conf)}</strong>
          <small>Model confidence</small>
        </div>
      </div>
      <div className="v2-result-strip" aria-label="Match result probabilities">
        {[
          ["Home win", match.homeWin],
          ["Draw", match.draw],
          ["Away win", match.awayWin],
        ].map(([label, value]) => (
          <div key={label}>
            <span>{label}</span>
            <strong>{percent(value)}</strong>
          </div>
        ))}
      </div>
      {showLink && (
        <Link className="v2-match-permalink" to={matchPath(match)}>
          Match prediction <Icon>arrow_forward</Icon>
        </Link>
      )}
      <details>
        <summary>
          All probabilities <Icon>expand_more</Icon>
        </summary>
        <MatchDetails match={match} odds={odds} />
      </details>
    </article>
  );
}
export function MatchList({ matches, oddsById = {} }) {
  const [selected, setSelected] = useState([]);
  const comparison = matches
    .filter((m) => selected.includes(matchKey(m)))
    .slice(0, 3);
  useEffect(() => {
    const available = new Set(matches.map(matchKey));
    if (selected.some((key) => !available.has(key)))
      setSelected(selected.filter((key) => available.has(key)));
  }, [matches, selected]);
  function toggleCompare(m) {
    const key = matchKey(m),
      active = comparison.map(matchKey);
    setSelected(
      active.includes(key)
        ? active.filter((k) => k !== key)
        : active.length < 3
          ? [...active, key]
          : active,
    );
  }
  return (
    <div className="v2-match-list">
      <Comparison
        matches={comparison}
        onRemove={(key) => setSelected(selected.filter((k) => k !== key))}
        onClear={() => setSelected([])}
      />
      {matches.map((m) => (
        <article
          className="v2-match-line"
          key={m.id ?? `${m.home}-${m.away}-${m.utcDate}`}
        >
          <div className="v2-line-overview">
            <div>
              <Link className="v2-fixture-title" to={matchPath(m)}>
                <span className="v2-mini-teams">
                  <TeamBadge name={m.home} />
                  <TeamBadge name={m.away} />
                </span>
                <strong>
                  {m.home} <span className="v2-vs">vs</span> {m.away}
                </strong>
              </Link>
              <small>
                <Competition code={m.comp} /> ·{" "}
                {dateLabel(m.utcDate || m.matchDate)} · Warsaw
              </small>
              <Kickoff value={m.utcDate} />
            </div>
            <div className="v2-line-signal">
              <span>{pickLabel(m)}</span>
              <small>AI prediction</small>
            </div>
            <div className="v2-line-score">
              <strong>{percent(m.conf)}</strong>
              <small>Confidence</small>
            </div>
            <SaveButton match={m} />
          </div>
          <button
            className="v2-compare-toggle"
            aria-pressed={comparison.some((x) => matchKey(x) === matchKey(m))}
            disabled={
              comparison.length >= 3 &&
              !comparison.some((x) => matchKey(x) === matchKey(m))
            }
            onClick={() => toggleCompare(m)}
            aria-label={`Compare ${m.home} vs ${m.away}`}
          >
            <Icon>compare_arrows</Icon>
            {comparison.some((x) => matchKey(x) === matchKey(m))
              ? "Added to comparison"
              : "Compare match"}
          </button>
          <details>
            <summary>
              Match analysis <Icon>expand_more</Icon>
            </summary>
            <MatchDetails match={m} odds={oddsById[m.matchId]} />
          </details>
        </article>
      ))}
    </div>
  );
}
export function Proof({ stats, loading }) {
  return (
    <aside className="v2-proof">
      <p className="v2-eyebrow">Results, in the open.</p>
      <strong>
        {loading ? "—" : stats ? `${stats.rate.toFixed(1)}%` : "—"}
      </strong>
      <p>Hit rate · recent settled predictions</p>
      <div className="v2-proof-track">
        <span style={{ width: `${stats?.rate || 0}%` }} />
      </div>
      <div className="v2-proof-counts">
        <span>{stats?.hits ?? "—"} correct</span>
        <span>{stats?.total ?? "—"} settled</span>
      </div>
      <p className="v2-fine">
        Confidence 80%+ · up to 500 recent results. Historical performance does
        not guarantee future results.
      </p>
      <Link className="v2-text-link" to="/track-record">
        Explore track record <Icon>arrow_forward</Icon>
      </Link>
    </aside>
  );
}

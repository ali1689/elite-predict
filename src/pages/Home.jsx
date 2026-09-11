import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAllPredictions } from "@/lib/usePredictions";
import { useTrackRecord, computeStats } from "@/lib/useTrackRecord";
import { LeagueLinks } from "@/components/FootballIdentity";
import {
  Community,
  Empty,
  ErrorState,
  Icon,
  Loading,
  MatchCard,
  Proof,
} from "@/components/V2";
export default function Home() {
  const { data, loading, error } = useAllPredictions(),
    results = useTrackRecord();
  const picks = useMemo(
    () =>
      [...data]
        .filter((m) => m.signal !== "No strong signal")
        .sort((a, b) => b.conf - a.conf)
        .slice(0, 3),
    [data],
  );
  const stats = useMemo(() => computeStats(results.data), [results.data]);
  return (
    <main className="v2-page v2-home">
      <section className="v2-home-hero">
        <div className="v2-hero-copy">
          <p className="v2-eyebrow">Football analysis, powered by AI</p>
          <h1>
            AI Football Predictions <em>Today</em>
          </h1>
          <p>
            See the likely goals, match outcomes and model picks. Follow your
            football with a clearer view.
          </p>
          <div className="v2-actions">
            <Link className="v2-button" to="/today">
              Today’s predictions <Icon>arrow_forward</Icon>
            </Link>
            <Link className="v2-text-link" to="/predictions">
              Upcoming matches <Icon>north_east</Icon>
            </Link>
          </div>
          <div className="v2-hero-caption">
            <Icon>analytics</Icon>AI analysis<span>·</span>Public results
            <span>·</span>Free account
          </div>
        </div>
        <div className="v2-hero-match">
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorState />
          ) : picks[0] ? (
            <MatchCard match={picks[0]} spotlight />
          ) : (
            <Empty title="New predictions coming soon">
              Check the upcoming schedule for available fixtures.
            </Empty>
          )}
        </div>
      </section>
      <LeagueLinks />
      <section className="v2-home-evidence">
        <div>
          <p className="v2-eyebrow">Your first prediction</p>
          <h2>One match. Three simple steps.</h2>
          <ol className="v2-quick-steps">
            {[
              [
                "sports_soccer",
                "Choose a match",
                "Today or the upcoming schedule.",
              ],
              [
                "bar_chart",
                "Read the prediction",
                "A model pick, backed by probabilities.",
              ],
              [
                "bookmark",
                "Save and follow",
                "Check settled outcomes in your watchlist.",
              ],
            ].map(([icon, title, text]) => (
              <li key={title}>
                <Icon>{icon}</Icon>
                <div>
                  <strong>{title}</strong>
                  <small>{text}</small>
                </div>
              </li>
            ))}
          </ol>
          <Link className="v2-text-link" to="/guide">
            How to read the numbers <Icon>arrow_forward</Icon>
          </Link>
        </div>
        {results.error ? (
          <ErrorState />
        ) : (
          <Proof stats={stats} loading={results.loading} />
        )}
      </section>
      {picks.length > 1 && (
        <section className="v2-home-picks">
          <div className="v2-section-title">
            <h2>Featured match predictions</h2>
            <Link to="/predictions" className="v2-text-link">
              All matches →
            </Link>
          </div>
          <div className="v2-card-grid">
            {picks.slice(1).map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}
      <Community />
    </main>
  );
}

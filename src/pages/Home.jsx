import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAllPredictions } from "@/lib/usePredictions";
import { useTrackRecord, computeStats } from "@/lib/useTrackRecord";
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
    ),
    stats = useMemo(() => computeStats(results.data), [results.data]);
  return (
    <main className="v2-page v2-home">
      <section className="v2-home-hero">
        <div className="v2-hero-copy">
          <p className="v2-eyebrow">Football intelligence, in perspective</p>
          <h1>
            The beautiful game.
            <br />
            <em>A clearer view.</em>
          </h1>
          <p>
            Read the match before the whistle. Explore model predictions, follow
            your fixtures, and see how the results unfold.
          </p>
          <div className="v2-actions">
            <Link className="v2-button" to="/today">
              Explore matchday <Icon>arrow_forward</Icon>
            </Link>
            <Link className="v2-text-link" to="/track-record">
              See the track record <Icon>north_east</Icon>
            </Link>
          </div>
          <div className="v2-hero-caption">
            <Icon>analytics</Icon>Clear probabilities <span>·</span> Public
            results <span>·</span> Your saved matches
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
            <Empty title="The next matchday is on its way">
              New predictions appear here when available.
            </Empty>
          )}
        </div>
      </section>
      <section className="v2-home-evidence">
        <div>
          <p className="v2-eyebrow">
            A little more understanding. A lot less noise.
          </p>
          <h2>
            Built around the way
            <br />
            you follow football.
          </h2>
          <p className="v2-muted">
            Start with a match. Explore its markets. Save the fixtures that
            matter to you. Then return to the results.
          </p>
          <Link className="v2-text-link" to="/guide">
            Get to know the model <Icon>arrow_forward</Icon>
          </Link>
        </div>
        {results.error ? (
          <ErrorState />
        ) : (
          <Proof stats={stats} loading={results.loading} />
        )}
      </section>
      <section>
        <div className="v2-section-title">
          <div>
            <p className="v2-eyebrow">One engine. Every matchday.</p>
            <h2>Find your next perspective.</h2>
          </div>
        </div>
        <div className="v2-tool-grid">
          {[
            {
              to: "/today",
              icon: "today",
              no: "01",
              title: "Matchday",
              body: "Today’s model picks, with the confidence and context to understand them.",
            },
            {
              to: "/predictions",
              icon: "calendar_month",
              no: "02",
              title: "Upcoming",
              body: "Browse the schedule. Compare markets. Find your team’s next fixture.",
            },
            {
              to: "/saved",
              icon: "bookmark",
              no: "03",
              title: "Your watchlist",
              body: "Keep the matches you care about together, saved on this browser.",
            },
          ].map((t) => (
            <Link className="v2-tool" key={t.to} to={t.to}>
              <div>
                <Icon>{t.icon}</Icon>
                <span>{t.no}</span>
              </div>
              <h3>{t.title}</h3>
              <p>{t.body}</p>
              <span className="v2-text-link">
                Explore <Icon>arrow_forward</Icon>
              </span>
            </Link>
          ))}
        </div>
      </section>
      {picks.length > 1 && (
        <section className="v2-home-picks">
          <div className="v2-section-title">
            <h2>Also on the radar</h2>
            <Link to="/predictions" className="v2-text-link">
              Full schedule <Icon>arrow_forward</Icon>
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

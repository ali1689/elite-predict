import { useMemo } from "react";
import { Link } from "react-router-dom";
import { LeagueLinks, TeamBadge } from "@/components/FootballIdentity";
import { matchPath } from "@/lib/seo";
import { dateLabel } from "@/lib/presentation";
import { useAllPredictions } from "@/lib/usePredictions";
import { useAuth } from "@/context/AuthContext";
import SignInGate from "@/components/SignInGate";
import MatchBrowser from "@/components/MatchBrowser";
import {
  Community,
  Empty,
  ErrorState,
  Loading,
  MatchCard,
  PageHeading,
} from "@/components/V2";
export default function Predictions({ league }) {
  const { data, loading, error, lastFetch } = useAllPredictions(),
    { user, loading: authLoading } = useAuth();
  const previewIds = useMemo(
    () =>
      new Set(
        [...data]
          .sort((a, b) => b.conf - a.conf)
          .slice(0, 3)
          .map((m) => m.id),
      ),
    [data],
  );
  const leagueMatches = league
    ? data.filter((m) => m.comp === league.code || m.comp === league.name)
    : data;
  return (
    <main className="v2-page">
      <PageHeading
        eyebrow={
          league
            ? `${league.country} · Football match analysis`
            : "Football match analysis"
        }
        title={
          league
            ? `${league.name} predictions`
            : "Upcoming football predictions"
        }
        description={
          league
            ? `AI match analysis and goal probabilities for ${league.name} fixtures.`
            : "Find a match. Compare the probabilities. Save your picks."
        }
      >
        <span className="v2-freshness">
          {lastFetch
            ? `Fetched ${lastFetch.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
            : "Awaiting match data"}
        </span>
      </PageHeading>
      {loading || authLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState retry={() => window.location.reload()} />
      ) : league && !leagueMatches.length ? (
        <Empty title={`No ${league.name} fixtures available yet`}>
          <p>New fixtures appear here when predictions are available.</p>
          <Link className="v2-text-link" to="/predictions">
            Browse all football predictions →
          </Link>
        </Empty>
      ) : (
        <MatchBrowser key={league?.code || "all"} matches={leagueMatches}>
          {user
            ? undefined
            : (filtered) => (
                <>
                  <p className="v2-fine">
                    Browse fixtures below. Sign in for full analysis; featured
                    prediction cards are free to preview.
                  </p>
                  <div className="v2-card-grid">
                    {filtered
                      .filter((m) => previewIds.has(m.id))
                      .map((m) => (
                        <MatchCard key={m.id} match={m} />
                      ))}
                  </div>
                  <div className="v2-public-fixtures">
                    {filtered
                      .filter((m) => !previewIds.has(m.id))
                      .slice(0, 20)
                      .map((m) => (
                        <Link
                          className="v2-public-fixture"
                          key={m.id}
                          to={matchPath(m)}
                        >
                          <span className="v2-mini-teams">
                            <TeamBadge name={m.home} />
                            <TeamBadge name={m.away} />
                          </span>
                          <span>
                            <strong>
                              {m.home} vs {m.away}
                            </strong>
                            <small>
                              {dateLabel(m.utcDate || m.matchDate)} · Warsaw
                            </small>
                          </span>
                          <span>View prediction →</span>
                        </Link>
                      ))}
                  </div>
                  {filtered.length ? (
                    <SignInGate
                      lockedLabel={`${filtered.length} upcoming matches`}
                      description="Sign in to browse the full schedule and explore every match’s model probabilities."
                    />
                  ) : (
                    <Empty>Try another team or reset your filters.</Empty>
                  )}
                </>
              )}
        </MatchBrowser>
      )}
      <LeagueLinks />
      <Community />
    </main>
  );
}

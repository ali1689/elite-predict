import { useMemo } from "react";
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
export default function Predictions() {
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
  return (
    <main className="v2-page">
      <PageHeading
        eyebrow="A look ahead"
        title="See the next match clearly."
        description="Find a fixture. Compare its markets. Make the numbers make sense."
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
      ) : (
        <MatchBrowser matches={data}>
          {user
            ? undefined
            : (filtered) => (
                <>
                  <p className="v2-fine">
                    Public preview · three featured fixtures across the full
                    schedule.
                  </p>
                  <div className="v2-card-grid">
                    {filtered
                      .filter((m) => previewIds.has(m.id))
                      .map((m) => (
                        <MatchCard key={m.id} match={m} />
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
      <Community />
    </main>
  );
}

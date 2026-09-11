import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useTodayPredictions } from "@/lib/usePredictions";
import { useMatchOdds } from "@/lib/useMatchOdds";
import {
  dateKey,
  dateLabel,
  isPackOpenedToday,
  PACK_EVENT,
} from "@/lib/presentation";
import {
  Community,
  Empty,
  ErrorState,
  Icon,
  Loading,
  Metric,
  PageHeading,
} from "@/components/V2";
import MatchBrowser from "@/components/MatchBrowser";
import SignInGate from "@/components/SignInGate";
export { markPackOpened, isPackOpenedToday } from "@/lib/presentation";
export default function Today() {
  const { user, loading: authLoading } = useAuth(),
    { data, loading, error, lastFetch, refresh } = useTodayPredictions(),
    odds = useMatchOdds();
  const [opened, setOpened] = useState(false);
  useEffect(() => {
    const sync = () => setOpened(isPackOpenedToday(user?.id));
    sync();
    window.addEventListener("focus", sync);
    window.addEventListener(PACK_EVENT, sync);
    window.addEventListener("storage", sync);
    const timer = setInterval(sync, 60000);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener(PACK_EVENT, sync);
      window.removeEventListener("storage", sync);
      clearInterval(timer);
    };
  }, [user?.id]);
  const matches = useMemo(
    () => data.filter((m) => m.signal !== "No strong signal" && m.tier !== "C"),
    [data],
  );
  const avg = matches.length
    ? matches.reduce((s, m) => s + m.conf, 0) / matches.length
    : null;
  return (
    <main className="v2-page">
      <PageHeading
        eyebrow={`Matchday / ${dateLabel(dateKey(), false)}`}
        title="Football predictions today"
        description="Today’s AI picks, goal probabilities and match analysis."
      >
        <button
          className="v2-button secondary"
          onClick={refresh}
          disabled={loading}
        >
          <Icon>refresh</Icon>Refresh
        </button>
      </PageHeading>
      <div className="v2-stats-grid">
        <Metric
          label="Today's picks"
          value={loading ? "—" : matches.length}
          note="Selected model signals"
        />
        <Metric
          label="Average confidence"
          value={loading || avg === null ? "—" : `${avg.toFixed(0)}%`}
          note="Model score, not a guarantee"
        />
        <Metric
          label="Leagues covered today"
          value={loading ? "—" : new Set(matches.map((m) => m.comp)).size}
          note="Across selected fixtures"
        />
        <Metric
          label="Last fetched"
          value={
            lastFetch
              ? lastFetch.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Europe/Warsaw",
                })
              : "—"
          }
          note="Warsaw · refreshes every 5 minutes"
        />
      </div>
      <details className="v2-help">
        <summary>
          <Icon>help</Icon>How to read these predictions{" "}
          <Icon>expand_more</Icon>
        </summary>
        <p>
          The main pick is the existing model’s selected signal. Confidence
          expresses its score; individual market probabilities are separate
          estimates. Expand a fixture for team goals, match goals, match result,
          expected goals and available odds.{" "}
          <Link to="/guide">Read the guide →</Link>
        </p>
      </details>
      {loading || authLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState retry={refresh} />
      ) : !matches.length ? (
        <Empty title="No selected picks for today">
          Check Upcoming for the next fixtures or return after the next update.
        </Empty>
      ) : !user ? (
        <SignInGate
          lockedLabel={`${matches.length} matchday picks`}
          description="Create an account, then open your free daily pack to explore today’s predictions."
        />
      ) : !opened ? (
        <section className="v2-gate">
          <span className="v2-gate-icon">
            <Icon>style</Icon>
          </span>
          <div>
            <p className="v2-eyebrow">Your daily selection is ready</p>
            <h2>Open today’s pack.</h2>
            <p>
              Reveal your daily predictions, then save the fixtures you want to
              follow.
            </p>
            <Link className="v2-button" to="/open">
              Open daily pack <Icon>arrow_forward</Icon>
            </Link>
          </div>
        </section>
      ) : (
        <MatchBrowser
          matches={matches}
          oddsById={odds}
          defaultSort="conf"
          showDates={false}
        />
      )}
      <Community />
    </main>
  );
}

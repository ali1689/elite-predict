import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { normalize, useAllPredictions } from "@/lib/usePredictions";
import { useAuth } from "@/context/AuthContext";
import { applySeo } from "@/components/Seo";
import { matchPath, leagueFor } from "@/lib/seo";
import { TeamBadge, Competition } from "@/components/FootballIdentity";
import {
  MatchCard,
  PageHeading,
  Loading,
  ErrorState,
  Empty,
} from "@/components/V2";
import { dateLabel } from "@/lib/presentation";
import SignInGate from "@/components/SignInGate";
export default function MatchPrediction() {
  const { id } = useParams(),
    { user, loading: authLoading } = useAuth(),
    schedule = useAllPredictions();
  const [state, setState] = useState({
    loading: true,
    match: null,
    error: false,
  });
  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, match: null, error: false });
    applySeo(
      {
        title: "Football Match Prediction",
        description: "Football match details and AI prediction analysis.",
      },
      null,
    );
    if (!/^(?:\d+|[a-f0-9-]{36})$/i.test(id)) {
      setState({ loading: false, match: null, error: false });
      return;
    }
    supabase
      .from("predictions")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!cancelled)
          setState({
            loading: false,
            match: data ? normalize(data) : null,
            error: !!error,
          });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, match: null, error: true });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);
  const m = state.match;
  useEffect(() => {
    if (state.loading) return;
    if (!m) {
      applySeo(
        {
          title: state.error
            ? "Prediction temporarily unavailable"
            : "Prediction unavailable",
          description: "Browse the available football match predictions.",
          noindex: !state.error,
        },
        null,
      );
      return;
    }
    applySeo(
      {
        title: `${m.home} vs ${m.away} Prediction`,
        description: `${m.home} vs ${m.away} football prediction for ${dateLabel(m.utcDate || m.matchDate, false)}. Explore the fixture, AI goal estimates and match-result analysis.`,
      },
      matchPath(m),
    );
  }, [m, state.loading, state.error]);
  if (state.loading)
    return (
      <main className="v2-page">
        <Loading />
      </main>
    );
  if (state.error)
    return (
      <main className="v2-page">
        <ErrorState retry={() => window.location.reload()} />
      </main>
    );
  if (!m)
    return (
      <main className="v2-page">
        <PageHeading
          title="Prediction unavailable"
          description="This fixture is no longer available in the prediction feed."
        />
        <Link className="v2-button" to="/predictions">
          Browse upcoming matches
        </Link>
      </main>
    );
  const preview = [...schedule.data]
    .sort((a, b) => b.conf - a.conf)
    .slice(0, 3)
    .some((x) => x.id === m.id);
  const league = leagueFor(m.comp);
  return (
    <main className="v2-page v2-match-page">
      <nav className="v2-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link to={league ? `/leagues/${league.slug}` : "/predictions"}>
          {league?.name || "Football predictions"}
        </Link>
      </nav>
      <PageHeading
        eyebrow="Football match analysis"
        title={`${m.home} vs ${m.away} prediction`}
        description={`${dateLabel(m.utcDate || m.matchDate)} · Warsaw time`}
      />
      {authLoading ? (
        <Loading />
      ) : user || preview ? (
        <MatchCard match={m} showLink={false} />
      ) : (
        <>
          <section className="v2-panel">
            <Competition code={m.comp} />
            <div className="v2-teams">
              <h2>
                <TeamBadge name={m.home} />
                {m.home}
              </h2>
              <span>vs</span>
              <h2>
                <TeamBadge name={m.away} />
                {m.away}
              </h2>
            </div>
          </section>
          <SignInGate
            lockedLabel="Match probabilities and analysis"
            description="Sign in to see the model pick, confidence score and goal probabilities for this fixture."
          />
        </>
      )}
      <p className="v2-fine">
        Model estimates are not guarantees. Fixture times can change.
      </p>
      <Link className="v2-text-link" to="/guide">
        How to read a football prediction →
      </Link>
    </main>
  );
}

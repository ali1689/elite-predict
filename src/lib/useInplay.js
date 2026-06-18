import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const POLL_INTERVAL_MS = 60_000; // 1 minute

function normalizeInplay(row) {
  return {
    id:              row.id,
    matchId:         row.match_id,
    fixtureId:       row.fixture_id,
    competition:     row.competition      ?? "",
    home:            row.home_team        ?? "",
    away:            row.away_team        ?? "",
    minute:          row.minute           ?? 0,
    homeScore:       row.home_score       ?? 0,
    awayScore:       row.away_score       ?? 0,
    status:          row.status           ?? "",
    pHomeWin:        row.p_home_win       ?? 0,
    pDraw:           row.p_draw           ?? 0,
    pAwayWin:        row.p_away_win       ?? 0,
    pOver25:         row.p_over25         ?? 0,
    pBtts:           row.p_btts           ?? 0,
    pOver15:         row.p_over15         ?? 0,
    pUnder25:        row.p_under25        ?? 0,
    pHomeOver05:     row.p_home_over05    ?? 0,
    pHomeOver15:     row.p_home_over15    ?? 0,
    pAwayOver05:     row.p_away_over05    ?? 0,
    pAwayOver15:     row.p_away_over15    ?? 0,
    lambdaHomeRem:   row.lambda_home_rem  ?? 0,
    lambdaAwayRem:   row.lambda_away_rem  ?? 0,
    primarySignal:   row.primary_signal   ?? "",
    confidence:      row.confidence       ?? 0,
    updatedAt:       row.updated_at       ?? "",
  };
}

export function useInplayPredictions() {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const load = useCallback(async () => {
    try {
      // Only fetch records updated in the last 10 minutes.
      // Matches that finish stop being pushed by the pipeline, so their
      // updated_at becomes stale — this filter prunes those "zombie" cards.
      const cutoff = new Date(Date.now() - 10 * 60 * 1000).toISOString();
      const { data: rows, error: err } = await supabase
        .from("inplay_predictions")
        .select("*")
        .gte("updated_at", cutoff)
        .order("minute", { ascending: false })
        .limit(200);
      if (err) throw err;
      setData((rows || []).map(normalizeInplay));
      setLastFetch(new Date());
      setError(null);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data, loading, error, lastFetch, refresh: load };
}

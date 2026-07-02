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

// ── Live VALUE bets (in-play risky tier) ──────────────────────────────────────
function normalizeLiveValue(row) {
  return {
    id:          `${row.match_id}__${row.market}`,
    matchId:     row.match_id,
    competition: row.competition ?? "",
    home:        row.home_team   ?? "",
    away:        row.away_team   ?? "",
    minute:      row.minute      ?? 0,
    status:      row.status      ?? "",
    homeScore:   row.home_score  ?? 0,
    awayScore:   row.away_score  ?? 0,
    market:      row.market      ?? "",
    modelProb:   row.model_prob  ?? 0,
    impliedProb: row.implied_prob ?? 0,
    edge:        row.edge        ?? 0,
    odds:        Number(row.decimal_odds ?? 0),
  };
}

export function useLiveValue() {
  const [data, setData] = useState([]);

  const load = useCallback(async () => {
    try {
      // Currently-live picks: updated within the last 20 minutes. Live value is
      // transient (it only clears the edge bar in bursts), so this keeps a
      // recently-spotted pick on the strip a little longer.
      const cutoff = new Date(Date.now() - 20 * 60 * 1000).toISOString();
      const { data: rows, error } = await supabase
        .from("live_value")
        .select("*")
        .eq("result_settled", false)
        .gte("updated_at", cutoff)
        .order("updated_at", { ascending: false })   // freshest first
        .limit(120);
      if (error) return;
      // One pick per match — keep the freshest (the current best market); older
      // markets from earlier minutes linger in the table but shouldn't show.
      const seen = new Set();
      const current = [];
      for (const r of (rows || [])) {
        if (seen.has(r.match_id)) continue;
        seen.add(r.match_id);
        current.push(r);
      }
      current.sort((a, b) => (b.edge ?? 0) - (a.edge ?? 0));   // display by edge
      setData(current.map(normalizeLiveValue));
    } catch (_) { /* best-effort */ }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [load]);

  return { data };
}

// ── Settled live value picks — for the Track Record "Live Value" ROI bucket ──
function normalizeLiveSettled(row) {
  return {
    id:          `${row.match_id}__${row.market}`,
    home:        row.home_team   ?? "",
    away:        row.away_team   ?? "",
    competition: row.competition ?? "",
    market:      row.market      ?? "",
    odds:        Number(row.decimal_odds ?? 0),
    edge:        row.edge        ?? 0,
    modelProb:   row.model_prob  ?? 0,
    impliedProb: row.implied_prob ?? 0,
    correct:     row.result_correct,
    homeScore:   row.home_score  ?? null,
    awayScore:   row.away_score  ?? null,
    matchDate:   row.match_date,
  };
}

export function useLiveValueRecord({ limit = 500 } = {}) {
  const [data, setData] = useState([]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { data: rows, error } = await supabase
          .from("live_value")
          .select("*")
          .eq("result_settled", true)
          .not("result_correct", "is", null)
          .order("updated_at", { ascending: false })
          .limit(limit);
        if (cancelled) return;
        if (!error) setData((rows || []).map(normalizeLiveSettled));
      } catch (_) { /* best-effort */ }
    }
    load();
    return () => { cancelled = true; };
  }, [limit]);

  return { data };
}

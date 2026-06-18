import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

// ── Compute the best displayable signal from stored (Poisson) probabilities ──
// The backend selects primary_signal using a blended probability (clf + Poisson),
// but only the Poisson component is stored in the DB. This can cause the displayed
// signal to contradict the shown percentages. We recompute from stored probs using
// the same market weights so the UI is always internally consistent.
// Falls back to primary_signal for markets not covered here (1X2, Double Chance).
function computeDisplaySignal(row) {
  const h05  = row.home_over05 ?? 0;
  const a05  = row.away_over05 ?? 0;
  const h15  = row.home_over15 ?? 0;
  const a15  = row.away_over15 ?? 0;
  const o15  = row.over15      ?? 0;
  const o25  = row.over25      ?? 0;
  const u25  = row.under25     ?? 0;
  const btts = row.btts        ?? 0;

  // Thresholds (matching backend DEFAULT_THRESHOLDS × 100) and market weights
  const candidates = [
    { label: "Home Over 0.5 Goals", prob: h05,  thr: 72, w: 1.00 },
    { label: "Away Over 0.5 Goals", prob: a05,  thr: 68, w: 0.98 },
    { label: "Over 1.5 Goals",      prob: o15,  thr: 72, w: 0.95 },
    { label: "Home Over 1.5 Goals", prob: h15,  thr: 58, w: 0.88 },
    { label: "Away Over 1.5 Goals", prob: a15,  thr: 52, w: 0.85 },
    { label: "Both Teams to Score", prob: btts, thr: 60, w: 0.78 },
    { label: "Under 2.5 Goals",     prob: u25,  thr: 57, w: 0.74 },
    { label: "Over 2.5 Goals",      prob: o25,  thr: 58, w: 0.70 },
  ];

  // Priority override: Over 1.5 ≥ 80% + strong scoring support → better value than Over 0.5
  if (o15 >= 80 && (h05 >= 75 || a05 >= 75)) {
    return "Over 1.5 Goals";
  }

  const best = candidates
    .filter(c => c.prob >= c.thr)
    .sort((a, b) => (b.prob * b.w) - (a.prob * a.w))[0];

  return best?.label ?? (row.primary_signal ?? "No strong signal");
}

// Normalise Supabase snake_case to camelCase
function normalize(row) {
  let allSignals = [];
  try {
    allSignals = typeof row.all_signals === "string"
      ? JSON.parse(row.all_signals)
      : (row.all_signals || []);
  } catch (_) {}

  return {
    id:          row.id,
    utcDate:     row.utc_date,
    matchDate:   row.match_date,
    comp:        row.comp,
    home:        row.home,
    away:        row.away,
    homeElo:     row.home_elo  ?? 1500,
    awayElo:     row.away_elo  ?? 1500,
    eloDiff:     (row.home_elo ?? 1500) - (row.away_elo ?? 1500),
    signal:      computeDisplaySignal(row),
    tier:        row.primary_tier   ?? "B",
    conf:        row.conf           ?? 0,
    homeOver05:  row.home_over05    ?? 0,
    homeOver15:  row.home_over15    ?? 0,
    awayOver05:  row.away_over05    ?? 0,
    awayOver15:  row.away_over15    ?? 0,
    btts:        row.btts           ?? 0,
    over15:      row.over15         ?? 0,   // Over 1.5 Goals
    over25:      row.over25         ?? 0,
    under25:     row.under25        ?? 0,
    lH:          row.l_h            ?? 0,
    lA:          row.l_a            ?? 0,
    xgTotal:     row.xg_total       ?? 0,
    // 1X2 match result probabilities
    homeWin:     row.home_win       ?? row.p_home_win ?? 0,
    draw:        row.draw           ?? row.p_draw     ?? 0,
    awayWin:     row.away_win       ?? row.p_away_win ?? 0,
    // Double Chance
    dc1X:        row.dc_1x          ?? row.p_1x       ?? 0,
    dcX2:        row.dc_x2          ?? row.p_x2       ?? 0,
    dc12:        row.dc_12          ?? row.p_12       ?? 0,
    allSignals,
    homeScore:   row.home_over05    ?? 0,
    awayScore:   row.away_over05    ?? 0,
    league:      row.comp,
  };
}

// Retry helper — waits `ms` ms then resolves
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// Generic hook
export function usePredictions({ dateFilter = null, limit = 300, futureOnly = false } = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);

      const MAX_RETRIES = 4;
      const DELAYS = [1500, 3000, 6000, 10000]; // ms between attempts

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;
        try {
          let query = supabase
            .from("predictions")
            .select("*")
            .order("utc_date", { ascending: true })
            .limit(limit);

          if (dateFilter) {
            query = query.eq("match_date", dateFilter);
          }

          if (futureOnly) {
            const todayUTC = new Date().toLocaleDateString("en-CA", { timeZone: "UTC" });
            query = query.gte("match_date", todayUTC);
          }

          const { data: rows, error: err } = await query;
          if (cancelled) return;
          if (err) throw err;
          setData((rows || []).map(normalize));
          setLastFetch(new Date());
          setError(null);
          setLoading(false);
          return; // success
        } catch (e) {
          if (cancelled) return;
          if (attempt < MAX_RETRIES) {
            // Database is waking up (Supabase free tier) — retry after delay
            await sleep(DELAYS[attempt]);
          } else {
            setError(e);
            setLoading(false);
          }
        }
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dateFilter, limit, futureOnly]);

  return { data, loading, error, lastFetch };
}

// Today hook — shows the closest upcoming day's predictions in Warsaw time.
// The pipeline runs at 06:00 Warsaw and may generate for today OR tomorrow.
// Strategy: try today's match_date first; if empty, fall back to tomorrow.
export function useTodayPredictions() {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch today's matches in Warsaw time only.
        // We do NOT fall through to tomorrow — the pipeline stores the whole
        // week so falling through would silently show future-day picks.
        // If today has no data, the page shows "No picks today".
        const todayWarsaw = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });

        const { data: fetched, error: err } = await supabase
          .from("predictions")
          .select("*")
          .eq("match_date", todayWarsaw)
          .order("utc_date", { ascending: true })
          .limit(200);

        if (err) throw err;
        const rows = (fetched && fetched.length > 0) ? fetched : null;

        if (cancelled) return;
        setData((rows || []).map(normalize));
        setLastFetch(new Date());
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error, lastFetch };
}

// All upcoming hook - only future matches, ordered by date ascending
export function useAllPredictions() {
  return usePredictions({ limit: 500, futureOnly: true });
}

// ── Player goalscorer hook ────────────────────────────────────────────────
function parseFixtureKey(key = "") {
  // fixture_key format: "home_team__away_team__YYYY-MM-DD"
  const parts = key.split("__");
  if (parts.length < 3) return { homeTeam: "", awayTeam: "", matchDate: "", matchDateRaw: "" };
  const fmt = s => s.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  const dateStr = parts[2]; // "2026-06-06"
  let matchDate = "";
  try {
    matchDate = new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", timeZone: "UTC",
    });
  } catch (_) { matchDate = dateStr; }
  return { homeTeam: fmt(parts[0]), awayTeam: fmt(parts[1]), matchDate, matchDateRaw: dateStr };
}

function normalizePlayer(row) {
  const { homeTeam, awayTeam, matchDate, matchDateRaw } = parseFixtureKey(row.fixture_key);
  return {
    id:          row.id,
    matchId:     row.match_id,
    fixtureKey:  row.fixture_key  ?? "",
    homeTeam,
    awayTeam,
    matchDate,
    matchDateRaw,
    teamId:      row.team_id      ?? 0,
    side:        row.side         ?? "",
    playerId:    row.player_id    ?? 0,
    playerName:  row.player_name  ?? "Unknown",
    position:    row.position     ?? "",
    goalsSeason: row.goals_season ?? 0,
    gamesSeason: row.games_season ?? 0,
    pAnytime:    row.p_anytime    ?? 0,
    adjLambda:   row.adj_lambda   ?? 0,
    computedAt:  row.computed_at  ?? "",
  };
}

export function usePlayerPredictions({ matchId = null, limit = 500 } = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase
          .from("player_goal_proba")
          .select("*")
          .order("p_anytime", { ascending: false })
          .limit(limit);

        if (matchId) query = query.eq("match_id", matchId);

        const { data: rows, error: err } = await query;
        if (cancelled) return;
        if (err) throw err;
        setData((rows || []).map(normalizePlayer));
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [matchId, limit]);

  return { data, loading, error };
}

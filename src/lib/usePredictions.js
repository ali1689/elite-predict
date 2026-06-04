import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";

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
    signal:      row.primary_signal ?? "No strong signal",
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
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [dateFilter, limit, futureOnly]);

  return { data, loading, error, lastFetch };
}

// Today hook — shows today's matches in Warsaw timezone.
// Queries yesterday + today UTC to handle the 00:00–02:00 Warsaw window
// where UTC has already flipped to the next day.
// Client-side: keeps only matches whose Warsaw date = today Warsaw.
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
        // Show matches within a 24-hour rolling window centred on now.
        // This handles late-night Warsaw users (01:00–02:00) who are technically
        // on the "next day" by clock but still want to see tonight's matches.
        const windowStart = new Date(Date.now() - 4  * 3600000).toISOString(); // 4h ago
        const windowEnd   = new Date(Date.now() + 20 * 3600000).toISOString(); // 20h ahead

        const { data: rows, error: err } = await supabase
          .from("predictions")
          .select("*")
          .gte("utc_date", windowStart)
          .lte("utc_date", windowEnd)
          .order("utc_date", { ascending: true })
          .limit(200);

        if (cancelled) return;
        if (err) throw err;

        const todayRows = rows || [];

        setData(todayRows.map(normalize));
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

import { useState, useEffect } from "react";
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
    over25:      row.over25         ?? 0,
    under25:     row.under25        ?? 0,
    lH:          row.l_h            ?? 0,
    lA:          row.l_a            ?? 0,
    xgTotal:     row.xg_total       ?? 0,
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
          const todayWarsaw = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
          query = query.gte("match_date", todayWarsaw);
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

// Today hook - Warsaw timezone
export function useTodayPredictions() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
  return usePredictions({ dateFilter: today });
}

// All upcoming hook - only future matches, ordered by date ascending
export function useAllPredictions() {
  return usePredictions({ limit: 500, futureOnly: true });
}

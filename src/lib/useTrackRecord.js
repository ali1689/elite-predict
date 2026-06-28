import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Mirrors the same logic as usePredictions.js deriveTier()
const SIGNAL_THRESHOLDS = {
  "Home Over 0.5 Goals":  0.70,
  "Away Over 0.5 Goals":  0.68,
  "Over 1.5 Goals":       0.63,
  "Home Over 1.5 Goals":  0.57,
  "Away Over 1.5 Goals":  0.52,
  "Both Teams to Score":  0.60,
  "Under 2.5 Goals":      0.57,
  "Over 2.5 Goals":       0.58,
  "Under 1.5 Goals":      0.55,
  "Home Clean Sheet":     0.52,
  "Away Clean Sheet":     0.50,
  "Home Win (1)":         0.58,
  "Away Win (2)":         0.55,
  "Draw (X)":             0.55,
  "Double Chance 1X":     0.74,
  "Double Chance X2":     0.74,
  "Double Chance 12":     0.76,
};

function deriveTier(signal, conf, backendTier) {
  if (backendTier && backendTier !== "B") return backendTier;
  const c      = (conf ?? 0) / 100;
  const thr    = SIGNAL_THRESHOLDS[signal] ?? 0.60;
  const denom  = Math.max(1 - thr, 0.01);
  const margin = (c - thr) / denom;
  if (margin >= 0.35) return "A";
  if (margin >= 0.12) return "B";
  return "C";
}

function normalizeResult(row) {
  return {
    id:            row.id,
    matchId:       row.match_id,
    matchDate:     row.match_date,
    comp:          row.comp,
    home:          row.home,
    away:          row.away,
    signal:        row.primary_signal ?? "—",
    tier:          deriveTier(row.primary_signal, row.conf, row.primary_tier),
    conf:          row.conf           ?? 0,
    homeScore:     row.home_score     ?? null,
    awayScore:     row.away_score     ?? null,
    correct:       row.result_correct ?? null,
    settled:       row.result_settled ?? false,
  };
}

export function useTrackRecord({ limit = 500 } = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const { data: rows, error: err } = await supabase
          .from("predictions")
          .select("id,match_id,match_date,utc_date,comp,home,away,primary_signal,primary_tier,conf,home_score,away_score,result_correct,result_settled")
          .eq("result_settled", true)
          .gte("conf", 80)
          .order("utc_date", { ascending: false, nullsFirst: false })
          .limit(limit);

        if (cancelled) return;
        if (err) throw err;

        const normalized = (rows || [])
          .map(normalizeResult)
          .filter(r => r.correct !== null); // exclude "No strong signal" nulls

        setData(normalized);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [limit]);

  return { data, loading, error };
}

// ── Past predictions for the Results list ─────────────────────────────────────
// Unlike useTrackRecord (settled-only, used for stats), this returns EVERY past
// pick — both graded (win/loss + score) and not-yet-graded ("pending"). This is
// so old "Today's Predictions" always stay visible in the Track Record's Results
// list, even on days the pipeline hasn't settled yet. Pending rows flip to a
// win/loss automatically once scores are exported.
export function usePastResults({ limit = 500 } = {}) {
  const [data,    setData]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Strictly before today (today's picks live in the "Today's Picks" block).
        const todayWarsaw = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });

        // Stale-pending cutoff: a pending pick normally flips to win/loss within
        // ~24h (the next nightly settle run). Anything still pending after 2 days
        // is stuck on a results coverage gap (e.g. a friendly/tournament whose
        // league isn't refreshed) and will never settle — so we hide it from the
        // Results list rather than showing a permanent "PENDING" row.
        const STALE_PENDING_DAYS = 2;
        const _stale = new Date();
        _stale.setDate(_stale.getDate() - STALE_PENDING_DAYS);
        const stalePendingCutoff = _stale.toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });

        const { data: rows, error: err } = await supabase
          .from("predictions")
          .select("id,match_id,match_date,utc_date,comp,home,away,primary_signal,primary_tier,conf,home_score,away_score,result_correct,result_settled")
          .lt("match_date", todayWarsaw)
          .gte("conf", 80)
          .order("utc_date", { ascending: false, nullsFirst: false })
          .limit(limit);

        if (cancelled) return;
        if (err) throw err;

        const normalized = (rows || [])
          .map(normalizeResult)
          // keep real picks only (drop "No strong signal" / empty rows)
          .filter(r => r.signal && r.signal !== "—" && r.signal !== "No strong signal")
          // hide stale pending rows that will never settle (coverage gap);
          // settled rows always stay, recent pending stays (still settleable)
          .filter(r => r.settled || r.matchDate >= stalePendingCutoff);

        setData(normalized);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [limit]);

  return { data, loading, error };
}

// Derive stats from settled results
export function computeStats(results) {
  const total = results.length;
  if (total === 0) return null;

  const hits   = results.filter(r => r.correct === true).length;
  const misses = results.filter(r => r.correct === false).length;
  const rate   = total > 0 ? (hits / total) * 100 : 0;

  // Current streak (most recent first)
  let streak = 0;
  let streakType = null;
  for (const r of results) {
    if (streakType === null) {
      streakType = r.correct;
      streak = 1;
    } else if (r.correct === streakType) {
      streak++;
    } else {
      break;
    }
  }

  // Signal breakdown
  const bySignal = {};
  for (const r of results) {
    const sig = r.signal;
    if (!bySignal[sig]) bySignal[sig] = { hits: 0, total: 0 };
    bySignal[sig].total++;
    if (r.correct) bySignal[sig].hits++;
  }
  const signalBreakdown = Object.entries(bySignal)
    .map(([sig, { hits: h, total: t }]) => ({
      signal: sig,
      hits: h,
      total: t,
      rate: (h / t) * 100,
    }))
    .sort((a, b) => b.total - a.total);

  // Tier breakdown
  const byTier = { A: { hits: 0, total: 0 }, B: { hits: 0, total: 0 }, C: { hits: 0, total: 0 } };
  for (const r of results) {
    const t = r.tier || "B";
    if (byTier[t]) {
      byTier[t].total++;
      if (r.correct) byTier[t].hits++;
    }
  }

  // Last 7 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 7);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const recent = results.filter(r => r.matchDate >= cutoffStr);
  const recentHits  = recent.filter(r => r.correct).length;
  const recentRate  = recent.length > 0 ? (recentHits / recent.length) * 100 : null;

  return {
    total,
    hits,
    misses,
    rate,
    streak,
    streakType,
    signalBreakdown,
    byTier,
    recentRate,
    recentTotal: recent.length,
  };
}

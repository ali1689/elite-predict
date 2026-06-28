import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Risky "value" picks live in their OWN Supabase table (risky_picks), written by
// the 05b_risky_picks notebook. They are deliberately kept separate from the safe
// `predictions` table so they never touch the headline track record.

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function normalize(row) {
  return {
    id:          `${row.match_id}__${row.market}`,
    matchId:     row.match_id,
    fixtureId:   row.fixture_id,
    market:      row.market          ?? "",
    competition: row.competition     ?? "",
    home:        row.home_team       ?? "",
    away:        row.away_team       ?? "",
    matchDate:   row.match_date,
    utcDate:     row.utc_date,
    modelProb:   row.model_prob      ?? 0,   // %
    impliedProb: row.implied_prob    ?? 0,   // %
    edge:        row.edge            ?? 0,   // percentage points
    odds:        Number(row.decimal_odds ?? 0),
    rank:        row.rank            ?? 99,
    bookmakerId: row.bookmaker_id    ?? 0,
    settled:     row.result_settled  ?? false,
    correct:     row.result_correct  ?? null,
    homeScore:   row.home_score      ?? null,
    awayScore:   row.away_score      ?? null,
    updatedAt:   row.updated_at      ?? "",
  };
}

// Refresh cadence — mirrors useTodayPredictions so the page picks up the daily
// pipeline run without a hard refresh.
const POLL_INTERVAL_MS = 5 * 60 * 1000;

export function useRiskyPicks() {
  const [data,      setData]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load(isBackground = false) {
      if (!isBackground) setLoading(true);

      const MAX_RETRIES = 4;
      const DELAYS = [1500, 3000, 6000, 10000]; // Supabase free-tier wake-up

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        if (cancelled) return;
        try {
          // Today (Warsaw) — only show today's picks, never yesterday's leftovers
          // that haven't been settled/cleaned yet.
          const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
          const { data: rows, error: err } = await supabase
            .from("risky_picks")
            .select("*")
            .eq("result_settled", false)
            .gte("match_date", today)
            .order("rank", { ascending: true })
            .limit(20);

          if (cancelled) return;
          if (err) throw err;

          setData((rows || []).map(normalize));
          setLastFetch(new Date());
          setError(null);
          if (!isBackground) setLoading(false);
          return; // success
        } catch (e) {
          if (cancelled) return;
          if (attempt < MAX_RETRIES) {
            await sleep(DELAYS[attempt]);
          } else {
            setError(e);
            if (!isBackground) setLoading(false);
          }
        }
      }
    }

    load(false);
    const id = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(id); };
  }, []);

  return { data, loading, error, lastFetch };
}

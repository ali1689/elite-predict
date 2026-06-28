import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// Today's bookmaker odds, written by the 05c_odds_enrich notebook into the
// `match_odds` table (keyed by the same match_id as `predictions`). Returns a
// lookup { [matchId]: oddsRow } so the Today cards can show prices + the
// odds-aware "best available bet".

function normalize(row) {
  const num = (v) => (v == null ? null : Number(v));
  return {
    matchId:     row.match_id,
    oddsHome:    num(row.odds_home),
    oddsDraw:    num(row.odds_draw),
    oddsAway:    num(row.odds_away),
    oddsOver05:  num(row.odds_over05),
    oddsOver15:  num(row.odds_over15),
    oddsOver25:  num(row.odds_over25),
    oddsUnder25: num(row.odds_under25),
    oddsBtts:    num(row.odds_btts),
    bestMarket:  row.best_market ?? null,
    bestOdds:    num(row.best_odds),
    bestProb:    row.best_prob ?? null,
  };
}

export function useMatchOdds() {
  const [byId, setById] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
        const { data, error } = await supabase
          .from("match_odds")
          .select("*")
          .eq("match_date", today)
          .limit(300);
        if (cancelled || error) return;
        const map = {};
        (data || []).forEach((r) => { map[r.match_id] = normalize(r); });
        setById(map);
      } catch (_) { /* odds are best-effort; cards render fine without them */ }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return byId;
}

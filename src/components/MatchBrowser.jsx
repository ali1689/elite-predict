import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSaved } from "@/context/SavedContext";
import { filterMatches, leagueName } from "@/lib/presentation";
import { Icon, Empty, MatchList } from "@/components/V2";
import { Favourites } from "@/components/Discovery";
export default function MatchBrowser({
  matches,
  oddsById = {},
  defaultSort = "date",
  showDates = true,
  children,
}) {
  const [params, setParams] = useSearchParams(),
    { saved } = useSaved(),
    [count, setCount] = useState(20);
  const [favourites, setFavourites] = useState([]);
  const forYou = params.get('forYou') === '1';
  const f = {
    search: params.get("q") || "",
    league: params.get("league") || "",
    date: params.get("date") || "",
    tier: params.get("tier") || "",
    min: params.get("min") || 0,
    market: params.get("market") || "",
    sort: params.get("sort") || defaultSort,
    saved: params.get("saved") === "1",
    keys: new Set(saved.map((m) => m.key)),
  };
  const filtered = filterMatches(forYou ? matches.filter(m => favourites.some(fav => fav.type === 'team' ? m.home === fav.value || m.away === fav.value : m.comp === fav.value)) : matches, f),
    leagues = useMemo(
      () => [...new Set(matches.map((m) => m.comp).filter(Boolean))].sort(),
      [matches],
    );
  function update(key, value) {
    setCount(20);
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        value ? next.set(key, value) : next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  return (
    <section className="v2-browser">
      <Favourites matches={matches} only={forYou} onOnly={active => update('forYou', active ? '1' : '')} onChange={setFavourites} />
      <div className="v2-browser-toolbar">
        <div className="v2-tabs">
          <button aria-pressed={!f.saved} onClick={() => update("saved", "")}>
            All matches
          </button>
          <button aria-pressed={f.saved} onClick={() => update("saved", "1")}>
            <Icon>bookmark</Icon>Saved
          </button>
        </div>
        <label className="v2-search">
          <Icon>search</Icon>
          <input
            aria-label="Search teams"
            placeholder="Find your team…"
            value={f.search}
            onChange={(e) => update("q", e.target.value)}
          />
          {f.search && (
            <button aria-label="Clear search" onClick={() => update("q", "")}>
              <Icon>close</Icon>
            </button>
          )}
        </label>
        <label className="v2-sort">
          <span>Sort</span>
          <select
            aria-label="Sort matches"
            value={f.sort}
            onChange={(e) => update("sort", e.target.value)}
          >
            <option value="date">Kickoff</option>
            <option value="conf">Confidence</option>
            <option value="xg">Expected goals</option>
            <option value="over15">Over 1.5 goals</option>
          </select>
        </label>
      </div>
      <details className="v2-filter-panel">
        <summary>
          <Icon>tune</Icon>Filters{" "}
          <span>
            {[f.league, f.date, f.tier, Number(f.min) > 0, f.market].filter(
              Boolean,
            ).length || ""}
          </span>
          <Icon>expand_more</Icon>
        </summary>
        <div className="v2-filter-grid">
          <label>
            League
            <select
              value={f.league}
              onChange={(e) => update("league", e.target.value)}
            >
              <option value="">All leagues</option>
              {leagues.map((l) => (
                <option key={l} value={l}>
                  {leagueName(l)}
                </option>
              ))}
            </select>
          </label>
          {showDates && (
            <label>
              Date
              <select
                value={f.date}
                onChange={(e) => update("date", e.target.value)}
              >
                <option value="">All dates</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="week">Next 7 days</option>
              </select>
            </label>
          )}
          <label>
            Confidence
            <select
              value={f.min}
              onChange={(e) => update("min", e.target.value)}
            >
              <option value="0">Any score</option>
              {[60, 65, 70, 75, 80, 85, 90].map((v) => (
                <option key={v} value={v}>
                  {v}%+
                </option>
              ))}
            </select>
          </label>
          <label>
            Tier
            <select
              value={f.tier}
              onChange={(e) => update("tier", e.target.value)}
            >
              <option value="">All tiers</option>
              {["A", "B", "C"].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            Market
            <select
              value={f.market}
              onChange={(e) => update("market", e.target.value)}
            >
              <option value="">All markets</option>
              <option value="btts">Both teams to score ≥60%</option>
              <option value="over25">Over 2.5 goals ≥60%</option>
            </select>
          </label>
          <button
            className="v2-button secondary"
            onClick={() => {
              setParams({}, { replace: true });
              setCount(20);
            }}
          >
            Reset filters
          </button>
        </div>
      </details>
      <div className="v2-filter-chips" aria-label="Active filters">
        {[
          ["q", f.search, `Team: ${f.search}`],
          ["league", f.league, leagueName(f.league)],
          ["date", f.date, { today: "Today", tomorrow: "Tomorrow", week: "Next 7 days" }[f.date]],
          ["tier", f.tier, `Tier ${f.tier}`],
          ["min", Number(f.min) > 0, `Confidence ${f.min}%+`],
          ["market", f.market, f.market === "btts" ? "Both teams to score ≥60%" : "Over 2.5 goals ≥60%"],
          ["saved", f.saved, "Saved only"],
          ["forYou", forYou, "My favourites"],
        ].filter(([, active]) => active).map(([key, , label]) => (
          <button key={key} onClick={() => update(key, "")} aria-label={`Remove filter: ${label}`}>
            {label}<Icon>close</Icon>
          </button>
        ))}
      </div>
      <div className="v2-section-title">
        <h2>Match schedule</h2>
        <span role="status">{filtered.length} matches · Warsaw time</span>
      </div>
      {children ? (
        children(filtered)
      ) : filtered.length ? (
        <>
          <MatchList matches={filtered.slice(0, count)} oddsById={oddsById} />
          {count < filtered.length && (
            <div className="v2-load-more">
              <button
                className="v2-button secondary"
                onClick={() => setCount((v) => v + 20)}
              >
                Show more matches ({filtered.length - count} remaining)
              </button>
            </div>
          )}
        </>
      ) : (
        <Empty>Try another team or adjust your filters.</Empty>
      )}
    </section>
  );
}

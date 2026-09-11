import { useMemo, useState } from "react";
import {
  useTrackRecord,
  usePastResults,
  computeStats,
} from "@/lib/useTrackRecord";
import {
  dateLabel,
  leagueName,
  mergeResults,
  percent,
} from "@/lib/presentation";
import {
  Empty,
  ErrorState,
  Icon,
  Loading,
  Metric,
  PageHeading,
} from "@/components/V2";
export default function TrackRecord() {
  const settled = useTrackRecord(),
    past = usePastResults();
  const [status, setStatus] = useState("settled"),
    [signal, setSignal] = useState(""),
    [search, setSearch] = useState(""),
    [page, setPage] = useState(1);
  const stats = useMemo(() => computeStats(settled.data), [settled.data]),
    rows = useMemo(
      () => mergeResults(settled.data, past.data),
      [settled.data, past.data],
    );
  const filtered = (
    status === "pending" ? rows.filter((m) => !m.settled) : settled.data
  ).filter(
    (m) =>
      (status !== "wins" || m.correct === true) &&
      (status !== "losses" || m.correct === false) &&
      (!signal || m.signal === signal) &&
      `${m.home} ${m.away}`.toLowerCase().includes(search.toLowerCase()),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / 20)),
    current = Math.min(page, pages),
    dates = settled.data
      .map((m) => m.matchDate)
      .filter(Boolean)
      .sort();
  const updateStatus = (value) => {
    setStatus(value);
    setPage(1);
  };
  return (
    <main className="v2-page">
      <PageHeading
        eyebrow="The evidence behind the engine"
        title="Football prediction results"
        description="Correct picks, missed picks and the numbers behind them."
      />
      {settled.loading ? (
        <Loading />
      ) : settled.error ? (
        <ErrorState retry={() => window.location.reload()} />
      ) : (
        <>
          <div className="v2-stats-grid">
            <Metric
              label="Hit rate"
              value={stats ? `${stats.rate.toFixed(1)}%` : "—"}
              note={`${stats?.hits || 0} correct from ${stats?.total || 0} settled`}
            />
            <Metric
              label="Correct predictions"
              value={stats?.hits || 0}
              note="Within the loaded history"
            />
            <Metric
              label="Missed predictions"
              value={stats?.misses || 0}
              note="Included in the same history"
            />
            <Metric
              label="Last 7 days"
              value={
                stats?.recentRate != null
                  ? `${stats.recentRate.toFixed(1)}%`
                  : "—"
              }
              note={`${stats?.recentTotal || 0} settled predictions`}
            />
          </div>
          <p className="v2-scope">
            <Icon>info</Icon>Scope: up to 500 recent settled predictions with
            confidence ≥80%.{" "}
            {dates.length
              ? `${dateLabel(dates[0], false)} – ${dateLabel(dates.at(-1), false)} ${dates.at(-1).slice(0, 4)}.`
              : "No settled results available."}{" "}
            Headline metrics and the settled list use the same records. Hit rate
            is not a measure of profit.
          </p>
          {stats && (
            <div className="v2-record-grid">
              <section className="v2-panel">
                <h2>By market</h2>
                <p className="v2-muted">
                  Select a market to explore its outcomes.
                </p>
                {stats.signalBreakdown.map((s) => (
                  <button
                    key={s.signal}
                    className={`v2-market-row ${signal === s.signal ? "selected" : ""}`}
                    aria-pressed={signal === s.signal}
                    onClick={() => {
                      setSignal(signal === s.signal ? "" : s.signal);
                      updateStatus("settled");
                    }}
                  >
                    <span>
                      {s.signal}
                      <small>
                        {s.hits} correct / {s.total} settled
                      </small>
                    </span>
                    <strong>{s.rate.toFixed(0)}%</strong>
                    <span className="v2-market-bar">
                      <span style={{ width: `${s.rate}%` }} />
                    </span>
                  </button>
                ))}
              </section>
              <section className="v2-panel">
                <h2>By confidence tier</h2>
                <p className="v2-muted">
                  Sample size matters when comparing tiers.
                </p>
                {Object.entries(stats.byTier).map(
                  ([tier, v]) =>
                    v.total > 0 && (
                      <div className="v2-tier-row" key={tier}>
                        <span className="v2-badge">Tier {tier}</span>
                        <div>
                          <strong>
                            {((v.hits / v.total) * 100).toFixed(0)}%
                          </strong>
                          <small>
                            {v.hits} correct / {v.total} settled
                          </small>
                        </div>
                      </div>
                    ),
                )}
                <p className="v2-fine">
                  Results are scored against final outcomes in the existing data
                  feed. Historical performance does not guarantee future
                  performance.
                </p>
              </section>
            </div>
          )}
          <div className="v2-section-title">
            <h2>Prediction history</h2>
            <span>{filtered.length} results</span>
          </div>
          <div className="v2-browser-toolbar">
            <div className="v2-tabs">
              {[
                ["settled", "Settled"],
                ["wins", "Correct"],
                ["losses", "Missed"],
                ["pending", "Pending"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={status === key}
                  onClick={() => updateStatus(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <label className="v2-search">
              <Icon>search</Icon>
              <input
                aria-label="Search historical teams"
                placeholder="Find a team…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            {signal && (
              <button
                className="v2-button secondary"
                onClick={() => {
                  setSignal("");
                  setPage(1);
                }}
              >
                Clear market <Icon>close</Icon>
              </button>
            )}
          </div>
          {status === "pending" && (
            <p className="v2-fine">
              Recent pending predictions are shown separately and excluded from
              hit-rate calculations. The existing feed hides pending records
              older than two days.
            </p>
          )}
          {status === "pending" && past.loading ? (
            <Loading />
          ) : status === "pending" && past.error ? (
            <ErrorState />
          ) : filtered.length ? (
            <>
              <div className="v2-history">
                {filtered.slice((current - 1) * 20, current * 20).map((m) => (
                  <article key={m.id}>
                    <div>
                      <strong>
                        {m.home} <span className="v2-vs">vs</span> {m.away}
                      </strong>
                      <small>
                        {dateLabel(m.matchDate, false)} · {leagueName(m.comp)}
                      </small>
                      <p>{m.signal}</p>
                    </div>
                    <span className="v2-history-score">
                      {m.homeScore != null && m.awayScore != null
                        ? `${m.homeScore} – ${m.awayScore}`
                        : "—"}
                    </span>
                    <div>
                      <span
                        className={`v2-outcome ${m.settled ? (m.correct ? "correct" : "missed") : "pending"}`}
                      >
                        {m.settled
                          ? m.correct
                            ? "Correct"
                            : "Missed"
                          : "Pending"}
                      </span>
                      <small>Confidence {percent(m.conf)}</small>
                    </div>
                  </article>
                ))}
              </div>
              <div className="v2-pagination">
                <button
                  className="v2-button secondary"
                  disabled={current === 1}
                  onClick={() => setPage(current - 1)}
                >
                  Previous
                </button>
                <span role="status">
                  Page {current} of {pages}
                </span>
                <button
                  className="v2-button secondary"
                  disabled={current === pages}
                  onClick={() => setPage(current + 1)}
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <Empty title="No results in this selection">
              Try a different status, market, or team.
            </Empty>
          )}
        </>
      )}
    </main>
  );
}

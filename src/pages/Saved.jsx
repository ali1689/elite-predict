import { Link } from "react-router-dom";
import { useState } from "react";
import { calendarEvent, downloadCalendar } from "@/lib/calendar";
import { Kickoff } from "@/components/Discovery";
import { useSaved } from "@/context/SavedContext";
import { useTrackRecord, usePastResults } from "@/lib/useTrackRecord";
import {
  dateLabel,
  leagueName,
  matchKey,
  mergeResults,
} from "@/lib/presentation";
import { Empty, Icon, PageHeading } from "@/components/V2";
export default function Saved() {
  const [view, setView] = useState('all');
  const { saved, remove } = useSaved(),
    settled = useTrackRecord(),
    past = usePastResults();
  const results = new Map(
    mergeResults(settled.data, past.data).map((m) => [matchKey(m), m]),
  );
  const group = (m) => results.get(m.key)?.settled ? 'settled' : m.utcDate && Date.parse(m.utcDate) > Date.now() ? 'upcoming' : 'unresolved';
  const visible = saved.filter(m => view === 'all' || group(m) === view);
  return (
    <main className="v2-page">
      <PageHeading
        eyebrow="Your football, together"
        title="Your saved matches"
        description="Your watchlist, saved on this browser."
      >
        <Link className="v2-button secondary" to="/predictions">
          Find matches <Icon>arrow_forward</Icon>
        </Link>
      </PageHeading>
      <div className="v2-section-title">
        <h2>Saved matches</h2>
        <span>{saved.length} {saved.length === 1 ? "fixture" : "fixtures"}</span>
      </div>
      <p className="v2-fine">
        Saved fixtures are local to this browser and do not sync to your
        account. Outcomes appear when available in the recent 80%+ confidence
        history; this is not a live score feed.
      </p>
      <div className="v2-tabs v2-saved-tabs">{[['all','All'],['upcoming','Upcoming'],['settled','Settled'],['unresolved','Other / awaiting result']].map(([key,label]) => <button key={key} aria-pressed={view === key} onClick={() => setView(key)}>{label} ({saved.filter(m => key === 'all' || group(m) === key).length})</button>)}</div>
      {saved.length > 0 && !visible.length && <Empty title="No saved fixtures in this group">Choose another tab to see your saved matches.</Empty>}
      {saved.length ? (
        <div className="v2-saved-list">
          {[...visible]
            .sort((a, b) =>
              (a.utcDate || a.matchDate || "").localeCompare(
                b.utcDate || b.matchDate || "",
              ),
            )
            .map((m) => {
              const r = results.get(m.key);
              return (
                <article className="v2-saved-item" key={m.key}>
                  <span className="v2-saved-mark">
                    <Icon>bookmark</Icon>
                  </span>
                  <div>
                    <h2>
                      {m.home} <span className="v2-vs">vs</span> {m.away}
                    </h2>
                    <p>
                      {leagueName(m.comp)} ·{" "}
                      {dateLabel(m.utcDate || m.matchDate)} · Warsaw
                    </p>
                    <Kickoff value={m.utcDate} />
                    <span className="v2-fine">
                      {r?.settled && typeof r.correct === "boolean"
                        ? `${r.correct ? "Correct prediction" : "Missed prediction"} · Final score ${r.homeScore ?? "—"} – ${r.awayScore ?? "—"}`
                        : r
                          ? "Awaiting settlement"
                          : settled.loading || past.loading
                            ? "Checking recent history…"
                            : settled.error || past.error
                              ? "Result feed unavailable"
                              : "No outcome in the loaded recent history"}
                    </span>
                  </div>
                  <div className="v2-actions">
                    {calendarEvent(m) && group(m) === 'upcoming' && <button className="v2-button secondary" onClick={() => downloadCalendar(m)}>Add to calendar</button>}
                    <Link
                      className="v2-button secondary"
                      to={`/predictions?q=${encodeURIComponent(m.home)}`}
                    >
                      Find fixture
                    </Link>
                    <button
                      className="v2-icon-button"
                      aria-label={`Remove ${m.home} vs ${m.away} from saved matches`}
                      onClick={() => remove(m.key)}
                    >
                      <Icon>bookmark_remove</Icon>
                    </button>
                  </div>
                </article>
              );
            })}
        </div>
      ) : (
        <Empty
          title="Your watchlist starts with one match."
          icon="bookmark_add"
        >
          <p>Tap the bookmark on a prediction to keep it here.</p>
          <Link className="v2-button" to="/predictions">
            Explore fixtures <Icon>arrow_forward</Icon>
          </Link>
        </Empty>
      )}
    </main>
  );
}


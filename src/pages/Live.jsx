import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/App";
import TeamAvatar from "@/components/TeamAvatar";
import { useInplayPredictions } from "@/lib/useInplay";

const ALL = "ALL";

// ── Status helpers ────────────────────────────────────────────────────────────
function statusLabel(status, minute) {
  if (status === "HT")  return "HT";
  if (status === "ET")  return `ET ${minute}'`;
  if (status === "P")   return "PEN";
  if (status === "INT") return "INT";
  if (minute)           return `${minute}'`;
  return status;
}

function statusColor(status) {
  if (status === "HT")  return "text-yellow-400 bg-yellow-400/10 border-yellow-400/30";
  if (status === "ET" || status === "P") return "text-orange-400 bg-orange-400/10 border-orange-400/30";
  return "text-red-400 bg-red-400/10 border-red-400/30";
}

// ── Signal colour (matches existing sigStyle convention) ──────────────────────
function signalColor(signal = "") {
  const s = signal.toLowerCase();
  if (s.includes("home win"))  return "text-primary-container";
  if (s.includes("away win"))  return "text-sky-400";
  if (s.includes("draw"))      return "text-yellow-400";
  if (s.includes("over 2.5"))  return "text-emerald-400";
  if (s.includes("over 1.5"))  return "text-teal-400";
  if (s.includes("btts"))      return "text-violet-400";
  if (s.includes("under"))     return "text-orange-400";
  return "text-on-surface";
}

// ── Confidence ring colour ───────────────────────────────────────────────────
function confColor(conf) {
  if (conf >= 75) return "text-primary-container";
  if (conf >= 60) return "text-yellow-400";
  return "text-on-surface-variant";
}

// ── Pulsing live dot ─────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
    </span>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-white/5 rounded-xl", className)} />;
}

// ── Scrollable row with arrow buttons ────────────────────────────────────────
function ScrollRow({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  return (
    <div className="relative flex items-center gap-1">
      <button
        onClick={() => scroll(-1)}
        className="flex-shrink-0 w-7 h-7 rounded-lg border border-white/10 bg-surface-container/60 text-on-surface-variant hover:text-on-surface hover:border-primary-container/40 transition-all flex items-center justify-center"
        aria-label="Scroll left"
      >
        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
      </button>
      <div ref={ref} className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pb-1">
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="flex-shrink-0 w-7 h-7 rounded-lg border border-white/10 bg-surface-container/60 text-on-surface-variant hover:text-on-surface hover:border-primary-container/40 transition-all flex items-center justify-center"
        aria-label="Scroll right"
      >
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      </button>
    </div>
  );
}

// ── Probability bar ───────────────────────────────────────────────────────────
function ProbBar({ label, value, color = "bg-primary-container" }) {
  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">{label}</span>
        <span className="font-['Lexend'] text-[9px] font-bold text-on-surface tabular-nums">{value}%</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all duration-700", color)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

// ── Staleness helper ─────────────────────────────────────────────────────────
function stalenessMinutes(updatedAt) {
  if (!updatedAt) return null;
  try {
    return Math.floor((Date.now() - new Date(updatedAt).getTime()) / 60000);
  } catch { return null; }
}

// ── Live match card ───────────────────────────────────────────────────────────
function LiveCard({ match }) {
  const homeTeam  = { abbr: match.home.slice(0, 3).toUpperCase(), name: match.home, logo: null };
  const awayTeam  = { abbr: match.away.slice(0, 3).toUpperCase(), name: match.away, logo: null };
  const sc        = signalColor(match.primarySignal);
  const stColor   = statusColor(match.status);
  const staleMin  = stalenessMinutes(match.updatedAt);
  const isStale   = staleMin !== null && staleMin >= 3;

  // Leading team determines score colour
  const homeAhead = match.homeScore > match.awayScore;
  const awayAhead = match.awayScore > match.homeScore;

  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-4 border border-white/5 hover:border-primary-container/25 transition-all duration-300 group">

      {/* Header row: competition + status badge */}
      <div className="flex items-center justify-between">
        <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest truncate max-w-[55%]">
          {match.competition}
        </span>
        <div className="flex items-center gap-1.5">
          {isStale && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 font-['Lexend'] text-[8px] font-bold uppercase tracking-widest text-yellow-400"
              title={`Data last updated ${staleMin}m ago — pipeline may be delayed`}>
              <span className="material-symbols-outlined text-[10px]">warning</span>
              {staleMin}m old
            </span>
          )}
          <span className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded-full border font-['Lexend'] text-[9px] font-bold uppercase tracking-widest",
            stColor
          )}>
            <LiveDot />
            {statusLabel(match.status, match.minute)}
          </span>
        </div>
      </div>

      {/* Score section */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <TeamAvatar team={homeTeam} />
          <div className="font-bold text-sm text-on-surface truncate w-full text-center">{homeTeam.abbr}</div>
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest text-center truncate w-full px-1">
            {match.home}
          </div>
        </div>

        {/* Score */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "text-3xl font-black tabular-nums leading-none",
              homeAhead ? "text-primary-container drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]" : "text-on-surface"
            )}>
              {match.homeScore}
            </span>
            <span className="text-xl font-black text-on-surface-variant">-</span>
            <span className={cn(
              "text-3xl font-black tabular-nums leading-none",
              awayAhead ? "text-primary-container drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]" : "text-on-surface"
            )}>
              {match.awayScore}
            </span>
          </div>
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest">
            xG rem: {(match.lambdaHomeRem + match.lambdaAwayRem).toFixed(2)}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center gap-2 min-w-0">
          <TeamAvatar team={awayTeam} />
          <div className="font-bold text-sm text-on-surface truncate w-full text-center">{awayTeam.abbr}</div>
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest text-center truncate w-full px-1">
            {match.away}
          </div>
        </div>
      </div>

      {/* Signal box */}
      <div className="bg-primary-container/10 rounded-xl p-3 border border-primary-container/25 group-hover:border-primary-container transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">Signal</div>
            <div className={cn("font-black text-sm leading-tight", sc)}>
              {match.primarySignal || "–"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">Conf</div>
            <div className={cn("font-black text-xl font-['Lexend'] tabular-nums", confColor(match.confidence))}>
              {match.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* 1X2 probability bars */}
      <div className="space-y-1.5">
        <ProbBar label="Home Win" value={match.pHomeWin} color="bg-primary-container" />
        <ProbBar label="Draw"     value={match.pDraw}    color="bg-yellow-400" />
        <ProbBar label="Away Win" value={match.pAwayWin} color="bg-sky-400" />
      </div>

      {/* Market pills */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "O2.5", value: match.pOver25  },
          { label: "O1.5", value: match.pOver15  },
          { label: "BTTS", value: match.pBtts    },
          { label: "U2.5", value: match.pUnder25 },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
            <div className="font-['Lexend'] text-[7px] text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</div>
            <div className="font-['Lexend'] text-xs font-semibold text-on-surface">{value}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Live() {
  const { data, loading, error, lastFetch, refresh } = useInplayPredictions();
  const [activeComp,   setActiveComp]   = useState(ALL);
  const [minConf,      setMinConf]      = useState(0);
  const [activeStatus, setActiveStatus] = useState(ALL);
  const [countdown,    setCountdown]    = useState(60);

  // Countdown to next auto-refresh
  useEffect(() => {
    setCountdown(60);
    const id = setInterval(() => setCountdown(c => (c <= 1 ? 60 : c - 1)), 1000);
    return () => clearInterval(id);
  }, [lastFetch]);

  const competitions = useMemo(() => {
    const set = new Set(data.map(m => m.competition));
    return [ALL, ...[...set].sort()];
  }, [data]);

  const filtered = useMemo(() => {
    let rows = activeComp === ALL ? data : data.filter(m => m.competition === activeComp);
    if (minConf > 0) rows = rows.filter(m => m.confidence >= minConf);
    if (activeStatus !== ALL) {
      // "HT" maps to HT; "1H" maps to 1H; "2H" maps to 2H + ET + P
      if (activeStatus === "2H") {
        rows = rows.filter(m => m.status === "2H" || m.status === "ET" || m.status === "P");
      } else {
        rows = rows.filter(m => m.status === activeStatus);
      }
    }
    return rows;
  }, [data, activeComp, minConf, activeStatus]);

  // Filter out no-value matches (already-achieved markets or final whistle)
  const actionable = useMemo(() => filtered.filter(m => {
    const tg  = m.homeScore + m.awayScore;
    const min = m.minute;
    const sig = m.primarySignal;

    // Match basically over
    if (min >= 88 && (m.status === "1H" || m.status === "2H")) return false;

    // Already-achieved goals markets
    if (sig === "Over 1.5" && tg >= 2) return false;
    if (sig === "Over 2.5" && tg >= 3) return false;

    // 1X2 too late
    if ((sig === "Home Win" || sig === "Away Win" || sig === "Draw") && min >= 85 && m.status === "2H") return false;

    // BTTS already guaranteed or impossible
    if (sig === "BTTS" && m.homeScore > 0 && m.awayScore > 0) return false;

    return true;
  }), [filtered]);

  // Sort: HT first, then by minute desc
  const sorted = useMemo(() => [...actionable].sort((a, b) => {
    if (a.status === "HT" && b.status !== "HT") return -1;
    if (b.status === "HT" && a.status !== "HT") return  1;
    return b.minute - a.minute;
  }), [actionable]);

  const fmtTime = (iso) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleTimeString("en-GB", {
        hour: "2-digit", minute: "2-digit", timeZone: "Europe/Warsaw",
      });
    } catch { return ""; }
  };

  return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">

      {/* Hero */}
      <section className="mb-8 md:mb-12 animate-fade-up">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <LiveDot />
              <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-red-400">
                Live · Updates every 60s
              </span>
            </div>
            <h1 className="text-[2.25rem] sm:text-5xl md:text-display-xl font-black text-on-surface mb-3 leading-tight tracking-tight md:tracking-[-0.04em]">
              In-Play <span className="text-primary-container">Predictions</span>
            </h1>
            <p className="text-on-surface-variant text-base sm:text-lg font-semibold leading-relaxed">
              {loading
                ? "Loading live matches..."
                : actionable.length === 0
                  ? "No actionable live bets right now — check back soon."
                  : `${actionable.length} actionable bet${actionable.length !== 1 ? "s" : ""} across ${data.length} live match${data.length !== 1 ? "es" : ""} · updated in real-time`}
            </p>
          </div>

          {/* Refresh control */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {lastFetch && (
              <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest text-right">
                <div>Updated {fmtTime(lastFetch.toISOString())}</div>
                <div className="text-primary-container">Next in {countdown}s</div>
              </div>
            )}
            <button
              onClick={refresh}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "border border-outline-variant/50 text-on-surface-variant",
                "hover:border-primary-container/50 hover:text-primary-container hover:bg-primary-container/5",
                "transition-all duration-200"
              )}
              title="Refresh now"
            >
              <span className="material-symbols-outlined text-[20px]">refresh</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-['Lexend']">
            Could not load live data — {error.message}
          </div>
        )}
      </section>

      {/* Stats bar */}
      {!loading && actionable.length > 0 && (
        <section className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Actionable Bets",  value: actionable.length,                                                    icon: "sports_soccer" },
            { label: "Avg Confidence",   value: `${Math.round(actionable.reduce((s,m) => s + m.confidence, 0) / actionable.length)}%`, icon: "verified" },
            { label: "High Conf (75%+)", value: actionable.filter(m => m.confidence >= 75).length,                    icon: "star" },
            { label: "Competitions",     value: competitions.length - 1,                                               icon: "emoji_events" },
          ].map(({ label, value, icon }) => (
            <div key={label} className="glass-card rounded-xl p-4 flex items-center gap-3 border border-white/5">
              <span className="material-symbols-outlined text-primary-container text-[22px]">{icon}</span>
              <div>
                <div className="text-lg font-black text-on-surface tabular-nums">{value}</div>
                <div className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">{label}</div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Filters */}
      <section className="mb-6 space-y-2">
        {/* Confidence chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { val: 0,  label: "All"  },
            { val: 60, label: "60%+" },
            { val: 70, label: "70%+" },
            { val: 75, label: "75%+" },
            { val: 85, label: "85%+" },
            { val: 90, label: "90%+" },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setMinConf(val)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                minConf === val
                  ? "bg-primary-container text-on-primary border-primary-container neon-glow"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
              )}>
              <span className="material-symbols-outlined text-[12px]">verified</span>
              {label}
            </button>
          ))}
        </div>

        {/* Status chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { val: ALL,  label: "All Periods",  icon: "sports_soccer" },
            { val: "1H", label: "1st Half",     icon: "first_page"    },
            { val: "HT", label: "Half Time",    icon: "pause_circle"  },
            { val: "2H", label: "2nd Half",     icon: "last_page"     },
          ].map(({ val, label, icon }) => (
            <button key={val} onClick={() => setActiveStatus(val)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                activeStatus === val
                  ? "bg-primary-container text-on-primary border-primary-container neon-glow"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
              )}>
              <span className="material-symbols-outlined text-[12px]">{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Competition tabs */}
        {competitions.length > 2 && (
          <ScrollRow>
            {competitions.map(c => (
              <button key={c} onClick={() => setActiveComp(c)}
                className={cn(
                  "px-3 py-1.5 rounded-full font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                  activeComp === c
                    ? "bg-primary-container text-on-primary border-primary-container neon-glow"
                    : "border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
                )}>
                {c === ALL ? "All Competitions" : c}
              </button>
            ))}
          </ScrollRow>
        )}
      </section>

      {/* Cards grid */}
      <section>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[420px]" />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-5 text-center">
            <div className="w-20 h-20 rounded-2xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
              <span className="material-symbols-outlined text-on-surface-variant text-4xl">sports_soccer</span>
            </div>
            <div>
              <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                {data.length === 0
                  ? "No live matches right now"
                  : actionable.length === 0
                    ? "All live bets already achieved or match too late"
                    : activeComp !== ALL
                      ? `No ${minConf > 0 ? `${minConf}%+ ` : ""}matches for ${activeComp}`
                      : `No matches at ${minConf}%+ confidence right now`}
              </div>
              <p className="text-on-surface-variant text-sm max-w-xs mx-auto leading-relaxed">
                {data.length === 0
                  ? "Live predictions appear here automatically when matches kick off."
                  : "Try lowering the confidence filter or switching to All Competitions."}
              </p>
            </div>
            {(activeComp !== ALL || minConf > 0 || activeStatus !== ALL) && (
              <button
                onClick={() => { setActiveComp(ALL); setMinConf(0); setActiveStatus(ALL); }}
                className="px-5 py-2.5 rounded-xl border border-primary-container/30 text-primary-container font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest hover:bg-primary-container/10 transition-all"
              >
                Reset filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {sorted.map(m => <LiveCard key={m.matchId} match={m} />)}
          </div>
        )}
      </section>

      {/* Footer note */}
      {!loading && data.length > 0 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest text-center">
            Probabilities adjust every minute · Time-adjusted Dixon-Coles Poisson model
          </span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
      )}
    </main>
  );
}

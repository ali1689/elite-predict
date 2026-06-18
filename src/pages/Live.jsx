import { useState, useMemo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/App";
import TeamAvatar from "@/components/TeamAvatar";
import { useInplayPredictions } from "@/lib/useInplay";
import { sigStyle, abbr } from "@/data/matches";
import InfoTip from "@/components/InfoTip";
import { useCountUp } from "@/lib/useCountUp";
import HowToRead from "@/components/HowToRead";

const ALL = "ALL";

// ── Live → Today label map (so picks get the same badge styling) ─────────────
const LIVE_TO_FULL = {
  "Over 1.5":      "Over 1.5 Goals",
  "Over 2.5":      "Over 2.5 Goals",
  "Under 2.5":     "Under 2.5 Goals",
  "Home Over 0.5": "Home Over 0.5 Goals",
  "Home Over 1.5": "Home Over 1.5 Goals",
  "Away Over 0.5": "Away Over 0.5 Goals",
  "Away Over 1.5": "Away Over 1.5 Goals",
  "BTTS":          "Both Teams to Score",
  "BTTS No":       "Under 2.5 Goals",   // defensive pick → reuse Under styling
};
function liveSigStyle(signal = "") {
  return sigStyle(LIVE_TO_FULL[signal] ?? signal);
}

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

// ── 1X2 result trio (matches Today's card) ────────────────────────────────────
function ResultTrio({ homeWin = 0, draw = 0, awayWin = 0 }) {
  const top = homeWin >= draw && homeWin >= awayWin ? "home"
    : draw >= homeWin && draw >= awayWin ? "draw" : "away";
  return (
    <div className="result-trio">
      <div className={cn("result-box", top === "home" && "top")}>
        <span className="result-box-label">Home</span>
        <span className="result-box-val">{Math.round(homeWin)}%</span>
      </div>
      <div className={cn("result-box", top === "draw" && "top")}>
        <span className="result-box-label">Draw</span>
        <span className="result-box-val">{Math.round(draw)}%</span>
      </div>
      <div className={cn("result-box", top === "away" && "top")}>
        <span className="result-box-label">Away</span>
        <span className="result-box-val">{Math.round(awayWin)}%</span>
      </div>
    </div>
  );
}

// ── Stat chip (matches Today's card) ──────────────────────────────────────────
// Pass `tip` (a glossary key, e.g. "BTTS") to show an explanation tooltip.
function StatChip({ label, value, accent, tip }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-2 text-center border border-outline-variant/30">
      <div className="flex items-center justify-center gap-0.5 mb-0.5">
        <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest">{label}</span>
        {tip && <InfoTip termKey={tip} />}
      </div>
      <div className={cn("font-['Lexend'] text-sm font-bold tabular-nums", accent ? "text-primary-container" : "text-on-surface")}>
        {value}
      </div>
    </div>
  );
}

// ── Live KPI tile (animated count-up + optional tooltip) ──────────────────────
function LiveKpi({ icon, label, count, suffix = "", tip }) {
  const v = useCountUp(count);
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3 border border-white/5">
      <span className="material-symbols-outlined text-primary-container text-[22px]">{icon}</span>
      <div>
        <div className="text-lg font-black text-on-surface tabular-nums">{v}{suffix}</div>
        <div className="flex items-center gap-0.5">
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">{label}</span>
          {tip && <InfoTip title={tip.title} text={tip.text} />}
        </div>
      </div>
    </div>
  );
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

// ── Probability bar (matches Today's card) ────────────────────────────────────
function ProbBar({ label, value, color = "bg-primary-container" }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">{label}</span>
        <span className={cn("font-['Lexend'] text-[9px] font-bold tabular-nums",
          color === "bg-primary-container" ? "text-primary-container" :
          color === "bg-blue-400"          ? "text-blue-400"          :
          color === "bg-violet-400"        ? "text-violet-400"        : "text-on-surface-variant"
        )}>{value}%</span>
      </div>
      <div className="h-1 bg-surface-container rounded-full overflow-hidden">
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

// ── Live match card (Today's design language, adapted for in-play) ────────────
function LiveCard({ match }) {
  const homeTeam  = { abbr: abbr(match.home), name: match.home, logo: null };
  const awayTeam  = { abbr: abbr(match.away), name: match.away, logo: null };
  const sig       = liveSigStyle(match.primarySignal);
  const stColor   = statusColor(match.status);
  const staleMin  = stalenessMinutes(match.updatedAt);
  const isStale   = staleMin !== null && staleMin >= 3;
  const xgRem     = (match.lambdaHomeRem + match.lambdaAwayRem).toFixed(2);

  // Leading team determines score colour
  const homeAhead = match.homeScore > match.awayScore;
  const awayAhead = match.awayScore > match.homeScore;
  const scoreGlow = "text-primary-container drop-shadow-[0_0_12px_rgba(57,255,20,0.6)]";

  return (
    <div className="glass-card p-5 rounded-xl hover:border-primary-container/30 transition-all duration-300 flex flex-col gap-4 group">

      {/* Header: status + signal pick (left) · competition (right) */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider w-fit border",
            stColor
          )}>
            <LiveDot />
            {statusLabel(match.status, match.minute)}
          </span>
          <span className={cn("px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-tighter w-fit", sig.bg, sig.text)}>
            {match.primarySignal}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest truncate max-w-[120px]">{match.competition}</div>
          {isStale && (
            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded border border-yellow-500/40 bg-yellow-500/10 font-['Lexend'] text-[8px] font-bold uppercase tracking-widest text-yellow-400"
              title={`Data last updated ${staleMin}m ago — pipeline may be delayed`}>
              <span className="material-symbols-outlined text-[10px]">warning</span>
              {staleMin}m old
            </span>
          )}
        </div>
      </div>

      {/* Teams + live score */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamAvatar team={homeTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight truncate w-full px-1">{match.home}</span>
        </div>
        <div className="flex flex-col items-center px-3 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className={cn("text-3xl font-black tabular-nums leading-none", homeAhead ? scoreGlow : "text-on-surface")}>{match.homeScore}</span>
            <span className="text-xl font-black text-on-surface-variant">-</span>
            <span className={cn("text-3xl font-black tabular-nums leading-none", awayAhead ? scoreGlow : "text-on-surface")}>{match.awayScore}</span>
          </div>
          <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mt-1.5">xG rem {xgRem}</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamAvatar team={awayTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight truncate w-full px-1">{match.away}</span>
        </div>
      </div>

      {/* Match progress bar (minute / 90) */}
      <div className="px-0.5 -mt-1">
        <div className="h-1 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-red-400/70 transition-all duration-700"
            style={{ width: `${Math.min((match.minute / 90) * 100, 100)}%` }} />
        </div>
      </div>

      {/* Signal + confidence box (pick-coloured) */}
      <div className={cn("rounded-xl p-3 border border-outline-variant/30 flex items-center justify-between", sig.bg)}>
        <div className="min-w-0">
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">Live Signal</div>
          <div className={cn("font-black text-sm leading-tight truncate", sig.text)}>{match.primarySignal || "–"}</div>
        </div>
        <div className="text-right flex-shrink-0 pl-3">
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-1">Conf</div>
          <div className={cn("font-black text-xl font-['Lexend'] tabular-nums", confColor(match.confidence))}>{match.confidence}%</div>
        </div>
      </div>

      {/* 1X2 result trio */}
      <ResultTrio homeWin={match.pHomeWin} draw={match.pDraw} awayWin={match.pAwayWin} />

      {/* Team-goal probability bars */}
      <div className="space-y-2">
        <ProbBar label="Home to score (0.5+)" value={match.pHomeOver05} color="bg-primary-container" />
        <ProbBar label="Home 2+ goals (1.5+)" value={match.pHomeOver15} color="bg-primary-container" />
        <ProbBar label="Away to score (0.5+)" value={match.pAwayOver05} color="bg-blue-400" />
        <ProbBar label="Away 2+ goals (1.5+)" value={match.pAwayOver15} color="bg-blue-400" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-5 gap-1.5">
        <StatChip label="BTTS" value={`${match.pBtts}%`}    tip="BTTS" />
        <StatChip label="O1.5" value={`${match.pOver15}%`}  accent tip="O1.5" />
        <StatChip label="O2.5" value={`${match.pOver25}%`}  accent tip="O2.5" />
        <StatChip label="U2.5" value={`${match.pUnder25}%`} tip="U2.5" />
        <StatChip label="xG"   value={xgRem} tip="xG rem" />
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

    // No qualifying pick (below the model's confidence floor) — hide entirely
    if (sig === "No strong signal" || !sig) return false;

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

      {/* How to read this page */}
      <div className="mb-8">
        <HowToRead
          storageKey="howto_live"
          title="How to read in-play picks"
          intro="These are matches happening right now — the page refreshes every 60 seconds."
          steps={[
            "The score and minute are live. \"xG rem\" is the goals still expected before full time.",
            "Signal — the best in-play bet right now; Conf is how sure the model is.",
            "The Home / Draw / Away boxes update with the live state; the bars show each team's chance to score.",
            "Tap the ⓘ next to any term (BTTS, O2.5, xG…) to see what it means.",
            "Only actionable bets are shown — settled or too-late markets drop off automatically.",
          ]}
        />
      </div>

      {/* Stats bar */}
      {!loading && actionable.length > 0 && (
        <section className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <LiveKpi icon="sports_soccer" label="Actionable Bets" count={actionable.length}
                   tip={{ title: "Actionable Bets", text: "Live matches with a qualifying in-play pick right now." }} />
          <LiveKpi icon="verified" label="Avg Confidence" suffix="%"
                   count={Math.round(actionable.reduce((s, m) => s + m.confidence, 0) / actionable.length)}
                   tip={{ title: "Average Confidence", text: "Mean model confidence across the actionable live bets." }} />
          <LiveKpi icon="star" label="High Conf (75%+)" count={actionable.filter(m => m.confidence >= 75).length}
                   tip={{ title: "High Confidence", text: "Live picks the model backs at 75%+ confidence." }} />
          <LiveKpi icon="emoji_events" label="Competitions" count={competitions.length - 1}
                   tip={{ title: "Competitions", text: "Distinct competitions with a live actionable bet." }} />
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

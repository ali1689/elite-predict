import { useMemo, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import TeamAvatar from "@/components/TeamAvatar";
import { useAuth } from "@/context/AuthContext";
import { useTodayPredictions } from "@/lib/usePredictions";

// ── Daily pack helpers ────────────────────────────────────────────────────
function packKey(userId) {
  return `ep_pack_opened_${userId ?? "anon"}`;
}
function getTodayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
}
export function markPackOpened(userId) {
  try { localStorage.setItem(packKey(userId), getTodayStr()); } catch (_) {}
}
export function isPackOpenedToday(userId) {
  try { return localStorage.getItem(packKey(userId)) === getTodayStr(); } catch (_) { return false; }
}
import { sigStyle, tierStyle, fmtTime, abbr, SIGNAL_DONUT_COLORS } from "@/data/matches";
import { cn } from "@/lib/utils";
import InfoTip from "@/components/InfoTip";
import { useCountUp } from "@/lib/useCountUp";
import HowToRead from "@/components/HowToRead";

// ── Loading skeleton ──────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-surface-container rounded-lg", className)} />;
}

// ── Scrollable row with arrow buttons ────────────────────────────────────────
function ScrollRow({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 220, behavior: "smooth" });
  return (
    <div className="relative flex items-center gap-1">
      <button onClick={() => scroll(-1)}
        className="flex-shrink-0 w-7 h-7 rounded-lg border border-white/10 bg-surface-container/60 text-on-surface-variant hover:text-on-surface hover:border-primary-container/40 transition-all flex items-center justify-center"
        aria-label="Scroll left">
        <span className="material-symbols-outlined text-[16px]">chevron_left</span>
      </button>
      <div ref={ref} className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pb-1">
        {children}
      </div>
      <button onClick={() => scroll(1)}
        className="flex-shrink-0 w-7 h-7 rounded-lg border border-white/10 bg-surface-container/60 text-on-surface-variant hover:text-on-surface hover:border-primary-container/40 transition-all flex items-center justify-center"
        aria-label="Scroll right">
        <span className="material-symbols-outlined text-[16px]">chevron_right</span>
      </button>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="glass-card p-5 rounded-xl space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-28" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-14 w-14 rounded-full" />
        <Skeleton className="h-10 w-16" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-4/5" />
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12" />)}
      </div>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────
// `countTo` (+ optional suffix/decimals) animates the number on load.
// `tip` shows an InfoTip explaining the metric.
function StatCard({ icon, label, value, sub, loading, countTo, suffix = "", decimals = 0, tip }) {
  const animated = useCountUp(countTo ?? 0, { decimals });
  const display = countTo != null ? `${animated}${suffix}` : value;
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary-container text-[20px]">{icon}</span>
        <span className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
        {tip && <InfoTip title={tip.title} text={tip.text} />}
      </div>
      {loading
        ? <Skeleton className="h-7 w-16 mt-1" />
        : <div className="font-black text-2xl text-on-surface leading-none tabular-nums">{display}</div>
      }
      {sub && <div className="font-['Lexend'] text-[10px] text-on-surface-variant">{sub}</div>}
    </div>
  );
}

// ── Signal Donut — legend row (count-up + hover sync) ──────────────────────
function DonutLegendRow({ s, i, hover, setHover }) {
  const cnt = useCountUp(s.cnt);
  const pct = useCountUp(Math.round(s.pct * 100));
  return (
    <div
      onMouseEnter={() => setHover(i)}
      onMouseLeave={() => setHover(null)}
      className={cn("flex items-center gap-2 rounded-md px-1.5 -mx-1.5 py-0.5 cursor-pointer", hover === i && "bg-white/5")}
      style={{ opacity: hover === null || hover === i ? 1 : 0.4, transition: "opacity 0.4s ease, background-color 0.4s ease" }}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
      <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider flex-1 truncate">{s.sig}</span>
      <span className="font-['Lexend'] text-[11px] font-bold text-on-surface tabular-nums">{cnt}</span>
      <span className="font-['Lexend'] text-[9px] text-on-surface-variant w-7 text-right tabular-nums">{pct}%</span>
    </div>
  );
}

// ── Signal Donut ──────────────────────────────────────────────────────────
function SignalDonut({ counts, total }) {
  const R = 54, CX = 70, CY = 70, STROKE = 14;
  const circ = 2 * Math.PI * R;
  const [hover, setHover]     = useState(null);
  const [mounted, setMounted] = useState(false);
  const totalUp = useCountUp(total);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  let offset = 0;
  const slices = Object.entries(counts)
    .filter(([, c]) => c > 0)
    .map(([sig, cnt]) => {
      const pct  = total > 0 ? cnt / total : 0;
      const dash = pct * circ;
      const el   = { sig, cnt, pct, dash, offset, color: SIGNAL_DONUT_COLORS[sig] || "#52525B" };
      offset += dash;
      return el;
    });

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-primary-container rounded-full inline-block" />
        Signal Breakdown
      </div>
      <div className="flex items-center gap-6">
        <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
          {slices.length === 0 && (
            <circle cx={CX} cy={CY} r={R} fill="none" stroke="#27272a" strokeWidth={STROKE} />
          )}
          {slices.map((s, i) => (
            <circle key={s.sig}
              cx={CX} cy={CY} r={R} fill="none"
              stroke={s.color}
              strokeWidth={hover === i ? STROKE + 3 : STROKE}
              strokeDasharray={mounted ? `${s.dash} ${circ - s.dash}` : `0 ${circ}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              style={{
                transform: "rotate(-90deg)", transformOrigin: "70px 70px", cursor: "pointer",
                opacity: hover === null || hover === i ? 1 : 0.3,
                transition: "stroke-dasharray 0.9s cubic-bezier(0.22,1,0.36,1), stroke-width 0.45s ease, opacity 0.45s ease",
              }}
            />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fill="#E8EAED" fontSize="22" fontWeight="900">
            {hover !== null && slices[hover] ? slices[hover].cnt : totalUp}
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" fill="#9AA0A6" fontSize="9" fontWeight="600" letterSpacing="1">
            {hover !== null && slices[hover] ? `${Math.round(slices[hover].pct * 100)}%` : "PICKS"}
          </text>
        </svg>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {slices.map((s, i) => (
            <DonutLegendRow key={s.sig} s={s} i={i} hover={hover} setHover={setHover} />
          ))}
          {slices.length === 0 && (
            <span className="font-['Lexend'] text-[10px] text-on-surface-variant">No picks today</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Confidence distribution — single bar (count-up + grow-in + hover) ──────
function ConfBar({ b, max, mounted, hover, setHover, i }) {
  const count = useCountUp(b.count);
  const w = max > 0 ? (b.count / max) * 100 : 0;
  return (
    <div
      onMouseEnter={() => setHover(i)}
      onMouseLeave={() => setHover(null)}
      className="flex items-center gap-3 cursor-default"
      style={{ opacity: hover === null || hover === i ? 1 : 0.45, transition: "opacity 0.4s ease" }}
    >
      <span className="font-['Lexend'] text-[10px] text-on-surface-variant w-14 flex-shrink-0">{b.label}</span>
      <div className="flex-1 h-5 bg-surface-container rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r from-blue-500/80 to-primary-container/80", hover === i && "brightness-110")}
          style={{ width: mounted ? `${w}%` : "0%", transition: "width 0.9s cubic-bezier(0.22,1,0.36,1), filter 0.4s ease" }}
        />
      </div>
      <span className="font-['Lexend'] text-[11px] font-bold text-on-surface w-5 text-right tabular-nums">{count}</span>
    </div>
  );
}

// ── Confidence distribution chart ─────────────────────────────────────────
function ConfChart({ matches }) {
  const buckets = [
    { label: "< 55%",   range: [0,   55] },
    { label: "55–64%",  range: [55,  65] },
    { label: "65–74%",  range: [65,  75] },
    { label: "75–84%",  range: [75,  85] },
    { label: "85%+",    range: [85, 101] },
  ];
  const counts = buckets.map(b => ({
    ...b,
    count: matches.filter(m => m.conf >= b.range[0] && m.conf < b.range[1]).length,
  }));
  const max = Math.max(...counts.map(c => c.count), 1);

  const [hover, setHover]     = useState(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-blue-400 rounded-full inline-block" />
        Confidence Distribution
      </div>
      <div className="space-y-3">
        {counts.map((b, i) => (
          <ConfBar key={b.label} b={b} i={i} max={max} mounted={mounted} hover={hover} setHover={setHover} />
        ))}
      </div>
    </div>
  );
}

// ── Prob bar row ──────────────────────────────────────────────────────────
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
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────
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

// ── 1X2 result trio ───────────────────────────────────────────────────────
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

// ── Double Chance trio ────────────────────────────────────────────────────
function DCTrio({ dc1X = 0, dcX2 = 0, dc12 = 0 }) {
  if (!dc1X && !dcX2 && !dc12) return null;
  const topDC = dc1X >= dcX2 && dc1X >= dc12 ? "1X"
    : dcX2 >= dc1X && dcX2 >= dc12 ? "X2" : "12";
  return (
    <div className="pt-2 border-t border-outline-variant/40">
      <div className="font-['Lexend'] text-[8px] font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5">
        Double Chance
      </div>
      <div className="result-trio">
        <div className={cn("result-box", topDC === "1X" && "top")}>
          <span className="result-box-label">1X</span>
          <span className="result-box-val">{Math.round(dc1X)}%</span>
        </div>
        <div className={cn("result-box", topDC === "X2" && "top")}>
          <span className="result-box-label">X2</span>
          <span className="result-box-val">{Math.round(dcX2)}%</span>
        </div>
        <div className={cn("result-box", topDC === "12" && "top")}>
          <span className="result-box-label">12</span>
          <span className="result-box-val">{Math.round(dc12)}%</span>
        </div>
      </div>
    </div>
  );
}

// ── Animated card wrapper — flips from face-down to face-up ──────────────
function AnimatedCard({ match, delay, instant = false }) {
  const [phase, setPhase] = useState(instant ? "front" : "back"); // back | front

  useEffect(() => {
    if (instant) return; // pack already opened — show immediately
    const t = setTimeout(() => setPhase("front"), delay);
    return () => clearTimeout(t);
  }, [delay, instant]);

  const tier = match?.tier ?? "B";
  const ringColor =
    tier === "A" ? "#39FF14" :
    tier === "B" ? "#60A5FA" : "#A1A1AA";
  const glowClass =
    tier === "A" ? "shadow-[0_0_32px_rgba(57,255,20,0.35)] border-[#39FF14]/60" :
    tier === "B" ? "shadow-[0_0_24px_rgba(96,165,250,0.3)] border-blue-400/50"   :
                  "border-zinc-600/40";

  if (phase === "back") {
    return (
      <div className={cn(
        "rounded-xl border-2 border-primary-container/30 bg-zinc-950 flex flex-col items-center justify-center gap-3 overflow-hidden",
        "animate-[scale-in_0.4s_ease-out]",
        "min-h-[420px]"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-blue-500/5 pointer-events-none" />
        <span className="text-4xl font-black italic text-primary-container tracking-tighter drop-shadow-[0_0_20px_rgba(57,255,20,0.8)]">EP</span>
        <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-[0.3em]">Elite Predict</span>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping" />
          <span className="font-['Lexend'] text-[9px] text-primary-container uppercase tracking-widest">Revealing…</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border-2 rounded-xl animate-[scale-in_0.35s_ease-out]", glowClass)}>
      <MatchCard match={match} />
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────
function MatchCard({ match }) {
  const sig  = sigStyle(match.signal);
  const tier = tierStyle(match.tier);
  const homeTeam = { abbr: abbr(match.home), name: match.home, logo: null };
  const awayTeam = { abbr: abbr(match.away), name: match.away, logo: null };
  const xg   = ((match.lH || 0) + (match.lA || 0)).toFixed(2);
  const confColor =
    match.conf >= 75 ? "text-primary-container" :
    match.conf >= 65 ? "text-blue-400"          : "text-on-surface-variant";

  const extraSignals = (match.allSignals || []).slice(1, 5);

  // Map signal type → stored (Poisson) probability so pills match the stat chips
  const storedProb = {
    home_over05: match.homeOver05, away_over05: match.awayOver05,
    home_over15: match.homeOver15, away_over15: match.awayOver15,
    over15: match.over15, over25: match.over25,
    under25: match.under25, btts: match.btts,
  };

  return (
    <div className="glass-card p-5 rounded-xl hover:border-primary-container/30 transition-all duration-300 flex flex-col gap-4">

      {/* Header: tier badge + signal + time */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className={cn(
            "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider w-fit border",
            tier.bg, tier.text, tier.border
          )}>
            {tier.label}
          </span>
          <span className={cn("px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-tighter w-fit", sig.bg, sig.text)}>
            {match.signal}
          </span>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">{match.comp}</div>
          <div className="font-['Lexend'] text-[10px] font-semibold text-on-surface mt-0.5">{fmtTime(match.utcDate)}</div>
        </div>
      </div>

      {/* Teams + confidence */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar team={homeTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight">{match.home}</span>
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider">
            {match.homeElo} elo
          </span>
        </div>
        <div className="flex flex-col items-center px-3">
          <span className="font-black text-lg text-on-surface-variant italic">VS</span>
          <span className={cn("font-black text-2xl leading-none mt-1", confColor)}>{match.conf > 0 ? match.conf : "—"}</span>
          <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest">% Conf</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar team={awayTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight">{match.away}</span>
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider">
            {match.awayElo} elo
          </span>
        </div>
      </div>

      {/* 1X2 result trio */}
      <ResultTrio homeWin={match.homeWin} draw={match.draw} awayWin={match.awayWin} />

      {/* Goals probability bars */}
      <div className="space-y-2">
        <ProbBar label="Home to score (0.5+)" value={match.homeOver05} color="bg-primary-container" />
        <ProbBar label="Away to score (0.5+)"  value={match.awayOver05} color="bg-blue-400" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-5 gap-1.5">
        <StatChip label="BTTS"  value={`${match.btts}%`}    tip="BTTS" />
        <StatChip label="O1.5"  value={`${match.over15}%`}  accent tip="O1.5" />
        <StatChip label="O2.5"  value={`${match.over25}%`}  accent tip="O2.5" />
        <StatChip label="U2.5"  value={`${match.under25}%`} tip="U2.5" />
        <StatChip label="xG"    value={xg} tip="xG" />
      </div>

      {/* Double Chance */}
      <DCTrio dc1X={match.dc1X} dcX2={match.dcX2} dc12={match.dc12} />

      {/* Extra signal pills */}
      {extraSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-outline-variant/30">
          {extraSignals.map(s => {
            const ss = sigStyle(s.label ?? s.type);
            return (
              <span key={s.type}
                className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider", ss.bg, ss.text)}>
                {s.label ?? s.type} · {storedProb[s.type] ?? Math.round(s.prob * 100)}%
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Today() {
  const { user, loading: authLoading } = useAuth();
  const [packOpened, setPackOpened] = useState(false);

  // Only check once auth has resolved and we have the real user id
  useEffect(() => {
    if (!authLoading) {
      setPackOpened(isPackOpenedToday(user?.id));
    }
  }, [authLoading, user?.id]);

  useEffect(() => {
    const onFocus = () => { if (!authLoading) setPackOpened(isPackOpenedToday(user?.id)); };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [authLoading, user?.id]);

  const { data: matches, loading, error, lastFetch, refresh } = useTodayPredictions();

  const [activeLeague, setActiveLeague] = useState("ALL");

  // Sort by confidence — show Tier A and B only (Tier C / Speculative hidden on Today)
  const sorted    = useMemo(() => [...matches].sort((a, b) => b.conf - a.conf), [matches]);
  const displayed = useMemo(() => sorted.filter(m => m.signal !== "No strong signal" && m.tier !== "C"), [sorted]);

  // League tabs derived from displayed
  const leagues = useMemo(() => {
    const set = new Set(displayed.map(m => m.comp || m.league || ""));
    return ["ALL", ...[...set].filter(Boolean).sort()];
  }, [displayed]);

  const visibleCards = useMemo(() =>
    activeLeague === "ALL" ? displayed : displayed.filter(m => (m.comp || m.league) === activeLeague),
  [displayed, activeLeague]);

  // Stats computed from displayed (75%+ picks only)
  const signalCounts = useMemo(() => {
    const counts = {};
    displayed.forEach(m => { counts[m.signal] = (counts[m.signal] || 0) + 1; });
    return counts;
  }, [displayed]);

  const avgConf  = displayed.length ? Math.round(displayed.reduce((s, m) => s + m.conf,    0) / displayed.length) : 0;
  const avgXg    = displayed.length ? (displayed.reduce((s, m) => s + (m.xgTotal || 0),    0) / displayed.length).toFixed(2) : "0.00";
  const tierA    = displayed.filter(m => m.tier === "A").length;
  const highConf = displayed.filter(m => m.conf >= 60).length;

  return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">

      {/* Header */}
      <section className="mb-8 md:mb-12 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-1.5 h-6 bg-primary-container rounded-full inline-block" />
          <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container">
            AI Engine · Live from Supabase
          </span>
        </div>
        <h1 className="text-[2.25rem] sm:text-5xl md:text-display-xl font-black text-on-surface mb-3 leading-tight tracking-tight md:tracking-[-0.04em]">
          Today's <span className="text-primary-container">Picks</span>
        </h1>
        <p className="text-on-surface-variant text-base sm:text-lg md:text-headline-md font-semibold leading-relaxed max-w-2xl">
          {loading
            ? "Loading today's predictions…"
            : matches.length > 0
              ? `${displayed.length} pick${displayed.length !== 1 ? "s" : ""} today — sorted by confidence.`
              : "No predictions scheduled for today. Check back later or browse the full schedule."}
        </p>
        {lastFetch && (
          <div className="flex items-center gap-3 mt-2">
            <p className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest">
              Updated {lastFetch.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1 font-['Lexend'] text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors disabled:opacity-40"
              aria-label="Refresh predictions"
            >
              <span className={cn("material-symbols-outlined text-[13px]", loading && "animate-spin")}>refresh</span>
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
        )}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-['Lexend']">
            ⚠️ Could not load predictions — check Supabase connection.
          </div>
        )}
      </section>

      {/* How to read this page */}
      <div className="mb-8 md:mb-10">
        <HowToRead
          storageKey="howto_today"
          title="How to read these picks"
          intro="Each card below is one upcoming match with our AI's best bet for it."
          steps={[
            "Signal — our single top recommended pick for that match.",
            "Conf (confidence) — how strongly the model backs it. Higher = stronger.",
            "The Home / Draw / Away boxes and the % chips are each market's probability.",
            "Tap the ⓘ next to any term (BTTS, O2.5, xG…) to see what it means.",
            "Cards are sorted strongest-first. Want full breakdowns? Join the Telegram.",
          ]}
        />
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
        <StatCard icon="calendar_today"  label="Today's Picks"    countTo={displayed.length} sub="All signals"        loading={loading}
                  tip={{ title: "Today's Picks", text: "Number of picks today with a valid signal." }} />
        <StatCard icon="grade"           label="Tier A Picks"     countTo={tierA}            sub="Strongest signals"   loading={loading}
                  tip={{ title: "Tier A Picks", text: "Picks graded A — the model's strongest tier by 30-day accuracy." }} />
        <StatCard icon="percent"         label="Avg Confidence"   countTo={avgConf} suffix="%" sub="Across all picks"  loading={loading}
                  tip={{ title: "Average Confidence", text: "Mean model confidence across today's qualifying picks." }} />
        <StatCard icon="sports_soccer"   label="Avg xG / match"   countTo={Number(avgXg)} decimals={2} sub="Expected goals" loading={loading}
                  tip={{ title: "Average xG", text: "Mean expected goals per match — higher means more open, attacking games." }} />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
        {loading
          ? <><Skeleton className="h-48" /><Skeleton className="h-48" /></>
          : <>
              <SignalDonut counts={signalCounts} total={displayed.length} />
              <ConfChart matches={displayed} />
            </>
        }
      </section>

      {/* Match cards / Pack gate */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="text-base md:text-headline-md font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2 md:gap-3">
            <span className="w-1.5 h-5 md:h-6 bg-primary-container rounded-full inline-block" />
            Today's Match Cards
          </h2>
          <Link to="/predictions"
            className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-1.5">
            Full Schedule
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {/* League filter with arrow scroll */}
        {leagues.length > 2 && (
          <div className="mb-5">
            <ScrollRow>
              {leagues.map(l => (
                <button key={l} onClick={() => setActiveLeague(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-full font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                    activeLeague === l
                      ? "bg-primary-container text-on-primary border-primary-container neon-glow"
                      : "border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
                  )}>
                  {l === "ALL" ? "All Leagues" : l}
                </button>
              ))}
            </ScrollRow>
          </div>
        )}

        {/* ── Not logged in: sign-in + store gate ── */}
        {!user && !loading && matches.length > 0 ? (
          <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-6 py-16 px-6 text-center
                          bg-surface-container border-2 border-primary-container/35
                          shadow-[0_0_60px_rgba(57,255,20,0.12)]">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.06), transparent 60%)" }} />
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(57,255,20,0.015) 12px,rgba(57,255,20,0.015) 24px)" }} />

            {/* Lock icon */}
            <div className="relative w-20 h-20 rounded-2xl border-2 border-primary-container/40 bg-primary-container/10 flex items-center justify-center z-10
                            shadow-[0_0_30px_rgba(57,255,20,0.25)]">
              <span className="material-symbols-outlined text-primary-container text-4xl">lock</span>
            </div>

            {/* Text */}
            <div className="relative z-10">
              <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container mb-2">
                Members Only
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                {matches.length} prediction{matches.length !== 1 ? "s" : ""} locked<br />
                <span className="text-primary-container drop-shadow-[0_0_20px_rgba(57,255,20,0.6)]">sign in to reveal</span>
              </h3>
              <p className="text-zinc-400 font-['Lexend'] text-sm max-w-sm mx-auto leading-relaxed">
                Sign in to open your free daily pack, or upgrade to get premium multi-match predictions every day.
              </p>
            </div>

            {/* CTAs */}
            <div className="relative z-10 flex flex-col sm:flex-row gap-3">
              <Link to="/login"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary-container text-on-primary font-black text-sm uppercase tracking-widest
                           shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_50px_rgba(57,255,20,0.8)]
                           hover:scale-105 active:scale-95 transition-all duration-200">
                <span className="material-symbols-outlined text-[18px]">login</span>
                Sign In
              </Link>
              <Link to="/open"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 border-primary-container/40 text-primary-container font-black text-sm uppercase tracking-widest
                           hover:bg-primary-container/10 hover:border-primary-container/70
                           hover:scale-105 active:scale-95 transition-all duration-200">
                <span className="material-symbols-outlined text-[18px]">style</span>
                Get Your Pack
              </Link>
            </div>

            <p className="relative z-10 font-['Lexend'] text-[10px] text-zinc-600 uppercase tracking-widest">
              Free daily pack · resets at midnight
            </p>
          </div>

        ) : /* ── Pack gate: logged-in user hasn't opened today's pack ── */
        user && !packOpened && !loading && matches.length > 0 ? (
          <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-6 py-16 px-6 text-center
                          bg-surface-container border-2 border-primary-container/35
                          shadow-[0_0_60px_rgba(57,255,20,0.12)]">
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.06), transparent 60%)" }} />
            <div className="absolute inset-0 opacity-20 pointer-events-none"
              style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(57,255,20,0.015) 12px,rgba(57,255,20,0.015) 24px)" }} />

            {/* Pack stack visual */}
            <div className="relative w-28 h-40">
              {[2,1,0].map(i => (
                <div key={i} className="absolute inset-0 rounded-xl border-2 border-primary-container/30 bg-zinc-900"
                  style={{ transform: `translateY(${i * -5}px) translateX(${i * 3}px) rotate(${i * -2}deg)`, zIndex: 3 - i }} />
              ))}
              <div className="absolute inset-0 rounded-xl border-2 border-primary-container bg-zinc-950 flex flex-col items-center justify-center z-10
                              shadow-[0_0_30px_rgba(57,255,20,0.4)]">
                <span className="text-3xl font-black italic text-primary-container drop-shadow-[0_0_20px_rgba(57,255,20,1)]">EP</span>
              </div>
            </div>

            {/* Text */}
            <div className="relative z-10">
              <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container mb-2">
                Daily Free Pack
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
                You have {matches.length} prediction{matches.length !== 1 ? "s" : ""}<br />
                <span className="text-primary-container drop-shadow-[0_0_20px_rgba(57,255,20,0.6)]">waiting inside</span>
              </h3>
              <p className="text-zinc-400 font-['Lexend'] text-sm max-w-sm mx-auto leading-relaxed">
                Every day you get one free prediction pack. Open it to reveal today's AI picks — one card at a time.
              </p>
            </div>

            {/* CTA */}
            <Link to="/open"
              className="relative z-10 flex items-center gap-3 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-black text-sm uppercase tracking-widest
                         shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_50px_rgba(57,255,20,0.8)]
                         hover:scale-105 active:scale-95 transition-all duration-200">
              <span className="material-symbols-outlined text-[20px]">style</span>
              Open Today's Pack
            </Link>

            <p className="relative z-10 font-['Lexend'] text-[10px] text-zinc-600 uppercase tracking-widest">
              Resets every day at midnight
            </p>
          </div>

        ) : loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>

        ) : visibleCards.length === 0 ? (
          <div className="text-center py-14 md:py-20 glass-card rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">sports_soccer</span>
            <div className="text-on-surface font-bold text-lg mb-2">
              {displayed.length === 0 ? "No picks for today" : `No picks for ${activeLeague}`}
            </div>
            <div className="text-on-surface-variant text-sm mb-6 px-4">
              {displayed.length === 0
                ? "The AI engine found no strong signals for today's matches."
                : "Try selecting a different league."}
            </div>
            {displayed.length > 0
              ? <button onClick={() => setActiveLeague("ALL")}
                  className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-lg font-black text-sm uppercase tracking-tight neon-glow">
                  Show all leagues
                </button>
              : <Link to="/predictions"
                  className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-lg font-black text-sm uppercase tracking-tight neon-glow">
                  Browse All Predictions
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </Link>
            }
          </div>

        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {visibleCards.map((m, i) => (
              <AnimatedCard key={m.id} match={m} delay={i * 500} instant={packOpened} />
            ))}
          </div>
        )}
      </section>

      {/* Telegram CTA */}
      <section className="mt-10 md:mt-16">
        <div className="relative rounded-2xl overflow-hidden p-5 sm:p-8 bg-primary-container/10 dark:bg-zinc-950 border border-primary-container/30 flex flex-col gap-5 md:flex-row md:items-center md:gap-6">
          <div className="flex-1">
            <div className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-primary-container mb-2">Live Alerts</div>
            <h3 className="text-lg md:text-headline-md font-black text-on-surface mb-1 md:mb-2">Get Instant Signal Alerts on Telegram</h3>
            <p className="text-on-surface-variant text-sm">Lineup news, late-value drops, and picks — directly on your phone.</p>
          </div>
          <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary-container text-on-primary px-6 py-3.5 rounded-xl font-black text-sm uppercase tracking-tight neon-glow hover:scale-105 active:scale-95 transition-all w-full md:w-auto flex-shrink-0">
            <span className="material-symbols-outlined text-[18px]">send</span>
            Join Telegram
          </a>
        </div>
      </section>

    </main>
  );
}

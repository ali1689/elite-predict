import { useMemo } from "react";
import { Link } from "react-router-dom";
import TeamAvatar from "@/components/TeamAvatar";
import { useTodayPredictions } from "@/lib/usePredictions";
import { sigStyle, tierStyle, fmtTime, abbr, SIGNAL_DONUT_COLORS } from "@/data/matches";
import { cn } from "@/lib/utils";

// ── Loading skeleton ──────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-surface-container rounded-lg", className)} />;
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
function StatCard({ icon, label, value, sub, loading }) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary-container text-[20px]">{icon}</span>
        <span className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
      </div>
      {loading
        ? <Skeleton className="h-7 w-16 mt-1" />
        : <div className="font-black text-2xl text-on-surface leading-none">{value}</div>
      }
      {sub && <div className="font-['Lexend'] text-[10px] text-on-surface-variant">{sub}</div>}
    </div>
  );
}

// ── Signal Donut ──────────────────────────────────────────────────────────
function SignalDonut({ counts, total }) {
  const R = 54, CX = 70, CY = 70, STROKE = 14;
  const circ = 2 * Math.PI * R;
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
          {slices.map(s => (
            <circle key={s.sig}
              cx={CX} cy={CY} r={R} fill="none"
              stroke={s.color} strokeWidth={STROKE}
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
            />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fill="#E8EAED" fontSize="22" fontWeight="900">{total}</text>
          <text x={CX} y={CY + 14} textAnchor="middle" fill="#9AA0A6" fontSize="9" fontWeight="600" letterSpacing="1">PICKS</text>
        </svg>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {slices.map(s => (
            <div key={s.sig} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider flex-1 truncate">{s.sig}</span>
              <span className="font-['Lexend'] text-[11px] font-bold text-on-surface">{s.cnt}</span>
              <span className="font-['Lexend'] text-[9px] text-on-surface-variant w-7 text-right">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
          {slices.length === 0 && (
            <span className="font-['Lexend'] text-[10px] text-on-surface-variant">No picks today</span>
          )}
        </div>
      </div>
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

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-blue-400 rounded-full inline-block" />
        Confidence Distribution
      </div>
      <div className="space-y-3">
        {counts.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="font-['Lexend'] text-[10px] text-on-surface-variant w-14 flex-shrink-0">{b.label}</span>
            <div className="flex-1 h-5 bg-surface-container rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500/80 to-primary-container/80 transition-all"
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </div>
            <span className="font-['Lexend'] text-[11px] font-bold text-on-surface w-5 text-right">{b.count}</span>
          </div>
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
function StatChip({ label, value, accent }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-2 text-center border border-outline-variant/30">
      <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</div>
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

  const extraSignals = (match.allSignals || []).slice(1, 4);

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
          <span className={cn("font-black text-2xl leading-none mt-1", confColor)}>{match.conf}</span>
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
        <StatChip label="BTTS"  value={`${match.btts}%`} />
        <StatChip label="O1.5"  value={`${match.over15}%`} accent />
        <StatChip label="O2.5"  value={`${match.over25}%`} accent />
        <StatChip label="U2.5"  value={`${match.under25}%`} />
        <StatChip label="xG"    value={xg} />
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
                {s.label ?? s.type} · {s.prob}%
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
  const { data: matches, loading, error, lastFetch } = useTodayPredictions();

  const signalCounts = useMemo(() => {
    const counts = {};
    matches.forEach(m => {
      counts[m.signal] = (counts[m.signal] || 0) + 1;
    });
    return counts;
  }, [matches]);

  const avgConf  = matches.length ? Math.round(matches.reduce((s, m) => s + m.conf,    0) / matches.length) : 0;
  const avgXg    = matches.length ? (matches.reduce((s, m) => s + (m.xgTotal || 0),    0) / matches.length).toFixed(2) : "0.00";
  const tierA    = matches.filter(m => m.tier === "A").length;
  const highConf = matches.filter(m => m.conf >= 70).length;

  // Sort by confidence desc
  const sorted = useMemo(() => [...matches].sort((a, b) => b.conf - a.conf), [matches]);

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
              ? `${matches.length} match${matches.length !== 1 ? "es" : ""} analysed — sorted by confidence.`
              : "No predictions scheduled for today. Check back later or browse the full schedule."}
        </p>
        {lastFetch && !loading && (
          <p className="font-['Lexend'] text-[10px] text-on-surface-variant mt-2 uppercase tracking-widest">
            Updated {lastFetch.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-['Lexend']">
            ⚠️ Could not load predictions — check Supabase connection.
          </div>
        )}
      </section>

      {/* Stat cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
        <StatCard icon="calendar_today"  label="Today's Picks"    value={matches.length} sub="Total matches"       loading={loading} />
        <StatCard icon="grade"           label="Tier A Picks"     value={tierA}          sub="Strongest signals"   loading={loading} />
        <StatCard icon="percent"         label="Avg Confidence"   value={`${avgConf}%`}  sub="Across all picks"   loading={loading} />
        <StatCard icon="sports_soccer"   label="Avg xG / match"   value={avgXg}          sub="Expected goals"     loading={loading} />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
        {loading
          ? <><Skeleton className="h-48" /><Skeleton className="h-48" /></>
          : <>
              <SignalDonut counts={signalCounts} total={matches.length} />
              <ConfChart matches={matches} />
            </>
        }
      </section>

      {/* Match cards */}
      <section>
        <div className="flex items-center justify-between mb-5 md:mb-6">
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

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-14 md:py-20 glass-card rounded-xl border border-outline-variant/30">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">sports_soccer</span>
            <div className="text-on-surface font-bold text-lg mb-2">No picks for today</div>
            <div className="text-on-surface-variant text-sm mb-6 px-4">The AI engine found no strong signals for today's matches.</div>
            <Link to="/predictions"
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary px-5 py-2.5 rounded-lg font-black text-sm uppercase tracking-tight neon-glow">
              Browse All Predictions
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {sorted.map(m => <MatchCard key={m.id} match={m} />)}
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

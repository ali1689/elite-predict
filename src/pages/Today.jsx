import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import TeamAvatar from "@/components/TeamAvatar";
import { schedule, abbr } from "@/data/matches";
import { cn } from "@/lib/utils";

// ── helpers ────────────────────────────────────────────────────────────────
const SIG_COLOR = {
  "HIGH SCORING": { text: "text-primary-container", bg: "bg-primary-container/10", dot: "bg-primary-container" },
  "BTTS + O2.5":  { text: "text-primary-container", bg: "bg-primary-container/10", dot: "bg-primary-container" },
  "BTTS":         { text: "text-blue-400",           bg: "bg-blue-500/10",          dot: "bg-blue-400"          },
  "OVER 2.5":     { text: "text-blue-400",           bg: "bg-blue-500/10",          dot: "bg-blue-400"          },
  "BALANCED":     { text: "text-on-surface-variant", bg: "bg-white/5",              dot: "bg-zinc-500"          },
};

function sigStyle(signal) {
  return SIG_COLOR[signal] ?? SIG_COLOR["BALANCED"];
}

function fmtTime(utcDate) {
  try {
    return new Date(utcDate).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }) + " UTC";
  } catch { return "TBD"; }
}

// ── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub }) {
  return (
    <div className="glass-card rounded-xl p-5 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="material-symbols-outlined text-primary-container text-[20px]">{icon}</span>
        <span className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
      </div>
      <div className="font-black text-2xl text-on-surface leading-none">{value}</div>
      {sub && <div className="font-['Lexend'] text-[10px] text-on-surface-variant">{sub}</div>}
    </div>
  );
}

// ── Signal Donut ────────────────────────────────────────────────────────────
function SignalDonut({ counts, total }) {
  const COLORS = {
    "HIGH SCORING": "#39FF14",
    "BTTS + O2.5":  "#7FFF00",
    "BTTS":         "#60A5FA",
    "OVER 2.5":     "#3B82F6",
    "BALANCED":     "#52525B",
  };
  const R = 54, CX = 70, CY = 70, STROKE = 14;
  const circ = 2 * Math.PI * R;
  let offset = 0;
  const slices = Object.entries(counts).map(([sig, cnt]) => {
    const pct = total > 0 ? cnt / total : 0;
    const dash = pct * circ;
    const el = { sig, cnt, pct, dash, offset, color: COLORS[sig] || "#52525B" };
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
        <svg width="140" height="140" viewBox="0 0 140 140">
          {slices.map(s => (
            <circle key={s.sig}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={s.color}
              strokeWidth={STROKE}
              strokeDasharray={`${s.dash} ${circ - s.dash}`}
              strokeDashoffset={-s.offset}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "70px 70px" }}
            />
          ))}
          <text x={CX} y={CY - 6} textAnchor="middle" fill="#E8EAED" fontSize="22" fontWeight="900">{total}</text>
          <text x={CX} y={CY + 14} textAnchor="middle" fill="#9AA0A6" fontSize="9" fontWeight="600" letterSpacing="1">PICKS</text>
        </svg>
        <div className="flex flex-col gap-2 flex-1">
          {slices.map(s => (
            <div key={s.sig} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
              <span className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-wider flex-1 truncate">{s.sig}</span>
              <span className="font-['Lexend'] text-[11px] font-bold text-on-surface">{s.cnt}</span>
              <span className="font-['Lexend'] text-[10px] text-on-surface-variant w-8 text-right">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Win Chance Bar Chart ────────────────────────────────────────────────────
function WinChanceChart({ matches }) {
  const buckets = [
    { label: "< 50%",   range: [0,  50]  },
    { label: "50–59%",  range: [50, 60]  },
    { label: "60–69%",  range: [60, 70]  },
    { label: "70–79%",  range: [70, 80]  },
    { label: "80%+",    range: [80, 101] },
  ];
  const counts = buckets.map(b => ({
    ...b,
    count: matches.filter(m => {
      const w = Math.max(m.homeScore || 0, m.awayScore || 0);
      return w >= b.range[0] && w < b.range[1];
    }).length,
  }));
  const max = Math.max(...counts.map(c => c.count), 1);

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-4 flex items-center gap-2">
        <span className="w-1.5 h-4 bg-blue-400 rounded-full inline-block" />
        Win Chance Distribution
      </div>
      <div className="space-y-3">
        {counts.map(b => (
          <div key={b.label} className="flex items-center gap-3">
            <span className="font-['Lexend'] text-[10px] text-on-surface-variant w-14 flex-shrink-0">{b.label}</span>
            <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500/80 to-primary-container/80 transition-all"
                style={{ width: `${(b.count / max) * 100}%` }}
              />
            </div>
            <span className="font-['Lexend'] text-[11px] font-bold text-on-surface w-6 text-right">{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Match Card ──────────────────────────────────────────────────────────────
function MatchCard({ match }) {
  const sig = sigStyle(match.signal);
  const homeTeam = { abbr: abbr(match.home), logo: null };
  const awayTeam = { abbr: abbr(match.away), logo: null };
  const winChance = Math.max(match.homeScore || 0, match.awayScore || 0);
  const confColor = match.conf >= 70 ? "text-primary-container" : match.conf >= 60 ? "text-blue-400" : "text-on-surface-variant";

  return (
    <div className="glass-card p-5 rounded-xl border border-white/5 hover:border-primary-container/20 transition-all duration-300 group">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className={cn("px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-tighter", sig.bg, sig.text)}>
          {match.signal}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={cn("w-1.5 h-1.5 rounded-full", sig.dot)} />
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">
            {match.league} · {fmtTime(match.utcDate)}
          </span>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar team={homeTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight">{match.home}</span>
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider">Home</span>
        </div>

        {/* Center score display */}
        <div className="flex flex-col items-center px-4">
          <span className="font-black text-xl text-on-surface-variant italic">VS</span>
          <div className="mt-1 flex items-baseline gap-0.5">
            <span className={cn("font-black text-2xl leading-none", confColor)}>{match.conf}</span>
            <span className="text-on-surface-variant text-xs">%</span>
          </div>
          <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest">Conf.</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar team={awayTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight">{match.away}</span>
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider">Away</span>
        </div>
      </div>

      {/* Win % bars */}
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">Home Win %</span>
            <span className="font-['Lexend'] text-[9px] font-bold text-primary-container">{match.homeScore}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: `${match.homeScore}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">Away Win %</span>
            <span className="font-['Lexend'] text-[9px] font-bold text-blue-400">{match.awayScore}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${match.awayScore}%` }} />
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">BTTS</div>
          <div className="font-['Lexend'] text-sm font-bold text-on-surface">{match.btts}%</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">O2.5</div>
          <div className="font-['Lexend'] text-sm font-bold text-on-surface">{match.over25}%</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">xG</div>
          <div className="font-['Lexend'] text-sm font-bold text-on-surface">{((match.lH || 0) + (match.lA || 0)).toFixed(1)}</div>
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function Today() {
  const today = useMemo(() => {
    // Since data is historical, show the earliest date's matches as "today"
    if (schedule.length === 0) return [];
    const dates = [...new Set(schedule.map(m => m.utcDate.slice(0, 10)))].sort();
    const firstDate = dates[0];
    return schedule.filter(m => m.utcDate.startsWith(firstDate));
  }, []);

  const signalCounts = useMemo(() => {
    const order = ["HIGH SCORING", "BTTS + O2.5", "BTTS", "OVER 2.5", "BALANCED"];
    const counts = {};
    order.forEach(s => { counts[s] = 0; });
    today.forEach(m => { if (counts[m.signal] !== undefined) counts[m.signal]++; else counts[m.signal] = 1; });
    return counts;
  }, [today]);

  const avgConf  = today.length ? Math.round(today.reduce((s, m) => s + m.conf,  0) / today.length) : 0;
  const avgXg    = today.length ? ((today.reduce((s, m) => s + (m.lH || 0) + (m.lA || 0), 0) / today.length)).toFixed(2) : "0.00";
  const highConf = today.filter(m => m.conf >= 70).length;

  return (
    <main className="pt-32 pb-24 max-w-[1280px] mx-auto px-8">

      {/* Header */}
      <section className="mb-12 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-1.5 h-6 bg-primary-container rounded-full inline-block" />
          <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container">AI Engine Active</span>
        </div>
        <h1 className="text-display-xl font-black text-on-surface mb-3 leading-tight">
          Today's <span className="text-primary-container">Picks</span>
        </h1>
        <p className="text-on-surface-variant text-headline-md font-semibold leading-relaxed max-w-2xl">
          {today.length} matches analysed by our neural engine — sorted by highest confidence signal.
        </p>
      </section>

      {/* Stats row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <StatCard icon="calendar_today"   label="Today's Matches"  value={today.length}          sub="Total scheduled"    />
        <StatCard icon="bolt"             label="High Conf Picks"  value={highConf}               sub="Confidence ≥ 70%"   />
        <StatCard icon="percent"          label="Avg Confidence"   value={`${avgConf}%`}          sub="Across all picks"   />
        <StatCard icon="sports_soccer"    label="Avg xG"           value={avgXg}                  sub="Goals expected"     />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <SignalDonut counts={signalCounts} total={today.length} />
        <WinChanceChart matches={today} />
      </section>

      {/* Match cards */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-md font-semibold text-on-surface uppercase tracking-wider flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary-container rounded-full inline-block" />
            Match Cards
          </h2>
          <Link to="/predictions"
            className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-primary-container transition-colors flex items-center gap-1.5">
            Full Schedule <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {today.length === 0 ? (
          <div className="text-center py-20 text-on-surface-variant">No matches found for today.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {today.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        )}
      </section>

      {/* Telegram CTA */}
      <section className="mt-16">
        <div className="relative rounded-2xl overflow-hidden p-8 bg-zinc-950 border border-primary-container/20 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1">
            <div className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-primary-container mb-2">Live Alerts</div>
            <h3 className="text-headline-md font-black text-on-surface mb-2">Get Instant Signal Alerts on Telegram</h3>
            <p className="text-on-surface-variant text-sm">Lineup news, late-value drops, and picks — directly on your phone.</p>
          </div>
          <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-2 bg-primary-container text-on-primary px-6 py-3 rounded-xl font-black text-sm uppercase tracking-tight neon-glow hover:scale-105 active:scale-95 transition-all">
            <span className="material-symbols-outlined text-[18px]">send</span>
            Join Telegram
          </a>
        </div>
      </section>

    </main>
  );
}

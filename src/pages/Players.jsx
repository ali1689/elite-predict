import { useState, useMemo } from "react";
import { usePlayerPredictions } from "@/lib/usePredictions";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import SignInGate from "@/components/SignInGate";

// ── Position config ────────────────────────────────────────────────────────
const POS_STYLE = {
  Attacker:  { bg: "bg-primary-container/15", text: "text-primary-container", label: "ATT" },
  Midfielder:{ bg: "bg-blue-500/15",          text: "text-blue-400",          label: "MID" },
  Defender:  { bg: "bg-violet-500/15",        text: "text-violet-400",        label: "DEF" },
  Goalkeeper:{ bg: "bg-zinc-500/15",          text: "text-zinc-400",          label: "GK"  },
  "":        { bg: "bg-zinc-500/15",          text: "text-zinc-400",          label: "—"   },
};
function posStyle(pos) { return POS_STYLE[pos] ?? POS_STYLE[""]; }

// ── Goal probability ring ──────────────────────────────────────────────────
function ProbRing({ prob }) {
  // prob is 0-1
  const pct   = Math.round(prob * 100);
  const r     = 18;
  const circ  = 2 * Math.PI * r;
  const dash  = (prob * circ).toFixed(1);
  const color = pct >= 40 ? "#39FF14" : pct >= 25 ? "#60A5FA" : "#71717A";

  return (
    <div className="relative flex items-center justify-center w-14 h-14 flex-shrink-0">
      <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
        <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="absolute font-['Lexend'] text-[11px] font-black text-on-surface tabular-nums">
        {pct}%
      </span>
    </div>
  );
}

// ── Stat chip ──────────────────────────────────────────────────────────────
function StatChip({ label, value }) {
  return (
    <div className="flex flex-col items-center bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2 min-w-[52px]">
      <span className="font-['Lexend'] text-sm font-bold text-on-surface tabular-nums">{value}</span>
      <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

// ── Player card ────────────────────────────────────────────────────────────
function PlayerCard({ player }) {
  const ps   = posStyle(player.position);
  const rate = player.gamesSeason > 0
    ? (player.goalsSeason / player.gamesSeason).toFixed(2)
    : "—";

  return (
    <div className="glass-card rounded-xl p-4 flex gap-4 items-start hover:border-primary-container/30 transition-all duration-200 group">
      {/* Ring */}
      <ProbRing prob={player.pAnytime} />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-bold text-on-surface text-sm truncate">{player.playerName}</span>
          <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider", ps.bg, ps.text)}>
            {ps.label}
          </span>
          {player.side && (
            <span className="px-2 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider bg-white/5 text-on-surface-variant">
              {player.side}
            </span>
          )}
        </div>

        <div className="font-['Lexend'] text-[10px] text-on-surface-variant mb-3 truncate flex items-center gap-1">
          <span className="material-symbols-outlined text-[11px]">calendar_today</span>
          <span className="truncate">
            {player.homeTeam && player.awayTeam
              ? `${player.homeTeam} vs ${player.awayTeam} · ${player.matchDate}`
              : player.matchDate || "—"}
          </span>
        </div>

        <div className="flex gap-2 flex-wrap">
          <StatChip label="Goals"    value={player.goalsSeason} />
          <StatChip label="Games"    value={player.gamesSeason} />
          <StatChip label="G/Game"   value={rate} />
          <StatChip label="xG Rate"  value={player.adjLambda.toFixed(3)} />
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="glass-card rounded-xl p-4 flex gap-4 items-start animate-pulse">
      <div className="w-14 h-14 rounded-full bg-white/5 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-white/5 rounded w-2/3" />
        <div className="h-3 bg-white/5 rounded w-1/3" />
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-10 w-14 bg-white/5 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}

const ALL = "ALL";
const POS_OPTIONS = ["ALL", "Attacker", "Midfielder", "Defender"];

export default function Players() {
  const { user, loading: authLoading } = useAuth();
  const { data, loading, error } = usePlayerPredictions({ limit: 600 });

  const [search,      setSearch]      = useState("");
  const [posFilter,   setPosFilter]   = useState("ALL");
  const [sideFilter,  setSideFilter]  = useState("ALL");
  const [sortBy,      setSortBy]      = useState("prob");
  const [minProb,     setMinProb]     = useState(0.70);

  // Deduplicate by playerId — keep the row with the highest pAnytime per player.
  // A player can appear in multiple upcoming fixtures; we surface their best chance.
  const dedupedData = useMemo(() => {
    const map = new Map();
    for (const p of data) {
      const existing = map.get(p.playerId);
      if (!existing || p.pAnytime > existing.pAnytime) {
        map.set(p.playerId, p);
      }
    }
    return [...map.values()];
  }, [data]);

  // Unique sides (from deduped set)
  const sides = useMemo(() => {
    const s = new Set(dedupedData.map(p => p.side).filter(Boolean));
    return ["ALL", ...[...s].sort()];
  }, [dedupedData]);

  const filtered = useMemo(() => {
    let rows = [...dedupedData];
    if (minProb     >  0)     rows = rows.filter(p => p.pAnytime  >= minProb);
    if (posFilter  !== "ALL") rows = rows.filter(p => p.position  === posFilter);
    if (sideFilter !== "ALL") rows = rows.filter(p => p.side      === sideFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(p => p.playerName.toLowerCase().includes(q));
    }
    if (sortBy === "prob")   return rows.sort((a, b) => b.pAnytime    - a.pAnytime);
    if (sortBy === "goals")  return rows.sort((a, b) => b.goalsSeason - a.goalsSeason);
    if (sortBy === "lambda") return rows.sort((a, b) => b.adjLambda   - a.adjLambda);
    if (sortBy === "date")   return rows.sort((a, b) => (a.matchDateRaw > b.matchDateRaw ? 1 : -1));
    return rows;
  }, [dedupedData, minProb, posFilter, sideFilter, search, sortBy]);

  // Top scorers for hero strip (from deduped set)
  const topScorers = useMemo(() =>
    [...dedupedData].sort((a, b) => b.pAnytime - a.pAnytime).slice(0, 5),
    [dedupedData]
  );

  // Members-only gate (shows the page shell + sign-in card, like Today/Upcoming)
  if (authLoading) return null;
  if (!user) return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">
      <SignInGate
        accent="green"
        eyebrow="AI Engine · Goalscorers"
        title={<>Goalscorer <span className="text-primary-container">Picks</span></>}
        lockedLabel="Anytime goalscorer picks"
        description="Sign in to see anytime-goalscorer probabilities, season form, and our top picks for every upcoming match."
      />
    </main>
  );

  return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">

      {/* Hero */}
      <section className="mb-8 md:mb-14 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-8 h-[2px] bg-primary-container rounded-full" />
          <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container">
            AI Goalscorer Intelligence
          </span>
        </div>
        <h1 className="text-[2.25rem] sm:text-5xl md:text-display-xl font-black text-on-surface mb-3 leading-tight tracking-tight md:tracking-[-0.04em]">
          Player <span className="text-primary-container">Goal</span> Probabilities
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-base sm:text-lg md:text-headline-md font-semibold leading-relaxed">
          {loading
            ? "Loading goalscorer data..."
            : `${dedupedData.length} unique players across upcoming fixtures — ranked by anytime goalscorer probability.`}
        </p>
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-['Lexend']">
            Could not load player data — check Supabase connection.
          </div>
        )}
      </section>

      {/* Top 5 hero strip */}
      {!loading && topScorers.length > 0 && (
        <section className="mb-10 md:mb-14">
          <h2 className="text-base font-semibold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-1.5 h-5 bg-primary-container rounded-full inline-block" />
            Top Goalscorer Picks
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {topScorers.map((p, i) => {
              const ps  = posStyle(p.position);
              const pct = Math.round(p.pAnytime * 100);
              return (
                <div key={p.id ?? i}
                  className="glass-card rounded-xl p-4 flex flex-col items-center gap-3 text-center hover:border-primary-container/40 transition-all">
                  <div className="w-8 h-8 rounded-full bg-primary-container/10 border border-primary-container/30 flex items-center justify-center">
                    <span className="font-['Lexend'] text-[11px] font-black text-primary-container">#{i + 1}</span>
                  </div>
                  <ProbRing prob={p.pAnytime} />
                  <div>
                    <div className="font-bold text-on-surface text-sm leading-tight">{p.playerName}</div>
                    <span className={cn("px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider mt-1 inline-block", ps.bg, ps.text)}>
                      {ps.label}
                    </span>
                  </div>
                  <div className="font-['Lexend'] text-[10px] text-on-surface-variant">
                    {p.goalsSeason}G in {p.gamesSeason} games
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="mb-6 space-y-3">

        {/* Probability threshold */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { val: 0,    label: "All"  },
            { val: 0.60, label: "60%+" },
            { val: 0.70, label: "70%+" },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setMinProb(val)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                minProb === val
                  ? "bg-primary-container text-on-primary border-primary-container neon-glow"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
              )}>
              <span className="material-symbols-outlined text-[12px]">sports_soccer</span>
              {label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center bg-surface-container-high border border-white/5 rounded-lg px-4 py-2.5 gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Search player name..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none w-full font-sans"
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-on-surface-variant hover:text-on-surface">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Position filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {POS_OPTIONS.map(p => (
            <button key={p} onClick={() => setPosFilter(p)}
              className={cn(
                "px-3 py-1.5 rounded-full font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                posFilter === p
                  ? "bg-primary-container text-on-primary border-primary-container"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50"
              )}>
              {p === "ALL" ? "All Positions" : p + "s"}
            </button>
          ))}
        </div>

        {/* Side + Sort */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {sides.map(s => (
            <button key={s} onClick={() => setSideFilter(s)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                sideFilter === s
                  ? "bg-primary-container text-on-primary border-primary-container"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50"
              )}>
              {s === "ALL" ? "Both Sides" : s}
            </button>
          ))}
          <div className="w-px bg-white/10 self-stretch flex-shrink-0 mx-1" />
          {[
            { key: "prob",   label: "By Probability" },
            { key: "date",   label: "By Date"        },
            { key: "goals",  label: "By Goals"       },
            { key: "lambda", label: "By xG Rate"     },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setSortBy(key)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                sortBy === key
                  ? "bg-primary-container text-on-primary border-primary-container"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50"
              )}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Count */}
      <div className="font-['Lexend'] text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">
        {filtered.length} player{filtered.length !== 1 ? "s" : ""}
      </div>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading
          ? [...Array(12)].map((_, i) => <Skeleton key={i} />)
          : filtered.length > 0
            ? filtered.map((p, i) => <PlayerCard key={p.id ?? i} player={p} />)
            : (
              <div className="col-span-full text-center py-16 text-on-surface-variant font-['Lexend'] text-sm">
                No players found for the selected filters.
              </div>
            )
        }
      </section>
    </main>
  );
}

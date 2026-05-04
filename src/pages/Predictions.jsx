import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import TeamAvatar from "@/components/TeamAvatar";
import MatchRow from "@/components/MatchRow";
import { useAllPredictions } from "@/lib/usePredictions";
import { sigStyle, tierStyle, fmtDate, fmtTime, abbr } from "@/data/matches";
import { cn } from "@/lib/utils";

const CTA_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDFSZ87SJRX2aa025ExYPpRA4_nsFny4c9anPKMHcdvtwFtyOobqOi1oN6pill283E0teUZJJhC1T5OqHzMRFuU0Vj0-06UY4cwM7YhmN1R7XcquQ-ksfJm5Vf-sYZLZnWzIkTE6j8uANAJS4ZVeuihMgaaCgI_TVCNlrTGFeLlCZiu1bZWfWECbm3RkAcTmyudBhvmvlqJIt7q0PHlXkEayMvSQojlpcUlMNgCUAejjZYsG5EUQ";

const ALL = "ALL";
const SORT_OPTIONS = [
  { key: "conf",   label: "By Confidence" },
  { key: "date",   label: "By Date"       },
  { key: "xg",     label: "By xG"         },
];
const TIER_FILTER_OPTIONS = [
  { key: "ALL", label: "All Tiers"  },
  { key: "A",   label: "🔥 Tier A"  },
  { key: "B",   label: "✅ Tier B"  },
  { key: "C",   label: "⚖️ Tier C"  },
];

// ── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-white/5 rounded-lg", className)} />;
}

// ── Featured card (top picks) ─────────────────────────────────────────────
function FeaturedCard({ match }) {
  const sig  = sigStyle(match.signal);
  const tier = tierStyle(match.tier);
  const homeTeam = { abbr: abbr(match.home), name: match.home, logo: null };
  const awayTeam = { abbr: abbr(match.away), name: match.away, logo: null };
  const xg = ((match.lH || 0) + (match.lA || 0)).toFixed(2);
  const extraSignals = (match.allSignals || []).slice(1, 3);

  return (
    <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-primary-container/30 transition-all duration-300 flex flex-col gap-5">

      {/* Tier badge top-right */}
      <div className="absolute top-0 right-0 p-4">
        <span className={cn(
          "px-3 py-1 rounded text-[9px] font-black uppercase tracking-tighter border",
          tier.bg, tier.text, tier.border
        )}>
          {tier.label}
        </span>
      </div>

      {/* League + time */}
      <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest">
        {match.comp} · {fmtDate(match.utcDate)} · {fmtTime(match.utcDate)}
      </div>

      {/* Teams */}
      <div className="flex justify-between items-center">
        <div className="text-center">
          <TeamAvatar team={homeTeam} />
          <div className="font-bold text-sm mt-2 text-on-surface">{homeTeam.abbr}</div>
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase mt-0.5">{match.homeElo} elo</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-on-surface-variant font-black text-2xl italic">VS</div>
          <div className="font-['Lexend'] text-[9px] text-on-surface-variant mt-1 uppercase tracking-widest">
            xG {xg}
          </div>
        </div>
        <div className="text-center">
          <TeamAvatar team={awayTeam} />
          <div className="font-bold text-sm mt-2 text-on-surface">{awayTeam.abbr}</div>
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase mt-0.5">{match.awayElo} elo</div>
        </div>
      </div>

      {/* Primary signal + confidence */}
      <div className="bg-black/40 p-4 rounded-lg border border-primary-container/20 group-hover:border-primary-container transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Primary Signal</div>
            <div className={cn("font-black text-base leading-tight", sig.text)}>{match.signal}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Confidence</div>
            <div className="text-on-surface font-bold font-['Lexend'] text-xl">{match.conf}%</div>
          </div>
        </div>
      </div>

      {/* Probability bars */}
      <div className="space-y-2">
        {[
          { label: "Home to score",    value: match.homeOver05, color: "bg-primary-container" },
          { label: "Home 2+ goals",    value: match.homeOver15, color: "bg-emerald-400"       },
          { label: "Away to score",    value: match.awayOver05, color: "bg-blue-400"           },
          { label: "Away 2+ goals",    value: match.awayOver15, color: "bg-sky-400"            },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex justify-between mb-0.5">
              <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">{label}</span>
              <span className="font-['Lexend'] text-[9px] font-bold text-on-surface tabular-nums">{value}%</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "BTTS",  value: `${match.btts}%`   },
          { label: "O2.5",  value: `${match.over25}%` },
          { label: "U2.5",  value: `${match.under25}%`},
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
            <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</div>
            <div className="font-['Lexend'] text-sm font-semibold text-on-surface">{value}</div>
          </div>
        ))}
      </div>

      {/* Extra signals */}
      {extraSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
          {extraSignals.map(s => {
            const ss = sigStyle(s.label ?? s.type);
            return (
              <span key={s.type} className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider", ss.bg, ss.text)}>
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
export default function Predictions() {
  const { data: allMatches, loading, error } = useAllPredictions();

  const [activeLeague, setActiveLeague] = useState(ALL);
  const [activeTier,   setActiveTier]   = useState("ALL");
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortBy,       setSortBy]       = useState("conf");

  const leagues = useMemo(() => {
    const set = new Set(allMatches.map(m => m.comp));
    return [ALL, ...[...set].sort()];
  }, [allMatches]);

  const filtered = useMemo(() => {
    let rows = allMatches;
    if (activeLeague !== ALL) rows = rows.filter(m => m.comp === activeLeague);
    if (activeTier   !== "ALL") rows = rows.filter(m => m.tier === activeTier);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(m =>
        m.home.toLowerCase().includes(q) ||
        m.away.toLowerCase().includes(q)
      );
    }
    if (sortBy === "conf") return [...rows].sort((a, b) => b.conf - a.conf);
    if (sortBy === "xg")   return [...rows].sort((a, b) => (b.xgTotal||0) - (a.xgTotal||0));
    return [...rows].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  }, [allMatches, activeLeague, activeTier, searchQuery, sortBy]);

  const topPicks = useMemo(() =>
    [...allMatches].sort((a, b) => b.conf - a.conf).slice(0, 3),
  [allMatches]);

  return (
    <main className="pt-32 pb-24 max-w-[1280px] mx-auto px-8">

      {/* Hero */}
      <section className="mb-16 animate-fade-up">
        <h1 className="text-display-xl font-black text-on-surface mb-4 leading-tight">
          Upcoming <span className="text-primary-container">Precision</span> Picks
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-headline-md font-semibold leading-relaxed">
          {loading
            ? "Loading predictions from AI engine…"
            : `${allMatches.length} real predictions across ${leagues.length - 1} league${leagues.length - 1 !== 1 ? "s" : ""} — powered by Elo ratings, Poisson xG, and calibrated ML.`}
        </p>
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-['Lexend']">
            ⚠️ Could not load predictions — check Supabase connection.
          </div>
        )}
      </section>

      {/* Top Picks */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-headline-md font-semibold text-on-surface uppercase tracking-wider flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary-container rounded-full inline-block" />
            Highest Confidence Picks
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-96" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPicks.map(m => <FeaturedCard key={m.id} match={m} />)}
          </div>
        )}
      </section>

      {/* Filters */}
      <section className="mb-8 space-y-4">
        {/* League tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {leagues.map(l => (
            <button key={l} onClick={() => setActiveLeague(l)}
              className={cn(
                "px-4 py-1.5 rounded-full font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0",
                activeLeague === l
                  ? "bg-primary-container text-on-primary"
                  : "border border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
              )}>
              {l === ALL ? "All Leagues" : l}
            </button>
          ))}
        </div>

        {/* Tier + search + sort row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tier filter */}
          <div className="flex gap-1.5">
            {TIER_FILTER_OPTIONS.map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTier(key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest transition-all",
                  activeTier === key
                    ? "bg-primary-container text-on-primary"
                    : "border border-white/10 text-on-surface-variant hover:border-primary-container/40"
                )}>
                {label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center bg-surface-container-high border border-white/5 rounded-lg px-4 py-2 gap-2 flex-1 min-w-[180px]">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
            <input
              type="text" placeholder="Search teams…" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none w-full font-sans"
            />
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            {SORT_OPTIONS.map(({ key, label }) => (
              <button key={key} onClick={() => setSortBy(key)}
                className={cn(
                  "px-4 py-2 rounded-lg font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest transition-all",
                  sortBy === key ? "bg-primary-container text-on-primary" : "border border-white/10 text-on-surface-variant hover:border-primary-container/40"
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Full schedule table */}
      <section className="mb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-md font-semibold text-on-surface uppercase tracking-wider">Full Schedule</h2>
          <div className="font-['Lexend'] text-[11px] text-on-surface-variant uppercase tracking-widest">
            {filtered.length} Match{filtered.length !== 1 ? "es" : ""}
          </div>
        </div>

        <div className="w-full overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {[
                  "Date / Time",
                  "Matchup + Elo",
                  "League",
                  "Tier · Signal",
                  "Home Goals",
                  "Away Goals",
                  "BTTS",
                  "O2.5",
                  "U2.5",
                  "xG",
                  "Conf",
                ].map(h => (
                  <th key={h} className="px-5 py-4 font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {[...Array(11)].map((_, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="animate-pulse h-4 bg-white/5 rounded w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : filtered.length > 0
                  ? filtered.map(m => <MatchRow key={m.id} match={m} />)
                  : (
                    <tr>
                      <td colSpan={11} className="px-6 py-16 text-center text-on-surface-variant font-['Lexend'] text-sm">
                        No matches found for the selected filters.
                      </td>
                    </tr>
                  )
              }
            </tbody>
          </table>
        </div>
      </section>

      {/* Telegram CTA */}
      <section>
        <div className="relative rounded-3xl overflow-hidden p-12 bg-zinc-950 border border-white/10">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <img src={CTA_BG} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
          <div className="relative z-10 md:w-2/3">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-12 h-[1px] bg-primary-container" />
              <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container">Live Community Updates</span>
            </div>
            <h3 className="text-display-xl font-black text-on-surface mb-6 leading-tight">Join 50k+ Sharp Bettors on Telegram</h3>
            <p className="text-on-surface-variant mb-10 text-headline-md font-semibold leading-relaxed">
              Get instant signal alerts, Elo-ranked picks, and late-market value drops directly on your phone.
            </p>
            <Button size="lg" variant="primary" className="neon-glow font-black uppercase tracking-tight flex items-center gap-3 group" asChild>
              <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
                JOIN OUR TELEGRAM
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">send</span>
              </a>
            </Button>
          </div>
        </div>
      </section>

    </main>
  );
}

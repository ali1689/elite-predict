import { useMemo } from "react";
import { Link } from "react-router-dom";
import TeamAvatar from "@/components/TeamAvatar";
import { fmtTime, abbr } from "@/data/matches";
import { cn } from "@/lib/utils";
import { useCountUp } from "@/lib/useCountUp";
import { useRiskyPicks } from "@/lib/useRiskyPicks";
import { useAuth } from "@/context/AuthContext";
import SignInGate from "@/components/SignInGate";

// ── Market → display label + icon ──────────────────────────────────────────
const MARKET_META = {
  "Home Win (1)":        { short: "Home Win",  icon: "home" },
  "Away Win (2)":        { short: "Away Win",  icon: "flight_takeoff" },
  "Draw (X)":            { short: "Draw",      icon: "drag_handle" },
  "Over 2.5 Goals":      { short: "Over 2.5",  icon: "trending_up" },
  "Under 2.5 Goals":     { short: "Under 2.5", icon: "trending_down" },
  "Both Teams to Score": { short: "BTTS",      icon: "swap_horiz" },
};
function marketMeta(m) {
  return MARKET_META[m] ?? { short: m, icon: "bolt" };
}

// ── Loading skeleton ───────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-surface-container rounded-lg", className)} />;
}
function CardSkeleton() {
  return (
    <div className="glass-card p-5 rounded-xl space-y-4">
      <div className="flex justify-between"><Skeleton className="h-5 w-16" /><Skeleton className="h-4 w-24" /></div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-12 w-12 rounded-full" />
        <Skeleton className="h-8 w-14" />
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-2 w-full" />
    </div>
  );
}

// ── Compact stat tile ──────────────────────────────────────────────────────
function Stat({ icon, label, countTo, suffix = "", prefix = "", decimals = 0, loading }) {
  const animated = useCountUp(countTo ?? 0, { decimals });
  return (
    <div className="glass-card rounded-xl p-4 sm:p-5 flex flex-col gap-1 border-amber-400/20">
      <div className="flex items-center gap-2 mb-0.5">
        <span className="material-symbols-outlined text-amber-400 text-[18px]">{icon}</span>
        <span className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">{label}</span>
      </div>
      {loading
        ? <Skeleton className="h-7 w-16 mt-1" />
        : <div className="font-black text-2xl text-on-surface leading-none tabular-nums">{prefix}{animated}{suffix}</div>}
    </div>
  );
}

// ── Edge comparison bar (model vs bookmaker fair price) ─────────────────────
function EdgeBar({ model, implied }) {
  const m = Math.min(Math.max(model, 0), 100);
  const i = Math.min(Math.max(implied, 0), 100);
  return (
    <div className="space-y-2">
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-['Lexend'] text-[9px] uppercase tracking-widest text-amber-400">Our model</span>
          <span className="font-['Lexend'] text-[10px] font-bold text-amber-400 tabular-nums">{model}%</span>
        </div>
        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-300" style={{ width: `${m}%` }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="font-['Lexend'] text-[9px] uppercase tracking-widest text-on-surface-variant">Bookmaker</span>
          <span className="font-['Lexend'] text-[10px] font-bold text-on-surface-variant tabular-nums">{implied}%</span>
        </div>
        <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-on-surface-variant/40" style={{ width: `${i}%` }} />
        </div>
      </div>
    </div>
  );
}

// ── Risky pick card ────────────────────────────────────────────────────────
function RiskyCard({ pick }) {
  const meta = marketMeta(pick.market);
  const homeTeam = { abbr: abbr(pick.home), name: pick.home, logo: null };
  const awayTeam = { abbr: abbr(pick.away), name: pick.away, logo: null };

  return (
    <div className="relative glass-card p-5 rounded-xl flex flex-col gap-4 border border-amber-400/25
                    hover:border-amber-400/50 transition-all duration-300
                    shadow-[0_0_24px_rgba(251,191,36,0.06)] hover:shadow-[0_0_32px_rgba(251,191,36,0.16)]">

      {/* Header: rank + comp + time */}
      <div className="flex items-start justify-between gap-2">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider
                         bg-amber-400/15 text-amber-400 border border-amber-400/30">
          <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
          #{pick.rank} Value
        </span>
        <div className="text-right flex-shrink-0">
          <div className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest truncate max-w-[140px]">{pick.competition}</div>
          <div className="font-['Lexend'] text-[10px] font-semibold text-on-surface mt-0.5">{fmtTime(pick.utcDate)}</div>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamAvatar team={homeTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight truncate max-w-full">{pick.home}</span>
        </div>
        <span className="font-black text-base text-on-surface-variant italic px-2">VS</span>
        <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
          <TeamAvatar team={awayTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight truncate max-w-full">{pick.away}</span>
        </div>
      </div>

      {/* The pick + odds */}
      <div className="flex items-center justify-between rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-amber-400 text-[20px]">{meta.icon}</span>
          <div className="min-w-0">
            <div className="font-['Lexend'] text-[8px] uppercase tracking-widest text-on-surface-variant">The pick</div>
            <div className="font-black text-sm text-on-surface truncate">{meta.short}</div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-['Lexend'] text-[8px] uppercase tracking-widest text-on-surface-variant">Odds</div>
          <div className="font-black text-lg text-amber-400 leading-none tabular-nums">{pick.odds.toFixed(2)}</div>
        </div>
      </div>

      {/* Edge bars */}
      <EdgeBar model={pick.modelProb} implied={pick.impliedProb} />

      {/* Edge highlight */}
      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30">
        <span className="font-['Lexend'] text-[9px] uppercase tracking-widest text-on-surface-variant">Model edge vs price</span>
        <span className="inline-flex items-center gap-1 font-black text-sm text-amber-400 tabular-nums">
          <span className="material-symbols-outlined text-[14px]">north_east</span>
          +{pick.edge} pts
        </span>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function RiskyPicks() {
  const { user, loading: authLoading } = useAuth();
  const { data: picks, loading, error, lastFetch } = useRiskyPicks();

  const sorted = useMemo(() => [...picks].sort((a, b) => a.rank - b.rank), [picks]);

  const avgEdge = sorted.length ? Math.round(sorted.reduce((s, p) => s + p.edge, 0) / sorted.length) : 0;
  const avgOdds = sorted.length ? sorted.reduce((s, p) => s + p.odds, 0) / sorted.length : 0;
  const topEdge = sorted.length ? Math.max(...sorted.map(p => p.edge)) : 0;

  // Members-only gate (shows the page shell + sign-in card, like Today/Upcoming)
  if (authLoading) return null;
  if (!user) return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">
      <SignInGate
        accent="amber"
        eyebrow="Value Engine · Higher Reward"
        title={<>Risky <span className="text-amber-400">Picks</span> of the Day</>}
        lockedLabel="Today's value picks"
        description="Sign in to see the day's best value bets — markets where our model's probability beats the bookmaker's price."
      />
    </main>
  );

  return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">

      {/* Header */}
      <section className="mb-8 md:mb-10 animate-fade-up">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-1.5 h-6 bg-amber-400 rounded-full inline-block" />
          <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-amber-400">
            Value Engine · Higher Reward
          </span>
        </div>
        <h1 className="text-[2.25rem] sm:text-5xl md:text-display-xl font-black text-on-surface mb-3 leading-tight tracking-tight md:tracking-[-0.04em]">
          Risky <span className="text-amber-400">Picks</span> of the Day
        </h1>
        <p className="text-on-surface-variant text-base sm:text-lg md:text-headline-md font-semibold leading-relaxed max-w-2xl">
          {loading
            ? "Scanning today's odds for value…"
            : sorted.length > 0
              ? `${sorted.length} pick${sorted.length !== 1 ? "s" : ""} where our model beats the bookmaker's price — higher odds, lower hit rate.`
              : "No value picks cleared the bar today. Quality over quantity — check back after the next run."}
        </p>
        {lastFetch && (
          <p className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">
            Updated {lastFetch.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-['Lexend']">
            ⚠️ Could not load risky picks — check the connection.
          </div>
        )}
      </section>

      {/* Risk disclaimer */}
      <div className="mb-8 md:mb-10 rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 sm:px-5 py-4 flex items-start gap-3">
        <span className="material-symbols-outlined text-amber-400 text-[22px] flex-shrink-0">warning</span>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          <span className="font-bold text-on-surface">These are higher-variance bets.</span> Each one is a market where the
          model's probability is meaningfully above the bookmaker's fair price — genuine value — but they win
          <span className="font-semibold text-on-surface"> less often</span> than our safe daily picks. They're graded in their own bucket and never affect the main track record. Stake small and bet responsibly.
        </p>
      </div>

      {/* Stats */}
      {sorted.length > 0 && (
        <section className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
          <Stat icon="bolt"       label="Value Picks" countTo={sorted.length}        loading={loading} />
          <Stat icon="trending_up" label="Avg Edge"   countTo={avgEdge} suffix=" pts" loading={loading} />
          <Stat icon="payments"   label="Avg Odds"    countTo={avgOdds} decimals={2} loading={loading} />
        </section>
      )}

      {/* Cards */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h2 className="text-base md:text-headline-md font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2 md:gap-3">
            <span className="w-1.5 h-5 md:h-6 bg-amber-400 rounded-full inline-block" />
            Best Value Bets
          </h2>
          <Link to="/today"
            className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-amber-400 transition-colors flex items-center gap-1.5">
            Safe Picks
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-14 md:py-20 glass-card rounded-xl border border-amber-400/20">
            <span className="material-symbols-outlined text-[48px] text-amber-400/70 mb-4 block">savings</span>
            <div className="text-on-surface font-bold text-lg mb-2">No value on the board today</div>
            <div className="text-on-surface-variant text-sm mb-6 px-4 max-w-md mx-auto">
              The model didn't find any market priced softly enough to clear the edge bar. That's by design — a risky pick only shows when it's genuinely good value.
            </div>
            <Link to="/today"
              className="inline-flex items-center gap-2 bg-amber-400 text-zinc-950 px-5 py-2.5 rounded-lg font-black text-sm uppercase tracking-tight">
              See Today's Safe Picks
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
            {sorted.map(p => <RiskyCard key={p.id} pick={p} />)}
          </div>
        )}
      </section>
    </main>
  );
}

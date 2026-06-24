import { useMemo, useState, useEffect, useCallback } from "react";
import { useTrackRecord, computeStats } from "@/lib/useTrackRecord";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 15;

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(str) {
  if (!str) return "—";
  try {
    return new Date(str + "T12:00:00Z").toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });
  } catch { return str; }
}

function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-surface-container rounded-xl", className)} />;
}

// ── Animated rate bar ─────────────────────────────────────────────────────────
function RateBar({ rate, className, height = "h-1.5", animate = false }) {
  const pct = Math.min(100, Math.max(0, rate ?? 0));
  const color =
    pct >= 70 ? "bg-emerald-500" :
    pct >= 55 ? "bg-amber-400"   :
                "bg-red-500";
  return (
    <div className={cn("rounded-full bg-surface-container overflow-hidden", height, className)}>
      <div
        className={cn("h-full rounded-full transition-all duration-300", color, animate && "group-hover:opacity-90")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Accent colour map ─────────────────────────────────────────────────────────
const ACCENT = {
  green: {
    icon:   "bg-emerald-500/15 text-emerald-500",
    glow:   "hover:shadow-[0_0_32px_rgba(16,185,129,0.22)]",
    border: "hover:border-emerald-500/35",
    shine:  "from-emerald-500/8",
  },
  amber: {
    icon:   "bg-amber-400/15 text-amber-400",
    glow:   "hover:shadow-[0_0_32px_rgba(251,191,36,0.22)]",
    border: "hover:border-amber-400/35",
    shine:  "from-amber-400/8",
  },
  red: {
    icon:   "bg-red-500/15 text-red-500",
    glow:   "hover:shadow-[0_0_32px_rgba(239,68,68,0.22)]",
    border: "hover:border-red-500/35",
    shine:  "from-red-500/8",
  },
  blue: {
    icon:   "bg-blue-400/15 text-blue-400",
    glow:   "hover:shadow-[0_0_32px_rgba(96,165,250,0.22)]",
    border: "hover:border-blue-400/35",
    shine:  "from-blue-400/8",
  },
  default: {
    icon:   "bg-primary-container/15 text-primary-container",
    glow:   "hover:shadow-[0_0_32px_rgba(100,130,255,0.18)]",
    border: "hover:border-primary-container/35",
    shine:  "from-primary-container/8",
  },
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, sub, accent, children }) {
  const a = ACCENT[accent] ?? ACCENT.default;
  return (
    <div className={cn(
      "glass-card rounded-2xl p-5 flex flex-col gap-2 relative overflow-hidden",
      "border border-transparent transition-all duration-150 cursor-default",
      "hover:-translate-y-1 hover:scale-[1.015]",
      a.glow, a.border, "group",
    )}>
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-100 pointer-events-none",
        a.shine,
      )} />
      <div className={cn(
        "w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-all duration-150 group-hover:scale-110 group-hover:rotate-3",
        a.icon,
      )}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div className="text-2xl font-black tracking-tight text-on-surface relative">
        {children ?? value}
      </div>
      <div className="font-['Lexend'] text-[10px] uppercase tracking-widest text-on-surface-variant relative">{label}</div>
      {sub && <div className="text-[11px] text-on-surface-variant/70 mt-0.5 relative">{sub}</div>}
    </div>
  );
}

// ── Signal row ────────────────────────────────────────────────────────────────
function SignalRow({ signal, hits, total, rate, rank, selected, onClick }) {
  const badge =
    rate >= 70 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
    rate >= 55 ? "bg-amber-400/10 text-amber-400 border-amber-400/20"       :
                 "bg-red-500/10 text-red-500 border-red-500/20";

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 py-3 border-b border-outline-variant/30 last:border-0",
        "cursor-pointer rounded-xl px-2 -mx-2 transition-all duration-100 group",
        selected
          ? "bg-surface-container/80"
          : "hover:bg-surface-container/50",
      )}
    >
      <span className="w-5 text-[11px] font-['Lexend'] text-on-surface-variant/50 text-right shrink-0 transition-colors group-hover:text-on-surface-variant">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-on-surface truncate transition-colors group-hover:text-primary-container">
          {signal}
        </div>
        <RateBar rate={rate} className="mt-1.5 max-w-[200px]" />
      </div>
      <div className="text-[11px] text-on-surface-variant shrink-0">{hits}/{total}</div>
      <span className={cn(
        "shrink-0 font-['Lexend'] font-bold text-[12px] px-2 py-0.5 rounded-lg border transition-transform duration-200 group-hover:scale-105",
        badge,
      )}>
        {rate.toFixed(0)}%
      </span>
      <span className={cn(
        "material-symbols-outlined text-[16px] text-on-surface-variant/40 transition-all duration-100 shrink-0",
        selected ? "rotate-180 text-primary-container" : "group-hover:text-on-surface-variant",
      )}>
        expand_more
      </span>
    </div>
  );
}

// ── Signal detail panel (expands on click) ────────────────────────────────────
function SignalDetail({ signal, hits, total, rate, results }) {
  const matching = results.filter(r => r.signal === signal).slice(0, 8);
  return (
    <div className="mx-2 mb-2 px-3 py-3 rounded-xl bg-surface-container/60 border border-outline-variant/20 space-y-2">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex gap-1">
          {matching.map((r, i) => (
            <div
              key={i}
              title={`${r.home} vs ${r.away} · ${r.homeScore}–${r.awayScore}`}
              className={cn(
                "w-5 h-5 rounded flex items-center justify-center text-[10px] font-black transition-transform hover:scale-125 cursor-default",
                r.correct ? "bg-emerald-500/20 text-emerald-500" : "bg-red-500/20 text-red-500",
              )}
            >
              {r.correct ? "✓" : "✗"}
            </div>
          ))}
          {total > 8 && (
            <div className="w-5 h-5 rounded bg-surface-high flex items-center justify-center text-[9px] text-on-surface-variant font-bold">
              +{total - 8}
            </div>
          )}
        </div>
        <div className="text-[11px] text-on-surface-variant">
          {hits} wins · {total - hits} losses
        </div>
      </div>
    </div>
  );
}

// ── Result row ────────────────────────────────────────────────────────────────
function ResultRow({ result, index }) {
  const { home, away, signal, homeScore, awayScore, correct, matchDate, tier } = result;

  const tierColor = {
    A: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    B: "text-blue-400  bg-blue-400/10  border-blue-400/20",
    C: "text-zinc-400  bg-zinc-400/10  border-zinc-400/20",
  }[tier] ?? "text-zinc-400 bg-zinc-400/10 border-zinc-400/20";

  const outcomeColor =
    correct === true  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" :
    correct === false ? "bg-red-500     shadow-[0_0_8px_rgba(239,68,68,0.5)]"  :
                        "bg-zinc-500";

  const rowHover =
    correct === true  ? "hover:bg-emerald-500/5 hover:border-l-2 hover:border-emerald-500/40" :
    correct === false ? "hover:bg-red-500/5     hover:border-l-2 hover:border-red-500/40"     :
                        "hover:bg-surface-container/50";

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 border-b border-outline-variant/20 last:border-0",
        "transition-all duration-100 rounded-lg px-2 -mx-2 cursor-default group",
        rowHover,
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Outcome indicator */}
      <div className={cn("w-2 h-2 rounded-full shrink-0 transition-all duration-100 group-hover:scale-150", outcomeColor)} />

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-on-surface truncate group-hover:text-on-surface transition-colors">
          <span className="group-hover:text-primary-container transition-colors">{home}</span>
          <span className="text-on-surface-variant font-normal mx-1">vs</span>
          {away}
        </div>
        <div className="font-['Lexend'] text-[10px] text-on-surface-variant/60 uppercase tracking-wider truncate mt-0.5">
          {signal}
        </div>
      </div>

      {/* Score pill */}
      {homeScore !== null && awayScore !== null && (
        <div className={cn(
          "font-black text-[13px] shrink-0 tabular-nums px-2.5 py-0.5 rounded-lg transition-all duration-100",
          correct === true  ? "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20" :
          correct === false ? "bg-red-500/10 text-red-500 group-hover:bg-red-500/20"             :
                              "bg-surface-container text-on-surface",
        )}>
          {homeScore}–{awayScore}
        </div>
      )}

      {/* Tier badge */}
      <span className={cn(
        "font-['Lexend'] text-[10px] font-bold px-2 py-0.5 rounded-lg border shrink-0 transition-transform duration-200 group-hover:scale-105",
        tierColor,
      )}>
        {tier}
      </span>

      {/* Date */}
      <div className="font-['Lexend'] text-[10px] text-on-surface-variant/50 shrink-0 hidden sm:block w-20 text-right transition-colors group-hover:text-on-surface-variant/80">
        {fmtDate(matchDate)}
      </div>
    </div>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────────
function TierCard({ tier, data }) {
  const { hits, total } = data;
  if (total === 0) return null;
  const rate = (hits / total) * 100;

  const styles = {
    A: {
      base:   "border-amber-400/20 bg-amber-400/5",
      text:   "text-amber-400",
      glow:   "hover:shadow-[0_0_28px_rgba(251,191,36,0.18)] hover:border-amber-400/40",
      label:  "🔥 Strong",
    },
    B: {
      base:   "border-blue-400/20 bg-blue-400/5",
      text:   "text-blue-400",
      glow:   "hover:shadow-[0_0_28px_rgba(96,165,250,0.18)] hover:border-blue-400/40",
      label:  "✅ Good",
    },
    C: {
      base:   "border-zinc-400/20 bg-zinc-400/5",
      text:   "text-zinc-400",
      glow:   "hover:shadow-[0_0_28px_rgba(161,161,170,0.18)] hover:border-zinc-400/40",
      label:  "⚖️ Speculative",
    },
  }[tier] ?? { base: "", text: "text-zinc-400", glow: "", label: "" };

  return (
    <div className={cn(
      "rounded-xl border p-4 flex flex-col gap-2 cursor-default group",
      "transition-all duration-150 hover:-translate-y-1",
      styles.base, styles.glow,
    )}>
      <div className="flex items-center justify-between">
        <div>
          <div className={cn("font-['Lexend'] font-black text-[12px] uppercase tracking-widest", styles.text)}>
            Tier {tier}
          </div>
          <div className="text-[10px] text-on-surface-variant/60 mt-0.5">{styles.label}</div>
        </div>
        <span className={cn("font-black text-2xl transition-transform duration-300 group-hover:scale-110", styles.text)}>
          {rate.toFixed(0)}%
        </span>
      </div>
      <RateBar rate={rate} height="h-2" animate />
      <div className="flex items-center justify-between text-[11px] text-on-surface-variant/60 mt-0.5">
        <span>{hits} hits</span>
        <span>{total} picks</span>
      </div>
    </div>
  );
}

// ── Filter pill ───────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "font-['Lexend'] text-[11px] uppercase tracking-widest px-3 py-1.5 rounded-xl border transition-all duration-100",
        active
          ? "bg-primary-container text-on-primary border-primary-container shadow-[0_0_16px_rgba(100,130,255,0.3)]"
          : "border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline hover:bg-surface-container",
      )}
    >
      {label}
    </button>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center">
        <span className="material-symbols-outlined text-[32px] text-on-surface-variant">history</span>
      </div>
      <div>
        <div className="font-black text-lg text-on-surface mb-1">No results yet</div>
        <div className="text-sm text-on-surface-variant max-w-xs">
          Settled results appear here once matches finish and the pipeline exports scores.
          Check back after today's matches.
        </div>
      </div>
    </div>
  );
}

// ── Scroll-to-top button ──────────────────────────────────────────────────────
function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-8 right-6 z-50 w-11 h-11 rounded-2xl",
        "bg-primary-container text-on-primary shadow-lg",
        "flex items-center justify-center",
        "transition-all duration-150",
        "hover:scale-110 hover:shadow-[0_0_24px_rgba(100,130,255,0.45)] active:scale-95",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
    </button>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  // Build visible page numbers with ellipsis
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-4 pb-1">
      {/* Prev */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className={cn(
          "w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-100",
          page === 1
            ? "border-outline-variant/30 text-on-surface-variant/30 cursor-not-allowed"
            : "border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline",
        )}
      >
        <span className="material-symbols-outlined text-[18px]">chevron_left</span>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-[12px] text-on-surface-variant/40">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "w-9 h-9 rounded-xl border font-['Lexend'] text-[12px] font-bold transition-all duration-100",
              p === page
                ? "bg-primary-container text-on-primary border-primary-container shadow-[0_0_16px_rgba(100,130,255,0.3)] scale-105"
                : "border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline",
            )}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className={cn(
          "w-9 h-9 rounded-xl border flex items-center justify-center transition-all duration-100",
          page === totalPages
            ? "border-outline-variant/30 text-on-surface-variant/30 cursor-not-allowed"
            : "border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-on-surface hover:border-outline",
        )}
      >
        <span className="material-symbols-outlined text-[18px]">chevron_right</span>
      </button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function TrackRecord() {
  const { data: results, loading, error } = useTrackRecord({ limit: 500 });
  const stats = useMemo(() => computeStats(results), [results]);

  const [expandedSignal, setExpandedSignal] = useState(null);
  const [resultFilter,   setResultFilter]   = useState("all");
  const [page,           setPage]           = useState(1);

  const filteredResults = useMemo(() => {
    let r = results;
    if (resultFilter === "win")  r = r.filter(x => x.correct === true);
    if (resultFilter === "loss") r = r.filter(x => x.correct === false);
    return r;
  }, [results, resultFilter]);

  const totalPages   = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const visibleResults = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset to page 1 when filter changes
  const handleFilter = useCallback((f) => {
    setResultFilter(f);
    setPage(1);
  }, []);

  // Jump to results section top when page changes
  const handlePageChange = useCallback((p) => {
    setPage(p);
    document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  if (loading) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-8 pt-28 pb-20 space-y-8">
        <Skeleton className="h-10 w-56" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[900px] mx-auto px-4 pt-28 pb-20">
        <div className="glass-card rounded-2xl p-8 text-center text-red-400">
          <span className="material-symbols-outlined text-[32px] block mb-2">error</span>
          Failed to load track record. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-8 pt-28 pb-20 space-y-10">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary-container text-[22px]">verified</span>
          <span className="font-['Lexend'] text-[11px] uppercase tracking-widest text-on-surface-variant">
            Verified Results
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-on-surface">
          Track Record
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant max-w-lg">
          Every settled prediction, scored against the actual result. No cherry-picking.
        </p>
      </div>

      {/* KPI row */}
      {stats ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard
            icon="bar_chart"
            label="Overall Hit Rate"
            value={`${stats.rate.toFixed(1)}%`}
            sub={`${stats.hits} hits / ${stats.total} picks`}
            accent={stats.rate >= 70 ? "green" : stats.rate >= 55 ? "amber" : "red"}
          />
          <KpiCard
            icon="format_list_numbered"
            label="Total Settled"
            value={stats.total}
            sub={`${stats.hits} correct · ${stats.misses} missed`}
          />

          <KpiCard
            icon={stats.streakType ? "local_fire_department" : "trending_down"}
            label="Current Streak"
            accent={stats.streak > 0 ? (stats.streakType ? "green" : "red") : undefined}
          >
            {stats.streak > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black">{stats.streak}</span>
                <div className="flex flex-col gap-0.5">
                  <div className="flex gap-[3px]">
                    {Array.from({ length: Math.min(stats.streak, 8) }).map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          "w-2 h-2 rounded-full transition-transform hover:scale-125",
                          stats.streakType ? "bg-emerald-500" : "bg-red-500",
                        )}
                        style={{ opacity: 1 - i * 0.07 }}
                      />
                    ))}
                    {stats.streak > 8 && (
                      <span className="text-[10px] text-on-surface-variant ml-0.5 self-center">+{stats.streak - 8}</span>
                    )}
                  </div>
                  <span className={cn(
                    "font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest",
                    stats.streakType ? "text-emerald-500" : "text-red-500",
                  )}>
                    {stats.streakType ? "winning" : "losing"}
                  </span>
                </div>
              </div>
            ) : (
              <span className="text-on-surface-variant text-base font-semibold">No data</span>
            )}
          </KpiCard>

          <KpiCard
            icon="schedule"
            label="Last 7 Days"
            value={stats.recentTotal > 0 ? `${stats.recentRate?.toFixed(0)}%` : "—"}
            sub={stats.recentTotal > 0 ? `${stats.recentTotal} picks this week` : "No picks yet"}
            accent={
              stats.recentRate !== null && stats.recentRate >= 70 ? "green" :
              stats.recentRate !== null && stats.recentRate >= 55 ? "amber" : "red"
            }
          />
        </div>
      ) : (
        <EmptyState />
      )}

      {stats && (
        <>
          {/* Tier breakdown */}
          <section>
            <h2 className="font-['Lexend'] text-[11px] uppercase tracking-widest text-on-surface-variant mb-3">
              By Confidence Tier
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {["A", "B", "C"].map(t => (
                <TierCard key={t} tier={t} data={stats.byTier[t]} />
              ))}
            </div>
          </section>

          {/* Signal accuracy — clickable to expand */}
          <section>
            <h2 className="font-['Lexend'] text-[11px] uppercase tracking-widest text-on-surface-variant mb-3">
              Signal Accuracy
              <span className="ml-2 normal-case tracking-normal text-on-surface-variant/50">· click a row to see details</span>
            </h2>
            <div className="glass-card rounded-2xl px-5 py-2">
              {stats.signalBreakdown.length === 0 ? (
                <div className="py-8 text-center text-sm text-on-surface-variant">No data yet</div>
              ) : (
                stats.signalBreakdown.map((s, i) => (
                  <div key={s.signal}>
                    <SignalRow
                      rank={i + 1}
                      {...s}
                      selected={expandedSignal === s.signal}
                      onClick={() => setExpandedSignal(prev => prev === s.signal ? null : s.signal)}
                    />
                    {expandedSignal === s.signal && (
                      <SignalDetail {...s} results={results} />
                    )}
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Recent results with filters + pagination */}
          <section id="results-section">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h2 className="font-['Lexend'] text-[11px] uppercase tracking-widest text-on-surface-variant">
                  Results
                </h2>
                <p className="text-[11px] text-on-surface-variant/50 mt-0.5">
                  {filteredResults.length} total · page {page} of {totalPages}
                </p>
              </div>
              <div className="flex gap-2">
                <FilterPill label="All"      active={resultFilter === "all"}  onClick={() => handleFilter("all")}  />
                <FilterPill label="✓ Wins"   active={resultFilter === "win"}  onClick={() => handleFilter("win")}  />
                <FilterPill label="✗ Losses" active={resultFilter === "loss"} onClick={() => handleFilter("loss")} />
              </div>
            </div>

            <div className="glass-card rounded-2xl px-5 py-2">
              {filteredResults.length === 0 ? (
                <div className="py-8 text-center text-sm text-on-surface-variant">No results match this filter</div>
              ) : (
                visibleResults.map((r, i) => (
                  <ResultRow key={r.id ?? r.matchId} result={r} index={i} />
                ))
              )}
            </div>

            <Pagination page={page} totalPages={totalPages} onChange={handlePageChange} />
          </section>
        </>
      )}

      <ScrollToTop />
    </div>
  );
}

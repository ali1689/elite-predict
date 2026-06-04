import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/App";
import { Button } from "@/components/ui/button";
import TeamAvatar from "@/components/TeamAvatar";
import MatchRow from "@/components/MatchRow";
import { useAllPredictions } from "@/lib/usePredictions";
import { sigStyle, tierStyle, fmtDate, fmtTime, abbr } from "@/data/matches";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const CTA_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDFSZ87SJRX2aa025ExYPpRA4_nsFny4c9anPKMHcdvtwFtyOobqOi1oN6pill283E0teUZJJhC1T5OqHzMRFuU0Vj0-06UY4cwM7YhmN1R7XcquQ-ksfJm5Vf-sYZLZnWzIkTE6j8uANAJS4ZVeuihMgaaCgI_TVCNlrTGFeLlCZiu1bZWfWECbm3RkAcTmyudBhvmvlqJIt7q0PHlXkEayMvSQojlpcUlMNgCUAejjZYsG5EUQ";

const ALL = "ALL";
const PAGE_SIZE = 40;

// ── Shared schedule column definition ─────────────────────────────────────
// Both the sticky header table and the scrollable body table use this exact
// colgroup so columns are always pixel-perfect aligned.
const SCHEDULE_COLS = [
  { id: "date",   label: "Date / Time",   width: 100 },
  { id: "match",  label: "Matchup + Elo", width: 175 },
  { id: "league", label: "League",        width: 118 },
  { id: "tier",   label: "Tier · Signal", width: 155 },
  { id: "homeG",  label: "Home Goals",    width: 118 },
  { id: "awayG",  label: "Away Goals",    width: 118 },
  { id: "btts",   label: "BTTS",          width: 63  },
  { id: "o15",    label: "O1.5",          width: 63  },
  { id: "o25",    label: "O2.5",          width: 63  },
  { id: "u25",    label: "U2.5",          width: 63  },
  { id: "xg",     label: "xG",            width: 58  },
  { id: "1x2",    label: "1 · X · 2",    width: 110 },
  { id: "dc",     label: "DC",            width: 100 },
  { id: "conf",   label: "Conf",          width: 118 },
];
const TABLE_MIN_W = SCHEDULE_COLS.reduce((s, c) => s + c.width, 0); // ~1159 px

// Shared colgroup — render the same element in both tables
function ScheduleColgroup() {
  return (
    <colgroup>
      {SCHEDULE_COLS.map(c => (
        <col key={c.id} style={{ width: c.width, minWidth: c.width }} />
      ))}
    </colgroup>
  );
}

const SORT_OPTIONS = [
  { key: "date", label: "By Date"       },
  { key: "conf", label: "By Confidence" },
  { key: "xg",   label: "By xG"         },
  { key: "o15",  label: "By O1.5"       },
];

const TIER_FILTER_OPTIONS = [
  { key: "ALL", label: "All Tiers" },
  { key: "A",   label: "Tier A"   },
  { key: "B",   label: "Tier B"   },
  { key: "C",   label: "Tier C"   },
];

const DATE_FILTER_OPTIONS = [
  { key: "ALL",      label: "All Dates"   },
  { key: "TODAY",    label: "Today"       },
  { key: "TOMORROW", label: "Tomorrow"    },
  { key: "NEXT3",    label: "Next 3 Days" },
  { key: "WEEK",     label: "This Week"   },
];

// Date helpers (Warsaw timezone)
function warsawDateStr(offsetDays) {
  const ms = Date.now() + (offsetDays || 0) * 864e5;
  return new Date(ms).toLocaleDateString("en-CA", { timeZone: "Europe/Warsaw" });
}

function getDateSet(filterKey) {
  if (filterKey === "TODAY")    return new Set([warsawDateStr(0)]);
  if (filterKey === "TOMORROW") return new Set([warsawDateStr(1)]);
  if (filterKey === "NEXT3")    return new Set([warsawDateStr(0), warsawDateStr(1), warsawDateStr(2)]);
  if (filterKey === "WEEK")     return new Set([0,1,2,3,4,5,6].map(warsawDateStr));
  return null;
}

function Skeleton({ className }) {
  return <div className={cn("animate-pulse bg-white/5 rounded-lg", className)} />;
}

// ── Featured card ──────────────────────────────────────────────────────────
function FeaturedCard({ match }) {
  const sig      = sigStyle(match.signal);
  const tier     = tierStyle(match.tier);
  const homeTeam = { abbr: abbr(match.home), name: match.home, logo: null };
  const awayTeam = { abbr: abbr(match.away), name: match.away, logo: null };
  const xg       = ((match.lH || 0) + (match.lA || 0)).toFixed(2);
  const extraSignals = (match.allSignals || []).slice(1, 3);

  return (
    <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-primary-container/30 transition-all duration-300 flex flex-col gap-5">
      <div className="absolute top-0 right-0 p-4">
        <span className={cn("px-3 py-1 rounded text-[9px] font-black uppercase tracking-tighter border", tier.bg, tier.text, tier.border)}>
          {tier.label}
        </span>
      </div>
      <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest">
        {match.comp} · {fmtDate(match.utcDate)} · {fmtTime(match.utcDate)}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <TeamAvatar team={homeTeam} />
          <div className="font-bold text-sm mt-2 text-on-surface">{homeTeam.abbr}</div>
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase mt-0.5">{match.homeElo} elo</div>
        </div>
        <div className="flex flex-col items-center">
          <div className="text-on-surface-variant font-black text-2xl italic">VS</div>
          <div className="font-['Lexend'] text-[9px] text-on-surface-variant mt-1 uppercase tracking-widest">xG {xg}</div>
        </div>
        <div className="text-center">
          <TeamAvatar team={awayTeam} />
          <div className="font-bold text-sm mt-2 text-on-surface">{awayTeam.abbr}</div>
          <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase mt-0.5">{match.awayElo} elo</div>
        </div>
      </div>
      <div className="bg-primary-container/10 dark:bg-black/40 p-4 rounded-lg border border-primary-container/25 group-hover:border-primary-container transition-colors">
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
      <div className="space-y-2">
        {[
          { label: "Home to score",  value: match.homeOver05, color: "bg-primary-container" },
          { label: "Home 2+ goals",  value: match.homeOver15, color: "bg-emerald-400"       },
          { label: "Away to score",  value: match.awayOver05, color: "bg-blue-400"           },
          { label: "Away 2+ goals",  value: match.awayOver15, color: "bg-sky-400"            },
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
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: "BTTS", value: `${match.btts}%`    },
          { label: "O1.5", value: `${match.over15}%`  },
          { label: "O2.5", value: `${match.over25}%`  },
          { label: "U2.5", value: `${match.under25}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
            <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</div>
            <div className="font-['Lexend'] text-sm font-semibold text-on-surface">{value}</div>
          </div>
        ))}
      </div>
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

// ── Back to Top button ─────────────────────────────────────────────────────
function BackToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handleClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <button
      onClick={handleClick}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full",
        "bg-zinc-900 border border-primary-container/40 text-primary-container",
        "shadow-[0_0_18px_rgba(57,255,20,0.22)] hover:shadow-[0_0_30px_rgba(57,255,20,0.5)]",
        "hover:bg-zinc-800 hover:border-primary-container hover:scale-110",
        "flex items-center justify-center",
        "transition-all duration-300 ease-out",
        visible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"
      )}
    >
      <span className="material-symbols-outlined text-[22px] select-none">arrow_upward</span>
    </button>
  );
}

// ── Schedule table — sticky-header architecture ────────────────────────────
//
// Why dual-table?
//   overflow-x: auto on ANY ancestor creates a CSS scroll container.
//   position: sticky resolves to its nearest scroll container, not the
//   viewport. So placing <thead sticky> inside overflow-x: auto means
//   the header sticks to the container's top edge (which scrolls away
//   with the page), causing the visual misalignment.
//
// Solution:
//   1. Outer wrapper has NO overflow set  → sticky resolves to viewport.
//   2. Header table sits in its own div   → sticky top-16/top-20 works.
//   3. Body table sits in overflow-x:auto → horizontal scroll works.
//   4. Both tables share ScheduleColgroup → pixel-perfect column alignment.
//   5. JS syncs header.scrollLeft = body.scrollLeft on horizontal scroll.
//
function ScheduleTable({ loading, visibleMatches, hasMore, filtered, visibleCount, onLoadMore }) {
  const headerRef = useRef(null);
  const bodyRef   = useRef(null);
  const { theme } = useTheme();

  // Sync horizontal scroll: body drives header
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const onScroll = () => {
      if (headerRef.current) headerRef.current.scrollLeft = body.scrollLeft;
    };
    body.addEventListener("scroll", onScroll, { passive: true });
    return () => body.removeEventListener("scroll", onScroll);
  }, []);

  // Table header — brand neon green (#39ff14) in light, near-black in dark
  const HEADER_BG = theme === "dark"
    ? { background: "rgba(9,9,11,0.97)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }
    : { background: "#39ff14", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" };

  const TH_CLASS = theme === "dark"
    ? "px-3 py-3 md:px-5 md:py-[14px] font-['Lexend'] text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-primary-container whitespace-nowrap text-left"
    : "px-3 py-3 md:px-5 md:py-[14px] font-['Lexend'] text-[9px] md:text-[10px] font-semibold uppercase tracking-widest text-[#053900] whitespace-nowrap text-left";

  return (
    // Outer wrapper: NO overflow property — this is critical.
    // border + rounded corners rendered here; overflow-hidden intentionally omitted.
    <div className="rounded-xl border border-outline-variant/40">

      {/* ── Sticky header ──────────────────────────────────────────────
          This div is sticky relative to the viewport (not a scroll
          container) because the outer wrapper has no overflow set.
          It has its own overflow-x: auto (scrollbar hidden) so JS can
          sync its scrollLeft with the body's scrollLeft.
      ────────────────────────────────────────────────────────────────── */}
      <div
        ref={headerRef}
        className="sticky top-16 md:top-20 z-20 overflow-x-auto scrollbar-hide rounded-t-xl border-b border-primary-container/30"
        style={HEADER_BG}
      >
        <table
          className="text-left border-collapse"
          style={{ tableLayout: "fixed", width: TABLE_MIN_W, minWidth: TABLE_MIN_W }}
        >
          <ScheduleColgroup />
          <thead>
            <tr>
              {SCHEDULE_COLS.map(c => (
                <th key={c.id} className={TH_CLASS}>{c.label}</th>
              ))}
            </tr>
          </thead>
        </table>
      </div>

      {/* ── Scrollable body ─────────────────────────────────────────────
          Horizontal scroll lives here. The sticky header is a sibling,
          NOT inside this div, so overflow-x: auto does not break it.
      ────────────────────────────────────────────────────────────────── */}
      <div ref={bodyRef} className="overflow-x-auto rounded-b-xl">
        <table
          className="text-left border-collapse"
          style={{ tableLayout: "fixed", width: TABLE_MIN_W, minWidth: TABLE_MIN_W }}
        >
          <ScheduleColgroup />
          <tbody>
            {loading ? (
              [...Array(8)].map((_, i) => (
                <tr key={i} className="border-b border-white/5">
                  {SCHEDULE_COLS.map(c => (
                    <td key={c.id} className="px-3 py-3 md:px-5 md:py-[14px]">
                      <div className="animate-pulse h-4 bg-white/5 rounded" />
                    </td>
                  ))}
                </tr>
              ))
            ) : visibleMatches.length > 0 ? (
              visibleMatches.map(m => <MatchRow key={m.id} match={m} />)
            ) : (
              <tr>
                <td
                  colSpan={SCHEDULE_COLS.length}
                  className="px-6 py-16 text-center text-on-surface-variant font-['Lexend'] text-sm"
                >
                  No upcoming matches found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Auth gate overlay ─────────────────────────────────────────────────────
function AuthGate({ matchCount }) {
  return (
    <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-6 py-20 px-6 text-center
                    bg-surface-container border-2 border-primary-container/25
                    shadow-[0_0_60px_rgba(57,255,20,0.08)]">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.05), transparent 60%)" }} />
      <div className="absolute inset-0 opacity-15 pointer-events-none"
        style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(57,255,20,0.012) 12px,rgba(57,255,20,0.012) 24px)" }} />

      {/* Icon */}
      <div className="relative w-20 h-20 rounded-2xl border-2 border-primary-container/40 bg-primary-container/10 flex items-center justify-center z-10
                      shadow-[0_0_30px_rgba(57,255,20,0.2)]">
        <span className="material-symbols-outlined text-primary-container text-4xl">lock</span>
      </div>

      {/* Text */}
      <div className="relative z-10">
        <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container mb-2">
          Members Only
        </div>
        <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
          {matchCount} upcoming picks locked<br />
          <span className="text-primary-container drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">sign in to unlock</span>
        </h3>
        <p className="text-zinc-400 font-['Lexend'] text-sm max-w-sm mx-auto leading-relaxed">
          Create a free account to access the full schedule, confidence ratings, xG models, and daily AI predictions.
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
          Get Free Pack
        </Link>
      </div>

      <p className="relative z-10 font-['Lexend'] text-[10px] text-zinc-600 uppercase tracking-widest">
        Free daily pack · full stats for members
      </p>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Predictions() {
  const { user } = useAuth();
  const { data: allMatches, loading, error } = useAllPredictions();

  const [activeLeague,     setActiveLeague]     = useState(ALL);
  const [activeTier,       setActiveTier]       = useState("ALL");
  const [activeDateFilter, setActiveDateFilter] = useState("ALL");
  const [minConf,          setMinConf]          = useState(60);
  const [searchQuery,      setSearchQuery]      = useState("");
  const [sortBy,           setSortBy]           = useState("date");
  const [visibleCount,     setVisibleCount]     = useState(PAGE_SIZE);

  const leagues = useMemo(() => {
    const set = new Set(allMatches.map(m => m.comp));
    return [ALL, ...[...set].sort()];
  }, [allMatches]);

  const filtered = useMemo(() => {
    const nowMs = Date.now();
    let rows = allMatches.filter(m => new Date(m.utcDate).getTime() > nowMs);
    if (minConf > 0)            rows = rows.filter(m => m.conf >= minConf);
    if (activeLeague !== ALL)   rows = rows.filter(m => m.comp === activeLeague);
    if (activeTier   !== "ALL") rows = rows.filter(m => m.tier === activeTier);
    if (activeDateFilter !== "ALL") {
      const dateSet = getDateSet(activeDateFilter);
      if (dateSet) rows = rows.filter(m => dateSet.has(m.matchDate));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rows = rows.filter(m =>
        m.home.toLowerCase().includes(q) || m.away.toLowerCase().includes(q)
      );
    }
    if (sortBy === "conf") return [...rows].sort((a, b) => b.conf - a.conf);
    if (sortBy === "xg")   return [...rows].sort((a, b) => (b.xgTotal || 0) - (a.xgTotal || 0));
    if (sortBy === "o15")  return [...rows].sort((a, b) => (b.over15 || 0) - (a.over15 || 0));
    return [...rows].sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  }, [allMatches, activeLeague, activeTier, activeDateFilter, searchQuery, sortBy]);

  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [activeLeague, activeTier, activeDateFilter, minConf, searchQuery, sortBy]);

  const topPicks = useMemo(() => {
    const nowMs = Date.now();
    return [...allMatches]
      .filter(m => new Date(m.utcDate).getTime() > nowMs)
      .sort((a, b) => b.conf - a.conf)
      .slice(0, 3);
  }, [allMatches]);

  const visibleMatches = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);
  const hasMore = visibleCount < filtered.length;

  return (
    <main className="pt-24 pb-16 md:pt-32 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">

      {/* Hero */}
      <section className="mb-8 md:mb-16 animate-fade-up">
        <h1 className="text-[2.25rem] sm:text-5xl md:text-display-xl font-black text-on-surface mb-3 md:mb-4 leading-tight tracking-tight md:tracking-[-0.04em]">
          Upcoming <span className="text-primary-container">Precision</span> Picks
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-base sm:text-lg md:text-headline-md font-semibold leading-relaxed">
          {loading
            ? "Loading predictions from AI engine..."
            : `${filtered.length} upcoming match${filtered.length !== 1 ? "es" : ""} across ${leagues.length - 1} league${leagues.length - 1 !== 1 ? "s" : ""} — powered by Elo ratings, Poisson xG, and calibrated ML.`}
        </p>
        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-['Lexend']">
            Could not load predictions — check Supabase connection.
          </div>
        )}
      </section>

      {/* Top Picks */}
      <section className="mb-10 md:mb-16">
        <div className="flex items-center justify-between mb-5 md:mb-8">
          <h2 className="text-base md:text-headline-md font-semibold text-on-surface uppercase tracking-wider flex items-center gap-2 md:gap-3">
            <span className="w-1.5 h-5 md:h-6 bg-primary-container rounded-full inline-block" />
            Highest Confidence Picks
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-80 md:h-96" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {topPicks.map(m => <FeaturedCard key={m.id} match={m} />)}
          </div>
        )}
      </section>

      {/* Filters */}
      <section className="mb-6 md:mb-8 space-y-3 md:space-y-4">
        {/* Confidence filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {[
            { val: 0,  label: "All"   },
            { val: 60, label: "60%+"  },
            { val: 65, label: "65%+"  },
            { val: 70, label: "70%+"  },
            { val: 75, label: "75%+"  },
          ].map(({ val, label }) => (
            <button key={val} onClick={() => setMinConf(val)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 md:px-4 rounded-full font-['Lexend'] text-[10px] md:text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                minConf === val
                  ? "bg-primary-container text-on-primary border-primary-container neon-glow"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
              )}>
              <span className="material-symbols-outlined text-[12px]">verified</span>
              {label}
            </button>
          ))}
        </div>

        {/* Date quick filters */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {DATE_FILTER_OPTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveDateFilter(key)}
              className={cn(
                "px-3 py-1.5 md:px-4 rounded-full font-['Lexend'] text-[10px] md:text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0 border",
                activeDateFilter === key
                  ? "bg-primary-container text-on-primary border-primary-container neon-glow"
                  : "border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
              )}>
              {label}
            </button>
          ))}
        </div>
        {/* League tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {leagues.map(l => (
            <button key={l} onClick={() => setActiveLeague(l)}
              className={cn(
                "px-3 py-1.5 md:px-4 rounded-full font-['Lexend'] text-[10px] md:text-[11px] font-semibold uppercase tracking-widest whitespace-nowrap transition-all flex-shrink-0",
                activeLeague === l
                  ? "bg-primary-container text-on-primary"
                  : "border border-white/10 text-on-surface-variant hover:border-primary-container/50 hover:text-on-surface"
              )}>
              {l === ALL ? "All Leagues" : l}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="flex items-center bg-surface-container-high border border-white/5 rounded-lg px-4 py-2.5 gap-2">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
          <input type="text" placeholder="Search teams..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none w-full font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-on-surface-variant hover:text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
        {/* Tier + Sort */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {TIER_FILTER_OPTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTier(key)}
              className={cn(
                "px-3 py-1.5 rounded-lg font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest transition-all flex-shrink-0",
                activeTier === key
                  ? "bg-primary-container text-on-primary"
                  : "border border-white/10 text-on-surface-variant hover:border-primary-container/40"
              )}>
              {label}
            </button>
          ))}
          <div className="w-px bg-white/10 self-stretch flex-shrink-0 mx-1" />
          {SORT_OPTIONS.map(({ key, label }) => (
            <button key={key} onClick={() => setSortBy(key)}
              className={cn(
                "px-3 py-1.5 md:px-4 rounded-lg font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest transition-all flex-shrink-0",
                sortBy === key
                  ? "bg-primary-container text-on-primary"
                  : "border border-white/10 text-on-surface-variant hover:border-primary-container/40"
              )}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* Full Schedule */}
      <section className="mb-16 md:mb-24">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <h2 className="text-base md:text-headline-md font-semibold text-on-surface uppercase tracking-wider">Full Schedule</h2>
          <div className="font-['Lexend'] text-[11px] text-on-surface-variant uppercase tracking-widest">
            {filtered.length} Match{filtered.length !== 1 ? "es" : ""}
          </div>
        </div>

        {!user ? (
          <AuthGate matchCount={filtered.length} />
        ) : (
          <>
            <ScheduleTable
              loading={loading}
              visibleMatches={visibleMatches}
              hasMore={hasMore}
              filtered={filtered}
              visibleCount={visibleCount}
              onLoadMore={() => setVisibleCount(c => c + PAGE_SIZE)}
            />

            {/* Load More */}
            {!loading && hasMore && (
              <div className="flex flex-col items-center gap-2 mt-6">
                <button
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className={cn(
                    "px-8 py-3 rounded-xl font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest",
                    "border border-primary-container/30 text-primary-container",
                    "hover:bg-primary-container/10 hover:border-primary-container hover:shadow-[0_0_16px_rgba(57,255,20,0.2)]",
                    "transition-all duration-200 flex items-center gap-2"
                  )}
                >
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  Load More — {filtered.length - visibleCount} remaining
                </button>
                <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest">
                  Showing {visibleCount} of {filtered.length} matches
                </div>
              </div>
            )}

            {!loading && !hasMore && filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <div className="h-px flex-1 bg-white/5" />
                <span className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest">
                  All {filtered.length} matches loaded
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            )}
          </>
        )}
      </section>

      {/* Telegram CTA */}
      <section>
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden p-6 sm:p-8 md:p-12 bg-surface-container-high border border-primary-container/30 dark:bg-zinc-950 dark:border-white/10">
          <div className="absolute inset-0 opacity-10 dark:opacity-20 pointer-events-none">
            <img src={CTA_BG} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 hidden dark:block bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
          <div className="relative z-10 md:w-2/3">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <span className="w-8 md:w-12 h-[1px] bg-primary-container" />
              <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container">Live Community Updates</span>
            </div>
            <h3 className="text-[1.75rem] sm:text-4xl md:text-display-xl font-black text-on-surface mb-4 md:mb-6 leading-tight">Join 50k+ Sharp Bettors on Telegram</h3>
            <p className="text-on-surface-variant mb-6 md:mb-10 text-base md:text-headline-md font-semibold leading-relaxed">
              Get instant signal alerts, Elo-ranked picks, and late-market value drops directly on your phone.
            </p>
            <Button size="lg" variant="primary" className="neon-glow font-black uppercase tracking-tight flex items-center gap-3 group w-full sm:w-auto" asChild>
              <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
                JOIN OUR TELEGRAM
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">send</span>
              </a>
            </Button>
          </div>
        </div>
      </section>

      <BackToTopButton />

    </main>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { markPackOpened, isPackOpenedToday } from "@/pages/Today";
import { useTodayPredictions } from "@/lib/usePredictions";
import { sigStyle, tierStyle, fmtTime, abbr } from "@/data/matches";
import { cn } from "@/lib/utils";
import TeamAvatar from "@/components/TeamAvatar";

// ── Shared card sub-components (mirrors Today.jsx) ────────────────────────
function ProbBar({ label, value, color = "bg-primary-container" }) {
  const textColor = color === "bg-primary-container" ? "text-primary-container"
    : color === "bg-blue-400" ? "text-blue-400" : "text-on-surface-variant";
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">{label}</span>
        <span className={cn("font-['Lexend'] text-[9px] font-bold tabular-nums", textColor)}>{value}%</span>
      </div>
      <div className="h-1 bg-surface-container rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

function StatChip({ label, value, accent }) {
  return (
    <div className="bg-surface-container-low rounded-lg p-2 text-center border border-outline-variant/30">
      <div className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest mb-0.5">{label}</div>
      <div className={cn("font-['Lexend'] text-sm font-bold tabular-nums", accent ? "text-primary-container" : "text-on-surface")}>{value}</div>
    </div>
  );
}

function ResultTrio({ homeWin = 0, draw = 0, awayWin = 0 }) {
  const top = homeWin >= draw && homeWin >= awayWin ? "home"
    : draw >= homeWin && draw >= awayWin ? "draw" : "away";
  return (
    <div className="result-trio">
      {[
        { key: "home", label: "Home", val: homeWin },
        { key: "draw", label: "Draw", val: draw    },
        { key: "away", label: "Away", val: awayWin },
      ].map(({ key, label, val }) => (
        <div key={key} className={cn("result-box", top === key && "top")}>
          <span className="result-box-label">{label}</span>
          <span className="result-box-val">{Math.round(val)}%</span>
        </div>
      ))}
    </div>
  );
}

function DCTrio({ dc1X = 0, dcX2 = 0, dc12 = 0 }) {
  if (!dc1X && !dcX2 && !dc12) return null;
  const top = dc1X >= dcX2 && dc1X >= dc12 ? "1X" : dcX2 >= dc1X && dcX2 >= dc12 ? "X2" : "12";
  return (
    <div className="pt-2 border-t border-outline-variant/40">
      <div className="font-['Lexend'] text-[8px] font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5">Double Chance</div>
      <div className="result-trio">
        {[
          { key: "1X", val: dc1X }, { key: "X2", val: dcX2 }, { key: "12", val: dc12 },
        ].map(({ key, val }) => (
          <div key={key} className={cn("result-box", top === key && "top")}>
            <span className="result-box-label">{key}</span>
            <span className="result-box-val">{Math.round(val)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Tier glow config ──────────────────────────────────────────────────────
const TIER_GLOW = {
  A: {
    card:    "border-[#39FF14] shadow-[0_0_40px_rgba(57,255,20,0.6),0_0_80px_rgba(57,255,20,0.3)]",
    badge:   "bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14]/50",
    ring:    "#39FF14",
    burst:   "rgba(57,255,20,",
    label:   "STRONG PICK",
  },
  B: {
    card:    "border-blue-400 shadow-[0_0_40px_rgba(96,165,250,0.5),0_0_80px_rgba(96,165,250,0.25)]",
    badge:   "bg-blue-400/20 text-blue-400 border-blue-400/50",
    ring:    "#60A5FA",
    burst:   "rgba(96,165,250,",
    label:   "GOOD PICK",
  },
  C: {
    card:    "border-zinc-400 shadow-[0_0_20px_rgba(161,161,170,0.3)]",
    badge:   "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    ring:    "#A1A1AA",
    burst:   "rgba(161,161,170,",
    label:   "SPECULATIVE",
  },
};

// ── Particle burst on card reveal ─────────────────────────────────────────
function Particles({ color, active }) {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle  = (i / 12) * 360;
    const dist   = 60 + Math.random() * 60;
    const size   = 4 + Math.random() * 6;
    const x      = Math.cos((angle * Math.PI) / 180) * dist;
    const y      = Math.sin((angle * Math.PI) / 180) * dist;
    return { x, y, size, angle };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible flex items-center justify-center">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width:     p.size,
            height:    p.size,
            background: color + "0.9)",
            transform:  `translate(${p.x}px, ${p.y}px)`,
            animation:  `particle-burst 0.6s ease-out forwards`,
            animationDelay: `${i * 20}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ── Single prediction card ────────────────────────────────────────────────
// Uses a simple scale+opacity reveal instead of CSS 3D transforms,
// which have cross-browser height and backface-visibility issues.
function PredCard({ match, index, revealed }) {
  const [phase, setPhase] = useState("hidden"); // hidden | back | front
  const [burst, setBurst] = useState(false);

  const tier = match?.tier ?? "B";
  const glow = TIER_GLOW[tier] ?? TIER_GLOW.B;
  const sig  = match ? sigStyle(match.signal) : null;

  // When revealed, show card back, then auto-flip to front after 800ms
  useEffect(() => {
    if (!revealed) return;
    setPhase("back");
    const t1 = setTimeout(() => setBurst(true),  500);
    const t2 = setTimeout(() => {
      setBurst(false);
      setPhase("front");
    }, 900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [revealed]);

  const cardH = "h-[380px]";

  // Hidden placeholder
  if (phase === "hidden") {
    return (
      <div className={cn("rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.02]", cardH)} />
    );
  }

  // Card back (face down)
  if (phase === "back") {
    return (
      <div className={cn(
        "relative rounded-2xl border-2 border-primary-container/40 bg-zinc-950 flex flex-col items-center justify-center gap-3 overflow-hidden",
        cardH,
        "animate-[scale-in_0.4s_ease-out]"
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-container/5 via-transparent to-blue-500/5" />
        <Particles color={glow.burst} active={burst} />
        <span className="relative text-4xl font-black italic text-primary-container tracking-tighter drop-shadow-[0_0_20px_rgba(57,255,20,0.8)]">EP</span>
        <span className="relative font-['Lexend'] text-[9px] text-zinc-500 uppercase tracking-[0.3em]">Elite Predict</span>
        <div className="relative mt-2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary-container animate-ping" />
          <span className="font-['Lexend'] text-[9px] text-primary-container uppercase tracking-widest">Revealing…</span>
        </div>
      </div>
    );
  }

  // Card front (revealed) — same layout as Today's MatchCard
  const confColor = match.conf >= 75 ? "text-primary-container"
    : match.conf >= 65 ? "text-blue-400" : "text-on-surface-variant";
  const xg = ((match.lH || 0) + (match.lA || 0)).toFixed(2);
  const extraSignals = (match.allSignals || []).slice(1, 5);
  const storedProb = {
    home_over05: match.homeOver05, away_over05: match.awayOver05,
    home_over15: match.homeOver15, away_over15: match.awayOver15,
    over15: match.over15, over25: match.over25,
    under25: match.under25, btts: match.btts,
  };
  const homeTeam = { abbr: abbr(match.home), name: match.home, logo: null };
  const awayTeam = { abbr: abbr(match.away), name: match.away, logo: null };

  return (
    <div className={cn(
      "glass-card p-5 rounded-xl flex flex-col gap-4",
      "animate-[scale-in_0.35s_ease-out]",
      glow.card
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1.5">
          <span className={cn("inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider w-fit border", tier.bg, tier.text, tier.border)}>
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
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider">{match.homeElo} elo</span>
        </div>
        <div className="flex flex-col items-center px-3">
          <span className="font-black text-lg text-on-surface-variant italic">VS</span>
          <span className={cn("font-black text-2xl leading-none mt-1", confColor)}>{match.conf > 0 ? match.conf : "—"}</span>
          <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-widest">% Conf</span>
        </div>
        <div className="flex flex-col items-center gap-1.5 flex-1">
          <TeamAvatar team={awayTeam} size="md" />
          <span className="font-bold text-xs text-on-surface text-center leading-tight">{match.away}</span>
          <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-wider">{match.awayElo} elo</span>
        </div>
      </div>

      {/* 1X2 */}
      <ResultTrio homeWin={match.homeWin} draw={match.draw} awayWin={match.awayWin} />

      {/* Goal bars */}
      <div className="space-y-2">
        <ProbBar label="Home to score (0.5+)" value={match.homeOver05} color="bg-primary-container" />
        <ProbBar label="Away to score (0.5+)"  value={match.awayOver05} color="bg-blue-400" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-1.5">
        <StatChip label="BTTS" value={`${match.btts}%`} />
        <StatChip label="O1.5" value={`${match.over15}%`} accent />
        <StatChip label="O2.5" value={`${match.over25}%`} accent />
        <StatChip label="U2.5" value={`${match.under25}%`} />
        <StatChip label="xG"   value={xg} />
      </div>

      {/* Double Chance */}
      <DCTrio dc1X={match.dc1X} dcX2={match.dcX2} dc12={match.dc12} />

      {/* Extra signals */}
      {extraSignals.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-outline-variant/30">
          {extraSignals.map(s => {
            const ss = sigStyle(s.label ?? s.type);
            return (
              <span key={s.type} className={cn("px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider", ss.bg, ss.text)}>
                {s.label ?? s.type} · {storedProb[s.type] ?? Math.round(s.prob * 100)}%
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Pack (before opening) ─────────────────────────────────────────────────
function Pack({ count, onClick }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-[0.3em] text-primary-container mb-3">
          Today's AI Predictions
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-on-surface leading-tight tracking-tight">
          {count} Match{count !== 1 ? "es" : ""}<br />
          <span className="text-primary-container drop-shadow-[0_0_30px_rgba(57,255,20,0.5)]">Inside</span>
        </h1>
      </div>

      {/* Pack visual */}
      <button
        onClick={onClick}
        className="relative group focus:outline-none"
        aria-label="Open pack"
      >
        {/* Glow layers */}
        <div className="absolute inset-0 rounded-2xl bg-primary-container/20 blur-2xl scale-110 group-hover:scale-125 group-hover:bg-primary-container/30 transition-all duration-500" />
        <div className="absolute inset-0 rounded-2xl bg-primary-container/10 blur-xl scale-105 animate-pulse" />

        {/* Card stack */}
        <div className="relative w-52 h-72">
          {/* Shadow cards */}
          {[...Array(Math.min(count - 1, 3))].map((_, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-2xl border-2 border-primary-container/20 bg-zinc-900"
              style={{
                transform: `translateY(${(i + 1) * -6}px) translateX(${(i + 1) * 3}px) rotate(${(i + 1) * -2}deg)`,
                zIndex: 3 - i,
              }}
            />
          ))}

          {/* Front card */}
          <div
            className="absolute inset-0 rounded-2xl border-2 border-primary-container bg-zinc-950 flex flex-col items-center justify-center gap-4 overflow-hidden z-10
                       group-hover:scale-105 group-hover:-translate-y-2 transition-all duration-300
                       shadow-[0_0_40px_rgba(57,255,20,0.4),0_0_80px_rgba(57,255,20,0.2)]"
          >
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 via-transparent to-blue-500/5" />
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(57,255,20,0.04) 8px, rgba(57,255,20,0.04) 16px)",
              }}
            />
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-container to-transparent opacity-60" />

            <span className="relative text-5xl font-black italic text-primary-container tracking-tighter drop-shadow-[0_0_30px_rgba(57,255,20,1)]">
              EP
            </span>
            <span className="relative font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-[0.3em]">
              Elite Predict
            </span>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 px-8 py-3 rounded-xl bg-primary-container text-on-primary font-black text-sm uppercase tracking-widest
                        shadow-[0_0_24px_rgba(57,255,20,0.5)] group-hover:shadow-[0_0_40px_rgba(57,255,20,0.8)]
                        transition-all duration-300 group-hover:scale-105 mx-auto text-center">
          Open Pack
        </div>
      </button>

      <p className="font-['Lexend'] text-[11px] text-on-surface-variant uppercase tracking-widest">
        Click to reveal today's picks
      </p>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function Open() {
  const { user, loading: authLoading } = useAuth();
  const { data: matches, loading }     = useTodayPredictions();
  const navigate = useNavigate();

  const [phase,        setPhase]        = useState("locked");  // locked | already | pack | confirm | revealing | done
  const [activeReveal, setActiveReveal] = useState(-1);
  const [cards,        setCards]        = useState([]);

  // Once matches load, set up cards
  useEffect(() => {
    if (!loading && matches.length > 0) {
      setCards([...matches].sort((a, b) => b.conf - a.conf));
      if (!user) {
        setPhase("locked");
      } else if (isPackOpenedToday(user.id)) {
        setPhase("already");
      } else {
        setPhase("pack");
      }
    }
  }, [loading, matches, user]);

  function confirmOpen() {
    setPhase("confirm");
  }

  function openPack() {
    setPhase("revealing");
    matches.forEach((_, i) => {
      setTimeout(() => setActiveReveal(i), i * 600);
    });
    setTimeout(() => {
      markPackOpened(user?.id);
      setPhase("done");
    }, matches.length * 600 + 800);
  }

  // ── Not logged in ────────────────────────────────────────────────────
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-primary-container/10 border border-primary-container/30 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-primary-container text-4xl">lock</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface mb-3">Members Only</h1>
          <p className="text-on-surface-variant mb-8 font-['Lexend'] text-sm leading-relaxed">
            Sign in to unlock the daily pack opening experience and reveal today's AI predictions one by one.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login"
              className="px-6 py-3 rounded-xl bg-primary-container text-on-primary font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_30px_rgba(57,255,20,0.6)] transition-all">
              Sign In
            </Link>
            <Link to="/today"
              className="px-6 py-3 rounded-xl border border-white/10 text-on-surface-variant hover:text-on-surface font-['Lexend'] text-sm uppercase tracking-widest transition-all">
              View Today
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (loading || authLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-primary-container/30 border-t-primary-container animate-spin" />
          <span className="font-['Lexend'] text-[11px] text-on-surface-variant uppercase tracking-widest">Loading today's picks…</span>
        </div>
      </main>
    );
  }

  // ── No matches today ─────────────────────────────────────────────────
  if (!loading && matches.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl mb-4 block">sports_soccer</span>
          <h2 className="text-2xl font-black text-on-surface mb-2">No picks today</h2>
          <p className="text-on-surface-variant font-['Lexend'] text-sm mb-6">Check back later or browse the full schedule.</p>
          <Link to="/predictions"
            className="px-6 py-3 rounded-xl border border-primary-container/30 text-primary-container font-['Lexend'] text-sm uppercase tracking-widest hover:bg-primary-container/10 transition-all">
            View Schedule
          </Link>
        </div>
      </main>
    );
  }

  // ── Already opened / done ────────────────────────────────────────────
  if (phase === "already") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-6 py-16 px-8 text-center max-w-md w-full
                        bg-surface-container border-2 border-primary-container/20
                        shadow-[0_0_60px_rgba(57,255,20,0.06)]">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.04), transparent 60%)" }} />

          {/* Icon */}
          <div className="relative w-24 h-24 rounded-2xl border-2 border-primary-container/30 bg-primary-container/5 flex items-center justify-center z-10
                          shadow-[0_0_30px_rgba(57,255,20,0.15)]">
            <span className="material-symbols-outlined text-primary-container text-5xl">event_available</span>
          </div>

          {/* Text */}
          <div className="relative z-10">
            <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container mb-2">
              Pack Opened
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-3 leading-tight">
              No packs available<br />
              <span className="text-primary-container drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]">right now</span>
            </h2>
            <p className="text-zinc-400 font-['Lexend'] text-sm leading-relaxed">
              You've already opened today's free pack. Come back tomorrow for a fresh set of AI predictions.
            </p>
          </div>

          {/* Countdown hint */}
          <div className="relative z-10 px-5 py-3 rounded-xl bg-primary-container/5 border border-primary-container/20 w-full">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-primary-container text-[18px]">schedule</span>
              <span className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container">
                Next free pack at midnight
              </span>
            </div>
          </div>

          {/* CTAs */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full">
            <Link to="/today"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary-container text-on-primary font-black text-sm uppercase tracking-widest
                         shadow-[0_0_20px_rgba(57,255,20,0.4)] hover:shadow-[0_0_36px_rgba(57,255,20,0.7)]
                         hover:scale-105 active:scale-95 transition-all duration-200">
              <span className="material-symbols-outlined text-[18px]">today</span>
              View Today's Picks
            </Link>
            <Link to="/predictions"
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-white/10 text-on-surface-variant font-['Lexend'] text-sm uppercase tracking-widest
                         hover:border-white/20 hover:text-on-surface
                         hover:scale-105 active:scale-95 transition-all duration-200">
              Full Schedule
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Pack phase ───────────────────────────────────────────────────────
  if (phase === "pack") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-16 pt-24">
        <Pack count={matches.length} onClick={confirmOpen} />
      </main>
    );
  }

  // ── Confirm phase ─────────────────────────────────────────────────────
  if (phase === "confirm") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 pb-16 pt-24">
        <div className="relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-6 py-14 px-8 text-center max-w-md w-full
                        bg-surface-container border-2 border-primary-container/35
                        shadow-[0_0_60px_rgba(57,255,20,0.12)]">
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.06), transparent 60%)" }} />

          {/* Pack icon */}
          <div className="relative w-20 h-20 rounded-2xl border-2 border-primary-container/50 bg-primary-container/10 flex items-center justify-center z-10
                          shadow-[0_0_30px_rgba(57,255,20,0.2)]">
            <span className="text-3xl font-black italic text-primary-container drop-shadow-[0_0_16px_rgba(57,255,20,0.8)]">EP</span>
          </div>

          {/* Text */}
          <div className="relative z-10">
            <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container mb-2">
              Ready to reveal?
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-on-surface mb-2 leading-tight">
              Open your daily pack?
            </h2>
            <p className="text-on-surface-variant font-['Lexend'] text-sm leading-relaxed max-w-xs mx-auto">
              You have <span className="text-primary-container font-bold">{matches.length} prediction{matches.length !== 1 ? "s" : ""}</span> waiting inside.
              Once opened, this pack is gone until tomorrow.
            </p>
          </div>

          {/* Warning chip */}
          <div className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 w-full">
            <span className="material-symbols-outlined text-amber-400 text-[18px] flex-shrink-0">info</span>
            <span className="font-['Lexend'] text-[11px] text-amber-400 uppercase tracking-wider">
              1 free pack per day · resets at midnight
            </span>
          </div>

          {/* CTAs */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={openPack}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary-container text-on-primary font-black text-sm uppercase tracking-widest
                         shadow-[0_0_24px_rgba(57,255,20,0.5)] hover:shadow-[0_0_40px_rgba(57,255,20,0.8)]
                         hover:scale-105 active:scale-95 transition-all duration-200">
              <span className="material-symbols-outlined text-[20px]">style</span>
              Yes, Open It!
            </button>
            <button
              onClick={() => setPhase("pack")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl border-2 border-outline-variant/40 text-on-surface-variant font-['Lexend'] text-sm uppercase tracking-widest
                         hover:border-outline-variant hover:text-on-surface
                         hover:scale-105 active:scale-95 transition-all duration-200">
              Not Yet
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Revealing / Done ─────────────────────────────────────────────────
  return (
    <main className="pt-24 pb-16 md:pt-28 md:pb-24 max-w-[1280px] mx-auto px-4 sm:px-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-primary-container mb-1">
            Today's Pack
          </div>
          <h1 className="text-3xl font-black text-on-surface">
            {phase === "done"
              ? `${matches.length} Pick${matches.length !== 1 ? "s" : ""} Revealed`
              : "Revealing…"}
          </h1>
        </div>
        {/* phase "done" now has its own screen — nothing here */}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {cards.map((match, i) => (
          <PredCard
            key={match.id}
            match={match}
            index={i}
            revealed={i <= activeReveal}
          />
        ))}
      </div>

      {/* Progress — shown while revealing */}
      {phase === "revealing" && (
        <div className="mt-8 text-center font-['Lexend'] text-[11px] text-on-surface-variant uppercase tracking-widest animate-pulse">
          Revealing {Math.min(activeReveal + 1, matches.length)} / {matches.length}…
        </div>
      )}

      {/* Done — confirm CTA after all cards revealed */}
      {phase === "done" && (
        <div className="mt-12 flex flex-col items-center gap-4 animate-fade-up">
          <p className="font-['Lexend'] text-sm text-on-surface-variant uppercase tracking-widest">
            All {matches.length} pick{matches.length !== 1 ? "s" : ""} revealed
          </p>
          <Link
            to="/today"
            className="flex items-center gap-3 px-10 py-4 rounded-xl bg-primary-container text-on-primary font-black text-sm uppercase tracking-widest
                       shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_50px_rgba(57,255,20,0.8)]
                       hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">today</span>
            View Today's Picks
          </Link>
        </div>
      )}
    </main>
  );
}

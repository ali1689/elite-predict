import { cn } from "@/lib/utils";
import { sigStyle, tierStyle, fmtDate, fmtTime } from "@/data/matches";

// ── Mini confidence bar ────────────────────────────────────────────────────
function ConfBar({ value }) {
  const color =
    value >= 70 ? "bg-primary-container" :
    value >= 60 ? "bg-blue-400"          : "bg-zinc-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-14 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="font-['Lexend'] text-xs font-semibold text-on-surface tabular-nums">{value}%</span>
    </div>
  );
}

// ── Mini probability pill ──────────────────────────────────────────────────
function ProbPill({ label, value, accent = false }) {
  return (
    <div className="flex flex-col items-center min-w-[38px]">
      <span className={cn(
        "font-['Lexend'] text-[11px] font-bold tabular-nums",
        accent ? "text-primary-container" : "text-on-surface"
      )}>{value}%</span>
      <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

// ── Elo diff badge ─────────────────────────────────────────────────────────
function EloBadge({ diff }) {
  const abs  = Math.abs(diff);
  const side = diff > 30 ? "H+" : diff < -30 ? "A+" : "=";
  const color =
    abs > 100 ? "text-primary-container" :
    abs > 50  ? "text-blue-400"          : "text-on-surface-variant";
  return (
    <span className={cn("font-['Lexend'] text-[9px] font-bold uppercase tracking-widest", color)}>
      Elo {side === "=" ? "Even" : `${side}${abs}`}
    </span>
  );
}

// ── Main row ───────────────────────────────────────────────────────────────
export default function MatchRow({ match, className }) {
  const sig  = sigStyle(match.signal);
  const tier = tierStyle(match.tier);
  const xg   = ((match.lH || 0) + (match.lA || 0)).toFixed(1);

  return (
    <tr className={cn(
      "hover:bg-white/[0.025] transition-colors group border-b border-white/5 last:border-0",
      className
    )}>
      {/* Date / Time */}
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="font-bold text-on-surface text-sm">{fmtDate(match.utcDate)}</div>
        <div className="text-on-surface-variant text-xs mt-0.5">{fmtTime(match.utcDate)}</div>
      </td>

      {/* Matchup + Elo */}
      <td className="px-5 py-4">
        <div className="font-semibold text-on-surface text-sm">{match.home}</div>
        <div className="text-on-surface-variant text-xs mt-0.5">vs {match.away}</div>
        <div className="mt-1">
          <EloBadge diff={match.eloDiff ?? 0} />
        </div>
      </td>

      {/* League */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <span className="text-on-surface-variant text-sm">{match.league ?? match.comp}</span>
      </td>

      {/* Tier + Signal */}
      <td className="px-5 py-4">
        <div className="flex flex-col gap-1.5">
          <span className={cn(
            "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider w-fit border",
            tier.bg, tier.text, tier.border
          )}>
            {tier.label}
          </span>
          <span className={cn(
            "inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider",
            sig.bg, sig.text
          )}>
            {match.signal}
          </span>
        </div>
      </td>

      {/* Home goals (over 0.5 / over 1.5) */}
      <td className="px-5 py-4 hidden xl:table-cell">
        <div className="flex gap-2">
          <ProbPill label="H0.5+" value={match.homeOver05} accent />
          <ProbPill label="H1.5+" value={match.homeOver15} />
        </div>
      </td>

      {/* Away goals (over 0.5 / over 1.5) */}
      <td className="px-5 py-4 hidden xl:table-cell">
        <div className="flex gap-2">
          <ProbPill label="A0.5+" value={match.awayOver05} />
          <ProbPill label="A1.5+" value={match.awayOver15} />
        </div>
      </td>

      {/* BTTS */}
      <td className="px-5 py-4 hidden md:table-cell">
        <div className="font-['Lexend'] text-sm text-on-surface-variant tabular-nums">{match.btts}%</div>
      </td>

      {/* O2.5 */}
      <td className="px-5 py-4 hidden md:table-cell">
        <div className="font-['Lexend'] text-sm text-on-surface-variant tabular-nums">{match.over25}%</div>
      </td>

      {/* U2.5 */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <div className="font-['Lexend'] text-sm text-violet-400 tabular-nums">{match.under25}%</div>
      </td>

      {/* xG */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <div className="font-['Lexend'] text-sm text-on-surface-variant tabular-nums">{xg}</div>
      </td>

      {/* Confidence */}
      <td className="px-5 py-4 hidden sm:table-cell">
        <ConfBar value={match.conf} />
      </td>
    </tr>
  );
}

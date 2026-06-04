import { cn } from "@/lib/utils";
import { sigStyle, tierStyle, fmtDate, fmtTime } from "@/data/matches";

// Mini confidence bar
function ConfBar({ value }) {
  const color =
    value >= 70 ? "bg-primary-container" :
    value >= 60 ? "bg-blue-400"          : "bg-zinc-500";
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full bg-surface-container-high dark:bg-zinc-800 overflow-hidden flex-shrink-0">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="font-['Lexend'] text-xs font-semibold text-on-surface tabular-nums">{value}%</span>
    </div>
  );
}

// Mini probability pill
function ProbPill({ label, value, accent = false }) {
  return (
    <div className="flex flex-col items-center min-w-[34px]">
      <span className={cn(
        "font-['Lexend'] text-[11px] font-bold tabular-nums",
        accent ? "text-primary-container" : "text-on-surface"
      )}>{value}%</span>
      <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</span>
    </div>
  );
}

// Elo diff badge
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

// 1X2 triple pill
function ResultPills({ homeWin, draw, awayWin }) {
  const best = Math.max(homeWin || 0, draw || 0, awayWin || 0);
  return (
    <div className="flex gap-1">
      {[
        { label: "1", value: homeWin || 0, hi: "text-primary-container" },
        { label: "X", value: draw    || 0, hi: "text-yellow-400"        },
        { label: "2", value: awayWin || 0, hi: "text-blue-400"          },
      ].map(({ label, value, hi }) => (
        <div key={label} className="flex flex-col items-center min-w-[28px]">
          <span className={cn(
            "font-['Lexend'] text-[11px] font-bold tabular-nums",
            value === best && value > 0 ? hi : "text-on-surface-variant"
          )}>{value}%</span>
          <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Double Chance triple pill
function DCPills({ dc1X, dcX2, dc12 }) {
  const best = Math.max(dc1X || 0, dcX2 || 0, dc12 || 0);
  return (
    <div className="flex gap-1">
      {[
        { label: "1X", value: dc1X || 0, hi: "text-emerald-400" },
        { label: "X2", value: dcX2 || 0, hi: "text-sky-400"     },
        { label: "12", value: dc12 || 0, hi: "text-violet-400"  },
      ].map(({ label, value, hi }) => (
        <div key={label} className="flex flex-col items-center min-w-[28px]">
          <span className={cn(
            "font-['Lexend'] text-[11px] font-bold tabular-nums",
            value === best && value > 0 ? hi : "text-on-surface-variant"
          )}>{value}%</span>
          <span className="font-['Lexend'] text-[8px] text-on-surface-variant uppercase tracking-wider mt-0.5">{label}</span>
        </div>
      ))}
    </div>
  );
}

// Shared td base class
const TD = "px-3 py-3 md:px-5 md:py-[14px] align-top overflow-hidden";

export default function MatchRow({ match, className }) {
  const sig  = sigStyle(match.signal);
  const tier = tierStyle(match.tier);
  const xg   = ((match.lH || 0) + (match.lA || 0)).toFixed(1);

  return (
    <tr className={cn(
      "hover:bg-primary-container/5 dark:hover:bg-white/[0.025] transition-colors group border-b border-outline-variant/20 dark:border-white/5 last:border-0",
      className
    )}>
      {/* Date / Time */}
      <td className={TD}>
        <div className="font-bold text-on-surface text-sm whitespace-nowrap">{fmtDate(match.utcDate)}</div>
        <div className="text-on-surface-variant text-xs mt-0.5 whitespace-nowrap">{fmtTime(match.utcDate)}</div>
      </td>

      {/* Matchup + Elo */}
      <td className={TD}>
        <div className="font-semibold text-on-surface text-sm truncate">{match.home}</div>
        <div className="text-on-surface-variant text-xs mt-0.5 truncate">vs {match.away}</div>
        <div className="mt-1"><EloBadge diff={match.eloDiff ?? 0} /></div>
      </td>

      {/* League */}
      <td className={TD}>
        <span className="text-on-surface-variant text-xs truncate block">{match.league ?? match.comp}</span>
      </td>

      {/* Tier + Signal */}
      <td className={TD}>
        <div className="flex flex-col gap-1.5">
          <span className={cn(
            "inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider w-fit border",
            tier.bg, tier.text, tier.border
          )}>{tier.label}</span>
          <span className={cn(
            "inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider w-fit",
            sig.bg, sig.text
          )}>{match.signal}</span>
        </div>
      </td>

      {/* Home Goals */}
      <td className={TD}>
        <div className="flex gap-1.5">
          <ProbPill label="H0.5+" value={match.homeOver05} accent />
          <ProbPill label="H1.5+" value={match.homeOver15} />
        </div>
      </td>

      {/* Away Goals */}
      <td className={TD}>
        <div className="flex gap-1.5">
          <ProbPill label="A0.5+" value={match.awayOver05} />
          <ProbPill label="A1.5+" value={match.awayOver15} />
        </div>
      </td>

      {/* BTTS */}
      <td className={TD}>
        <div className="font-['Lexend'] text-sm text-on-surface-variant tabular-nums">{match.btts}%</div>
      </td>

      {/* O1.5 */}
      <td className={TD}>
        <div className={cn(
          "font-['Lexend'] text-sm font-bold tabular-nums",
          (match.over15 ?? 0) >= 75 ? "text-primary-container" :
          (match.over15 ?? 0) >= 60 ? "text-yellow-400"        :
                                      "text-on-surface-variant"
        )}>
          {match.over15 != null ? `${match.over15}%` : "—"}
        </div>
      </td>

      {/* O2.5 */}
      <td className={TD}>
        <div className="font-['Lexend'] text-sm text-on-surface-variant tabular-nums">{match.over25}%</div>
      </td>

      {/* U2.5 */}
      <td className={TD}>
        <div className="font-['Lexend'] text-sm text-violet-400 tabular-nums">{match.under25}%</div>
      </td>

      {/* xG */}
      <td className={TD}>
        <div className="font-['Lexend'] text-sm text-on-surface-variant tabular-nums">{xg}</div>
      </td>

      {/* 1X2 Result */}
      <td className={TD}>
        <ResultPills homeWin={match.homeWin} draw={match.draw} awayWin={match.awayWin} />
      </td>

      {/* Double Chance */}
      <td className={TD}>
        <DCPills dc1X={match.dc1X} dcX2={match.dcX2} dc12={match.dc12} />
      </td>

      {/* Confidence */}
      <td className={TD}>
        <ConfBar value={match.conf} />
      </td>
    </tr>
  );
}

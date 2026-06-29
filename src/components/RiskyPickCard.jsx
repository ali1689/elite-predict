import TeamAvatar from "@/components/TeamAvatar";
import { fmtTime, abbr } from "@/data/matches";
import { cn } from "@/lib/utils";

// Shared amber "value / risky" pick card — used by the Today page's Risky tab.
const MARKET_META = {
  "Home Win (1)":        { short: "Home Win",  icon: "home" },
  "Away Win (2)":        { short: "Away Win",  icon: "flight_takeoff" },
  "Draw (X)":            { short: "Draw",      icon: "drag_handle" },
  "Over 1.5 Goals":      { short: "Over 1.5",  icon: "trending_up" },
  "Over 2.5 Goals":      { short: "Over 2.5",  icon: "trending_up" },
  "Under 2.5 Goals":     { short: "Under 2.5", icon: "trending_down" },
  "Both Teams to Score": { short: "BTTS",      icon: "swap_horiz" },
};
function marketMeta(m) {
  return MARKET_META[m] ?? { short: m, icon: "bolt" };
}

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

export default function RiskyPickCard({ pick }) {
  const meta = marketMeta(pick.market);
  const homeTeam = { abbr: abbr(pick.home), name: pick.home, logo: null };
  const awayTeam = { abbr: abbr(pick.away), name: pick.away, logo: null };

  return (
    <div className="relative glass-card p-5 rounded-xl flex flex-col gap-4 h-full border border-amber-400/25
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
          <div className="font-black text-lg text-amber-400 leading-none tabular-nums">{Number(pick.odds).toFixed(2)}</div>
        </div>
      </div>

      {/* Edge bars */}
      <EdgeBar model={pick.modelProb} implied={pick.impliedProb} />

      {/* Edge highlight */}
      <div className="flex items-center justify-between pt-1 border-t border-outline-variant/30 mt-auto">
        <span className="font-['Lexend'] text-[9px] uppercase tracking-widest text-on-surface-variant">Model edge vs price</span>
        <span className="inline-flex items-center gap-1 font-black text-sm text-amber-400 tabular-nums">
          <span className="material-symbols-outlined text-[14px]">north_east</span>
          +{pick.edge} pts
        </span>
      </div>
    </div>
  );
}

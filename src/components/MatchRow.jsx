import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SIG_STYLE = {
  "HIGH SCORING": { bg: "bg-primary-container/10", text: "text-primary-container" },
  "BTTS + O2.5":  { bg: "bg-primary-container/10", text: "text-primary-container" },
  "BTTS":         { bg: "bg-blue-500/15",           text: "text-blue-400"          },
  "OVER 2.5":     { bg: "bg-blue-500/15",           text: "text-blue-400"          },
  "BALANCED":     { bg: "bg-white/5",               text: "text-on-surface-variant"},
};

function ConfBar({ value }) {
  const color = value >= 70 ? "bg-primary-container" : value >= 60 ? "bg-blue-400" : "bg-zinc-500";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${value}%` }} />
      </div>
      <span className="font-['Lexend'] text-xs font-semibold text-on-surface">{value}%</span>
    </div>
  );
}

export default function MatchRow({ match, className }) {
  const sig = SIG_STYLE[match.signal] ?? SIG_STYLE["BALANCED"];
  return (
    <tr className={cn("hover:bg-white/[0.025] transition-colors group border-b border-white/5 last:border-0", className)}>
      <td className="px-5 py-4 whitespace-nowrap">
        <div className="font-bold text-on-surface text-sm">{match.date}</div>
        <div className="text-on-surface-variant text-xs mt-0.5">{match.time}</div>
      </td>
      <td className="px-5 py-4">
        <div className="font-semibold text-on-surface text-sm">{match.home}</div>
        <div className="text-on-surface-variant text-xs mt-0.5">vs {match.away}</div>
      </td>
      <td className="px-5 py-4 hidden lg:table-cell">
        <span className="text-on-surface-variant text-sm">{match.league}</span>
      </td>
      <td className="px-5 py-4">
        <span className={cn("inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider", sig.bg, sig.text)}>
          {match.signal}
        </span>
      </td>
      <td className="px-5 py-4 hidden md:table-cell">
        <div className="font-['Lexend'] text-sm text-on-surface-variant">{match.btts}%</div>
      </td>
      <td className="px-5 py-4 hidden md:table-cell">
        <div className="font-['Lexend'] text-sm text-on-surface-variant">{match.over25}%</div>
      </td>
      <td className="px-5 py-4 hidden sm:table-cell">
        <ConfBar value={match.conf} />
      </td>
      <td className="px-5 py-4 text-right">
        <Button variant="outline" size="sm"
          className="font-['Lexend'] text-[10px] tracking-widest uppercase group-hover:border-primary-container/60 whitespace-nowrap">
          Deep Dive
        </Button>
      </td>
    </tr>
  );
}

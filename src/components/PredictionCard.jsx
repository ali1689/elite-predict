import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import TeamAvatar from "@/components/TeamAvatar";

const STATUS_CONFIG = {
  live:       { dot: "bg-red-500",           label: "Live Analysis", labelClass: "text-red-500",           pulse: true  },
  optimized:  { dot: "bg-primary-container", label: "Optimized",     labelClass: "text-primary-container", pulse: false },
  finalizing: { dot: "bg-zinc-500",          label: "Finalizing",    labelClass: "text-zinc-500",          pulse: false },
};

const SIGNAL_COLOR = {
  "HIGH SCORING": "text-primary-container",
  "BTTS + O2.5":  "text-primary-container",
  "BTTS":         "text-blue-400",
  "OVER 2.5":     "text-blue-400",
  "BALANCED":     "text-on-surface-variant",
};

export default function PredictionCard({ card, className }) {
  const status   = STATUS_CONFIG[card.status] ?? STATUS_CONFIG.finalizing;
  const sigColor = SIGNAL_COLOR[card.prediction] ?? "text-primary-container";

  return (
    <div className={cn("glass-card p-8 rounded-2xl relative overflow-hidden group hover:border-primary-container/30 transition-all duration-300", className)}>
      <div className="absolute top-0 right-0 p-4">
        <span className={cn("flex items-center gap-2 font-bold text-xs uppercase", status.labelClass)}>
          <span className={cn("w-2 h-2 rounded-full", status.dot, status.pulse && "animate-pulse-dot")} />
          {status.label}
        </span>
      </div>
      <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mb-4 mt-1">
        {card.league} · {card.time}
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-center w-[38%]">
          <TeamAvatar team={card.home} />
          <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">{card.home.abbr}</div>
        </div>
        <div className="text-center font-black text-xl text-on-surface-variant italic">VS</div>
        <div className="text-center w-[38%]">
          <TeamAvatar team={card.away} />
          <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mt-2">{card.away.abbr}</div>
        </div>
      </div>
      <div className="bg-zinc-950/60 rounded-xl p-4 mb-4 border border-white/5 group-hover:border-primary-container/20 transition-colors">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-on-surface-variant">Signal</span>
          <span className={cn("font-black tracking-wide text-sm", sigColor)}>{card.prediction}</span>
        </div>
        <Progress value={card.confidence} />
        <div className="flex justify-between items-center mt-2">
          <span className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest">Confidence</span>
          <span className="font-['Lexend'] text-primary-container font-semibold">{card.confidence}%</span>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">Home Scoring Chance</span>
            <span className="font-['Lexend'] text-[9px] font-bold text-primary-container">{card.homeScore}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: `${card.homeScore}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-1">
            <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">Away Scoring Chance</span>
            <span className="font-['Lexend'] text-[9px] font-bold text-blue-400">{card.awayScore}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${card.awayScore}%` }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5 text-center">
          <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">BTTS</div>
          <div className="font-['Lexend'] text-base font-semibold text-on-surface">{card.btts}%</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5 text-center">
          <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mb-1">O2.5</div>
          <div className="font-['Lexend'] text-base font-semibold text-on-surface">{card.over25}%</div>
        </div>
      </div>
      <Button variant="outline" size="default" asChild
        className="w-full rounded-lg text-xs tracking-widest hover:bg-primary-container hover:text-on-primary hover:border-primary-container">
        <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
          Join Telegram for Full Stats
        </a>
      </Button>
    </div>
  );
}

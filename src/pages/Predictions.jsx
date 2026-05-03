import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import TeamAvatar from "@/components/TeamAvatar";
import MatchRow from "@/components/MatchRow";
import { featureCards, schedule } from "@/data/matches";
import { cn } from "@/lib/utils";

const CTA_BG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDFSZ87SJRX2aa025ExYPpRA4_nsFny4c9anPKMHcdvtwFtyOobqOi1oN6pill283E0teUZJJhC1T5OqHzMRFuU0Vj0-06UY4cwM7YhmN1R7XcquQ-ksfJm5Vf-sYZLZnWzIkTE6j8uANAJS4ZVeuihMgaaCgI_TVCNlrTGFeLlCZiu1bZWfWECbm3RkAcTmyudBhvmvlqJIt7q0PHlXkEayMvSQojlpcUlMNgCUAejjZYsG5EUQ";

const ALL = "ALL";
const LEAGUES = [ALL, ...Array.from(new Set(schedule.map(m => m.league))).sort()];

const SIG_STYLE = {
  "HIGH SCORING": { text: "text-primary-container", bg: "bg-primary-container/10" },
  "BTTS + O2.5":  { text: "text-primary-container", bg: "bg-primary-container/10" },
  "BTTS":         { text: "text-blue-400",           bg: "bg-blue-500/10"          },
  "OVER 2.5":     { text: "text-blue-400",           bg: "bg-blue-500/10"          },
  "BALANCED":     { text: "text-on-surface-variant", bg: "bg-white/5"              },
};

function FeaturedCard({ card }) {
  const sig = SIG_STYLE[card.prediction] ?? SIG_STYLE["BALANCED"];
  const badgeEl = card.badgeStyle === "neon"
    ? <span className="bg-primary-container/10 text-primary-container px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">{card.badge}</span>
    : card.badgeStyle === "blue"
    ? <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">{card.badge}</span>
    : <span className="bg-white/5 text-on-surface-variant px-3 py-1 rounded text-[10px] font-black uppercase tracking-tighter">{card.badge}</span>;

  return (
    <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-primary-container/30 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4">{badgeEl}</div>
      <div className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest mb-5">
        {card.league} · {card.time}
      </div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-center">
          <TeamAvatar team={card.home} />
          <div className="font-bold text-sm mt-2 text-on-surface">{card.home.abbr}</div>
        </div>
        <div className="text-on-surface-variant font-black text-2xl italic">VS</div>
        <div className="text-center">
          <TeamAvatar team={card.away} />
          <div className="font-bold text-sm mt-2 text-on-surface">{card.away.abbr}</div>
        </div>
      </div>
      <div className="bg-black/40 p-4 rounded-lg border border-primary-container/20 group-hover:border-primary-container transition-colors mb-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Signal</div>
            <div className={cn("font-black text-lg", sig.text)}>{card.prediction}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mb-1">Confidence</div>
            <div className="text-on-surface font-bold font-['Lexend']">{card.confidence}%</div>
          </div>
        </div>
      </div>
      {/* Scoring chances */}
      <div className="space-y-1.5 mb-3">
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">Home Scoring</span>
            <span className="font-['Lexend'] text-[9px] font-bold text-primary-container">{card.homeScore}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary-container rounded-full" style={{ width: `${card.homeScore}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between mb-0.5">
            <span className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest">Away Scoring</span>
            <span className="font-['Lexend'] text-[9px] font-bold text-blue-400">{card.awayScore}%</span>
          </div>
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-400 rounded-full" style={{ width: `${card.awayScore}%` }} />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
          <div className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">BTTS</div>
          <div className="font-['Lexend'] text-sm font-semibold text-on-surface">{card.btts}%</div>
        </div>
        <div className="bg-white/[0.03] rounded-lg p-2 text-center border border-white/5">
          <div className="font-['Lexend'] text-[9px] text-on-surface-variant uppercase tracking-widest mb-0.5">O2.5</div>
          <div className="font-['Lexend'] text-sm font-semibold text-on-surface">{card.over25}%</div>
        </div>
      </div>
    </div>
  );
}

export default function Predictions() {
  const [activeLeague, setActiveLeague] = useState(ALL);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [sortBy,       setSortBy]       = useState("date");

  const filtered = useMemo(() => {
    let rows = schedule;
    if (activeLeague !== ALL) rows = rows.filter(m => m.league === activeLeague);
    if (searchQuery.trim())   rows = rows.filter(m =>
      m.home.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.away.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (sortBy === "conf") rows = [...rows].sort((a, b) => b.conf - a.conf);
    return rows;
  }, [activeLeague, searchQuery, sortBy]);

  return (
    <main className="pt-32 pb-24 max-w-[1280px] mx-auto px-8">

      <section className="mb-16 animate-fade-up">
        <h1 className="text-display-xl font-black text-on-surface mb-4 leading-tight">
          Upcoming <span className="text-primary-container">Precision</span> Picks
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-headline-md font-semibold leading-relaxed">
          {schedule.length} real predictions across {LEAGUES.length - 1} leagues — powered by our AI engine.
        </p>
      </section>

      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-headline-md font-semibold text-on-surface uppercase tracking-wider flex items-center gap-3">
            <span className="w-1.5 h-6 bg-primary-container rounded-full inline-block" />
            Highest Confidence Picks
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featureCards.map(card => <FeaturedCard key={card.id} card={card} />)}
        </div>
      </section>

      <section className="mb-8 space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {LEAGUES.map(l => (
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-surface-container-high border border-white/5 rounded-lg px-4 py-2 gap-2 flex-1 min-w-[200px]">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">search</span>
            <input type="text" placeholder="Search teams..." value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none w-full font-sans" />
          </div>
          <div className="flex gap-2">
            {[{key:"date",label:"By Date"},{key:"conf",label:"By Confidence"}].map(({key,label}) => (
              <button key={key} onClick={() => setSortBy(key)}
                className={cn(
                  "px-4 py-2 rounded-lg font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest transition-all",
                  sortBy === key ? "bg-primary-container text-on-primary" : "border border-white/10 text-on-surface-variant hover:border-primary-container/40"
                )}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-24">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-headline-md font-semibold text-on-surface uppercase tracking-wider">Full Schedule</h2>
          <div className="font-['Lexend'] text-[11px] text-on-surface-variant uppercase tracking-widest">
            {filtered.length} Match{filtered.length !== 1 ? "es" : ""}
          </div>
        </div>
        <div className="w-full overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                {["Date / Time","Matchup","League","Signal","BTTS","O2.5","Conf",""].map(h => (
                  <th key={h} className="px-5 py-4 font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0
                ? filtered.map(m => <MatchRow key={m.id} match={m} />)
                : <tr><td colSpan={8} className="px-6 py-16 text-center text-on-surface-variant">No matches found.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </section>

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
              Get instant signal alerts, breaking lineup news, and late-market value drops directly on your phone.
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

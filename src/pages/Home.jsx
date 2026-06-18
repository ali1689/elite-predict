import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PredictionCard from "@/components/PredictionCard";
import FeatureCard from "@/components/FeatureCard";
import ToolCard from "@/components/ToolCard";
import TestimonialCard from "@/components/TestimonialCard";
import { testimonials, abbr, fmtTime } from "@/data/matches";
import { useAllPredictions } from "@/lib/usePredictions";
import { useReveal } from "@/lib/useReveal";
import { useCountUp } from "@/lib/useCountUp";

// Transform a normalized Supabase row → PredictionCard-compatible card object
function toHeroCard(m) {
  return {
    id:         m.id,
    home:       { abbr: abbr(m.home), name: m.home, logo: null },
    away:       { abbr: abbr(m.away), name: m.away, logo: null },
    prediction: m.signal,
    confidence: m.conf,
    status:     m.tier === "A" ? "optimized" : m.tier === "B" ? "live" : "finalizing",
    league:     m.comp,
    time:       fmtTime(m.utcDate),
    btts:       m.btts,
    over25:     m.over25,
    homeScore:  m.homeOver05,
    awayScore:  m.awayOver05,
    lH:         m.lH,
    lA:         m.lA,
  };
}

const STADIUM_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC7mr9iVGiClXRxel-urcHQjdBa7cHDVc6BJzIwwUob8QMRyNz2r_Qn2vuwuZGuHU4eikl26YAE1PY7xLh_qtDipp7k4CXQ8t4TJp0pEwy_zt2h8c8V1masqYth_4uzMBhR2mycPN9FeRevauIhcyGdllXVHsPkvZ0MEbkE2RHhpsNRy4A-8KNqgC_Tb-9TBICJDtQgAHcEIR7Aa57kM026fDgekdshgVvWi6-JuJsurObxcUCRUl2q_CiMuRSpcIObjQQUMgha2A";

// Animated counters — each item declares a numeric target + presentation.
const STATS = [
  { value: 5000, decimals: 0, suffix: "+", group: true, label: "Active Members"  },
  { value: 87.4, decimals: 1, suffix: "%",               label: "ROI Last Month"  },
  { text:  "FREE",                                        label: "Lifetime Access" },
];

// New-feature showcase — every tool the app now ships, linked from the home page.
const TOOLS = [
  {
    to: "/live", icon: "sensors", live: true,
    title: "Live In-Play",
    description: "Follow goals, momentum and in-play signals updating in real time as matches unfold.",
  },
  {
    to: "/today", icon: "today", badge: "Daily",
    title: "Today's Predictions",
    description: "Every high-confidence pick for today's fixtures, ranked and scored by our AI engine.",
  },
  {
    to: "/open", icon: "style", badge: "New",
    title: "Open Pack",
    description: "Reveal a curated pack of the day's strongest value bets — one tap, instant insight.",
  },
  {
    to: "/predictions", icon: "calendar_month",
    title: "Upcoming Predictions",
    description: "Browse the full slate of upcoming matches with probabilities across every market.",
  },
  {
    to: "/players", icon: "sports_soccer", badge: "Players",
    title: "Goalscorers",
    description: "Anytime and first-scorer probabilities for the key players in every featured match.",
  },
  {
    href: "https://t.me/SmartBet_Signals", icon: "send", badge: "Free",
    title: "Telegram Community",
    description: "Get instant alerts, full breakdowns and discussion with 5,000+ elite members.",
  },
];

const FEATURES = [
  {
    icon: "psychology",
    title: "Deep Learning AI",
    description: "Our neural engine simulates each match 50,000 times before issuing a final prediction, accounting for every statistical outlier.",
  },
  {
    icon: "notifications_active",
    title: "Real-Time Alerts",
    description: "Never miss a high-value opportunity. Get instant notifications for lineup changes and market shifts directly on Telegram.",
  },
  {
    icon: "diversity_3",
    title: "Pro Community",
    description: "Connect with 5,000+ elite analysts and bettors. Share insights and strategies inside our exclusive free group.",
  },
];

const COMMUNITY_PERKS = [
  ["Unlimited AI Predictions", "1,200+ Global Leagues", "Real-time Live Match Alerts"],
  ["Bankroll Management Advice", "Exclusive Telegram Discussion", "Live Injury & Lineup Updates"],
];

// ── Scroll-reveal wrapper ─────────────────────────────────────────────────────
function Reveal({ children, className = "", delay = 0, as: Tag = "div", ...rest }) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "reveal-in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// ── Single animated stat — counts up once its section scrolls into view ───────
function Stat({ stat, shown }) {
  const animated = useCountUp(shown ? stat.value ?? 0 : 0, { decimals: stat.decimals ?? 0 });
  let display = stat.text;
  if (!display) {
    const n = stat.group ? Number(animated).toLocaleString("en-US") : animated;
    display = `${n}${stat.suffix ?? ""}`;
  }
  return (
    <div>
      <div className="font-['Lexend'] text-3xl sm:text-5xl md:text-display-xl font-extrabold text-primary-container mb-1 md:mb-2 leading-none tabular-nums">
        {display}
      </div>
      <div className="font-['Lexend'] text-[9px] sm:text-[11px] md:text-[12px] text-on-surface-variant uppercase tracking-widest">
        {stat.label}
      </div>
    </div>
  );
}

function StatBar() {
  const [ref, shown] = useReveal({ threshold: 0.4 });
  return (
    <section ref={ref} className="bg-surface-container-low border-y border-white/5 py-10 md:py-14">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 grid grid-cols-3 gap-4 md:gap-12 text-center">
        {STATS.map((stat) => (
          <Stat key={stat.label} stat={stat} shown={shown} />
        ))}
      </div>
    </section>
  );
}

// Skeleton placeholder for a PredictionCard while loading
function CardSkeleton() {
  return (
    <div className="glass-card p-8 rounded-2xl animate-pulse space-y-5">
      <div className="h-4 bg-white/5 rounded w-1/2" />
      <div className="flex justify-between items-center">
        <div className="h-16 w-16 bg-white/5 rounded-full" />
        <div className="h-6 w-8 bg-white/5 rounded" />
        <div className="h-16 w-16 bg-white/5 rounded-full" />
      </div>
      <div className="h-16 bg-white/5 rounded-xl" />
      <div className="space-y-2">
        <div className="h-2 bg-white/5 rounded w-full" />
        <div className="h-2 bg-white/5 rounded w-4/5" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="h-14 bg-white/5 rounded-lg" />
        <div className="h-14 bg-white/5 rounded-lg" />
      </div>
    </div>
  );
}

export default function Home() {
  const { data: allMatches, loading } = useAllPredictions();
  const heroCards = useMemo(
    () => [...allMatches].sort((a, b) => b.conf - a.conf).slice(0, 8).map(toHeroCard),
    [allMatches]
  );

  // Wired carousel — chevrons scroll the rail by roughly one card width.
  const railRef = useRef(null);
  const scrollRail = (dir) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.querySelector("[data-rail-card]");
    const amount = card ? card.offsetWidth + 32 : rail.clientWidth * 0.8;
    rail.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 md:pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={STADIUM_IMG} alt="Football stadium at night"
            className="w-full h-full object-cover opacity-30 grayscale ep-kenburns" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        {/* Ambient animated glow orbs */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="ep-orb ep-orb-green absolute -top-24 -left-24 w-[26rem] h-[26rem] md:w-[34rem] md:h-[34rem] rounded-full" />
          <div className="ep-orb ep-orb-blue absolute top-1/3 -right-24 w-[22rem] h-[22rem] md:w-[28rem] md:h-[28rem] rounded-full" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-8 w-full py-12 md:py-24">
          <div className="max-w-4xl">
            <div className="animate-fade-up" style={{ animationDelay: "0ms", animationFillMode: "both" }}>
              <Badge variant="neon" className="mb-4 md:mb-6">
                AI-Engine Activated &bull; Now 100% Free
              </Badge>
            </div>
            <h1 className="animate-fade-up text-[2.25rem] sm:text-5xl md:text-display-xl font-black text-on-surface mb-5 md:mb-8 leading-[1.05] tracking-tight md:tracking-[-0.04em]"
              style={{ animationDelay: "100ms", animationFillMode: "both" }}>
              MASTER THE MATCH WITH{" "}
              <span className="text-primary-container ep-glow-text">PRO-LEVEL</span> PRECISION
            </h1>
            <p className="animate-fade-up text-base sm:text-lg md:text-headline-md font-semibold text-on-surface-variant mb-8 md:mb-12 max-w-2xl leading-relaxed"
              style={{ animationDelay: "200ms", animationFillMode: "both" }}>
              Join the world's most accurate AI football prediction engine. Now free for the
              community. Real-time data, expert analytics, and 85%+ win rates.
            </p>
            <div className="animate-fade-up flex flex-col sm:flex-row gap-3 sm:gap-5"
              style={{ animationDelay: "300ms", animationFillMode: "both" }}>
              <Button size="lg" variant="primary" className="neon-glow w-full sm:w-auto" asChild>
                <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
                  Join Telegram Channel
                </a>
              </Button>
              <Button size="lg" variant="ghost" className="w-full sm:w-auto" asChild>
                <Link to="/predictions">Access Free Predictions</Link>
              </Button>
            </div>

            {/* Quick-jump chips to the newest tools */}
            <div className="animate-fade-up mt-8 md:mt-12 flex flex-wrap gap-2 md:gap-3"
              style={{ animationDelay: "400ms", animationFillMode: "both" }}>
              {[
                { to: "/live", icon: "sensors", label: "Live In-Play", live: true },
                { to: "/today", icon: "today", label: "Today" },
                { to: "/open", icon: "style", label: "Open Pack" },
                { to: "/players", icon: "sports_soccer", label: "Goalscorers" },
              ].map(({ to, icon, label, live }) => (
                <Link key={to} to={to}
                  className="group flex items-center gap-2 pl-3 pr-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-on-surface text-xs md:text-sm font-semibold hover:border-primary-container/40 hover:bg-primary-container/10 transition-all">
                  {live
                    ? <span className="ep-live-dot" />
                    : <span className="material-symbols-outlined text-primary-container text-[18px]">{icon}</span>}
                  {label}
                  <span className="material-symbols-outlined text-[16px] opacity-0 -ml-1 group-hover:opacity-60 group-hover:ml-0 transition-all">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF — animated counters */}
      <StatBar />

      {/* FEATURE SHOWCASE — surface every tool the app now ships */}
      <section className="py-16 md:py-28 max-w-[1280px] mx-auto px-4 sm:px-8">
        <Reveal className="text-center mb-10 md:mb-16 max-w-2xl mx-auto">
          <Badge variant="neon" className="mb-4">Everything in one place</Badge>
          <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-bold text-on-surface mb-3 md:mb-4">
            One engine, every angle of the match
          </h2>
          <p className="text-on-surface-variant text-sm md:text-base">
            Elite Predict has grown into a full toolkit. Jump straight into live action,
            today's slate, surprise packs, goalscorer markets and more.
          </p>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {TOOLS.map((tool, i) => (
            <Reveal key={tool.title} delay={(i % 3) * 90}>
              <ToolCard {...tool} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* PREDICTION FEED — wired swipe rail */}
      <section className="py-16 md:py-28 bg-surface-container">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <Reveal className="flex justify-between items-start md:items-end mb-8 md:mb-14 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-bold text-on-surface mb-3 md:mb-4">
                Upcoming High-Confidence Predictions
              </h2>
              <p className="text-on-surface-variant max-w-xl text-sm md:text-base">
                Our neural networks have flagged these matches with extreme probability scoring.
                Swipe through the top picks or open the full slate.
              </p>
            </div>
            <div className="hidden md:flex gap-3 flex-shrink-0">
              <button onClick={() => scrollRail(-1)} aria-label="Scroll left"
                className="p-3 rounded-full border border-white/10 hover:bg-white/5 hover:border-primary-container/30 transition-colors">
                <span className="material-symbols-outlined text-on-surface">chevron_left</span>
              </button>
              <button onClick={() => scrollRail(1)} aria-label="Scroll right"
                className="p-3 rounded-full border border-white/10 hover:bg-white/5 hover:border-primary-container/30 transition-colors">
                <span className="material-symbols-outlined text-on-surface">chevron_right</span>
              </button>
            </div>
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
              {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : heroCards.length > 0 ? (
            <div ref={railRef}
              className="ep-rail flex gap-5 md:gap-8 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-8 sm:px-8">
              {heroCards.map((card) => (
                <div key={card.id} data-rail-card
                  className="flex-shrink-0 w-[85vw] sm:w-[360px] md:w-[calc((100%-4rem)/3)]">
                  <PredictionCard card={card} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant font-['Lexend'] text-sm">
              No predictions available right now — check back soon.
            </p>
          )}

          <Reveal className="mt-8 md:mt-10 flex justify-center" delay={100}>
            <Button size="lg" variant="ghost" asChild>
              <Link to="/predictions">View all predictions</Link>
            </Button>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-background py-16 md:py-32">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
          <Reveal className="text-center mb-10 md:mb-20 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-headline-lg font-bold text-on-surface mb-4 md:mb-6">
              Unrivaled AI Precision, Free Forever
            </h2>
            <p className="text-on-surface-variant text-sm md:text-base">
              We've opened our vault. Our proprietary algorithms process historical trends and
              real-time news to deliver surgical precision directly to your phone.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
            {FEATURES.map(({ icon, title, description }, i) => (
              <Reveal key={icon} delay={i * 110}>
                <FeatureCard icon={icon} title={title} description={description} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-16 md:py-32 max-w-[1280px] mx-auto px-4 sm:px-8">
        <Reveal as="h2" className="text-2xl sm:text-3xl md:text-headline-lg font-bold text-on-surface mb-8 md:mb-16 text-center">
          Success Stories from Our Channel
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
          {testimonials.map((t, i) => (
            <Reveal key={t.id} delay={(i % 2) * 110}>
              <TestimonialCard testimonial={t} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="py-16 md:py-32 bg-zinc-950">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 text-center">
          <Reveal className="max-w-4xl mx-auto p-6 sm:p-8 md:p-12 rounded-2xl md:rounded-3xl bg-primary-container text-on-primary shadow-2xl shadow-primary-container/20">
            <span className="inline-block bg-on-primary text-primary-container text-[10px] font-bold uppercase tracking-[0.15em] py-1 px-4 rounded-full mb-4 md:mb-6">
              100% Free Lifetime Access
            </span>
            <h2 className="text-[2rem] sm:text-5xl md:text-display-xl font-black mb-4 md:mb-6 text-on-primary leading-tight">
              JOIN OUR FREE COMMUNITY
            </h2>
            <p className="text-base sm:text-lg md:text-headline-md font-semibold mb-7 md:mb-10 opacity-90 max-w-xl mx-auto leading-relaxed">
              Get instant access to our Elite AI engine and Pro-level predictions. No
              subscriptions, no hidden fees. Just winning insights.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6 text-left mb-7 md:mb-12 max-w-lg mx-auto">
              {COMMUNITY_PERKS.map((col, ci) => (
                <ul key={ci} className="space-y-2 md:space-y-3">
                  {col.map((perk) => (
                    <li key={perk} className="flex items-center gap-2 md:gap-3 font-semibold text-on-primary text-sm md:text-base">
                      <span className="material-symbols-outlined text-on-primary text-lg md:text-xl flex-shrink-0">check_circle</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <Button size="xl"
              className="bg-on-primary text-primary-container rounded-xl font-black text-lg md:text-2xl hover:scale-105 active:scale-95 neon-glow w-full sm:w-auto"
              asChild>
              <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
                FOLLOW ON TELEGRAM
              </a>
            </Button>
            <p className="mt-4 md:mt-6 text-sm opacity-70">
              Join 5,000+ members already winning with Elite Predict
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

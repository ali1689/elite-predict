import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PredictionCard from "@/components/PredictionCard";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCard from "@/components/TestimonialCard";
import { heroCards, testimonials } from "@/data/matches";

const STADIUM_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC7mr9iVGiClXRxel-urcHQjdBa7cHDVc6BJzIwwUob8QMRyNz2r_Qn2vuwuZGuHU4eikl26YAE1PY7xLh_qtDipp7k4CXQ8t4TJp0pEwy_zt2h8c8V1masqYth_4uzMBhR2mycPN9FeRevauIhcyGdllXVHsPkvZ0MEbkE2RHhpsNRy4A-8KNqgC_Tb-9TBICJDtQgAHcEIR7Aa57kM026fDgekdshgVvWi6-JuJsurObxcUCRUl2q_CiMuRSpcIObjQQUMgha2A";

const STATS = [
  { value: "5,000+", label: "Active Members"  },
  { value: "87.4%",  label: "ROI Last Month"  },
  { value: "FREE",   label: "Lifetime Access" },
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

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img src={STADIUM_IMG} alt="Football stadium at night"
            className="w-full h-full object-cover opacity-30 grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        </div>
        <div className="relative z-10 max-w-[1280px] mx-auto px-8 w-full py-24">
          <div className="max-w-4xl animate-fade-up">
            <Badge variant="neon" className="mb-6">
              AI-Engine Activated &bull; Now 100% Free
            </Badge>
            <h1 className="text-display-xl font-black text-on-surface mb-8 leading-[1.05]">
              MASTER THE MATCH WITH{" "}
              <span className="text-primary-container">PRO-LEVEL</span> PRECISION
            </h1>
            <p className="text-headline-md font-semibold text-on-surface-variant mb-12 max-w-2xl leading-relaxed">
              Join the world's most accurate AI football prediction engine. Now free for the
              community. Real-time data, expert analytics, and 85%+ win rates.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Button size="lg" variant="primary" className="neon-glow" asChild>
                <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
                  Join Telegram Channel
                </a>
              </Button>
              <Button size="lg" variant="ghost" asChild>
                <Link to="/predictions">Access Free Predictions</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="bg-surface-container-low border-y border-white/5 py-14">
        <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <div className="font-['Lexend'] text-display-xl font-extrabold text-primary-container mb-2 leading-none">
                {value}
              </div>
              <div className="font-['Lexend'] text-[12px] text-on-surface-variant uppercase tracking-widest">
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PREDICTION FEED */}
      <section className="py-32 max-w-[1280px] mx-auto px-8">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="text-headline-lg font-bold text-on-surface mb-4">
              Upcoming High-Confidence Predictions
            </h2>
            <p className="text-on-surface-variant max-w-xl">
              Our neural networks have flagged these matches with extreme probability scoring.
              Join our Telegram for full breakdowns.
            </p>
          </div>
          <div className="hidden md:flex gap-3">
            {["chevron_left", "chevron_right"].map((icon) => (
              <button key={icon} aria-label={icon}
                className="p-3 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
                <span className="material-symbols-outlined text-on-surface">{icon}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {heroCards.map((card) => (
            <PredictionCard key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="bg-surface-container py-32">
        <div className="max-w-[1280px] mx-auto px-8">
          <div className="text-center mb-20 max-w-2xl mx-auto">
            <h2 className="text-headline-lg font-bold text-on-surface mb-6">
              Unrivaled AI Precision, Free Forever
            </h2>
            <p className="text-on-surface-variant">
              We've opened our vault. Our proprietary algorithms process historical trends and
              real-time news to deliver surgical precision directly to your phone.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {FEATURES.map(({ icon, title, description }) => (
              <FeatureCard key={icon} icon={icon} title={title} description={description} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-32 max-w-[1280px] mx-auto px-8">
        <h2 className="text-headline-lg font-bold text-on-surface mb-16 text-center">
          Success Stories from Our Channel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>
      </section>

      {/* COMMUNITY CTA */}
      <section className="py-32 bg-zinc-950">
        <div className="max-w-[1280px] mx-auto px-8 text-center">
          <div className="max-w-4xl mx-auto p-12 rounded-3xl bg-primary-container text-on-primary shadow-2xl shadow-primary-container/20">
            <span className="inline-block bg-on-primary text-primary-container text-[10px] font-bold uppercase tracking-[0.15em] py-1 px-4 rounded-full mb-6">
              100% Free Lifetime Access
            </span>
            <h2 className="text-display-xl font-black mb-6 text-on-primary leading-tight">
              JOIN OUR FREE COMMUNITY
            </h2>
            <p className="text-headline-md font-semibold mb-10 opacity-90 max-w-xl mx-auto leading-relaxed">
              Get instant access to our Elite AI engine and Pro-level predictions. No
              subscriptions, no hidden fees. Just winning insights.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-12 max-w-lg mx-auto">
              {COMMUNITY_PERKS.map((col, ci) => (
                <ul key={ci} className="space-y-3">
                  {col.map((perk) => (
                    <li key={perk} className="flex items-center gap-3 font-semibold text-on-primary">
                      <span className="material-symbols-outlined text-on-primary text-xl">check_circle</span>
                      {perk}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <Button size="xl"
              className="bg-on-primary text-primary-container rounded-xl font-black text-2xl hover:scale-105 active:scale-95 neon-glow"
              asChild>
              <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
                FOLLOW ON TELEGRAM
              </a>
            </Button>
            <p className="mt-6 text-sm opacity-70">
              Join 5,000+ members already winning with Elite Predict
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

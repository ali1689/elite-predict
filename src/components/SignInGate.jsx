import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Reusable "Members Only — sign in to unlock" gate, matching the Today / Upcoming
// pages. Two accents: "green" (default brand) and "amber" (risky/value pages).
const ACCENTS = {
  green: {
    bar:        "bg-primary-container",
    text:       "text-primary-container",
    border:     "border-primary-container/25",
    iconBorder: "border-primary-container/40",
    iconBg:     "bg-primary-container/10",
    glow:       "shadow-[0_0_60px_rgba(57,255,20,0.08)]",
    iconGlow:   "shadow-[0_0_30px_rgba(57,255,20,0.2)]",
    radial:     "radial-gradient(ellipse at 50% 0%, rgba(57,255,20,0.05), transparent 60%)",
    drop:       "drop-shadow-[0_0_20px_rgba(57,255,20,0.5)]",
    btn:        "bg-primary-container text-on-primary shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:shadow-[0_0_50px_rgba(57,255,20,0.8)]",
    btnOutline: "border-primary-container/40 text-primary-container hover:bg-primary-container/10 hover:border-primary-container/70",
  },
  amber: {
    bar:        "bg-amber-400",
    text:       "text-amber-400",
    border:     "border-amber-400/25",
    iconBorder: "border-amber-400/40",
    iconBg:     "bg-amber-400/10",
    glow:       "shadow-[0_0_60px_rgba(251,191,36,0.08)]",
    iconGlow:   "shadow-[0_0_30px_rgba(251,191,36,0.2)]",
    radial:     "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.05), transparent 60%)",
    drop:       "drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]",
    btn:        "bg-amber-400 text-zinc-950 shadow-[0_0_30px_rgba(251,191,36,0.5)] hover:shadow-[0_0_50px_rgba(251,191,36,0.8)]",
    btnOutline: "border-amber-400/40 text-amber-400 hover:bg-amber-400/10 hover:border-amber-400/70",
  },
};

export default function SignInGate({
  accent = "green",
  eyebrow,
  title,
  lockedLabel = "This page",
  description = "Create a free account to unlock the full experience — confidence ratings, models, and daily AI picks.",
  icon = "lock",
  secondaryTo = "/open",
  secondaryLabel = "Get Free Pack",
  secondaryIcon = "style",
  compact = false,
}) {
  const a = ACCENTS[accent] ?? ACCENTS.green;

  return (
    <>
      {(eyebrow || title) && (
        <section className="mb-8 md:mb-10 animate-fade-up">
          {eyebrow && (
            <div className="flex items-center gap-3 mb-3">
              <span className={cn("w-1.5 h-6 rounded-full inline-block", a.bar)} />
              <span className={cn("font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest", a.text)}>
                {eyebrow}
              </span>
            </div>
          )}
          {title && (
            <h1 className="text-[2.25rem] sm:text-5xl md:text-display-xl font-black text-on-surface leading-tight tracking-tight md:tracking-[-0.04em]">
              {title}
            </h1>
          )}
        </section>
      )}

      <div className={cn(
        "relative rounded-2xl overflow-hidden flex flex-col items-center justify-center gap-6 px-6 text-center bg-surface-container border-2",
        compact ? "py-10 md:py-12 gap-5" : "py-16 md:py-20",
        a.border, a.glow,
      )}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: a.radial }} />
        <div className="absolute inset-0 opacity-15 pointer-events-none"
          style={{ background: "repeating-linear-gradient(45deg,transparent,transparent 12px,rgba(127,127,127,0.015) 12px,rgba(127,127,127,0.015) 24px)" }} />

        {/* Lock icon */}
        <div className={cn("relative rounded-2xl border-2 flex items-center justify-center z-10", compact ? "w-16 h-16" : "w-20 h-20", a.iconBorder, a.iconBg, a.iconGlow)}>
          <span className={cn("material-symbols-outlined", compact ? "text-3xl" : "text-4xl", a.text)}>{icon}</span>
        </div>

        {/* Text */}
        <div className="relative z-10">
          <div className={cn("font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest mb-2", a.text)}>
            Members Only
          </div>
          <h3 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">
            {lockedLabel} locked<br />
            <span className={cn(a.text, a.drop)}>sign in to unlock</span>
          </h3>
          <p className="text-zinc-400 font-['Lexend'] text-sm max-w-sm mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-3">
          <Link to="/login"
            className={cn("flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200", a.btn)}>
            <span className="material-symbols-outlined text-[18px]">login</span>
            Sign In
          </Link>
          <Link to={secondaryTo}
            className={cn("flex items-center gap-2 px-7 py-3.5 rounded-xl border-2 font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all duration-200", a.btnOutline)}>
            <span className="material-symbols-outlined text-[18px]">{secondaryIcon}</span>
            {secondaryLabel}
          </Link>
        </div>

        <p className="relative z-10 font-['Lexend'] text-[10px] text-zinc-600 uppercase tracking-widest">
          Free daily pack · full access for members
        </p>
      </div>
    </>
  );
}

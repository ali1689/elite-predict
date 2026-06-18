import { useState } from "react";
import { cn } from "@/lib/utils";

// ── HowToRead ─────────────────────────────────────────────────────────────────
// A friendly, collapsible "how to read this page" panel for first-time visitors.
// Open by default; the collapse choice is remembered per page in localStorage.
// Fully additive — delete this file + its usages to roll back.
//
//   <HowToRead storageKey="howto_today" title="How to read these picks"
//              intro="…" steps={["…", "…"]} />
export default function HowToRead({ storageKey = "howto", title = "How to read this", intro, steps = [] }) {
  const [open, setOpen] = useState(() => {
    try { return localStorage.getItem(storageKey) !== "collapsed"; } catch { return true; }
  });

  const toggle = () =>
    setOpen((o) => {
      const next = !o;
      try { localStorage.setItem(storageKey, next ? "open" : "collapsed"); } catch {}
      return next;
    });

  return (
    <div className="glass-card rounded-xl border border-primary-container/20 overflow-hidden">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary-container text-[18px]">help</span>
          <span className="font-['Lexend'] text-[11px] font-bold uppercase tracking-widest text-on-surface truncate">
            {title}
          </span>
        </span>
        <span className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-['Lexend'] text-[9px] uppercase tracking-widest text-on-surface-variant hidden sm:inline">
            {open ? "Hide" : "Show"}
          </span>
          <span className={cn("material-symbols-outlined text-on-surface-variant text-[20px] transition-transform duration-300", open && "rotate-180")}>
            expand_more
          </span>
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 animate-fade-up">
          {intro && <p className="text-on-surface-variant text-sm mb-3 leading-relaxed">{intro}</p>}
          <ol className="space-y-2.5">
            {steps.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 mt-0.5 w-5 h-5 rounded-full bg-primary-container/15 text-primary-container font-['Lexend'] text-[10px] font-bold flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <span className="text-on-surface-variant text-sm leading-snug">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

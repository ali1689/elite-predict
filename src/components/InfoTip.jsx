import { useState, useId } from "react";
import { cn } from "@/lib/utils";
import { term as lookupTerm } from "@/data/glossary";

// ── InfoTip ───────────────────────────────────────────────────────────────────
// Accessible hover/tap tooltip for explaining betting terms.
// Usage:
//   <InfoTip termKey="BTTS" />                     ← looks up the glossary
//   <InfoTip title="Custom" text="Explanation." /> ← custom content
//
// Renders a small ⓘ trigger; the bubble shows on hover, focus, or tap.
// Fully additive — remove the import + usages to roll back.
export default function InfoTip({ termKey, title, text, side = "top", className }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  const entry = termKey ? lookupTerm(termKey) : null;
  const ttl = title ?? entry?.title ?? termKey;
  const body = text ?? entry?.desc ?? "";
  if (!ttl && !body) return null;

  return (
    <span
      className={cn("relative inline-flex items-center align-middle", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={ttl ? `What is ${ttl}` : "More info"}
        aria-describedby={open ? id : undefined}
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center justify-center text-on-surface-variant hover:text-primary-container transition-colors focus:outline-none"
      >
        <span className="material-symbols-outlined text-[13px] leading-none">info</span>
      </button>

      {open && (
        <span
          id={id}
          role="tooltip"
          className={cn(
            "absolute z-50 w-44 p-2.5 rounded-lg text-left pointer-events-none",
            "bg-inverse-surface text-inverse-on-surface shadow-xl border border-white/10",
            "font-['Lexend'] text-[10px] leading-snug font-medium normal-case tracking-normal",
            "left-1/2 -translate-x-1/2",
            side === "bottom" ? "top-full mt-2" : "bottom-full mb-2"
          )}
        >
          {ttl && <span className="block font-bold text-primary-container mb-0.5 normal-case">{ttl}</span>}
          {body}
        </span>
      )}
    </span>
  );
}

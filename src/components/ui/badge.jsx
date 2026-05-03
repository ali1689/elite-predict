import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 font-['Lexend'] text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
  {
    variants: {
      variant: {
        neon:    "bg-primary-container/10 border border-primary-container/25 text-primary-container rounded-full px-3 py-1",
        solid:   "bg-primary-container text-on-primary rounded-full px-3 py-1",
        blue:    "bg-blue-500/15 text-blue-400 rounded px-2 py-1",
        red:     "bg-red-500/15 text-red-400 rounded px-2 py-1",
        neutral: "bg-white/5 border border-white/10 text-on-surface-variant rounded px-2 py-1",
        ghost:   "text-on-surface-variant rounded px-2 py-1",
      },
    },
    defaultVariants: { variant: "neon" },
  }
);

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

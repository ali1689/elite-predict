import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // base
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-container focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-primary-container text-on-primary rounded-xl neon-glow hover:scale-[1.03] active:scale-[0.97]",
        ghost:
          "bg-white/5 border border-white/10 text-on-surface rounded-xl backdrop-blur-md hover:bg-white/10 active:scale-[0.97]",
        outline:
          "border border-white/10 text-on-surface rounded-lg bg-transparent hover:border-primary-container/60 hover:text-primary-container active:scale-[0.97]",
        icon:
          "rounded-full border border-white/10 bg-transparent text-on-surface hover:bg-white/5 active:scale-95",
        destructive:
          "bg-error-container text-on-error rounded-lg hover:opacity-90 active:scale-[0.97]",
      },
      size: {
        sm:      "h-8  px-4 text-xs",
        default: "h-10 px-6 text-sm",
        lg:      "h-14 px-10 text-lg",
        xl:      "h-16 px-14 text-xl",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size:    "default",
    },
  }
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

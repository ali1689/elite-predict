import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Floating "back to top" arrow that fades in once you've scrolled down.
export default function ScrollToTop({ threshold = 400 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={cn(
        "fixed bottom-8 right-6 z-50 w-11 h-11 rounded-2xl",
        "bg-primary-container text-on-primary shadow-lg",
        "flex items-center justify-center transition-all duration-150",
        "hover:scale-110 hover:shadow-[0_0_24px_rgba(57,255,20,0.45)] active:scale-95",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
      )}
    >
      <span className="material-symbols-outlined text-[22px]">arrow_upward</span>
    </button>
  );
}

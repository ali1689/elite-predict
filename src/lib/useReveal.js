import { useEffect, useRef, useState } from "react";

// ── useReveal ─────────────────────────────────────────────────────────────────
// Returns a ref + boolean that flips to true the first time the element scrolls
// into view. Pair with the `.reveal` / `.reveal-in` utilities (see index.css) to
// fade + lift content as the user scrolls. Respects prefers-reduced-motion
// (reveals immediately so nothing is ever hidden for those users).
//
//   const [ref, shown] = useReveal();
//   <div ref={ref} className={`reveal ${shown ? "reveal-in" : ""}`}>…</div>
//
export function useReveal({ threshold = 0.15, rootMargin = "0px 0px -10% 0px", once = true } = {}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            if (once) obs.unobserve(entry.target);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, shown];
}

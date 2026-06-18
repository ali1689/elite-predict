import { useEffect, useRef, useState } from "react";

// ── useCountUp ────────────────────────────────────────────────────────────────
// Animates a number from 0 → target on mount (and whenever target changes).
// Returns a formatted string/number ready to render.
//   const conf = useCountUp(83);            → "0"… "83"
//   const xg   = useCountUp(3.19, { decimals: 2 });
// Respects prefers-reduced-motion (snaps straight to the value).
export function useCountUp(target, { duration = 900, decimals = 0 } = {}) {
  const to = Number(target) || 0;
  const [val, setVal] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setVal(to); return; }

    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      setVal(to * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [to, duration]);

  return decimals > 0 ? val.toFixed(decimals) : Math.round(val);
}

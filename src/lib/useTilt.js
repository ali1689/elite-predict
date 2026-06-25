import { useRef, useCallback } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/**
 * Pointer-tracking 3D tilt + spotlight position.
 * Spread the returned props on a card root (which must be `position: relative`).
 * It also writes CSS vars --mx / --my (0–100%) so a child glow layer can follow
 * the cursor. Subtle by design and disabled when the user prefers reduced motion.
 */
export function useTilt({ max = 5, scale = 1.02 } = {}) {
  const ref = useRef(null);

  const onMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const r  = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;   // 0..1
    const py = (e.clientY - r.top)  / r.height;  // 0..1
    // Always update the spotlight position (a soft glow following the cursor is
    // not vestibular motion) so it works even under reduced-motion.
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    if (prefersReducedMotion()) return;          // skip the 3D tilt only
    const rx = (0.5 - py) * max * 2;             // rotateX
    const ry = (px - 0.5) * max * 2;             // rotateY
    el.style.transition = "transform 0.08s ease-out";
    el.style.transform =
      `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale(${scale})`;
  }, [max, scale]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
    el.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)";
  }, []);

  return {
    ref,
    onMouseMove,
    onMouseLeave,
    style: { transformStyle: "preserve-3d", willChange: "transform" },
  };
}

/**
 * Moves a child "orb" element toward the cursor inside a container.
 * Attach `ref` to the container and `orbRef` to the absolutely-positioned orb.
 */
export function usePointerGlow() {
  const ref    = useRef(null);
  const orbRef = useRef(null);

  const onMouseMove = useCallback((e) => {
    const wrap = ref.current;
    const orb  = orbRef.current;
    if (!wrap || !orb || prefersReducedMotion()) return;
    const r = wrap.getBoundingClientRect();
    orb.style.opacity   = "1";
    orb.style.transform = `translate3d(${e.clientX - r.left}px, ${e.clientY - r.top}px, 0) translate(-50%, -50%)`;
  }, []);

  const onMouseLeave = useCallback(() => {
    if (orbRef.current) orbRef.current.style.opacity = "0";
  }, []);

  return { ref, orbRef, onMouseMove, onMouseLeave };
}

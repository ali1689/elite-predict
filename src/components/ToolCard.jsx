import { Link } from "react-router-dom";

// ── ToolCard ──────────────────────────────────────────────────────────────────
// Interactive showcase tile used on the home page to surface each tool/page.
// Tracks the cursor to drive a neon sheen (see .ep-tool-card in index.css) and
// animates its icon + arrow on hover. Renders as a router <Link> (internal) or a
// plain <a> when `href` is provided (e.g. Telegram).
export default function ToolCard({
  to,
  href,
  icon,
  title,
  description,
  badge,
  live = false,
}) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  const inner = (
    <>
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="ep-tool-icon w-14 h-14 rounded-xl bg-primary-container/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary-container text-[30px]">
            {icon}
          </span>
        </div>
        {(badge || live) && (
          <span
            className={[
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.14em]",
              live
                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                : "bg-primary-container/15 text-primary-container border border-primary-container/30",
            ].join(" ")}
          >
            {live && <span className="ep-live-dot" />}
            {live ? "Live" : badge}
          </span>
        )}
      </div>

      <h3 className="relative z-10 font-['Lexend'] text-lg md:text-xl font-bold text-on-surface mb-2 leading-snug">
        {title}
      </h3>
      <p className="relative z-10 text-on-surface-variant text-sm leading-relaxed">
        {description}
      </p>

      <div className="relative z-10 mt-6 flex items-center gap-1.5 text-primary-container font-['Lexend'] text-[11px] font-bold uppercase tracking-widest">
        <span>Explore</span>
        <span className="ep-tool-arrow material-symbols-outlined text-[18px]">
          arrow_forward
        </span>
      </div>
    </>
  );

  const cls =
    "ep-tool-card group block p-6 md:p-7 rounded-2xl h-full focus:outline-none";

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
        onMouseMove={onMove}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link to={to} className={cls} onMouseMove={onMove}>
      {inner}
    </Link>
  );
}

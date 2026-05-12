import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Today's Predictions",  to: "/today",       icon: "today"          },
  { label: "Upcoming Predictions", to: "/predictions", icon: "calendar_month" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-zinc-950/90 backdrop-blur-md border-b border-white/5">
        <nav className="max-w-[1280px] mx-auto px-4 sm:px-8 flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" onClick={() => setMenuOpen(false)}
            className="text-xl md:text-2xl font-black italic text-primary-container tracking-tighter select-none">
            ELITE PREDICT
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map(({ label, to }) => (
              <NavLink key={label} to={to}
                className={({ isActive }) =>
                  [
                    "font-['Lexend'] uppercase tracking-widest font-semibold text-[11px] transition-colors",
                    isActive
                      ? "text-primary-container border-b-2 border-primary-container pb-0.5"
                      : "text-zinc-400 hover:text-zinc-100",
                  ].join(" ")
                }>
                {label}
              </NavLink>
            ))}
          </div>

          {/* Desktop right actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="font-['Lexend'] text-[11px] text-on-surface-variant">
                  {user.name || user.email}
                </span>
                <button onClick={logout} title="Sign out"
                  className="material-symbols-outlined text-on-surface-variant hover:text-on-surface hover:bg-white/5 p-2 rounded-lg transition-all text-[22px]">
                  logout
                </button>
              </div>
            ) : (
              <Link to="/login"
                className="font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                Sign In
              </Link>
            )}
            <Button size="default" variant="primary" className="rounded-lg text-xs tracking-wide" asChild>
              <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer">
                Join Telegram
              </a>
            </Button>
          </div>

          {/* Mobile: Telegram pill + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-primary-container text-on-primary px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-tight neon-glow">
              <span className="material-symbols-outlined text-[14px]">send</span>
              Telegram
            </a>
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
              className="p-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="material-symbols-outlined text-on-surface text-[24px]">
                {menuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Panel */}
          <nav
            className="absolute top-16 left-0 right-0 bg-zinc-950 border-b border-white/10 shadow-2xl"
            onClick={e => e.stopPropagation()}>
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map(({ label, to, icon }) => (
                <NavLink key={label} to={to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl font-['Lexend'] uppercase tracking-widest font-semibold text-[12px] transition-all",
                      isActive
                        ? "text-primary-container bg-primary-container/10 border border-primary-container/20"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-white/5",
                    ].join(" ")
                  }>
                  <span className="material-symbols-outlined text-[18px]">{icon}</span>
                  {label}
                </NavLink>
              ))}
            </div>

            {/* Bottom actions */}
            <div className="px-4 py-4 border-t border-white/5 space-y-3">
              {user ? (
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="font-['Lexend'] text-[11px] text-on-surface-variant truncate max-w-[180px]">
                    {user.name || user.email}
                  </span>
                  <button
                    onClick={() => { logout(); setMenuOpen(false); }}
                    className="flex items-center gap-1.5 text-on-surface-variant hover:text-on-surface text-[11px] font-['Lexend'] uppercase tracking-widest transition-colors">
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    Sign Out
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-['Lexend'] uppercase tracking-widest font-semibold text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all">
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

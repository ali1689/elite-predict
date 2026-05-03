import { NavLink, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Today's Predictions",  to: "/today"       },
  { label: "Upcoming Predictions", to: "/predictions" },
];

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
      <nav className="max-w-[1280px] mx-auto px-8 flex justify-between items-center h-20">
        <Link to="/" className="text-2xl font-black italic text-primary-container tracking-tighter select-none">
          ELITE PREDICT
        </Link>

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

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:block font-['Lexend'] text-[11px] text-on-surface-variant">
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
      </nav>
    </header>
  );
}

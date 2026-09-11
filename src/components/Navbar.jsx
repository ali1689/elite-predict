import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "@/App";
import { useAuth } from "@/context/AuthContext";
import { useSaved } from "@/context/SavedContext";
import { Icon } from "@/components/V2";
const links = [
  ["Home", "/"],
  ["Matchday", "/today"],
  ["Upcoming", "/predictions"],
  ["Track record", "/track-record"],
  ["Daily pack", "/open"],
];
export default function Navbar() {
  const { theme, toggle } = useTheme(),
    { user, logout } = useAuth(),
    { saved } = useSaved();
  const [open, setOpen] = useState(false),
    menuButton = useRef(null),
    { pathname } = useLocation();
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  useEffect(() => {
    const escape = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <>
      <a className="v2-skip" href="#main-content">
        Skip to content
      </a>
      <header className="v2-navbar">
        <div className="v2-navbar-inner">
          <Link to="/" className="v2-logo" aria-label="ElitePredict home">
            <span className="v2-logomark">
              <Icon>center_focus_strong</Icon>
            </span>
            elitepredict<span className="v2-logo-dot">.</span>
          </Link>
          <nav className="v2-desktop-nav" aria-label="Main navigation">
            {links.map(([label, to]) => (
              <NavLink key={to} to={to} end={to === "/"}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="v2-nav-actions">
            <Link
              to="/saved"
              className="v2-saved-nav"
              aria-label={`Saved matches (${saved.length})`}
            >
              <Icon>bookmark</Icon>
              <span>{saved.length}</span>
            </Link>
            <button
              className="v2-icon-button"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} appearance`}
            >
              <Icon>{theme === "dark" ? "light_mode" : "dark_mode"}</Icon>
            </button>
            {user ? (
              <button
                className="v2-desktop-auth v2-button secondary"
                onClick={logout}
              >
                Sign out
              </button>
            ) : (
              <Link className="v2-desktop-auth v2-button" to="/login">
                Sign in <Icon>arrow_forward</Icon>
              </Link>
            )}
            <button
              ref={menuButton}
              className="v2-menu-button v2-icon-button"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="v2-mobile-menu"
              onClick={() => setOpen((v) => !v)}
            >
              <Icon>{open ? "close" : "menu"}</Icon>
            </button>
          </div>
        </div>
        <nav
          className="v2-mobile-nav"
          id="v2-mobile-menu"
          hidden={!open}
          aria-label="Mobile navigation"
        >
          {links.map(([label, to]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
              <Icon>arrow_forward</Icon>
            </NavLink>
          ))}
          <NavLink to="/saved">
            Saved matches <span>{saved.length}</span>
          </NavLink>
          {user ? (
            <button
              onClick={() => {
                logout();
                setOpen(false);
              }}
            >
              Sign out
            </button>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      </header>
    </>
  );
}

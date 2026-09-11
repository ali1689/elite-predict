import { useState, useEffect, createContext, useContext } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
} from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Predictions from "./pages/Predictions";
import Today from "./pages/Today";
import Login from "./pages/Login";
// Players (Goalscorers) retired 2026-08-24 — see the /players redirect below.
// The page file is left on disk so it can be restored if a player-stats source
// is ever reconnected.
import Open from "./pages/Open";
import Saved from "./pages/Saved";
import Guide from "./pages/Guide";
import { SavedProvider } from "./context/SavedContext";
import TrackRecord from "./pages/TrackRecord";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ── Theme context ──────────────────────────────────────────────────────────
export const ThemeContext = createContext({ theme: "light", toggle: () => {} });
export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("ep_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("ep_theme", theme);
    } catch {}
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ── Protected route — redirects to /login if not authenticated ────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null; // wait for session check before deciding
  return user ? children : <Navigate to="/login" replace />;
}

function RouteEffects() {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();
  useEffect(() => {
    const titles = {
      "/": "Football intelligence",
      "/today": "Matchday",
      "/predictions": "Upcoming matches",
      "/track-record": "Track record",
      "/open": "Daily pack",
      "/saved": "Saved matches",
      "/guide": "How it works",
      "/login": "Your account",
    };
    document.title = `${titles[pathname] || "Page not found"} | ElitePredict`;
    if (navigationType !== "POP")
      window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname, navigationType]);
  return null;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SavedProvider>
          <RouteEffects />
          <div className="v2-app">
            <Navbar />
            <div id="main-content" className="v2-app-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/today" element={<Today />} />
                <Route path="/predictions" element={<Predictions />} />
                {/* Goalscorers retired 2026-08-24 — no player data source on the
                  football-data.org free tier. Redirect so old links/bookmarks
                  land somewhere useful instead of a 404. */}
                <Route
                  path="/players"
                  element={<Navigate to="/today" replace />}
                />
                <Route path="/open" element={<Open />} />
                <Route
                  path="/live"
                  element={<Navigate to="/today" replace />}
                />
                <Route path="/saved" element={<Saved />} />
                <Route path="/guide" element={<Guide />} />
                {/* Risky picks folded into Today — keep old links working */}
                <Route
                  path="/risky"
                  element={<Navigate to="/today" replace />}
                />
                <Route path="/track-record" element={<TrackRecord />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/login" element={<Login />} />
              </Routes>
            </div>
            <Footer />
            <Analytics />
            <SpeedInsights />
          </div>
        </SavedProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

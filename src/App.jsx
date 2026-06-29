import { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Predictions from "./pages/Predictions";
import Today from "./pages/Today";
import Login from "./pages/Login";
import Players from "./pages/Players";
import Open from "./pages/Open";
import Live from "./pages/Live";
import TrackRecord from "./pages/TrackRecord";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ── Theme context ──────────────────────────────────────────────────────────
export const ThemeContext = createContext({ theme: "light", toggle: () => {} });
export function useTheme() { return useContext(ThemeContext); }

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("ep_theme") || "light"; } catch { return "light"; }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try { localStorage.setItem("ep_theme", theme); } catch {}
  }, [theme]);

  const toggle = () => setTheme(t => t === "dark" ? "light" : "dark");

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

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/"            element={<Home />} />
              <Route path="/today"       element={<Today />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/players"     element={<Players />} />
              <Route path="/open"        element={<Open />} />
              <Route path="/live"        element={<Live />} />
              {/* Risky picks folded into Today — keep old links working */}
              <Route path="/risky"       element={<Navigate to="/today" replace />} />
              <Route path="/track-record" element={<TrackRecord />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/login"       element={<Login />} />
            </Routes>
          </main>
          <Footer />
          <Analytics />
          <SpeedInsights />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

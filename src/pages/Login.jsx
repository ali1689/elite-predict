import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-on-surface">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
  );
}

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]           = useState("login"); // "login" | "register"
  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPwd, setShowPwd]     = useState(false);
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/today");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-10 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="material-symbols-outlined text-primary-container text-4xl">bolt</span>
            <span className="font-black text-xl text-on-surface uppercase tracking-tight">
              Elite<span className="text-primary-container">Predict</span>
            </span>
          </Link>
          <p className="text-on-surface-variant text-sm mt-3">
            {mode === "login" ? "Sign in to access your predictions" : "Create your free account"}
          </p>
        </div>

        {/* Glass card */}
        <div className="glass-card rounded-2xl p-8 border border-white/10">
          {/* Tab toggle */}
          <div className="flex gap-1 bg-black/30 rounded-lg p-1 mb-8">
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                className={cn(
                  "flex-1 py-2 rounded-md font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest transition-all",
                  mode === m ? "bg-primary-container text-on-primary" : "text-on-surface-variant hover:text-on-surface"
                )}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                  Full Name
                </label>
                <div className="flex items-center bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 gap-3 focus-within:border-primary-container/50 transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">person</span>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none w-full"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                Email Address
              </label>
              <div className="flex items-center bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 gap-3 focus-within:border-primary-container/50 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">mail</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none w-full"
                />
              </div>
            </div>

            <div>
              <label className="block font-['Lexend'] text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
                Password
              </label>
              <div className="flex items-center bg-surface-container-high border border-white/5 rounded-lg px-4 py-3 gap-3 focus-within:border-primary-container/50 transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">lock</span>
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="bg-transparent text-on-surface placeholder-on-surface-variant text-sm outline-none w-full"
                />
                <button type="button" onClick={() => setShowPwd(v => !v)}
                  className="text-on-surface-variant hover:text-on-surface transition-colors">
                  <span className="material-symbols-outlined text-[18px]">{showPwd ? "visibility_off" : "visibility"}</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <span className="material-symbols-outlined text-red-400 text-[16px]">error</span>
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <Button type="submit" variant="primary" size="lg" disabled={loading}
              className="w-full neon-glow font-black uppercase tracking-tight mt-2">
              {loading
                ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" /> Processing...</span>
                : mode === "login" ? "Sign In" : "Create Account"
              }
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-['Lexend'] text-[10px] text-on-surface-variant uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-surface-container-high border border-white/10 hover:border-white/20 rounded-lg px-4 py-3 transition-all group">
              <GoogleIcon />
              <span className="font-['Lexend'] text-[11px] font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-surface-container-high border border-white/10 hover:border-white/20 rounded-lg px-4 py-3 transition-all group">
              <AppleIcon />
              <span className="font-['Lexend'] text-[11px] font-semibold text-on-surface-variant group-hover:text-on-surface transition-colors">Apple</span>
            </button>
          </div>

          {/* Telegram promo */}
          <div className="mt-6 p-4 bg-primary-container/5 border border-primary-container/20 rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-primary-container text-[22px]">send</span>
            <div>
              <div className="font-['Lexend'] text-[10px] font-semibold uppercase tracking-widest text-primary-container mb-0.5">Free Telegram Channel</div>
              <a href="https://t.me/SmartBet_Signals" target="_blank" rel="noopener noreferrer"
                className="text-on-surface-variant text-xs hover:text-primary-container transition-colors">
                Join 50k+ bettors → t.me/SmartBet_Signals
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-on-surface-variant text-xs mt-6">
          © 2025 ElitePredict · <Link to="/" className="hover:text-on-surface transition-colors">Home</Link>
        </p>
      </div>
    </div>
  );
}

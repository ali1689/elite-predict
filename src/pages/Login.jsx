import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Icon } from "@/components/V2";
export default function Login() {
  const { login, register, loginWithProvider } = useAuth(),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const [mode, setMode] = useState(
      params.get("mode") === "register" ? "register" : "login",
    ),
    [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [password, setPassword] = useState(""),
    [show, setShow] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const candidate = params.get("next");
  const next =
    candidate && /^\/(?!\/)/.test(candidate) && !candidate.includes("\\")
      ? candidate
      : "/today";
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setMode("update");
        setMessage("Choose a new password for your account.");
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);
  function change(value) {
    setMode(value);
    setError("");
    setMessage("");
    setPassword("");
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      if (mode === "reset") {
        const { error: err } = await supabase.auth.resetPasswordForEmail(
          email,
          { redirectTo: `${window.location.origin}/login` },
        );
        if (err) throw err;
        setMessage(
          "If an account exists for this email, a password reset link will arrive shortly.",
        );
      } else if (mode === "update") {
        const { error: err } = await supabase.auth.updateUser({ password });
        if (err) throw err;
        setMessage("Your password has been updated.");
        setMode("login");
        setPassword("");
      } else if (mode === "register") {
        const result = await register(name, email, password);
        if (result?.needsConfirmation) {
          setMessage("Check your email to confirm your account, then sign in.");
          setMode("login");
          setPassword("");
        } else navigate(next);
      } else {
        await login(email, password);
        navigate(next);
      }
    } catch (err) {
      setError(err.message || "Unable to continue. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setError("");
    setBusy(true);
    try {
      await loginWithProvider("google", next);
    } catch (err) {
      setError(
        err.message || "Google sign-in is unavailable. Please try email.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="v2-page v2-auth">
      <section className="v2-auth-story">
        <p className="v2-eyebrow">Your next match starts here</p>
        <h2>Football predictions.<br /><em>Your matchday.</em></h2>
        <p>
          Open your daily pack, explore the model’s predictions, and keep your
          favourite fixtures together.
        </p>
        <div className="v2-auth-benefit">
          <Icon>style</Icon>
          <div>
            <strong>Your daily selection</strong>
            <span>Fresh predictions in one place.</span>
          </div>
        </div>
        <div className="v2-auth-benefit">
          <Icon>bookmark</Icon>
          <div>
            <strong>Follow what matters</strong>
            <span>Your fixture watchlist, saved on this browser.</span>
          </div>
        </div>
        <div className="v2-auth-benefit">
          <Icon>analytics</Icon>
          <div>
            <strong>Numbers in perspective</strong>
            <span>Market probabilities and historical outcomes.</span>
          </div>
        </div>
        <Link className="v2-text-link" to="/guide">
          How ElitePredict works <Icon>arrow_forward</Icon>
        </Link>
      </section>
      <section className="v2-auth-form">
        <p className="v2-eyebrow">ElitePredict account</p>
        <h1>
          {mode === "register"
            ? "Create your account."
            : mode === "reset"
              ? "Reset your password."
              : mode === "update"
                ? "Choose a new password."
                : "Sign in to ElitePredicts"}
        </h1>
        {["login", "register"].includes(mode) && (
          <div className="v2-tabs">
            <button
              disabled={busy}
              onClick={() => change("login")}
              aria-pressed={mode === "login"}
            >
              Sign in
            </button>
            <button
              disabled={busy}
              onClick={() => change("register")}
              aria-pressed={mode === "register"}
            >
              Create account
            </button>
          </div>
        )}
        <form onSubmit={submit}>
          {mode === "register" && (
            <label htmlFor="account-name">
              Name
              <input
                id="account-name"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
              />
            </label>
          )}
          {mode !== "update" && (
            <label htmlFor="account-email">
              Email address
              <input
                id="account-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
          )}
          {mode !== "reset" && (
            <label htmlFor="account-password">
              Password
              <div className="v2-password">
                <input
                  id="account-password"
                  type={show ? "text" : "password"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder={
                    mode === "login" ? "Your password" : "At least 6 characters"
                  }
                />
                <button
                  type="button"
                  className="v2-icon-button"
                  aria-label={show ? "Hide password" : "Show password"}
                  onClick={() => setShow((v) => !v)}
                >
                  <Icon>{show ? "visibility_off" : "visibility"}</Icon>
                </button>
              </div>
            </label>
          )}
          {mode === "login" && (
            <button
              type="button"
              className="v2-text-link"
              onClick={() => change("reset")}
            >
              Forgot password?
            </button>
          )}
          {error && (
            <p role="alert" className="v2-form-error">
              {error}
            </p>
          )}
          {message && (
            <p role="status" className="v2-form-message">
              {message}
            </p>
          )}
          <button className="v2-button" type="submit" disabled={busy}>
            {busy
              ? "Please wait…"
              : mode === "register"
                ? "Create free account"
                : mode === "reset"
                  ? "Send reset link"
                  : mode === "update"
                    ? "Update password"
                    : "Sign in"}
            <Icon>arrow_forward</Icon>
          </button>
        </form>
        {["login", "register"].includes(mode) ? (
          <>
            <div className="v2-or">or</div>
            <button
              className="v2-button secondary"
              onClick={google}
              disabled={busy}
            >
              Continue with Google <Icon>north_east</Icon>
            </button>
          </>
        ) : (
          <button className="v2-text-link" onClick={() => change("login")}>
            Back to sign in
          </button>
        )}
        <p className="v2-fine">
          Your saved fixtures stay on this browser.{" "}
          <Link to="/track-record">Explore the public track record</Link> before
          signing in.
        </p>
      </section>
    </main>
  );
}

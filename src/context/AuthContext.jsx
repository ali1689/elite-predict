import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Load user session on app start
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // 🔐 LOGIN (with retry for Supabase cold-start)
  async function login(email, password) {
    const DELAYS = [2000, 4000, 7000];
    let lastError;
    for (let i = 0; i <= DELAYS.length; i++) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error) { setUser(data.user); return data.user; }
      lastError = error;
      const isNetwork = error.message?.toLowerCase().includes("fetch") || error.status === 0;
      if (!isNetwork || i === DELAYS.length) break;
      await new Promise(r => setTimeout(r, DELAYS[i]));
    }
    const msg = lastError?.message?.toLowerCase().includes("fetch")
      ? "Database is waking up — please try again in a few seconds."
      : lastError.message;
    throw new Error(msg);
  }

  // 🧾 REGISTER
  async function register(name, email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    // save name in profiles table
    if (data.user) {
      await supabase.from("profiles").insert([
        {
          id: data.user.id,
          name: name,
        },
      ]);
    }

    setUser(data.user);
    return data.user;
  }

  // 🔑 OAUTH — Google / Apple
  async function loginWithProvider(provider) {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/today`,
      },
    });
    if (error) throw new Error(error.message);
    // Page will redirect to provider — no return value needed
  }

  // 🚪 LOGOUT
  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, loginWithProvider, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
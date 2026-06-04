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

  // 🔐 LOGIN
  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    setUser(data.user);
    return data.user;
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
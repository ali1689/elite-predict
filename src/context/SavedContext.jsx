import { createContext, useContext, useEffect, useState } from "react";
import { matchKey, savedFixture, readSaved } from "@/lib/presentation";
const SavedContext = createContext(null),
  KEY = "ep_saved_fixtures_v2";
export function SavedProvider({ children }) {
  const [saved, setSaved] = useState(() => {
      try {
        return readSaved(localStorage.getItem(KEY));
      } catch {
        return [];
      }
    }),
    [notice, setNotice] = useState(null);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 6500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const sync = (e) => {
      if (e.key === KEY || e.key === null) setSaved(readSaved(e.newValue));
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  function commit(next, message, removed = null) {
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setSaved(next);
      setNotice({ message, removed });
    } catch {
      setNotice({ message: "Your browser could not save this match. Check that site storage is enabled." });
    }
  }
  function toggle(m) {
    const key = matchKey(m),
      exists = saved.some((x) => x.key === key);
    if (!exists && saved.length >= 300) {
      setNotice({ message: "Your saved list is full. Remove a fixture first." });
      return;
    }
    commit(
      exists ? saved.filter((x) => x.key !== key) : [...saved, savedFixture(m)],
      exists ? "Match removed from Saved." : "Match saved on this browser.",
      exists ? saved.find((x) => x.key === key) : null,
    );
  }
  return (
    <SavedContext.Provider
      value={{
        saved,
        toggle,
        remove: (key) =>
          commit(
            saved.filter((m) => m.key !== key),
            "Match removed from Saved.",
            saved.find((m) => m.key === key),
          ),
        isSaved: (m) => saved.some((x) => x.key === matchKey(m)),
      }}
    >
      {children}
      <div className={notice ? "v2-toast" : "v2-announcement"} role="status" aria-live="polite" aria-atomic="true">
        {notice && <><span>{notice.message}</span>{notice.removed && <button className="v2-undo" type="button" onClick={() => {
          if (saved.some((m) => m.key === notice.removed.key)) { setNotice(null); return; }
          if (saved.length >= 300) { setNotice({ message: "Your saved list is full. Remove a fixture first." }); return; }
          commit([...saved, notice.removed], "Match restored to Saved.");
        }}>Undo</button>}<button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></>}
      </div>
    </SavedContext.Provider>
  );
}
export const useSaved = () => useContext(SavedContext);

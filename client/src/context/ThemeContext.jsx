import { createContext, useContext, useEffect, useState } from "react";

/* ══════════════════════════════════════════════════════
   THEME CONTEXT
   Supports: "light" | "dark" | "system"
   Auto-syncs with OS preference when set to "system"
   Persists to localStorage under key "theme"
══════════════════════════════════════════════════════ */

const ThemeContext = createContext(null);

/* ── Helper: resolve actual theme from preference ── */
const resolveTheme = (preference) => {
  if (preference === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return preference;
};

/* ── CSS Variables applied to :root for global styling ── */
const THEME_VARS = {
  dark: {
    "--bg-primary":       "#020617",
    "--bg-secondary":     "#0f172a",
    "--bg-card":          "rgba(255,255,255,0.03)",
    "--bg-card-hover":    "rgba(255,255,255,0.06)",
    "--border-subtle":    "rgba(255,255,255,0.07)",
    "--border-card":      "rgba(255,255,255,0.08)",
    "--text-primary":     "#f1f5f9",
    "--text-secondary":   "#94a3b8",
    "--text-muted":       "#475569",
    "--text-faint":       "#1e293b",
    "--accent-blue":      "#60a5fa",
    "--accent-green":     "#34d399",
    "--accent-amber":     "#f59e0b",
    "--accent-pink":      "#f472b6",
    "--accent-purple":    "#a78bfa",
    "--accent-orange":    "#fb923c",
    "--sidebar-bg":       "rgba(2,6,23,0.98)",
    "--scrollbar-thumb":  "#1e293b",
  },
  light: {
    "--bg-primary":       "#f8fafc",
    "--bg-secondary":     "#f0f9ff",
    "--bg-card":          "rgba(255,255,255,0.9)",
    "--bg-card-hover":    "rgba(255,255,255,1)",
    "--border-subtle":    "rgba(0,0,0,0.06)",
    "--border-card":      "rgba(0,0,0,0.07)",
    "--text-primary":     "#0f172a",
    "--text-secondary":   "#475569",
    "--text-muted":       "#64748b",
    "--text-faint":       "#cbd5e1",
    "--accent-blue":      "#2563eb",
    "--accent-green":     "#059669",
    "--accent-amber":     "#d97706",
    "--accent-pink":      "#db2777",
    "--accent-purple":    "#7c3aed",
    "--accent-orange":    "#ea580c",
    "--sidebar-bg":       "#ffffff",
    "--scrollbar-thumb":  "#cbd5e1",
  },
};

const applyThemeVars = (resolvedTheme) => {
  const vars = THEME_VARS[resolvedTheme];
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, val]) => root.style.setProperty(key, val));
  root.setAttribute("data-theme", resolvedTheme);
};

/* ══════════════════════════════════════════════════════
   PROVIDER
══════════════════════════════════════════════════════ */
export function ThemeProvider({ children }) {
  /* preference = what user picked: "light" | "dark" | "system" */
  const [preference, setPreference] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  /* resolved = actual applied theme: "light" | "dark" */
  const [resolved, setResolved] = useState(() => resolveTheme(
    localStorage.getItem("theme") || "dark"
  ));

  /* Apply CSS vars whenever resolved theme changes */
  useEffect(() => {
    applyThemeVars(resolved);
  }, [resolved]);

  /* Listen to OS-level changes when preference is "system" */
  useEffect(() => {
    if (preference !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e) => setResolved(e.matches ? "dark" : "light");

    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  /* Public setter — called from Settings page */
  const setTheme = (newPreference) => {
    setPreference(newPreference);
    localStorage.setItem("theme", newPreference);
    setResolved(resolveTheme(newPreference));
  };

  /* Convenience toggle between light ↔ dark */
  const toggleTheme = () => {
    const next = resolved === "dark" ? "light" : "dark";
    setTheme(next);
  };

  const isDark  = resolved === "dark";
  const isLight = resolved === "light";

  return (
    <ThemeContext.Provider
      value={{
        theme:      preference,   /* "light" | "dark" | "system" — for Settings UI */
        resolved,                 /* "light" | "dark" — for conditionals in components */
        isDark,
        isLight,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════
   HOOK  →  const { theme, resolved, isDark, setTheme } = useTheme();
══════════════════════════════════════════════════════ */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}

export default ThemeContext;

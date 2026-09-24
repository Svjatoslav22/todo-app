"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("todo-theme") || "system";
    }
    return "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("todo-theme");
      if (saved === "dark") return "dark";
      if (saved === "light") return "light";
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(targetTheme) {
      const isDark =
        targetTheme === "system" ? mediaQuery.matches : targetTheme === "dark";

      setResolvedTheme(isDark ? "dark" : "light");

      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    applyTheme(theme);

    function handleMediaChange() {
      if (theme === "system") {
        applyTheme("system");
      }
    }

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, [theme]);

  function setTheme(newTheme) {
    setThemeState(newTheme);
    localStorage.setItem("todo-theme", newTheme);
  }

  function toggleTheme() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

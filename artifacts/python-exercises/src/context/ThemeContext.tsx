import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
export type AccentColor = "blue" | "green" | "purple" | "orange" | "red";

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
  showVidas: boolean;
  setShowVidas: (show: boolean) => void;
  showRacha: boolean;
  setShowRacha: (show: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENT_COLORS = {
  blue: {
    primary: "199 92% 54%",
    border: "#1899D6",
  },
  green: {
    primary: "94 96% 40%",
    border: "#3E8E00",
  },
  purple: {
    primary: "276 100% 75%",
    border: "#A568CC",
  },
  orange: {
    primary: "20 100% 50%",
    border: "#D67E00",
  },
  red: {
    primary: "0 100% 65%",
    border: "#EA2B2B",
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  });

  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const saved = localStorage.getItem("accentColor") as AccentColor;
    if (saved && ACCENT_COLORS[saved]) return saved;
    return "blue";
  });

  const [showVidas, setShowVidasState] = useState<boolean>(() => {
    const saved = localStorage.getItem("showVidas");
    return saved !== "false"; // default to true
  });

  const [showRacha, setShowRachaState] = useState<boolean>(() => {
    const saved = localStorage.getItem("showRacha");
    return saved !== "false"; // default to true
  });

  // Apply dark/light theme classes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.setAttribute("data-theme", "dark");
      root.classList.add("dark");
    } else {
      root.removeAttribute("data-theme");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Apply custom accent color to CSS variables dynamically
  useEffect(() => {
    const root = window.document.documentElement;
    const config = ACCENT_COLORS[accentColor] || ACCENT_COLORS.blue;

    root.style.setProperty("--primary", config.primary);
    root.style.setProperty("--primary-border", config.border);
    root.style.setProperty("--color-marca-azul", `hsl(${config.primary})`);
    root.style.setProperty("--sombra-marca-azul", config.border);

    localStorage.setItem("accentColor", accentColor);
  }, [accentColor]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color);
  };

  const setShowVidas = (show: boolean) => {
    setShowVidasState(show);
    localStorage.setItem("showVidas", String(show));
  };

  const setShowRacha = (show: boolean) => {
    setShowRachaState(show);
    localStorage.setItem("showRacha", String(show));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
        showVidas,
        setShowVidas,
        showRacha,
        setShowRacha,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

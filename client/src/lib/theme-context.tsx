import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes to start fresh
    root.classList.remove("light", "dark");
    
    // For debugging
    console.log(`Setting document theme: ${theme}`);
    
    if (theme === "system") {
      // Apply system theme based on OS preference
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      
      console.log(`System preference detected: ${systemTheme}`);
      root.classList.add(systemTheme);
      
      // Add event listener to update theme when system preference changes
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
        console.log(`System theme changed to: ${e.matches ? "dark" : "light"}`);
      };
      
      // Remove existing listeners to prevent duplicates
      try {
        // Safari doesn't support removeEventListener for MediaQueryList
        mediaQuery.removeEventListener("change", handleChange);
      } catch (e) {
        console.log("Browser doesn't support MediaQueryList.removeEventListener");
      }
      
      mediaQuery.addEventListener("change", handleChange);
      return;
    }
    
    // Apply explicit theme choice
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};
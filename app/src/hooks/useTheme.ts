import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

/**
 * Custom hook for managing the application theme
 * Handles theme switching, persistence, and system preference detection
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to system
    const savedTheme = localStorage.getItem("navis-theme") as Theme;
    return savedTheme || "system";
  });

  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  const [isInitialized, setIsInitialized] = useState(false);

  // Function to apply theme to the DOM
  const applyTheme = (theme: "dark" | "light") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    setResolvedTheme(theme);
  };

  // Function to get system preference
  const getSystemTheme = (): "dark" | "light" => {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  };

  // Function to set theme and persist it
  const setThemeAndPersist = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("navis-theme", newTheme);
    
    // Only refresh the page if the hook has been initialized (not on initial load)
    if (isInitialized) {
      window.location.reload();
    }
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    if (theme === "system") {
      const systemTheme = getSystemTheme();
      setThemeAndPersist(systemTheme === "dark" ? "light" : "dark");
    } else {
      setThemeAndPersist(theme === "dark" ? "light" : "dark");
    }
  };

  // Effect to handle theme changes
  useEffect(() => {
    const updateTheme = () => {
      if (theme === "system") {
        const systemTheme = getSystemTheme();
        applyTheme(systemTheme);
      } else {
        applyTheme(theme);
      }
    };

    updateTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Initial theme application on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem("navis-theme") as Theme;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Set initial system theme
      const systemTheme = getSystemTheme();
      applyTheme(systemTheme);
    }
    
    // Mark as initialized after initial setup
    setIsInitialized(true);
  }, []);

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeAndPersist,
    toggleTheme,
    systemTheme: getSystemTheme(),
  };
}

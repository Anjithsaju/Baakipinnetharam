"use client";
import React, { createContext, useContext, useState } from "react";

type ThemeContextType = {
  theme: string;
  themeClass: string;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "glass",
  themeClass: "bg-[#333b4d8f] text-white backdrop-blur-md",
  toggleTheme: () => {},
});

const themes = {
  glass:
    "bg-[#333b4db0] text-white backdrop-blur-sm transition-colors duration-500 border-1 border-[#38497069]",
  light:
    "bg-gray-300 text-black transition-colors duration-500 border-1 border-[#38497069]",
};

export function ThemeProvider({ children }: React.PropsWithChildren<{}>) {
  const [theme, setTheme] = useState<keyof typeof themes>("light");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "glass" ? "light" : "glass"));
  };

  return (
    <ThemeContext.Provider
      value={{ theme, themeClass: themes[theme], toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

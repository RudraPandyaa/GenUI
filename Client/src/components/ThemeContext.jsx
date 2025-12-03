import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check local storage or system preference on load
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'dark'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both to avoid conflicts
    root.classList.remove('light', 'dark');
    // Add the current theme class
    root.classList.add(theme);
    
    // Save to local storage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
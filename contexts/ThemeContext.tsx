import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'dark' | 'dutch-masters' | 'nordic-bright';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount and initialize theme class
  useEffect(() => {
    setMounted(true);
    
    const root = document.documentElement;
    const savedTheme = localStorage.getItem('dashboard-theme') as ThemeMode;
    
    if (savedTheme && ['dark', 'dutch-masters', 'nordic-bright'].includes(savedTheme)) {
      setThemeState(savedTheme);
      // Immediately apply the saved theme data attribute
      root.setAttribute('data-theme', savedTheme);
    } else {
      // Apply default theme data attribute
      root.setAttribute('data-theme', 'dark');
    }
    
    console.log('Initial theme setup:', root.classList.toString());
  }, []);

  // Apply theme data attribute to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    
    // Use data attribute instead of classes for more reliable theming
    root.setAttribute('data-theme', theme);
    
    // Save to localStorage
    localStorage.setItem('dashboard-theme', theme);
    
    console.log(`Theme changed to: ${theme}`, root.getAttribute('data-theme'));
  }, [theme, mounted]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const themes: ThemeMode[] = ['dark', 'dutch-masters', 'nordic-bright'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
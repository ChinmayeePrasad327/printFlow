import React, { createContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName, StatusBar } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Colors } from '../constants/colors';
import { Storage } from '../utils/storage';
import type { ThemeContextType, ColorScheme } from '../types/theme';

const THEME_KEY = '@printflow_theme';

export const ThemeContext = createContext<ThemeContextType>({
  scheme: 'light',
  colors: Colors.light,
  toggleTheme: async () => {},
  setScheme: async () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = Appearance.getColorScheme() || 'light';
  const [scheme, setSchemeState] = useState<ColorScheme>((() => 'light')());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        SplashScreen.preventAutoHideAsync();
      } catch {}
      const saved = await Storage.get(THEME_KEY);
      if (saved === 'light' || saved === 'dark') {
        setSchemeState(saved as ColorScheme);
      } else {
        setSchemeState(colorScheme as ColorScheme);
      }
      setHydrated(true);
      try {
        await SplashScreen.hideAsync();
      } catch {}
    })();
  }, [colorScheme]);

  const setScheme = async (s: ColorScheme) => {
    setSchemeState(s);
    await Storage.set(THEME_KEY, s);
  };

  const toggleTheme = async () => {
    const next = scheme === 'light' ? 'dark' : 'light';
    await setScheme(next);
  };

  const value = useMemo(() => ({ scheme, colors: scheme === 'light' ? Colors.light : Colors.dark, toggleTheme, setScheme }), [scheme]);

  // keep status bar in sync
  useEffect(() => {
    StatusBar.setBarStyle(scheme === 'light' ? 'dark-content' : 'light-content');
  }, [scheme]);

  if (!hydrated) return null; // keep splash up while hydrating

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

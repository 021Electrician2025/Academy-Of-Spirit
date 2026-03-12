import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativeWindScheme } from 'nativewind';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextValue {
  preference: ThemePreference;
  setTheme: (pref: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  preference: 'system',
  setTheme: () => {},
});

const STORAGE_KEY = '@aos:theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>('system');
  const { setColorScheme } = useNativeWindScheme();

  // Load saved preference on startup
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreference(saved);
        setColorScheme(saved);
      }
    });
  }, []);

  const setTheme = (pref: ThemePreference) => {
    setPreference(pref);
    setColorScheme(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  return (
    <ThemeContext.Provider value={{ preference, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useAppTheme = () => useContext(ThemeContext);

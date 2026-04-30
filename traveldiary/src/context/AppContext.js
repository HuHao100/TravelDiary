import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem('lang') || 'zh';
  });

  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-prefers-color-scheme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Apply theme on mount
  useEffect(() => {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-prefers-color-scheme', theme);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === 'zh' ? 'en' : 'zh'));
  }, []);

  const t = useCallback((key, params) => {
    const dict = translations[lang] || translations['zh'];
    let str = dict[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return str;
  }, [lang]);

  return (
    <AppContext.Provider value={{ isDark, toggleTheme, lang, toggleLang, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

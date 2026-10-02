import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkStored = localStorage.getItem('queuesmart_theme') === 'dark';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const active = isDarkStored || (!('queuesmart_theme' in localStorage) && prefersDark);

    setIsDark(active);
    if (active) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('queuesmart_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('queuesmart_theme', 'light');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm ${className}`}
    >
      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
    </button>
  );
};

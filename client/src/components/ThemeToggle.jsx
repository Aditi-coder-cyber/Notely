import React from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`inline-flex items-center gap-2 p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${className}`}
    >
      {isDark ? (
        <FiSun className="w-5 h-5 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <FiMoon className="w-5 h-5 text-indigo-600 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
      {showLabel && (
        <span className="text-sm font-medium">{isDark ? 'Light mode' : 'Dark mode'}</span>
      )}
    </button>
  );
}

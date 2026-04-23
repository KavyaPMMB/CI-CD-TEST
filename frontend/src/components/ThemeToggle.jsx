import { Moon, Sun } from "lucide-react";

export function ThemeToggle({ theme, onToggle }) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/50 bg-white/50 text-amber-500 shadow-glass backdrop-blur-xl transition hover:scale-105 dark:border-white/10 dark:bg-slate-900/60 dark:text-amber-300 dark:shadow-glass-lg"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}

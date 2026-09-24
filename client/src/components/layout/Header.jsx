"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Sun,
  Moon,
  Plus,
  Flame,
  Timer,
  HelpCircle,
  Command,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { useTheme } from "@/providers/ThemeProvider";
import { getProductivityData } from "@/lib/productivity";

export default function Header({
  title = "Всі завдання",
  icon: Icon,
  completedCount = 0,
  totalCount = 0,
  searchQuery,
  onSearchChange,
  onOpenCreateTask,
  onOpenCommandPalette,
  onOpenPomodoro,
  onOpenMyDay,
  onOpenShortcuts,
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [streak, setStreak] = useState(1);

  useEffect(() => {
    function syncStreak() {
      const data = getProductivityData();
      setStreak(data.currentStreak || 1);
    }
    syncStreak();

    window.addEventListener("todo-pro-stats-updated", syncStreak);
    return () => window.removeEventListener("todo-pro-stats-updated", syncStreak);
  }, []);

  const progressPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 px-4 sm:px-8 backdrop-blur-2xl">
      {/* Title & Progress */}
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <span>{title}</span>
            {totalCount > 0 && (
              <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
                {totalCount}
              </span>
            )}
          </h1>
        </div>

        {totalCount > 0 && (
          <div className="hidden lg:flex items-center gap-2 ml-4 pl-4 border-l border-zinc-200 dark:border-white/10">
            <div className="w-20 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              {completedCount}/{totalCount} ({progressPercent}%)
            </span>
          </div>
        )}
      </div>

      {/* Search & Productivity Actions */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Command Palette / Search Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="relative flex items-center gap-2 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:border-zinc-300 dark:hover:border-white/20 transition shadow-xs"
        >
          <Search className="h-3.5 w-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Пошук або команди...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
            Ctrl+K
          </kbd>
        </button>

        {/* My Day & Streak Button */}
        <Tooltip content="Мій день та продуктивність (D)">
          <button
            type="button"
            onClick={onOpenMyDay}
            className="flex items-center gap-1.5 rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/40 px-2.5 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 shadow-xs backdrop-blur-md transition"
          >
            <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
            <span className="tabular-nums">{streak}</span>
          </button>
        </Tooltip>

        {/* Pomodoro Timer Button */}
        <Tooltip content="Режим фокусу / Помодоро (P)">
          <button
            type="button"
            onClick={onOpenPomodoro}
            className="flex items-center justify-center rounded-xl border border-indigo-200/60 dark:border-indigo-800/40 bg-indigo-50/60 dark:bg-indigo-950/40 p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/50 shadow-xs backdrop-blur-md transition"
            aria-label="Режим фокусу"
          >
            <Timer className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* Keyboard Shortcuts Button */}
        <Tooltip content="Гарячі клавіші (?)">
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:inline-flex rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs backdrop-blur-md transition"
            aria-label="Гарячі клавіші"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </Tooltip>

        {/* Theme Switcher Button */}
        <Tooltip content="Змінити тему">
          <button
            type="button"
            onClick={toggleTheme}
            className="hidden sm:inline-flex rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs backdrop-blur-md transition"
            aria-label="Змінити тему"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-500" />
            )}
          </button>
        </Tooltip>

        {/* Quick Add Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onOpenCreateTask}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
        >
          <span className="hidden sm:inline">Створити</span>
        </Button>
      </div>
    </header>
  );
}

"use client";

import { Search, Sun, Moon, Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import { useTheme } from "@/providers/ThemeProvider";

export default function Header({
  title = "Всі завдання",
  icon: Icon,
  completedCount = 0,
  totalCount = 0,
  searchQuery,
  onSearchChange,
  onOpenCreateTask,
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
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

      {/* Search & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Пошук завдань... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-36 sm:w-60 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50/70 dark:bg-zinc-900/60 pl-8 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none backdrop-blur-md transition-all focus:w-48 sm:focus:w-72 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

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

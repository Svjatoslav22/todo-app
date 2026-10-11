"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Timer,
  Keyboard,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";
import { getProductivityData } from "@/lib/productivity";
import { useEffect, useState } from "react";

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenShortcuts,
}) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [stats, setStats] = useState(() => getProductivityData());

  useEffect(() => {
    function refreshStats() {
      setStats(getProductivityData());
    }
    window.addEventListener("todo-pro-stats-updated", refreshStats);
    return () => window.removeEventListener("todo-pro-stats-updated", refreshStats);
  }, []);

  const activeStats = isOpen ? getProductivityData() : stats;

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const displayName = user.name || user.email?.split("@")[0] || "Користувач";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="relative w-full max-w-sm rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-2xl space-y-5 z-10 select-none"
          >
            {/* Header / Close */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Профіль та налаштування
              </span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User Bio Card */}
            <div className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-white/5">
              <Avatar email={user.email} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {displayName}
                  </h3>
                  {isAdmin && (
                    <span className="rounded bg-purple-50 dark:bg-purple-950/80 px-1.5 py-0.2 text-[9px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Mini Productivity Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-amber-200/60 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 p-2.5">
                <Flame className="h-4 w-4 text-amber-500 mx-auto fill-amber-500 mb-1" />
                <div className="text-base font-extrabold text-amber-950 dark:text-amber-200 tabular-nums">
                  {activeStats.currentStreak}
                </div>
                <div className="text-[10px] text-amber-700 dark:text-amber-400">
                  днів стрік
                </div>
              </div>

              <div className="rounded-xl border border-indigo-200/60 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20 p-2.5">
                <CheckCircle2 className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
                <div className="text-base font-extrabold text-indigo-950 dark:text-indigo-200 tabular-nums">
                  {activeStats.totalCompleted}
                </div>
                <div className="text-[10px] text-indigo-700 dark:text-indigo-400">
                  виконано
                </div>
              </div>

              <div className="rounded-xl border border-purple-200/60 dark:border-purple-900/40 bg-purple-50/40 dark:bg-purple-950/20 p-2.5">
                <Timer className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                <div className="text-base font-extrabold text-purple-950 dark:text-purple-200 tabular-nums">
                  {activeStats.focusMinutes}
                </div>
                <div className="text-[10px] text-purple-700 dark:text-purple-400">
                  хв фокусу
                </div>
              </div>
            </div>

            {/* Quick Actions List */}
            <div className="space-y-1.5 pt-1">
              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-4 w-4 text-amber-400" />
                  ) : (
                    <Moon className="h-4 w-4 text-indigo-500" />
                  )}
                  <span>Тема інтерфейсу</span>
                </div>
                <span className="text-[11px] text-zinc-400 capitalize">
                  {resolvedTheme === "dark" ? "Темна" : "Світла"}
                </span>
              </button>

              {/* Admin Panel Link */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span>Панель адміністратора</span>
                  </div>
                  <Sparkles className="h-3.5 w-3.5 text-purple-500" />
                </Link>
              )}

              {/* Shortcuts button */}
              {onOpenShortcuts && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenShortcuts();
                  }}
                  className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  <div className="flex items-center gap-2.5">
                    <Keyboard className="h-4 w-4 text-zinc-400" />
                    <span>Гарячі клавіші</span>
                  </div>
                  <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                    ?
                  </kbd>
                </button>
              )}
            </div>

            {/* Logout Action */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5">
              <Button
                variant="danger"
                size="sm"
                className="w-full"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                leftIcon={<LogOut className="h-4 w-4" />}
              >
                Вийти з акаунту
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

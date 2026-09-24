"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  Timer,
  Trophy,
  Calendar,
  Sparkles,
  X,
  TrendingUp,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import {
  getProductivityData,
  getActivityHeatmapData,
  getWeeklyChartData,
  ACHIEVEMENTS,
} from "@/lib/productivity";
import { triggerAchievementCelebration } from "@/lib/celebrate";
import { cn } from "@/lib/utils";

export default function MyDayModal({
  isOpen,
  onClose,
  tasks = [],
  userName = "Користувач",
}) {
  const [stats, setStats] = useState(() => getProductivityData());
  const [heatmap, setHeatmap] = useState(() => getActivityHeatmapData());
  const [weekly, setWeekly] = useState(() => getWeeklyChartData());

  // Listen to productivity updates
  useEffect(() => {
    function refreshStats() {
      setStats(getProductivityData());
      setHeatmap(getActivityHeatmapData());
      setWeekly(getWeeklyChartData());
    }

    if (isOpen) {
      refreshStats();
    }

    window.addEventListener("todo-pro-stats-updated", refreshStats);
    return () => window.removeEventListener("todo-pro-stats-updated", refreshStats);
  }, [isOpen]);

  // Greeting by hour
  const currentHour = new Date().getHours();
  let greeting = "Доброго дня";
  if (currentHour >= 5 && currentHour < 12) greeting = "Доброго ранку";
  else if (currentHour >= 18 && currentHour < 23) greeting = "Доброго вечора";
  else if (currentHour >= 23 || currentHour < 5) greeting = "Доброї ночі";

  // Today tasks calculations
  const todayStr = new Date().toDateString();
  const todayTasks = tasks.filter((t) => {
    if (t.isArchived || t.isDeleted) return false;
    if (t.dueDate) return new Date(t.dueDate).toDateString() === todayStr;
    return new Date(t.createdAt).toDateString() === todayStr;
  });

  const todayCompleted = todayTasks.filter((t) => t.status === "done").length;
  const todayTotal = todayTasks.length;
  const todayPercent =
    todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;
  const todayPendingCount = todayTotal - todayCompleted;

  // Max value in weekly chart for relative heights
  const maxWeeklyCount = Math.max(...weekly.map((d) => d.count), 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-lg"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 my-auto select-none"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 px-3 py-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                    <Sparkles className="h-3.5 w-3.5" />
                    Мій день & Мотивація
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
                  {greeting}, {userName}! 👋
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Маленькі щоденні кроки створюють великі перемоги.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Key Metrics Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Streak Card */}
              <div className="rounded-2xl border border-amber-200/60 dark:border-amber-900/40 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                    Стрік
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
                    <Flame className="h-4 w-4 fill-amber-500" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-amber-950 dark:text-amber-200 tabular-nums">
                    {stats.currentStreak}{" "}
                    <span className="text-xs font-normal text-amber-700 dark:text-amber-400">
                      {stats.currentStreak === 1 ? "день" : "дні"}
                    </span>
                  </div>
                  <div className="text-[10px] text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                    Рекорд: {stats.bestStreak} дн.
                  </div>
                </div>
              </div>

              {/* Today Focus Progress Ring Card */}
              <div className="rounded-2xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    Сьогодні
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-indigo-950 dark:text-indigo-200 tabular-nums">
                      {todayCompleted}
                      <span className="text-xs font-normal text-zinc-400">
                        /{todayTotal}
                      </span>
                    </div>
                    <div className="text-[10px] text-indigo-600/80 dark:text-indigo-400/70 mt-0.5">
                      {todayPercent}% виконано
                    </div>
                  </div>

                  {/* Micro circular ring */}
                  <div className="relative w-8 h-8 -rotate-90">
                    <svg className="w-full h-full">
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="currentColor"
                        strokeWidth="3"
                        className="text-zinc-200 dark:text-zinc-800 fill-transparent"
                      />
                      <circle
                        cx="16"
                        cy="16"
                        r="12"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeDasharray={2 * Math.PI * 12}
                        strokeDashoffset={2 * Math.PI * 12 * (1 - todayPercent / 100)}
                        strokeLinecap="round"
                        className="fill-transparent transition-all duration-500"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Focus Time Card */}
              <div className="rounded-2xl border border-purple-200/60 dark:border-purple-900/40 bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                    Помодоро
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400">
                    <Timer className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-purple-950 dark:text-purple-200 tabular-nums">
                    {stats.focusMinutes}{" "}
                    <span className="text-xs font-normal text-purple-700 dark:text-purple-400">
                      хв
                    </span>
                  </div>
                  <div className="text-[10px] text-purple-600/80 dark:text-purple-400/70 mt-0.5">
                    Час концентрації
                  </div>
                </div>
              </div>

              {/* Total Completed Card */}
              <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Всього закрито
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-extrabold text-emerald-950 dark:text-emerald-200 tabular-nums">
                    {stats.totalCompleted}
                  </div>
                  <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70 mt-0.5">
                    Завдань в історії
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Productivity & Activity Heatmap Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Weekly Chart */}
              <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                    <span>Продуктивність тижня</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    Пн — Нд
                  </span>
                </div>

                <div className="h-28 flex items-end justify-between gap-2 pt-4 px-1">
                  {weekly.map((item, idx) => {
                    const barHeightPercent = Math.max(
                      10,
                      Math.round((item.count / maxWeeklyCount) * 100)
                    );

                    return (
                      <div
                        key={idx}
                        className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                      >
                        <span className="text-[10px] font-bold tabular-nums text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                          {item.count > 0 ? item.count : ""}
                        </span>

                        <div className="w-full bg-zinc-200/60 dark:bg-zinc-800/80 rounded-lg overflow-hidden h-20 flex items-end">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${item.count > 0 ? barHeightPercent : 0}%` }}
                            transition={{ duration: 0.6, delay: idx * 0.05 }}
                            className={cn(
                              "w-full rounded-lg transition-all",
                              item.isToday
                                ? "bg-gradient-to-t from-indigo-600 to-indigo-400 shadow-md shadow-indigo-500/25"
                                : item.count > 0
                                ? "bg-gradient-to-t from-zinc-400 to-zinc-300 dark:from-zinc-700 dark:to-zinc-500"
                                : "h-1 bg-transparent"
                            )}
                          />
                        </div>

                        <span
                          className={cn(
                            "text-[10px] font-semibold transition",
                            item.isToday
                              ? "text-indigo-600 dark:text-indigo-400 font-bold"
                              : "text-zinc-400"
                          )}
                        >
                          {item.day}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* GitHub-style Heatmap */}
              <div className="rounded-2xl border border-zinc-200/70 dark:border-white/10 bg-zinc-50/50 dark:bg-zinc-950/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                    <Calendar className="h-3.5 w-3.5 text-purple-500" />
                    <span>Активність (12 тижнів)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <span>Менше</span>
                    <span className="h-2 w-2 rounded-xs bg-zinc-200 dark:bg-zinc-800" />
                    <span className="h-2 w-2 rounded-xs bg-indigo-300 dark:bg-indigo-900" />
                    <span className="h-2 w-2 rounded-xs bg-indigo-500" />
                    <span className="h-2 w-2 rounded-xs bg-indigo-600" />
                    <span className="h-2 w-2 rounded-xs bg-purple-600" />
                    <span>Більше</span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="grid grid-flow-col grid-rows-7 gap-1 overflow-x-auto pb-1">
                    {heatmap.map((cell) => {
                      const levelColors = [
                        "bg-zinc-200/70 dark:bg-zinc-800/80 hover:ring-1 hover:ring-zinc-400",
                        "bg-indigo-300 dark:bg-indigo-900 hover:ring-1 hover:ring-indigo-400",
                        "bg-indigo-500 dark:bg-indigo-600 hover:ring-1 hover:ring-indigo-300",
                        "bg-indigo-600 dark:bg-indigo-500 hover:ring-1 hover:ring-indigo-200",
                        "bg-purple-600 dark:bg-purple-500 shadow-xs hover:ring-1 hover:ring-purple-300",
                      ];

                      return (
                        <Tooltip
                          key={cell.date}
                          content={`${cell.formatted}: ${cell.count} завдань`}
                        >
                          <div
                            className={cn(
                              "h-3 w-3 rounded-xs transition-colors cursor-pointer",
                              levelColors[cell.level]
                            )}
                          />
                        </Tooltip>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Gamification Achievements */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Досягнення та відзнаки
                </h3>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={triggerAchievementCelebration}
                  leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-500" />}
                >
                  Святкувати успіх!
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {ACHIEVEMENTS.map((ach) => {
                  const unlocked = ach.check(stats, todayPendingCount);

                  return (
                    <div
                      key={ach.id}
                      className={cn(
                        "rounded-xl border p-3 flex items-start gap-2.5 transition select-none",
                        unlocked
                          ? "border-indigo-200/70 dark:border-indigo-800/60 bg-indigo-50/40 dark:bg-indigo-950/20"
                          : "border-zinc-200/40 dark:border-white/5 bg-zinc-50/30 dark:bg-zinc-950/20 opacity-50 grayscale"
                      )}
                    >
                      <span className="text-2xl shrink-0">{ach.icon}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {ach.title}
                          </p>
                          {unlocked && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                          {ach.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end pt-2 border-t border-zinc-200/60 dark:border-white/5">
              <Button variant="primary" size="sm" onClick={onClose}>
                Продовжити роботу
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

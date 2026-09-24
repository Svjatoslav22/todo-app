"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox,
  Sun,
  Calendar,
  Star,
  Archive,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LogOut,
  Moon,
  Laptop,
  Flame,
  Timer,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Tooltip from "@/components/ui/Tooltip";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

export const SMART_LISTS = [
  { id: "all", label: "Всі завдання", icon: Inbox, countKey: "all" },
  { id: "today", label: "Сьогодні", icon: Sun, countKey: "today" },
  { id: "upcoming", label: "Найближчі", icon: Calendar, countKey: "upcoming" },
  { id: "important", label: "Важливі", icon: Star, countKey: "important" },
  { id: "archive", label: "Архів", icon: Archive, countKey: "archive" },
  { id: "trash", label: "Корзина", icon: Trash2, countKey: "trash" },
];

export const DEMO_PROJECTS = [
  { id: "work", name: "Робота та проєкти", color: "bg-indigo-500" },
  { id: "personal", name: "Особисті справи", color: "bg-emerald-500" },
  { id: "study", name: "Навчання та книги", color: "bg-amber-500" },
];

export default function Sidebar({
  activeList,
  onSelectList,
  taskCounts = {},
  user,
  onLogout,
  onOpenCreateTask,
  onOpenMyDay,
  onOpenPomodoro,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 260 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="hidden md:flex flex-col h-screen sticky top-0 z-30 shrink-0 border-r border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-2xl select-none"
    >
      {/* Brand & Collapse Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-200/60 dark:border-white/5 h-16">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/25">
            ✓
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 truncate"
              >
                <span className="font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-base">
                  Todo Pro
                </span>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/80 px-1.5 py-0.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                  PRO
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition"
          aria-label={collapsed ? "Розгорнути" : "Згорнути"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* New Task Action Button */}
      <div className="p-3">
        {collapsed ? (
          <Tooltip content="Створити завдання (N)" position="right">
            <button
              type="button"
              onClick={onOpenCreateTask}
              className="flex h-10 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-600 transition"
            >
              <Plus className="h-4 w-4" />
            </button>
          </Tooltip>
        ) : (
          <button
            type="button"
            onClick={onOpenCreateTask}
            className="flex w-full items-center justify-between rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-indigo-600 transition"
          >
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Нове завдання</span>
            </span>
            <kbd className="rounded bg-indigo-800/50 px-1.5 py-0.5 text-[10px] font-mono text-indigo-200">
              N
            </kbd>
          </button>
        )}
      </div>

      {/* Navigation Lists */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {/* Smart Lists */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Списки
            </p>
          )}

          {SMART_LISTS.map((item) => {
            const Icon = item.icon;
            const isActive = activeList === item.id;
            const count = taskCounts[item.id] ?? 0;

            const buttonContent = (
              <button
                type="button"
                onClick={() => onSelectList(item.id)}
                className={cn(
                  "flex w-full items-center rounded-xl px-3 py-2 text-xs font-medium transition-all group select-none",
                  collapsed ? "justify-center" : "justify-between",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon
                    className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    )}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && count > 0 && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums",
                      isActive
                        ? "bg-indigo-200/50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );

            return collapsed ? (
              <Tooltip key={item.id} content={item.label} position="right">
                {buttonContent}
              </Tooltip>
            ) : (
              <div key={item.id}>{buttonContent}</div>
            );
          })}
        </div>

        {/* Productivity Hub */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              Продуктивність
            </p>
          )}

          {/* My Day */}
          {collapsed ? (
            <Tooltip content="Мій день (D)" position="right">
              <button
                type="button"
                onClick={onOpenMyDay}
                className="flex w-full items-center justify-center rounded-xl p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition"
              >
                <Flame className="h-4 w-4 fill-amber-500 text-amber-500" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={onOpenMyDay}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/30 hover:text-amber-700 dark:hover:text-amber-300 transition group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Flame className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500/20 group-hover:fill-amber-500 transition-colors" />
                <span>Мій день</span>
              </div>
              <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                D
              </kbd>
            </button>
          )}

          {/* Pomodoro */}
          {collapsed ? (
            <Tooltip content="Помодоро / Фокус (P)" position="right">
              <button
                type="button"
                onClick={onOpenPomodoro}
                className="flex w-full items-center justify-center rounded-xl p-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
              >
                <Timer className="h-4 w-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={onOpenPomodoro}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:text-indigo-700 dark:hover:text-indigo-300 transition group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Timer className="h-4 w-4 shrink-0 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span>Фокус (Помодоро)</span>
              </div>
              <kbd className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                P
              </kbd>
            </button>
          )}
        </div>

        {/* Projects / Lists */}
        <div className="space-y-1">
          {!collapsed && (
            <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
              <span>Проєкти</span>
              <FolderKanban className="h-3 w-3" />
            </div>
          )}

          {DEMO_PROJECTS.map((proj) => {
            const isActive = activeList === `proj-${proj.id}`;

            const projButton = (
              <button
                type="button"
                onClick={() => onSelectList(`proj-${proj.id}`)}
                className={cn(
                  "flex w-full items-center rounded-xl px-3 py-2 text-xs font-medium transition-all group select-none",
                  collapsed ? "justify-center" : "justify-between",
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60 hover:text-zinc-900 dark:hover:text-zinc-200"
                )}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full shrink-0 shadow-xs",
                      proj.color
                    )}
                  />
                  {!collapsed && <span className="truncate">{proj.name}</span>}
                </div>
              </button>
            );

            return collapsed ? (
              <Tooltip key={proj.id} content={proj.name} position="right">
                {projButton}
              </Tooltip>
            ) : (
              <div key={proj.id}>{projButton}</div>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Settings Bar */}
      <div className="p-3 border-t border-zinc-200/60 dark:border-white/5 space-y-2 bg-zinc-50/50 dark:bg-zinc-900/30">
        <div
          className={cn(
            "flex items-center",
            collapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <Avatar email={user?.email} size="sm" />
            {!collapsed && (
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {user?.email?.split("@")[0] || "Користувач"}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {user?.email || "активний"}
                </p>
              </div>
            )}
          </div>

          {!collapsed && (
            <div className="flex items-center gap-1">
              <Tooltip content="Перемкнути тему">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
                  aria-label="Змінити тему"
                >
                  {resolvedTheme === "dark" ? (
                    <Sun className="h-3.5 w-3.5 text-amber-400" />
                  ) : (
                    <Moon className="h-3.5 w-3.5 text-indigo-500" />
                  )}
                </button>
              </Tooltip>

              <Tooltip content="Вийти">
                <button
                  type="button"
                  onClick={onLogout}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                  aria-label="Вийти"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {collapsed && (
          <div className="flex flex-col items-center gap-1 pt-1 border-t border-zinc-200/40 dark:border-white/5">
            <Tooltip content="Тема" position="right">
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <Moon className="h-3.5 w-3.5 text-indigo-500" />
                )}
              </button>
            </Tooltip>
            <Tooltip content="Вийти" position="right">
              <button
                type="button"
                onClick={onLogout}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </Tooltip>
          </div>
        )}
      </div>
    </motion.aside>
  );
}

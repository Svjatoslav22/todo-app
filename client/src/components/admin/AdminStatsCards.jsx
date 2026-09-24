"use client";

import { motion } from "framer-motion";
import {
  Users,
  CheckCircle2,
  ListTodo,
  ShieldAlert,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export default function AdminStatsCards({ stats }) {
  if (!stats) return null;

  const {
    totalUsers = 0,
    totalTasks = 0,
    completedTasks = 0,
    completedPercent = 0,
    bannedUsers = 0,
    active24hUsers = 0,
    registrationsByDate = [],
  } = stats;

  const maxReg = Math.max(...registrationsByDate.map((r) => r.count), 1);

  return (
    <div className="space-y-6">
      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 shadow-xs backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Користувачів
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {totalUsers}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <UserCheck className="h-3.5 w-3.5" />
              <span>{active24hUsers} активні за 24г</span>
            </div>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 shadow-xs backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Всього завдань
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
              <ListTodo className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {totalTasks}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                  style={{ width: `${completedPercent}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tabular-nums">
                {completedPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 shadow-xs backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Виконано завдань
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {completedTasks}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Успішно закритих справ
            </p>
          </div>
        </div>

        {/* Banned Users */}
        <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 shadow-xs backdrop-blur-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Заблоковані
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
              <ShieldAlert className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
              {bannedUsers}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Облікових записів під баном
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Registration Activity Chart */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-5 shadow-xs backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-indigo-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Динаміка реєстрацій за останні 7 днів
            </h3>
          </div>
          <span className="text-xs text-zinc-400 font-medium">
            Нові користувачі платформи
          </span>
        </div>

        <div className="h-32 flex items-end justify-between gap-3 pt-4 px-2">
          {registrationsByDate.map((item, idx) => {
            const heightPercent = Math.max(
              12,
              Math.round((item.count / maxReg) * 100)
            );

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col items-center gap-2 h-full justify-end group"
              >
                <span className="text-[11px] font-bold tabular-nums text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                  {item.count}
                </span>

                <Tooltip content={`${item.date}: ${item.count} реєстрацій`}>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-xl overflow-hidden h-24 flex items-end cursor-pointer">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${heightPercent}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className={cn(
                        "w-full rounded-xl transition-all",
                        item.count > 0
                          ? "bg-gradient-to-t from-indigo-600 via-indigo-500 to-purple-500 shadow-md shadow-indigo-500/20 group-hover:brightness-110"
                          : "bg-zinc-200/60 dark:bg-zinc-800 h-2"
                      )}
                    />
                  </div>
                </Tooltip>

                <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

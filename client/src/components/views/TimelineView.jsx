"use client";

import { useMemo } from "react";
import {
  Calendar,
  Flag,
  Clock,
  CheckCircle2,
  ListTodo,
} from "lucide-react";
import { PRIORITY_CONFIG } from "@/components/ui/PrioritySelect";
import { formatDueDate } from "@/components/ui/DatePicker";
import { cn } from "@/lib/utils";

export default function TimelineView({ tasks = [], onSelectTask }) {
  // Generate 14 days timeline starting from 2 days ago up to 12 days in the future
  const timelineDays = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = -2; i <= 12; i++) {
      const d = new Date(now);
      d.setDate(now.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const todayStr = new Date().toDateString();

  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 p-5 shadow-sm backdrop-blur-2xl space-y-6">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-white/5 pb-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-500" />
            <span>Шкала часу (Таймлайн)</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Візуальний графік дедлайнів на найближчі два тижні
          </p>
        </div>
      </div>

      {/* Days Scale Header */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px] space-y-4">
          <div className="grid grid-cols-15 gap-1 border-b border-zinc-200/60 dark:border-white/10 pb-2 text-center text-xs font-semibold">
            {timelineDays.map((d) => {
              const isToday = d.toDateString() === todayStr;
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    "py-1.5 rounded-xl flex flex-col items-center gap-0.5",
                    isToday
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/40"
                      : "text-zinc-500 dark:text-zinc-400"
                  )}
                >
                  <span className="text-[10px] uppercase">
                    {d.toLocaleDateString("uk-UA", { weekday: "short" })}
                  </span>
                  <span className="text-xs">{d.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Tasks Tracks */}
          <div className="space-y-2.5">
            {tasks.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-400">
                Немає завдань для відображення на таймлайні
              </div>
            ) : (
              tasks.map((task) => {
                const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.none;
                const isDone = task.status === "done";
                const taskDate = task.dueDate ? new Date(task.dueDate) : null;
                const isOverdue =
                  taskDate && taskDate < new Date() && !isDone;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="flex items-center gap-4 rounded-2xl border border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/30 p-2.5 hover:border-zinc-300 dark:hover:border-white/15 transition cursor-pointer select-none"
                  >
                    {/* Task Title & Status */}
                    <div className="w-56 shrink-0 truncate flex items-center gap-2">
                      {isDone ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : task.status === "in_progress" ? (
                        <Clock className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <ListTodo className="h-4 w-4 text-zinc-400 shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-xs font-semibold truncate",
                          isDone
                            ? "line-through text-zinc-400"
                            : "text-zinc-900 dark:text-zinc-100"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    {/* Timeline Track Pill */}
                    <div className="flex-1 flex items-center">
                      {taskDate ? (
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-medium border shadow-xs transition",
                            isDone
                              ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700"
                              : isOverdue
                              ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                              : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-800/40"
                          )}
                        >
                          {task.priority !== "none" && (
                            <Flag
                              className={cn(
                                "h-3 w-3",
                                pConfig.fill,
                                pConfig.color
                              )}
                            />
                          )}
                          <Calendar className="h-3 w-3" />
                          <span>Дедлайн: {formatDueDate(task.dueDate)}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">
                          Без встановленого дедлайну
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

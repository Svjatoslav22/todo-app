"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Flag,
  CheckCircle2,
} from "lucide-react";
import { PRIORITY_CONFIG } from "@/components/ui/PrioritySelect";
import { cn } from "@/lib/utils";

const MONTHS = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export default function CalendarView({
  tasks = [],
  onSelectTask,
  onCreateOnDate,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("month"); // 'month' | 'week'

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  function prevPeriod() {
    if (viewType === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const prev = new Date(currentDate);
      prev.setDate(prev.getDate() - 7);
      setCurrentDate(prev);
    }
  }

  function nextPeriod() {
    if (viewType === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const next = new Date(currentDate);
      next.setDate(next.getDate() + 7);
      setCurrentDate(next);
    }
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  // Days matrix for Month view
  const monthDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const startOffset = (firstDayIndex + 6) % 7; // Monday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Previous month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDays; d++) {
      days.push({
        date: new Date(year, month, d),
        isCurrentMonth: true,
      });
    }

    // Next month padding to reach 35 or 42 cells
    const remaining = 35 - days.length;
    for (let d = 1; d <= (remaining > 0 ? remaining : 42 - days.length); d++) {
      days.push({
        date: new Date(year, month + 1, d),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month]);

  // Week days matrix
  const weekDays = useMemo(() => {
    const curr = new Date(currentDate);
    const dayOfWeek = (curr.getDay() + 6) % 7; // Monday = 0
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push({ date: d, isCurrentMonth: d.getMonth() === month });
    }
    return days;
  }, [currentDate, month]);

  const daysToRender = viewType === "month" ? monthDays : weekDays;

  const isToday = (d) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-950/70 p-4 shadow-sm backdrop-blur-2xl space-y-4">
      {/* Calendar Header Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
            {MONTHS[month]} {year}
          </h2>
          <div className="flex items-center gap-1 ml-2">
            <button
              type="button"
              onClick={prevPeriod}
              className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Попередній"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Сьогодні
            </button>
            <button
              type="button"
              onClick={nextPeriod}
              className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Наступний"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Switcher: Month / Week */}
        <div className="flex items-center rounded-xl bg-zinc-100/80 dark:bg-zinc-900/80 p-0.5 border border-zinc-200/60 dark:border-white/5 text-xs font-medium">
          <button
            type="button"
            onClick={() => setViewType("month")}
            className={cn(
              "rounded-lg px-2.5 py-1 transition",
              viewType === "month"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            Місяць
          </button>
          <button
            type="button"
            onClick={() => setViewType("week")}
            className={cn(
              "rounded-lg px-2.5 py-1 transition",
              viewType === "week"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs font-bold"
                : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
            )}
          >
            Тиждень
          </button>
        </div>
      </div>

      {/* Weekdays Header */}
      <div className="grid grid-cols-7 text-center text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 pb-1">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1">
            {w}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div
        className={cn(
          "grid grid-cols-7 gap-1.5 sm:gap-2",
          viewType === "month" ? "auto-rows-fr" : "h-96"
        )}
      >
        {daysToRender.map(({ date, isCurrentMonth }, index) => {
          const dateStr = date.toDateString();
          const dayTasks = tasks.filter((t) => {
            if (!t.dueDate) return false;
            return new Date(t.dueDate).toDateString() === dateStr;
          });

          const today = isToday(date);

          return (
            <div
              key={`${dateStr}-${index}`}
              onClick={() => onCreateOnDate(date)}
              className={cn(
                "group relative flex flex-col justify-between rounded-2xl border p-2 transition cursor-pointer select-none min-h-[90px] sm:min-h-[110px]",
                today
                  ? "border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30"
                  : isCurrentMonth
                  ? "border-zinc-200/70 dark:border-white/5 bg-zinc-50/40 dark:bg-zinc-900/30 hover:border-zinc-300 dark:hover:border-white/10"
                  : "border-transparent bg-transparent opacity-40 hover:opacity-70"
              )}
            >
              {/* Day Number Header */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold",
                    today
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-zinc-700 dark:text-zinc-300"
                  )}
                >
                  {date.getDate()}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateOnDate(date);
                  }}
                  className="opacity-0 group-hover:opacity-100 rounded-md p-0.5 text-zinc-400 hover:text-indigo-600 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 transition"
                  title="Додати завдання на цю дату"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Tasks List inside Day */}
              <div className="flex-1 space-y-1 mt-1 overflow-y-auto max-h-20 no-scrollbar">
                {dayTasks.slice(0, 3).map((task) => {
                  const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.none;
                  const isDone = task.status === "done";

                  return (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTask(task);
                      }}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium transition truncate shadow-xs",
                        isDone
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 line-through"
                          : "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-white/10 hover:border-indigo-500"
                      )}
                      title={task.title}
                    >
                      {task.priority !== "none" && (
                        <Flag
                          className={cn(
                            "h-2.5 w-2.5 shrink-0",
                            pConfig.fill,
                            pConfig.color
                          )}
                        />
                      )}
                      {isDone && (
                        <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500 shrink-0" />
                      )}
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <p className="text-[9px] font-bold text-zinc-400 px-1">
                    +{dayTasks.length - 3} ще...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

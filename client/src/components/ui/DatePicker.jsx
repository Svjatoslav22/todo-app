"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunrise,
  CalendarDays,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
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

const WEEKDAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

export function formatDueDate(dateInput) {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Сьогодні";
  if (diffDays === 1) return "Завтра";
  if (diffDays === -1) return "Вчора";
  if (diffDays > 1 && diffDays < 7) {
    return date.toLocaleDateString("uk-UA", { weekday: "short" });
  }

  return date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Дедлайн",
  size = "md",
  className,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedDate = value ? new Date(value) : null;
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || new Date()
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Calendar matrix calculation
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    // In Ukrainian calendar, Monday is 0
    const startOffset = (firstDayIndex + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [year, month]);

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  function handleSelectDate(d) {
    if (!d) return;
    d.setHours(20, 0, 0, 0);
    onChange(d.toISOString());
    setIsOpen(false);
  }

  function handleQuickSelect(type) {
    const now = new Date();
    if (type === "today") {
      now.setHours(20, 0, 0, 0);
      onChange(now.toISOString());
    } else if (type === "tomorrow") {
      now.setDate(now.getDate() + 1);
      now.setHours(20, 0, 0, 0);
      onChange(now.toISOString());
    } else if (type === "nextWeek") {
      now.setDate(now.getDate() + 7);
      now.setHours(20, 0, 0, 0);
      onChange(now.toISOString());
    } else if (type === "clear") {
      onChange(null);
    }
    setIsOpen(false);
  }

  const isToday = (d) => {
    if (!d) return false;
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (d) => {
    if (!d || !selectedDate) return false;
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  const sizes = {
    sm: "px-2 py-1 text-xs rounded-lg gap-1.5 h-7",
    md: "px-2.5 py-1.5 text-xs font-medium rounded-xl gap-2 h-8",
    lg: "px-3 py-2 text-sm rounded-xl gap-2.5 h-10",
  };

  const formattedLabel = formatDueDate(value);

  return (
    <div ref={containerRef} className={cn("relative inline-block text-left", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 shadow-xs backdrop-blur-md transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 select-none",
          formattedLabel &&
            "border-indigo-200/80 dark:border-indigo-800/50 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold",
          sizes[size]
        )}
      >
        <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
        <span>{formattedLabel || placeholder}</span>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange(null);
            }}
            className="hover:text-rose-500 rounded p-0.5 ml-0.5"
            title="Очистити дату"
          >
            <X className="h-3 w-3" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 z-50 mt-1.5 w-72 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-3.5 shadow-2xl backdrop-blur-2xl"
          >
            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-1.5 pb-3 border-b border-zinc-200/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => handleQuickSelect("today")}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                <span>Сьогодні</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("tomorrow")}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Sunrise className="h-3.5 w-3.5 text-orange-500" />
                <span>Завтра</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("nextWeek")}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <CalendarDays className="h-3.5 w-3.5 text-indigo-500" />
                <span>Наст. тиждень</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickSelect("clear")}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              >
                <X className="h-3.5 w-3.5" />
                <span>Без дати</span>
              </button>
            </div>

            {/* Month Header Navigation */}
            <div className="flex items-center justify-between py-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                {MONTH_NAMES[month]} {year}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevMonth}
                  className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={nextMonth}
                  className="rounded-lg p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-zinc-400 mb-1">
              {WEEKDAY_NAMES.map((name) => (
                <div key={name} className="py-1">
                  {name}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((d, index) => {
                if (!d) return <div key={`empty-${index}`} />;
                const active = isSelected(d);
                const current = isToday(d);

                return (
                  <button
                    key={d.toISOString()}
                    type="button"
                    onClick={() => handleSelectDate(d)}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition select-none mx-auto",
                      active
                        ? "bg-indigo-600 text-white font-bold shadow-xs"
                        : current
                        ? "border border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    )}
                  >
                    {d.getDate()}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

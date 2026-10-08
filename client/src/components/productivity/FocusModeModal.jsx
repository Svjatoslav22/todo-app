"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  X,
  Volume2,
  Coffee,
  Brain,
  Target,
} from "lucide-react";
import Button from "@/components/ui/Button";
import { playCompletionChime, playStartTick } from "@/lib/sound";
import { triggerConfetti } from "@/lib/celebrate";
import { recordFocusMinutes } from "@/lib/productivity";
import { cn } from "@/lib/utils";

const MODES = {
  focus: {
    id: "focus",
    name: "Фокус",
    minutes: 25,
    seconds: 25 * 60,
    color: "from-indigo-500 to-purple-600",
    strokeColor: "#6366f1",
    icon: Brain,
  },
  shortBreak: {
    id: "shortBreak",
    name: "Перерва",
    minutes: 5,
    seconds: 5 * 60,
    color: "from-emerald-500 to-teal-600",
    strokeColor: "#10b981",
    icon: Coffee,
  },
  longBreak: {
    id: "longBreak",
    name: "Відпочинок",
    minutes: 15,
    seconds: 15 * 60,
    color: "from-blue-500 to-cyan-600",
    strokeColor: "#0ea5e9",
    icon: Target,
  },
};

export default function FocusModeModal({
  isOpen,
  onClose,
  tasks = [],
  onCompleteTask,
}) {
  const [currentMode, setCurrentMode] = useState("focus");
  const [timeLeft, setTimeLeft] = useState(MODES.focus.seconds);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const timerRef = useRef(null);

  const activeModeConfig = MODES[currentMode];
  const activeTasks = tasks.filter((t) => t.status !== "done" && !t.isArchived && !t.isDeleted);
  const focusedTask = activeTasks.find((t) => t.id === selectedTaskId);

  // Switch mode
  function handleModeChange(modeKey) {
    setIsRunning(false);
    setCurrentMode(modeKey);
    setTimeLeft(MODES[modeKey].seconds);
  }

  // Toggle start / pause
  function handleTogglePlay() {
    if (!isRunning) {
      playStartTick();
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  }

  // Reset timer
  function handleReset() {
    setIsRunning(false);
    setTimeLeft(activeModeConfig.seconds);
  }

  // Skip to next mode
  function handleSkip() {
    setIsRunning(false);
    if (currentMode === "focus") {
      handleModeChange("shortBreak");
    } else {
      handleModeChange("focus");
    }
  }

  // Timer interval loop
  useEffect(() => {
    if (!isRunning) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsRunning(false);
          playCompletionChime();

          if (currentMode === "focus") {
            triggerConfetti();
            recordFocusMinutes(MODES.focus.minutes);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, currentMode]);

  // Handle task completion from focus modal
  function handleMarkTaskCompleted() {
    if (!focusedTask) return;
    triggerConfetti();
    playCompletionChime();
    onCompleteTask(focusedTask.id);
  }

  // Formatted MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  // Circular SVG calculations
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = timeLeft / activeModeConfig.seconds;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/70 backdrop-blur-lg"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 450, damping: 32 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 text-center select-none"
          >
            {/* Ambient Background Glow */}
            <div
              className={cn(
                "absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500",
                currentMode === "focus"
                  ? "bg-indigo-500"
                  : currentMode === "shortBreak"
                  ? "bg-emerald-500"
                  : "bg-blue-500"
              )}
            />

            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <Timer className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                  Помодоро & Режим фокусу
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="flex items-center justify-center gap-1.5 p-1 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-white/5 max-w-xs mx-auto">
              {Object.values(MODES).map((mode) => {
                const isActive = currentMode === mode.id;
                const Icon = mode.icon;

                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => handleModeChange(mode.id)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition select-none",
                      isActive
                        ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{mode.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Circular Timer Display */}
            <div className="relative flex items-center justify-center py-4">
              <svg className="w-56 h-56 -rotate-90">
                {/* Background circle */}
                <circle
                  cx="112"
                  cy="112"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-zinc-200 dark:text-zinc-800/80 fill-transparent"
                />
                {/* Animated Progress circle */}
                <circle
                  cx="112"
                  cy="112"
                  r={radius}
                  stroke={activeModeConfig.strokeColor}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="fill-transparent transition-all duration-300"
                />
              </svg>

              {/* Centered digits */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-extrabold tracking-tight tabular-nums text-zinc-900 dark:text-zinc-100 font-mono">
                  {formattedTime}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mt-1">
                  {isRunning ? "Триває сесія" : "На паузі"}
                </span>
              </div>
            </div>

            {/* Controls (Play/Pause, Reset, Skip) */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleReset}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                title="Скинути таймер"
              >
                <RotateCcw className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-transform active:scale-95",
                  activeModeConfig.id === "focus"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500"
                    : activeModeConfig.id === "shortBreak"
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30 hover:from-emerald-500 hover:to-teal-500"
                    : "bg-gradient-to-r from-blue-600 to-cyan-600 shadow-blue-500/30 hover:from-blue-500 hover:to-cyan-500"
                )}
                title={isRunning ? "Пауза" : "Старт"}
              >
                {isRunning ? (
                  <Pause className="h-6 w-6 fill-current" />
                ) : (
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-3 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition"
                title="Перейти далі"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            </div>

            {/* Task Focus Association */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 space-y-2 text-left">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Завдання для фокусу:
              </label>

              {activeTasks.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">
                  Немає активних завдань. Створіть завдання для фокусування.
                </p>
              ) : (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <select
                    value={selectedTaskId}
                    onChange={(e) => setSelectedTaskId(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-200/80 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800/80 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30"
                  >
                    <option value="">— Виберіть завдання зі списку —</option>
                    {activeTasks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                  </select>

                  {focusedTask && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleMarkTaskCompleted}
                      leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                      className="shrink-0"
                    >
                      Виконано
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

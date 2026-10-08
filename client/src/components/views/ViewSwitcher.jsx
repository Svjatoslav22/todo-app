"use client";

import { motion } from "framer-motion";
import { LayoutList, Columns3, Calendar as CalendarIcon, Clock3, Layers } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";
import { cn } from "@/lib/utils";

export const VIEW_MODES = [
  { id: "list", label: "Список", icon: LayoutList },
  { id: "kanban", label: "Дошка", icon: Columns3 },
  { id: "calendar", label: "Календар", icon: CalendarIcon },
  { id: "timeline", label: "Таймлайн", icon: Clock3 },
];

export const GROUP_OPTIONS = [
  { value: "none", label: "Без групування" },
  { value: "status", label: "За статусом" },
  { value: "priority", label: "За пріоритетом" },
  { value: "date", label: "За дедлайном" },
];

export default function ViewSwitcher({
  currentView = "list",
  onViewChange,
  groupBy = "none",
  onGroupByChange,
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-white/5 pb-3">
      {/* View Mode Segmented Tabs */}
      <div className="flex items-center rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-zinc-100/70 dark:bg-zinc-900/60 p-1 shadow-inner backdrop-blur-md">
        {VIEW_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentView === mode.id;

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onViewChange(mode.id)}
              className={cn(
                "relative flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors select-none",
                isActive
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeViewTab"
                  className="absolute inset-0 rounded-xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/60 dark:border-white/10 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className={cn("h-3.5 w-3.5", isActive && "text-indigo-600 dark:text-indigo-400")} />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Grouping Control (Active in List mode) */}
      {currentView === "list" && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 flex items-center gap-1">
            <Layers className="h-3 w-3" />
            <span className="hidden sm:inline">Групування:</span>
          </span>
          <CustomSelect
            value={groupBy}
            onChange={onGroupByChange}
            options={GROUP_OPTIONS}
            size="sm"
          />
        </div>
      )}
    </div>
  );
}

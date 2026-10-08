"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  X,
  Trash2,
  Archive,
  Flag,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import Dropdown from "@/components/ui/Dropdown";

export default function BatchActionBar({
  selectedCount = 0,
  onClearSelection,
  onBatchStatus,
  onBatchPriority,
  onBatchArchive,
  onBatchDelete,
}) {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 450, damping: 35 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 sm:gap-3 rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 px-4 py-2.5 shadow-2xl backdrop-blur-2xl"
        >
          <div className="flex items-center gap-2 pr-2 border-r border-zinc-200/60 dark:border-white/10 text-xs font-semibold text-zinc-900 dark:text-zinc-100">
            <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Вибрано: {selectedCount}</span>
          </div>

          {/* Batch Status */}
          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Статус</span>
              </button>
            }
            items={[
              {
                label: "До виконання",
                icon: <ListTodo className="h-3.5 w-3.5" />,
                onClick: () => onBatchStatus("todo"),
              },
              {
                label: "В процесі",
                icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
                onClick: () => onBatchStatus("in_progress"),
              },
              {
                label: "Виконано",
                icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
                onClick: () => onBatchStatus("done"),
              },
            ]}
          />

          {/* Batch Priority */}
          <Dropdown
            trigger={
              <button
                type="button"
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <Flag className="h-3.5 w-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Пріоритет</span>
              </button>
            }
            items={[
              {
                label: "Терміновий (P1)",
                icon: <Flag className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />,
                onClick: () => onBatchPriority("urgent"),
              },
              {
                label: "Високий (P2)",
                icon: <Flag className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />,
                onClick: () => onBatchPriority("high"),
              },
              {
                label: "Середній (P3)",
                icon: <Flag className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />,
                onClick: () => onBatchPriority("medium"),
              },
              {
                label: "Низький (P4)",
                icon: <Flag className="h-3.5 w-3.5 text-teal-500 fill-teal-500" />,
                onClick: () => onBatchPriority("low"),
              },
              {
                label: "Без пріоритету",
                icon: <Flag className="h-3.5 w-3.5 text-zinc-400" />,
                onClick: () => onBatchPriority("none"),
              },
            ]}
          />

          {/* Batch Archive */}
          <button
            type="button"
            onClick={onBatchArchive}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <Archive className="h-3.5 w-3.5 text-purple-500" />
            <span className="hidden sm:inline">Архівувати</span>
          </button>

          {/* Batch Delete */}
          <button
            type="button"
            onClick={onBatchDelete}
            className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Видалити</span>
          </button>

          {/* Dismiss / Clear Selection */}
          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition ml-1"
            title="Зняти вибір"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

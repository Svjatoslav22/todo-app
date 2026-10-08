"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Sparkles } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
  title = "Завдань не знайдено",
  description = "У вас немає запланованих завдань на цей період. Відпочиньте або створіть нове!",
  actionLabel = "Створити завдання",
  onAction,
  icon,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-zinc-900/30 p-12 text-center backdrop-blur-md my-4"
    >
      <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 shadow-inner">
        <div className="absolute inset-0 rounded-3xl bg-indigo-500/10 blur-xl -z-10" />
        {icon || (
          <CheckCircle2 className="h-10 w-10 text-indigo-500 dark:text-indigo-400 stroke-[1.5]" />
        )}
        <div className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white shadow-md">
          <Sparkles className="h-3 w-3" />
        </div>
      </div>

      <h3 className="text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>

      {onAction && (
        <div className="mt-6">
          <Button
            variant="primary"
            size="sm"
            onClick={onAction}
            leftIcon={<Sparkles className="h-3.5 w-3.5" />}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

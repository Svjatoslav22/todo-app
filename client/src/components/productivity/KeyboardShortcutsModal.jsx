"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import Button from "@/components/ui/Button";

const SHORTCUT_GROUPS = [
  {
    title: "Швидкі команди та відкриття",
    shortcuts: [
      { keys: ["Ctrl", "K"], description: "Відкрити командну палітру (або ⌘K)" },
      { keys: ["N"], description: "Швидке створення нового завдання" },
      { keys: ["P"], description: "Запустити Помодоро-таймер концентрації" },
      { keys: ["D"], description: "Відкрити «Мій день» та аналітику" },
      { keys: ["?"], description: "Показати цю довідку гарячих клавіш" },
    ],
  },
  {
    title: "Перемикання подань",
    shortcuts: [
      { keys: ["1"], description: "Список завдань (List View)" },
      { keys: ["2"], description: "Канбан-дошка (Kanban View)" },
      { keys: ["3"], description: "Календар дедлайнів (Calendar View)" },
      { keys: ["4"], description: "Таймлайн на 14 днів (Timeline View)" },
    ],
  },
  {
    title: "Навігація та керування",
    shortcuts: [
      { keys: ["/"], description: "Фокус на полі пошуку завдань" },
      { keys: ["Esc"], description: "Закрити активне модальне вікно або зняти вибір" },
      { keys: ["↑", "↓"], description: "Навігація елементами у командній палітрі" },
      { keys: ["Enter"], description: "Виконати вибрану дію або зберегти завдання" },
    ],
  },
];

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
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
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 450, damping: 30 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-2xl space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/70 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
                  <Keyboard className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Гарячі клавіші Todo Pro
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Керуйте всім додатком блискавично без миші
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-xl p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Shortcut Groups */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUT_GROUPS.map((group) => (
                <div key={group.title} className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {group.title}
                  </h3>

                  <div className="rounded-xl border border-zinc-200/60 dark:border-white/5 divide-y divide-zinc-100 dark:divide-white/5 bg-zinc-50/50 dark:bg-zinc-950/30">
                    {group.shortcuts.map((sc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                      >
                        <span className="text-zinc-700 dark:text-zinc-300 font-medium">
                          {sc.description}
                        </span>

                        <div className="flex items-center gap-1">
                          {sc.keys.map((k, kIdx) => (
                            <kbd
                              key={kIdx}
                              className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 shadow-xs"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={onClose}>
                Зрозуміло
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

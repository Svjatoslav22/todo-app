"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Timer,
  Sparkles,
  HelpCircle,
  Sun,
  Moon,
  ListTodo,
  Kanban,
  Calendar,
  Layers,
  Inbox,
  Star,
  Archive,
  Trash2,
  CheckCircle2,
  Circle,
  ArrowRight,
  Command,
  ShieldCheck,
} from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { cn } from "@/lib/utils";

function CommandPaletteModal({
  onClose,
  tasks = [],
  onSelectTask,
  onOpenCreateTask,
  onOpenPomodoro,
  onOpenMyDay,
  onOpenShortcuts,
  onSelectList,
  onChangeView,
  isAdmin = false,
  onOpenAdmin,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { resolvedTheme, toggleTheme } = useTheme();

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Static commands list
  const staticActions = [
    {
      id: "create_task",
      title: "Створити нове завдання",
      subtitle: "Відкрити форму додавання завдання",
      category: "Дії",
      icon: Plus,
      shortcut: "N",
      action: () => {
        onClose();
        onOpenCreateTask();
      },
    },
    {
      id: "pomodoro",
      title: "Режим фокусу / Помодоро",
      subtitle: "25-хвилинна сесія глибокої концентрації",
      category: "Дії",
      icon: Timer,
      shortcut: "P",
      action: () => {
        onClose();
        onOpenPomodoro();
      },
    },
    {
      id: "my_day",
      title: "Мій день та продуктивність",
      subtitle: "Стрік активності, прогрес-кільце та досягнення",
      category: "Дії",
      icon: Sparkles,
      shortcut: "D",
      action: () => {
        onClose();
        onOpenMyDay();
      },
    },
    ...(isAdmin && onOpenAdmin
      ? [
          {
            id: "admin_panel",
            title: "Адмін-панель Todo Pro",
            subtitle: "Керування користувачами, аналітика та системні логи",
            category: "Дії",
            icon: ShieldCheck,
            shortcut: "A",
            action: () => {
              onClose();
              onOpenAdmin();
            },
          },
        ]
      : []),
    {
      id: "shortcuts",
      title: "Гарячі клавіші",
      subtitle: "Повний список клавіатурних скорочень",
      category: "Дії",
      icon: HelpCircle,
      shortcut: "?",
      action: () => {
        onClose();
        onOpenShortcuts();
      },
    },
    {
      id: "theme",
      title: resolvedTheme === "dark" ? "Світла тема" : "Темна тема",
      subtitle: "Перемкнути кольорову гаму інтерфейсу",
      category: "Дії",
      icon: resolvedTheme === "dark" ? Sun : Moon,
      shortcut: "T",
      action: () => {
        toggleTheme();
        onClose();
      },
    },
    // Views
    {
      id: "view_list",
      title: "Перейти до Списку (List)",
      subtitle: "Класичне груповане відображення",
      category: "Подання",
      icon: ListTodo,
      shortcut: "1",
      action: () => {
        onChangeView("list");
        onClose();
      },
    },
    {
      id: "view_kanban",
      title: "Перейти до Канбан-дошки (Kanban)",
      subtitle: "Колонки зі зміною статусів через Drag & Drop",
      category: "Подання",
      icon: Kanban,
      shortcut: "2",
      action: () => {
        onChangeView("kanban");
        onClose();
      },
    },
    {
      id: "view_calendar",
      title: "Перейти до Календаря (Calendar)",
      subtitle: "Місячна та тижнева сітка дедлайнів",
      category: "Подання",
      icon: Calendar,
      shortcut: "3",
      action: () => {
        onChangeView("calendar");
        onClose();
      },
    },
    {
      id: "view_timeline",
      title: "Перейти до Таймлайну (Timeline)",
      subtitle: "Горизонтальна шкала термінів на 14 днів",
      category: "Подання",
      icon: Layers,
      shortcut: "4",
      action: () => {
        onChangeView("timeline");
        onClose();
      },
    },
    // Navigation Lists
    {
      id: "list_all",
      title: "Всі завдання",
      subtitle: "Переглянути всі активні справи",
      category: "Навігація",
      icon: Inbox,
      action: () => {
        onSelectList("all");
        onClose();
      },
    },
    {
      id: "list_today",
      title: "Завдання на сьогодні",
      subtitle: "Справи заплановані або створені сьогодні",
      category: "Навігація",
      icon: Sun,
      action: () => {
        onSelectList("today");
        onClose();
      },
    },
    {
      id: "list_upcoming",
      title: "Найближчі завдання",
      subtitle: "Завдання з майбутніми термінами",
      category: "Навігація",
      icon: Calendar,
      action: () => {
        onSelectList("upcoming");
        onClose();
      },
    },
    {
      id: "list_important",
      title: "Важливі завдання",
      subtitle: "Завдання з терміновим або високим пріоритетом",
      category: "Навігація",
      icon: Star,
      action: () => {
        onSelectList("important");
        onClose();
      },
    },
    {
      id: "list_archive",
      title: "Архів",
      subtitle: "Архівовані завдання та проєкти",
      category: "Навігація",
      icon: Archive,
      action: () => {
        onSelectList("archive");
        onClose();
      },
    },
    {
      id: "list_trash",
      title: "Корзина",
      subtitle: "Видалені елементи з можливістю відновлення",
      category: "Навігація",
      icon: Trash2,
      action: () => {
        onSelectList("trash");
        onClose();
      },
    },
  ];

  // Dynamic matching tasks
  const matchingTasks = query.trim()
    ? tasks
        .filter((t) => {
          const q = query.toLowerCase();
          return (
            t.title.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.tags?.some((tag) => tag.name.toLowerCase().includes(q))
          );
        })
        .slice(0, 6)
        .map((task) => ({
          id: `task_${task.id}`,
          title: task.title,
          subtitle: task.description || "Натисніть для перегляду деталей",
          category: "Завдання",
          icon: task.status === "done" ? CheckCircle2 : Circle,
          isTask: true,
          task,
          action: () => {
            onClose();
            onSelectTask(task);
          },
        }))
    : [];

  // Filtered list
  const filteredActions = staticActions.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const allItems = [...matchingTasks, ...filteredActions];

  const allItemsRef = useRef(allItems);
  const selectedIndexRef = useRef(selectedIndex);

  useEffect(() => {
    allItemsRef.current = allItems;
    selectedIndexRef.current = selectedIndex;
  });

  // Handle Keyboard Arrows and Enter
  useEffect(() => {
    function onKeyDown(e) {
      const items = allItemsRef.current;
      const currentIdx = selectedIndexRef.current;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (items.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev === 0 ? Math.max(0, items.length - 1) : prev - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selected = items[currentIdx];
        if (selected) {
          selected.action();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  // Group items by category
  const categories = Array.from(new Set(allItems.map((item) => item.category)));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md"
      />

      {/* Dialog Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -10 }}
        transition={{ type: "spring", stiffness: 450, damping: 30 }}
        className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/95 dark:bg-zinc-900/95 shadow-2xl backdrop-blur-2xl"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-zinc-200/70 dark:border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-indigo-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Введіть команду або знайдіть завдання..."
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
          />
          <div className="flex items-center gap-1.5 shrink-0">
            <kbd className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
              ESC
            </kbd>
          </div>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-3">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-zinc-400">
              Нічого не знайдено за запитом «{query}»
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = allItems.filter(
                (item) => item.category === cat
              );

              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    {cat}
                  </div>

                  {catItems.map((item) => {
                    const globalIndex = allItems.findIndex(
                      (i) => i.id === item.id
                    );
                    const isSelected = globalIndex === selectedIndex;
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                        onClick={item.action}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-3 py-2.5 cursor-pointer transition select-none",
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border",
                              isSelected
                                ? "border-indigo-400/50 bg-indigo-500/40 text-white"
                                : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p
                              className={cn(
                                "text-xs font-semibold truncate",
                                isSelected
                                  ? "text-white"
                                  : "text-zinc-900 dark:text-zinc-100"
                              )}
                            >
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p
                                className={cn(
                                  "text-[11px] truncate",
                                  isSelected
                                    ? "text-indigo-100"
                                    : "text-zinc-400"
                                )}
                              >
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {item.shortcut && (
                            <kbd
                              className={cn(
                                "rounded px-1.5 py-0.5 text-[10px] font-mono",
                                isSelected
                                  ? "bg-indigo-700 text-indigo-100"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                              )}
                            >
                              {item.shortcut}
                            </kbd>
                          )}
                          {isSelected && (
                            <ArrowRight className="h-3.5 w-3.5 text-indigo-200" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200/70 dark:border-white/10 px-4 py-2.5 bg-zinc-50/70 dark:bg-zinc-950/40 text-[11px] text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 font-mono">
                ↑↓
              </kbd>{" "}
              Навігація
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5 font-mono">
                Enter
              </kbd>{" "}
              Вибрати
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Command className="h-3 w-3" />
            <span>Todo Pro Palette</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function CommandPalette({ isOpen, onClose, ...props }) {
  return (
    <AnimatePresence>
      {isOpen && <CommandPaletteModal onClose={onClose} {...props} />}
    </AnimatePresence>
  );
}

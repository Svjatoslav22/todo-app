"use client";

import { Inbox, Sun, Star, Plus, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function MobileNav({
  activeList,
  onSelectList,
  onOpenCreateTask,
  onOpenProfile,
}) {
  const tabs = [
    { id: "all", label: "Всі", icon: Inbox },
    { id: "today", label: "Сьогодні", icon: Sun },
    { id: "create", isAction: true },
    { id: "important", label: "Важливі", icon: Star },
    { id: "profile", label: "Профіль", icon: User },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200/80 dark:border-white/10 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        if (tab.isAction) {
          return (
            <button
              key="action-create"
              type="button"
              onClick={onOpenCreateTask}
              className="flex -mt-5 h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-500/35 active:scale-95 transition"
              aria-label="Створити завдання"
            >
              <Plus className="h-6 w-6 stroke-[2.5]" />
            </button>
          );
        }

        const Icon = tab.icon;
        const isActive = activeList === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === "profile") {
                onOpenProfile?.();
              } else {
                onSelectList(tab.id);
              }
            }}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition text-[10px] font-medium",
              isActive
                ? "text-indigo-600 dark:text-indigo-400 font-bold"
                : "text-zinc-500 dark:text-zinc-400"
            )}
          >
            <Icon className={cn("h-4 w-4", isActive && "stroke-[2.5]")} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

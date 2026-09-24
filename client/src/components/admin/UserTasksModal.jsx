"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  Calendar,
  Flag,
  ListChecks,
  X,
  Tag,
} from "lucide-react";
import api from "@/lib/api";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import { PRIORITY_CONFIG } from "@/components/ui/PrioritySelect";
import { formatDueDate } from "@/components/ui/DatePicker";
import { TaskSkeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";

export default function UserTasksModal({ userId, isOpen, onClose }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", userId, "tasks"],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}/tasks`);
      return res.data;
    },
    enabled: Boolean(userId && isOpen),
  });

  const user = data?.user;
  const tasks = data?.tasks || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? `Завдання користувача ${user.email}` : "Завдання користувача"}
      description={`Режим перегляду (read-only): всього ${tasks.length} завдань`}
      maxWidth="xl"
    >
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2 py-4">
            <TaskSkeleton />
            <TaskSkeleton />
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-12 text-center text-zinc-400 text-xs">
            У цього користувача поки що немає створених завдань
          </div>
        ) : (
          tasks.map((task) => {
            const isDone = task.status === "done";
            const pConfig = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.none;
            const subtasksTotal = task.subtasks?.length || 0;
            const subtasksCompleted =
              task.subtasks?.filter((s) => s.completed).length || 0;

            return (
              <div
                key={task.id}
                className={cn(
                  "rounded-2xl border p-4 transition-all duration-150 backdrop-blur-xl shadow-xs space-y-2",
                  isDone
                    ? "border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-75"
                    : "border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div
                      className={cn(
                        "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-md border",
                        isDone
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-zinc-300 dark:border-zinc-600"
                      )}
                    >
                      {isDone && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </div>
                    <div>
                      <h4
                        className={cn(
                          "text-xs font-bold",
                          isDone
                            ? "line-through text-zinc-400"
                            : "text-zinc-900 dark:text-zinc-100"
                        )}
                      >
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {task.priority !== "none" && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border",
                          pConfig.bg
                        )}
                      >
                        <Flag className={cn("h-3 w-3", pConfig.fill, pConfig.color)} />
                        <span>{pConfig.badgeLabel}</span>
                      </span>
                    )}

                    <Badge
                      variant={
                        task.status === "done"
                          ? "success"
                          : task.status === "in_progress"
                          ? "warning"
                          : "secondary"
                      }
                      size="sm"
                    >
                      {task.status === "done"
                        ? "Виконано"
                        : task.status === "in_progress"
                        ? "В процесі"
                        : "До виконання"}
                    </Badge>
                  </div>
                </div>

                {/* Subtasks and tags */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                  {task.dueDate && (
                    <span className="inline-flex items-center gap-1 font-medium text-indigo-500">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDueDate(task.dueDate)}</span>
                    </span>
                  )}

                  {subtasksTotal > 0 && (
                    <span className="inline-flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 font-medium">
                      <ListChecks className="h-3 w-3 text-zinc-400" />
                      <span>
                        {subtasksCompleted}/{subtasksTotal} підзадач
                      </span>
                    </span>
                  )}

                  {task.tags?.map((t) => (
                    <span
                      key={t.id || t.name}
                      className="inline-flex items-center gap-0.5 rounded bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 font-medium"
                    >
                      #{t.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}

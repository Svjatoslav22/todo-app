"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  ListTodo,
  MoreVertical,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";
import api, { setAccessToken } from "@/lib/api";
import Sidebar, { SMART_LISTS } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CustomSelect from "@/components/ui/CustomSelect";
import Dropdown from "@/components/ui/Dropdown";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import { TaskSkeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  {
    value: "todo",
    label: "До виконання",
    icon: <ListTodo className="h-3.5 w-3.5 text-zinc-500" />,
  },
  {
    value: "in_progress",
    label: "В процесі",
    icon: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  },
  {
    value: "done",
    label: "Виконано",
    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  },
];

const STATUS_BADGE_VARIANTS = {
  todo: "zinc",
  in_progress: "amber",
  done: "emerald",
};

const STATUS_LABELS = {
  todo: "До виконання",
  in_progress: "В процесі",
  done: "Виконано",
};

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeList, setActiveList] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newStatus, setNewStatus] = useState("todo");

  // Authentication query
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
    retry: false,
  });

  const isAuthenticated = Boolean(meQuery.data);

  // Tasks query
  const tasksQuery = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data } = await api.get("/tasks");
      return data.tasks;
    },
    enabled: isAuthenticated,
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: (payload) => api.post("/tasks", payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsCreateModalOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewStatus("todo");
      toast.success("Завдання додано!", {
        description: `«${res.data?.task?.title}» успішно створено.`,
      });
    },
    onError: (err) => {
      toast.error("Помилка створення", {
        description: err?.response?.data?.message || "Не вдалося додати завдання",
      });
    },
  });

  // Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/tasks/${id}`, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (variables.status) {
        toast.info("Статус оновлено", {
          description: `Завдання переведено в «${STATUS_LABELS[variables.status]}».`,
        });
      }
    },
    onError: (err) => {
      toast.error("Помилка оновлення", {
        description: err?.response?.data?.message || "Не вдалося оновити статус",
      });
    },
  });

  // Delete Task Mutation with Undo
  const deleteTaskMutation = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: (_data, id) => {
      // Find previous task for potential restore
      const deletedTask = tasksQuery.data?.find((t) => t.id === id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });

      if (deletedTask) {
        toast.undoable("Завдання видалено", {
          description: `«${deletedTask.title}» видалено.`,
          duration: 6000,
          onUndo: async () => {
            try {
              await api.post("/tasks", {
                title: deletedTask.title,
                description: deletedTask.description,
              });
              queryClient.invalidateQueries({ queryKey: ["tasks"] });
              toast.success("Завдання відновлено!");
            } catch {
              toast.error("Не вдалося відновити завдання");
            }
          },
        });
      }
    },
    onError: (err) => {
      toast.error("Помилка видалення", {
        description: err?.response?.data?.message || "Не вдалося видалити завдання",
      });
    },
  });

  // Handle unauthorized redirects
  useEffect(() => {
    if (meQuery.isError) {
      setAccessToken(null);
      router.replace("/login");
    }
  }, [meQuery.isError, router]);

  // Global keyboard shortcuts (N for new task)
  useEffect(() => {
    function handleKeyDown(event) {
      if (
        event.key === "n" &&
        !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)
      ) {
        event.preventDefault();
        setIsCreateModalOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore
    } finally {
      setAccessToken(null);
      queryClient.clear();
      toast.info("До зустрічі!", { description: "Ви вийшли з облікового запису." });
      router.push("/login");
    }
  }

  function handleCreateSubmit(e) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTaskMutation.mutate({
      title: newTitle.trim(),
      description: newDescription.trim() || undefined,
      status: newStatus,
    });
  }

  const allTasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  // Filter tasks according to active smart list, status filter, and search query
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      // Search matching
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(query);
        const matchesDesc = task.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // Status pill filter
      if (statusFilter !== "all" && task.status !== statusFilter) {
        return false;
      }

      // Smart lists filter
      if (activeList === "today") {
        const createdDate = new Date(task.createdAt).toDateString();
        const todayDate = new Date().toDateString();
        return createdDate === todayDate;
      }
      if (activeList === "important") {
        return task.status === "in_progress";
      }
      if (activeList === "archive") {
        return task.status === "done";
      }

      return true;
    });
  }, [allTasks, searchQuery, statusFilter, activeList]);

  // Counts for smart lists
  const taskCounts = useMemo(() => {
    const today = new Date().toDateString();
    return {
      all: allTasks.length,
      today: allTasks.filter(
        (t) => new Date(t.createdAt).toDateString() === today
      ).length,
      upcoming: allTasks.filter((t) => t.status === "todo").length,
      important: allTasks.filter((t) => t.status === "in_progress").length,
      archive: allTasks.filter((t) => t.status === "done").length,
      trash: 0,
    };
  }, [allTasks]);

  const completedCount = allTasks.filter((t) => t.status === "done").length;

  const currentListConfig =
    SMART_LISTS.find((l) => l.id === activeList) || {
      label: "Всі завдання",
      icon: ListTodo,
    };

  if (meQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-2xl border-3 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold tracking-wide uppercase text-zinc-500">
            Завантаження простору...
          </p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Collapsible Linear/Notion Sidebar */}
      <Sidebar
        activeList={activeList}
        onSelectList={(listId) => {
          setActiveList(listId);
          setStatusFilter("all");
        }}
        taskCounts={taskCounts}
        user={meQuery.data}
        onLogout={handleLogout}
        onOpenCreateTask={() => setIsCreateModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <Header
          title={currentListConfig.label}
          icon={currentListConfig.icon}
          completedCount={completedCount}
          totalCount={allTasks.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateTask={() => setIsCreateModalOpen(true)}
        />

        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 py-6 space-y-6">
          {/* Quick Create Bar */}
          <div className="relative rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-2 shadow-sm backdrop-blur-xl transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
            <form onSubmit={handleCreateSubmit} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition shrink-0 ml-1"
                title="Розширене створення"
              >
                <Plus className="h-4 w-4" />
              </button>

              <input
                type="text"
                placeholder="Додати нове завдання... Натисніть Enter або 'N'"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="flex-1 bg-transparent px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
              />

              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!newTitle.trim() || createTaskMutation.isPending}
                loading={createTaskMutation.isPending}
              >
                Додати
              </Button>
            </form>
          </div>

          {/* Filters Bar & View Controls */}
          <div className="flex items-center justify-between gap-4 border-b border-zinc-200/60 dark:border-white/5 pb-3">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { value: "all", label: "Всі" },
                { value: "todo", label: "До виконання" },
                { value: "in_progress", label: "В процесі" },
                { value: "done", label: "Виконано" },
              ].map((f) => {
                const isActive = statusFilter === f.value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      "relative rounded-xl px-3 py-1.5 text-xs font-semibold transition-all select-none",
                      isActive
                        ? "text-indigo-600 dark:text-indigo-400"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100/60 dark:hover:bg-zinc-800/60"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeFilterPill"
                        className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      />
                    )}
                    {f.label}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">
              {filteredTasks.length} {filteredTasks.length === 1 ? "завдання" : "завдань"}
            </span>
          </div>

          {/* Tasks List Content */}
          <div className="space-y-2.5">
            {tasksQuery.isLoading ? (
              <div className="space-y-3">
                <TaskSkeleton />
                <TaskSkeleton />
                <TaskSkeleton />
              </div>
            ) : filteredTasks.length === 0 ? (
              <EmptyState
                title={
                  searchQuery
                    ? "Нічого не знайдено за запитом"
                    : activeList === "done"
                    ? "Немає виконаних завдань"
                    : "У списку порожньо"
                }
                description={
                  searchQuery
                    ? `За запитом «${searchQuery}» не знайдено жодного завдання.`
                    : "Створіть перше завдання та почніть день продуктивно!"
                }
                actionLabel="Створити перше завдання"
                onAction={() => setIsCreateModalOpen(true)}
              />
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredTasks.map((task) => {
                  const isDone = task.status === "done";
                  return (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
                      transition={{ type: "spring", stiffness: 450, damping: 35 }}
                      className={cn(
                        "group relative flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-150 backdrop-blur-xl shadow-xs",
                        isDone
                          ? "border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-75"
                          : "border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md"
                      )}
                    >
                      {/* Checkbox Quick Action */}
                      <button
                        type="button"
                        onClick={() =>
                          updateTaskMutation.mutate({
                            id: task.id,
                            status: isDone ? "todo" : "done",
                          })
                        }
                        className={cn(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all duration-150 active:scale-90",
                          isDone
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 text-transparent"
                        )}
                        aria-label={isDone ? "Позначити невиконаним" : "Позначити виконаним"}
                      >
                        <Check className="h-3.5 w-3.5 stroke-[3]" />
                      </button>

                      {/* Task Info */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <h3
                            className={cn(
                              "text-sm font-semibold tracking-tight transition-all",
                              isDone
                                ? "line-through text-zinc-400 dark:text-zinc-500"
                                : "text-zinc-900 dark:text-zinc-100"
                            )}
                          >
                            {task.title}
                          </h3>

                          {/* Custom Status Badge / Dropdown */}
                          <div className="shrink-0 flex items-center gap-2">
                            <CustomSelect
                              value={task.status}
                              onChange={(nextStatus) =>
                                updateTaskMutation.mutate({
                                  id: task.id,
                                  status: nextStatus,
                                })
                              }
                              options={STATUS_OPTIONS}
                              size="sm"
                              className="hidden sm:inline-block"
                            />

                            <Badge
                              variant={STATUS_BADGE_VARIANTS[task.status]}
                              dot
                              className="sm:hidden"
                            >
                              {STATUS_LABELS[task.status]}
                            </Badge>

                            {/* Dropdown Actions */}
                            <Dropdown
                              trigger={
                                <button
                                  type="button"
                                  className="rounded-lg p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition opacity-80 group-hover:opacity-100"
                                  aria-label="Опції"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              }
                              items={[
                                {
                                  label: "До виконання",
                                  icon: <ListTodo className="h-3.5 w-3.5" />,
                                  onClick: () =>
                                    updateTaskMutation.mutate({
                                      id: task.id,
                                      status: "todo",
                                    }),
                                },
                                {
                                  label: "В процесі",
                                  icon: <Clock className="h-3.5 w-3.5" />,
                                  onClick: () =>
                                    updateTaskMutation.mutate({
                                      id: task.id,
                                      status: "in_progress",
                                    }),
                                },
                                {
                                  label: "Виконано",
                                  icon: <CheckCircle2 className="h-3.5 w-3.5" />,
                                  onClick: () =>
                                    updateTaskMutation.mutate({
                                      id: task.id,
                                      status: "done",
                                    }),
                                },
                                { type: "divider" },
                                {
                                  label: "Видалити",
                                  icon: <Trash2 className="h-3.5 w-3.5" />,
                                  danger: true,
                                  onClick: () => deleteTaskMutation.mutate(task.id),
                                },
                              ]}
                            />
                          </div>
                        </div>

                        {task.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-line leading-relaxed pr-6">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 pt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(task.createdAt).toLocaleDateString("uk-UA", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      {/* Adaptive Mobile Bottom Navigation */}
      <MobileNav
        activeList={activeList}
        onSelectList={(listId) => {
          setActiveList(listId);
          setStatusFilter("all");
        }}
        onOpenCreateTask={() => setIsCreateModalOpen(true)}
        onOpenProfile={handleLogout}
      />

      {/* Modal for Creating New Task */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Нове завдання"
        description="Запишіть деталі задачі для вашого списку справ"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4 mt-2">
          <Input
            label="Назва завдання *"
            placeholder="Наприклад: Підготувати звіт до понеділка"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Опис (необов&apos;язково)
            </label>
            <textarea
              rows={3}
              placeholder="Додайте деталі, посилання або підказки..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none backdrop-blur-md transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Початковий статус
            </label>
            <CustomSelect
              value={newStatus}
              onChange={setNewStatus}
              options={STATUS_OPTIONS}
              className="w-full"
              size="lg"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200/60 dark:border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!newTitle.trim() || createTaskMutation.isPending}
              loading={createTaskMutation.isPending}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Створити завдання
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

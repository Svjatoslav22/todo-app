"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trash2,
  CheckCircle2,
  Clock,
  ListTodo,
  Check,
  Calendar,
  Sparkles,
  Archive,
  ArchiveRestore,
  RotateCcw,
  CheckSquare,
  Square,
  Flag,
  ListChecks,
} from "lucide-react";
import api, { setAccessToken } from "@/lib/api";
import Sidebar, { SMART_LISTS } from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import CustomSelect from "@/components/ui/CustomSelect";
import DatePicker, { formatDueDate } from "@/components/ui/DatePicker";
import PrioritySelect, {
  PRIORITY_CONFIG,
  PRIORITY_OPTIONS,
} from "@/components/ui/PrioritySelect";
import EmptyState from "@/components/ui/EmptyState";
import { TaskSkeleton } from "@/components/ui/Skeleton";
import TaskSlideOver from "@/components/tasks/TaskSlideOver";
import BatchActionBar from "@/components/tasks/BatchActionBar";
import ViewSwitcher from "@/components/views/ViewSwitcher";
import KanbanView from "@/components/views/KanbanView";
import CalendarView from "@/components/views/CalendarView";
import TimelineView from "@/components/views/TimelineView";
import Modal from "@/components/ui/Modal";
import CommandPalette from "@/components/productivity/CommandPalette";
import KeyboardShortcutsModal from "@/components/productivity/KeyboardShortcutsModal";
import FocusModeModal from "@/components/productivity/FocusModeModal";
import MyDayModal from "@/components/productivity/MyDayModal";
import { useToast } from "@/providers/ToastProvider";
import { parseNaturalLanguageTask } from "@/lib/taskParser";
import { triggerConfetti } from "@/lib/celebrate";
import { recordTaskCompletion } from "@/lib/productivity";
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
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Views & Grouping state with lazy persistence initialization
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("todo-view-mode") || "list";
    }
    return "list";
  });

  const [groupBy, setGroupBy] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("todo-group-by") || "none";
    }
    return "none";
  });

  function handleViewModeChange(mode) {
    setViewMode(mode);
    localStorage.setItem("todo-view-mode", mode);
  }

  function handleGroupByChange(group) {
    setGroupBy(group);
    localStorage.setItem("todo-group-by", group);
  }

  // SlideOver task details state
  const [selectedTask, setSelectedTask] = useState(null);

  // Multi-selection state
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Smart Input & Natural Language State
  const [quickInput, setQuickInput] = useState("");
  const inputRef = useRef(null);

  // Create Task Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalDescription, setModalDescription] = useState("");
  const [modalPriority, setModalPriority] = useState("none");
  const [modalDueDate, setModalDueDate] = useState(null);
  const [modalStatus, setModalStatus] = useState("todo");
  const [modalTags, setModalTags] = useState("");

  // Productivity Modals State
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [isMyDayOpen, setIsMyDayOpen] = useState(false);

  // Live parsed natural language elements
  const parsedPreview = useMemo(() => {
    return parseNaturalLanguageTask(quickInput);
  }, [quickInput]);

  // Auth Query
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
    retry: false,
  });

  const isAuthenticated = Boolean(meQuery.data);

  // Tasks Query
  const isTrashView = activeList === "trash";
  const isArchiveView = activeList === "archive";

  const tasksQuery = useQuery({
    queryKey: ["tasks", activeList],
    queryFn: async () => {
      const params = {};
      if (isTrashView) {
        params.isDeleted = "true";
      } else if (isArchiveView) {
        params.isArchived = "true";
      } else {
        params.isArchived = "false";
      }
      const { data } = await api.get("/tasks", { params });
      return data.tasks;
    },
    enabled: isAuthenticated,
  });

  const allTasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data]);

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (payload) => api.post("/tasks", payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setQuickInput("");
      setIsCreateModalOpen(false);
      resetModalForm();
      toast.success("Завдання додано!", {
        description: `«${res.data?.task?.title}» створено.`,
      });
    },
    onError: (err) => {
      toast.error("Помилка створення", {
        description: err?.response?.data?.message || "Не вдалося додати завдання",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, ...data }) => api.put(`/tasks/${id}`, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (selectedTask?.id === variables.id) {
        setSelectedTask(res.data.task);
      }
      if (variables.status) {
        if (variables.status === "done") {
          triggerConfetti();
          recordTaskCompletion();
        }
        toast.info("Статус оновлено", {
          description: `Завдання переведено в «${STATUS_LABELS[variables.status]}».`,
        });
      }
    },
    onError: (err) => {
      toast.error("Помилка оновлення", {
        description: err?.response?.data?.message || "Не вдалося оновити дані",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: (_data, id) => {
      const deletedTask = allTasks.find((t) => t.id === id);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (selectedTask?.id === id) {
        setSelectedTask(null);
      }

      if (deletedTask && !isTrashView) {
        toast.undoable("Завдання переміщено в корзину", {
          description: `«${deletedTask.title}» у корзині.`,
          duration: 6000,
          onUndo: async () => {
            try {
              await api.post(`/tasks/${id}/restore`);
              queryClient.invalidateQueries({ queryKey: ["tasks"] });
              toast.success("Завдання відновлено!");
            } catch {
              toast.error("Не вдалося відновити завдання");
            }
          },
        });
      } else {
        toast.success("Завдання остаточно видалено");
      }
    },
  });

  const restoreTaskMutation = useMutation({
    mutationFn: (id) => api.post(`/tasks/${id}/restore`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Завдання відновлено з корзини!");
    },
  });

  const batchActionMutation = useMutation({
    mutationFn: (payload) => api.post("/tasks/batch", payload),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      const count = variables.taskIds.length;
      setSelectedTaskIds([]);

      if (variables.action === "status" && variables.value === "done") {
        triggerConfetti();
        for (let i = 0; i < count; i++) {
          recordTaskCompletion();
        }
      }

      toast.undoable(`Дію застосовано до ${count} завдань`, {
        description: "Ви можете скасувати останню масову зміну.",
        duration: 6000,
        onUndo: () => {
          queryClient.invalidateQueries({ queryKey: ["tasks"] });
          toast.info("Оновлення списку скасовано");
        },
      });
    },
  });

  function resetModalForm() {
    setModalTitle("");
    setModalDescription("");
    setModalPriority("none");
    setModalDueDate(null);
    setModalStatus("todo");
    setModalTags("");
  }

  // Handle unauthorized redirects
  useEffect(() => {
    if (meQuery.isError) {
      setAccessToken(null);
      router.replace("/login");
    }
  }, [meQuery.isError, router]);

  // Global shortcuts
  useEffect(() => {
    function handleKeyDown(event) {
      const activeTag = document.activeElement?.tagName;
      const isInputActive =
        ["INPUT", "TEXTAREA", "SELECT"].includes(activeTag) ||
        document.activeElement?.isContentEditable;

      // Ctrl+K or Cmd+K: Command Palette
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // If user is currently typing in an input/textarea, do not intercept single-key shortcuts
      if (isInputActive) return;

      if (event.key === "?") {
        event.preventDefault();
        setIsShortcutsOpen(true);
      } else if (event.key.toLowerCase() === "p") {
        event.preventDefault();
        setIsPomodoroOpen(true);
      } else if (event.key.toLowerCase() === "d") {
        event.preventDefault();
        setIsMyDayOpen(true);
      } else if (event.key === "1") {
        event.preventDefault();
        handleViewModeChange("list");
      } else if (event.key === "2") {
        event.preventDefault();
        handleViewModeChange("kanban");
      } else if (event.key === "3") {
        event.preventDefault();
        handleViewModeChange("calendar");
      } else if (event.key === "4") {
        event.preventDefault();
        handleViewModeChange("timeline");
      } else if (event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
      } else if (event.key === "n" || event.key === "N") {
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

  // Handle Natural Language Quick Create Submission
  function handleQuickSubmit(e) {
    e.preventDefault();
    const { cleanTitle, priority, dueDate, tags } = parsedPreview;
    if (!cleanTitle) return;

    createTaskMutation.mutate({
      title: cleanTitle,
      priority,
      dueDate: dueDate ? dueDate.toISOString() : null,
      tags: tags.map((t) => ({ name: t, color: "indigo" })),
    });
  }

  // Handle Modal Form Submission
  function handleModalSubmit(e) {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const parsedTags = modalTags
      ? modalTags
          .split(",")
          .map((t) => t.trim().replace(/^#/, ""))
          .filter(Boolean)
          .map((name) => ({ name, color: "indigo" }))
      : [];

    createTaskMutation.mutate({
      title: modalTitle.trim(),
      description: modalDescription.trim() || undefined,
      priority: modalPriority,
      dueDate: modalDueDate,
      status: modalStatus,
      tags: parsedTags,
    });
  }

  function handleOpenCreateWithStatus(colStatus) {
    setModalStatus(colStatus);
    setIsCreateModalOpen(true);
  }

  function handleOpenCreateWithDate(targetDate) {
    setModalDueDate(targetDate.toISOString());
    setIsCreateModalOpen(true);
  }

  // Toggle single item selection
  function handleToggleSelect(id, e) {
    e?.stopPropagation();
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  // Select all visible tasks
  function handleSelectAll() {
    if (selectedTaskIds.length === filteredTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    }
  }

  // Filter tasks based on active smart list, filters, and search
  const filteredTasks = allTasks.filter((task) => {
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDesc = task.description?.toLowerCase().includes(query);
      const matchesTag = task.tags?.some((t) =>
        t.name.toLowerCase().includes(query)
      );
      if (!matchesTitle && !matchesDesc && !matchesTag) return false;
    }

    // Status filter
    if (statusFilter !== "all" && task.status !== statusFilter) {
      return false;
    }

    // Priority filter
    if (priorityFilter !== "all" && task.priority !== priorityFilter) {
      return false;
    }

    // Smart lists
    if (activeList === "today") {
      if (!task.dueDate) {
        const createdDate = new Date(task.createdAt).toDateString();
        return createdDate === new Date().toDateString();
      }
      return new Date(task.dueDate).toDateString() === new Date().toDateString();
    }
    if (activeList === "upcoming") {
      if (task.dueDate) {
        return new Date(task.dueDate) >= new Date();
      }
      return task.status === "todo";
    }
    if (activeList === "important") {
      return task.priority === "urgent" || task.priority === "high";
    }

    return true;
  });

  // Grouped tasks calculation for List View
  const groupedTasks = useMemo(() => {
    if (groupBy === "none") {
      return [{ id: "all", title: null, tasks: filteredTasks }];
    }

    if (groupBy === "status") {
      return [
        {
          id: "todo",
          title: "До виконання",
          tasks: filteredTasks.filter((t) => t.status === "todo"),
        },
        {
          id: "in_progress",
          title: "В процесі",
          tasks: filteredTasks.filter((t) => t.status === "in_progress"),
        },
        {
          id: "done",
          title: "Виконано",
          tasks: filteredTasks.filter((t) => t.status === "done"),
        },
      ].filter((g) => g.tasks.length > 0);
    }

    if (groupBy === "priority") {
      return [
        {
          id: "urgent",
          title: "Термінові (P1)",
          tasks: filteredTasks.filter((t) => t.priority === "urgent"),
        },
        {
          id: "high",
          title: "Високий (P2)",
          tasks: filteredTasks.filter((t) => t.priority === "high"),
        },
        {
          id: "medium",
          title: "Середній (P3)",
          tasks: filteredTasks.filter((t) => t.priority === "medium"),
        },
        {
          id: "low",
          title: "Низький (P4)",
          tasks: filteredTasks.filter((t) => t.priority === "low"),
        },
        {
          id: "none",
          title: "Без пріоритету",
          tasks: filteredTasks.filter((t) => t.priority === "none"),
        },
      ].filter((g) => g.tasks.length > 0);
    }

    if (groupBy === "date") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const overdue = [];
      const todayTasks = [];
      const tomorrowTasks = [];
      const upcoming = [];
      const noDate = [];

      filteredTasks.forEach((t) => {
        if (!t.dueDate) {
          noDate.push(t);
          return;
        }
        const d = new Date(t.dueDate);
        d.setHours(0, 0, 0, 0);
        const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));

        if (diff < 0 && t.status !== "done") overdue.push(t);
        else if (diff === 0) todayTasks.push(t);
        else if (diff === 1) tomorrowTasks.push(t);
        else upcoming.push(t);
      });

      return [
        { id: "overdue", title: "Прострочені", tasks: overdue },
        { id: "today", title: "Сьогодні", tasks: todayTasks },
        { id: "tomorrow", title: "Завтра", tasks: tomorrowTasks },
        { id: "upcoming", title: "Найближчим часом", tasks: upcoming },
        { id: "noDate", title: "Без дедлайну", tasks: noDate },
      ].filter((g) => g.tasks.length > 0);
    }

    return [{ id: "all", title: null, tasks: filteredTasks }];
  }, [filteredTasks, groupBy]);

  // Counts for smart lists
  const taskCounts = useMemo(() => {
    const todayStr = new Date().toDateString();
    return {
      all: allTasks.filter((t) => !t.isArchived && !t.isDeleted).length,
      today: allTasks.filter((t) => {
        if (t.isArchived || t.isDeleted) return false;
        if (t.dueDate) return new Date(t.dueDate).toDateString() === todayStr;
        return new Date(t.createdAt).toDateString() === todayStr;
      }).length,
      upcoming: allTasks.filter(
        (t) => !t.isArchived && !t.isDeleted && t.status === "todo"
      ).length,
      important: allTasks.filter(
        (t) =>
          !t.isArchived &&
          !t.isDeleted &&
          (t.priority === "urgent" || t.priority === "high")
      ).length,
      archive: allTasks.filter((t) => t.isArchived && !t.isDeleted).length,
      trash: allTasks.filter((t) => t.isDeleted).length,
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
      {/* Sidebar */}
      <Sidebar
        activeList={activeList}
        onSelectList={(listId) => {
          setActiveList(listId);
          setStatusFilter("all");
          setSelectedTaskIds([]);
        }}
        taskCounts={taskCounts}
        user={meQuery.data}
        onLogout={handleLogout}
        onOpenCreateTask={() => setIsCreateModalOpen(true)}
        onOpenMyDay={() => setIsMyDayOpen(true)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 md:pb-10">
        <Header
          title={currentListConfig.label}
          icon={currentListConfig.icon}
          completedCount={completedCount}
          totalCount={allTasks.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenCreateTask={() => setIsCreateModalOpen(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenPomodoro={() => setIsPomodoroOpen(true)}
          onOpenMyDay={() => setIsMyDayOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
        />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 space-y-5">
          {/* Quick Smart Input Bar */}
          {!isTrashView && !isArchiveView && (
            <div className="relative rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-2.5 shadow-sm backdrop-blur-xl transition focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <form onSubmit={handleQuickSubmit} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shrink-0 ml-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Швидке створення: наприклад «Підготувати звіт завтра о 10 !високий #робота»..."
                    value={quickInput}
                    onChange={(e) => setQuickInput(e.target.value)}
                    className="flex-1 bg-transparent px-2 py-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none"
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    disabled={!parsedPreview.cleanTitle || createTaskMutation.isPending}
                    loading={createTaskMutation.isPending}
                  >
                    Додати
                  </Button>
                </div>

                {/* Natural language detected badges */}
                {quickInput.trim() && (
                  <div className="flex flex-wrap items-center gap-2 px-2 pt-1 border-t border-zinc-100 dark:border-white/5 text-xs">
                    <span className="text-[11px] font-medium text-zinc-400">
                      Розпізнано:
                    </span>

                    {parsedPreview.priority !== "none" && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 font-medium border border-amber-200/60 dark:border-amber-800/40">
                        <Flag className="h-3 w-3" />
                        {PRIORITY_CONFIG[parsedPreview.priority]?.label}
                      </span>
                    )}

                    {parsedPreview.dueDate && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 font-medium border border-indigo-200/60 dark:border-indigo-800/40">
                        <Calendar className="h-3 w-3" />
                        {formatDueDate(parsedPreview.dueDate)}
                      </span>
                    )}

                    {parsedPreview.tags.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 font-medium border border-purple-200/60 dark:border-purple-800/40"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </form>
            </div>
          )}

          {/* View Mode Switcher & Grouping Controls */}
          <ViewSwitcher
            currentView={viewMode}
            onViewChange={handleViewModeChange}
            groupBy={groupBy}
            onGroupByChange={handleGroupByChange}
          />

          {/* Filters Bar (when in list or kanban) */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200/60 dark:border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                {selectedTaskIds.length > 0 &&
                selectedTaskIds.length === filteredTasks.length ? (
                  <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                <span>Вибрати всі</span>
              </button>

              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

              {/* Status filter tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
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
                        "relative rounded-xl px-2.5 py-1 text-xs font-semibold transition select-none",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeFilterTab"
                          className="absolute inset-0 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/40 -z-10"
                        />
                      )}
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority filter */}
            <div className="flex items-center gap-2">
              <CustomSelect
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={[
                  { value: "all", label: "Всі пріоритети" },
                  ...PRIORITY_OPTIONS,
                ]}
                size="sm"
              />
              <span className="text-xs text-zinc-400 font-medium">
                {filteredTasks.length} завдань
              </span>
            </div>
          </div>

          {/* Main Views Container */}
          {tasksQuery.isLoading ? (
            <div className="space-y-3">
              <TaskSkeleton />
              <TaskSkeleton />
              <TaskSkeleton />
            </div>
          ) : viewMode === "kanban" ? (
            /* Kanban View */
            <KanbanView
              tasks={filteredTasks}
              onSelectTask={setSelectedTask}
              onUpdateStatus={(id, status) =>
                updateTaskMutation.mutate({ id, status })
              }
              onOpenCreateWithStatus={handleOpenCreateWithStatus}
            />
          ) : viewMode === "calendar" ? (
            /* Calendar View */
            <CalendarView
              tasks={filteredTasks}
              onSelectTask={setSelectedTask}
              onCreateOnDate={handleOpenCreateWithDate}
            />
          ) : viewMode === "timeline" ? (
            /* Timeline View */
            <TimelineView
              tasks={filteredTasks}
              onSelectTask={setSelectedTask}
            />
          ) : (
            /* List View (with optional grouping) */
            <div className="space-y-6">
              {filteredTasks.length === 0 ? (
                <EmptyState
                  title={
                    searchQuery
                      ? "Нічого не знайдено"
                      : isTrashView
                      ? "Корзина порожня"
                      : isArchiveView
                      ? "Архів порожній"
                      : "Немає завдань у цьому списку"
                  }
                  description={
                    searchQuery
                      ? `За запитом «${searchQuery}» результатів немає.`
                      : isTrashView
                      ? "Усі видалені завдання зберігаються тут із можливістю відновлення."
                      : isArchiveView
                      ? "Тут зберігаються завершені проєкти та архівовані задачі."
                      : "Створіть перше завдання та почніть день продуктивно!"
                  }
                  actionLabel={!isTrashView && !isArchiveView ? "Створити завдання" : undefined}
                  onAction={
                    !isTrashView && !isArchiveView
                      ? () => setIsCreateModalOpen(true)
                      : undefined
                  }
                />
              ) : (
                groupedTasks.map((group) => (
                  <div key={group.id} className="space-y-2.5">
                    {group.title && (
                      <div className="flex items-center gap-2 px-1 pt-2">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                          {group.title}
                        </h3>
                        <span className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-zinc-500">
                          {group.tasks.length}
                        </span>
                      </div>
                    )}

                    <AnimatePresence mode="popLayout">
                      {group.tasks.map((task) => {
                        const isDone = task.status === "done";
                        const isSelected = selectedTaskIds.includes(task.id);
                        const pConfig =
                          PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.none;
                        const totalSub = task.subtasks?.length || 0;
                        const completedSub =
                          task.subtasks?.filter((s) => s.completed).length || 0;

                        return (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 450, damping: 35 }}
                            onClick={() => setSelectedTask(task)}
                            className={cn(
                              "group relative flex items-start gap-3 rounded-2xl border p-4 transition-all duration-150 backdrop-blur-xl shadow-xs cursor-pointer select-none",
                              isSelected &&
                                "border-indigo-500/80 bg-indigo-50/20 dark:bg-indigo-950/20 ring-1 ring-indigo-500/30",
                              !isSelected && isDone
                                ? "border-zinc-200/50 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/40 opacity-75"
                                : !isSelected &&
                                    "border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-white/20 hover:shadow-md"
                            )}
                          >
                            {/* Selection checkbox */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleSelect(task.id, e)}
                              className={cn(
                                "mt-0.5 rounded-lg p-0.5 transition",
                                isSelected
                                  ? "text-indigo-600 dark:text-indigo-400"
                                  : "text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100"
                              )}
                              aria-label="Вибрати"
                            >
                              {isSelected ? (
                                <CheckSquare className="h-4 w-4" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>

                            {/* Status checkbox */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateTaskMutation.mutate({
                                  id: task.id,
                                  status: isDone ? "todo" : "done",
                                });
                              }}
                              className={cn(
                                "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition duration-150 active:scale-90",
                                isDone
                                  ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                                  : "border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 text-transparent"
                              )}
                              aria-label={isDone ? "Невиконано" : "Виконано"}
                            >
                              <Check className="h-3.5 w-3.5 stroke-[3]" />
                            </button>

                            {/* Info */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-3">
                                <h3
                                  className={cn(
                                    "text-sm font-semibold tracking-tight transition",
                                    isDone
                                      ? "line-through text-zinc-400 dark:text-zinc-500"
                                      : "text-zinc-900 dark:text-zinc-100"
                                  )}
                                >
                                  {task.title}
                                </h3>

                                <div
                                  className="shrink-0 flex items-center gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {task.priority !== "none" && (
                                    <span
                                      className={cn(
                                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold border",
                                        pConfig.bg
                                      )}
                                    >
                                      <Flag
                                        className={cn(
                                          "h-3 w-3",
                                          pConfig.fill,
                                          pConfig.color
                                        )}
                                      />
                                      <span>{pConfig.badgeLabel}</span>
                                    </span>
                                  )}

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
                                </div>
                              </div>

                              {task.description && (
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                                  {task.description}
                                </p>
                              )}

                              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                                {task.dueDate && (
                                  <span className="inline-flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium">
                                    <Calendar className="h-3 w-3 text-indigo-500" />
                                    <span>{formatDueDate(task.dueDate)}</span>
                                  </span>
                                )}

                                {totalSub > 0 && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-zinc-600 dark:text-zinc-300 font-medium">
                                    <ListChecks className="h-3 w-3 text-zinc-400" />
                                    <span>
                                      {completedSub}/{totalSub}
                                    </span>
                                  </span>
                                )}

                                {task.tags?.map((tag) => (
                                  <span
                                    key={tag.id || tag.name}
                                    className="inline-flex items-center gap-0.5 text-indigo-600 dark:text-indigo-400 font-medium bg-indigo-50 dark:bg-indigo-950/40 rounded px-1.5 py-0.5 text-[10px]"
                                  >
                                    #{tag.name}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions on hover */}
                            <div
                              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition shrink-0 ml-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {isTrashView ? (
                                <button
                                  type="button"
                                  onClick={() => restoreTaskMutation.mutate(task.id)}
                                  className="rounded-lg p-1 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
                                  title="Відновити з корзини"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateTaskMutation.mutate({
                                      id: task.id,
                                      isArchived: !task.isArchived,
                                    })
                                  }
                                  className="rounded-lg p-1 text-zinc-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
                                  title={task.isArchived ? "Розархівувати" : "В архів"}
                                >
                                  {task.isArchived ? (
                                    <ArchiveRestore className="h-4 w-4" />
                                  ) : (
                                    <Archive className="h-4 w-4" />
                                  )}
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => deleteTaskMutation.mutate(task.id)}
                                className="rounded-lg p-1 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                                title={isTrashView ? "Очистити остаточно" : "В корзину"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>

      {/* Floating Batch Actions Toolbar */}
      <BatchActionBar
        selectedCount={selectedTaskIds.length}
        onClearSelection={() => setSelectedTaskIds([])}
        onBatchStatus={(status) =>
          batchActionMutation.mutate({
            taskIds: selectedTaskIds,
            action: "status",
            value: status,
          })
        }
        onBatchPriority={(priority) =>
          batchActionMutation.mutate({
            taskIds: selectedTaskIds,
            action: "priority",
            value: priority,
          })
        }
        onBatchArchive={() =>
          batchActionMutation.mutate({
            taskIds: selectedTaskIds,
            action: isArchiveView ? "unarchive" : "archive",
          })
        }
        onBatchDelete={() =>
          batchActionMutation.mutate({
            taskIds: selectedTaskIds,
            action: isTrashView ? "permanentDelete" : "delete",
          })
        }
      />

      {/* SlideOver Detailed Task View */}
      <TaskSlideOver
        key={selectedTask?.id}
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTask(null)}
        onUpdate={(fields) => updateTaskMutation.mutate(fields)}
        onDelete={(id) => deleteTaskMutation.mutate(id)}
        onRestore={(id) => restoreTaskMutation.mutate(id)}
      />

      {/* Full Modal for Task Creation */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetModalForm();
        }}
        title="Нове завдання"
        description="Створіть детальне завдання з дедлайном, пріоритетом та тегами"
        maxWidth="lg"
      >
        <form onSubmit={handleModalSubmit} className="space-y-4 mt-2">
          <Input
            label="Назва завдання *"
            placeholder="Наприклад: Підготувати квартальний звіт для команди"
            value={modalTitle}
            onChange={(e) => setModalTitle(e.target.value)}
            required
            autoFocus
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              Опис / нотатки
            </label>
            <textarea
              rows={3}
              placeholder="Додайте деталі, контекст або посилання..."
              value={modalDescription}
              onChange={(e) => setModalDescription(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 p-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none backdrop-blur-md transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Статус
              </label>
              <CustomSelect
                value={modalStatus}
                onChange={setModalStatus}
                options={STATUS_OPTIONS}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Пріоритет
              </label>
              <PrioritySelect
                value={modalPriority}
                onChange={setModalPriority}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                Дедлайн
              </label>
              <DatePicker
                value={modalDueDate}
                onChange={setModalDueDate}
                className="w-full"
              />
            </div>
          </div>

          <Input
            label="Теги (через кому)"
            placeholder="#проєкт, #робота, #терміново"
            value={modalTags}
            onChange={(e) => setModalTags(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-200/60 dark:border-white/5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetModalForm();
              }}
            >
              Скасувати
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!modalTitle.trim() || createTaskMutation.isPending}
              loading={createTaskMutation.isPending}
              leftIcon={<Sparkles className="h-4 w-4" />}
            >
              Створити завдання
            </Button>
          </div>
        </form>
      </Modal>

      {/* Adaptive Mobile Nav */}
      <MobileNav
        activeList={activeList}
        onSelectList={(listId) => {
          setActiveList(listId);
          setStatusFilter("all");
          setSelectedTaskIds([]);
        }}
        onOpenCreateTask={() => setIsCreateModalOpen(true)}
        onOpenProfile={handleLogout}
      />

      {/* Epic 4: Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tasks={allTasks}
        onSelectTask={setSelectedTask}
        onOpenCreateTask={() => setIsCreateModalOpen(true)}
        onOpenPomodoro={() => setIsPomodoroOpen(true)}
        onOpenMyDay={() => setIsMyDayOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onSelectList={(listId) => {
          setActiveList(listId);
          setStatusFilter("all");
          setSelectedTaskIds([]);
        }}
        onChangeView={handleViewModeChange}
        isAdmin={meQuery.data?.role === "admin"}
        onOpenAdmin={() => router.push("/admin")}
      />

      {/* Epic 4: Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Epic 4: Pomodoro Focus Timer Modal */}
      <FocusModeModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        tasks={allTasks}
        onCompleteTask={(taskId) => {
          updateTaskMutation.mutate({ id: taskId, status: "done" });
        }}
      />

      {/* Epic 4: My Day & Motivation Modal */}
      <MyDayModal
        isOpen={isMyDayOpen}
        onClose={() => setIsMyDayOpen(false)}
        tasks={allTasks}
        userName={meQuery.data?.name || meQuery.data?.email?.split("@")[0] || "Користувач"}
      />
    </div>
  );
}

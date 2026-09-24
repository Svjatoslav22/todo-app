"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Trash2, CheckCircle2, Clock, ListTodo } from "lucide-react";
import api, { setAccessToken } from "@/lib/api";

const FILTERS = [
  { value: "all", label: "Всі" },
  { value: "todo", label: "До виконання" },
  { value: "in_progress", label: "В процесі" },
  { value: "done", label: "Виконано" },
];

const STATUS_LABELS = {
  todo: "До виконання",
  in_progress: "В процесі",
  done: "Виконано",
};

const STATUS_STYLES = {
  todo: "bg-zinc-100 text-zinc-700 border-zinc-200",
  in_progress: "bg-amber-50 text-amber-800 border-amber-200",
  done: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    "Сталася неочікувана помилка. Спробуйте ще раз"
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
    retry: false,
  });

  const isAuthenticated = Boolean(meQuery.data);

  const tasksQuery = useQuery({
    queryKey: ["tasks", status],
    queryFn: async () => {
      const params = status === "all" ? {} : { status };
      const { data } = await api.get("/tasks", { params });
      return data.tasks;
    },
    enabled: isAuthenticated,
  });

  const createTask = useMutation({
    mutationFn: (payload) => api.post("/tasks", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTitle("");
      setDescription("");
    },
  });

  const updateTask = useMutation({
    mutationFn: ({ id, nextStatus }) =>
      api.put(`/tasks/${id}`, { status: nextStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  useEffect(() => {
    if (meQuery.isError) {
      setAccessToken(null);
      router.replace("/login");
    }
  }, [meQuery.isError, router]);

  async function handleLogout() {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore network errors on logout
    } finally {
      setAccessToken(null);
      queryClient.clear();
      router.push("/login");
    }
  }

  function handleCreate(event) {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    createTask.mutate({
      title: trimmedTitle,
      description: description.trim() || undefined,
    });
  }

  if (meQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-900 border-t-transparent" />
          <p className="text-sm font-medium text-zinc-600">Завантаження профілю...</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tasks = tasksQuery.data ?? [];

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-200 bg-white/80 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-sm">
            ✓
          </div>
          <h1 className="text-lg font-bold tracking-tight text-zinc-900">
            Todo Pro
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-zinc-600">
            {meQuery.data?.email}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 hover:text-zinc-900"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        {/* Create Task Form */}
        <form
          onSubmit={handleCreate}
          className="space-y-3.5 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="space-y-1">
            <h2 className="text-base font-semibold text-zinc-900">
              Нове завдання
            </h2>
            <p className="text-xs text-zinc-500">
              Запишіть завдання або ідею для виконання
            </p>
          </div>

          <input
            type="text"
            required
            placeholder="Назва завдання..."
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3.5 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-sm"
          />

          <textarea
            placeholder="Опис завдання (необов'язково)..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-300 px-3.5 py-2 text-zinc-900 placeholder:text-zinc-400 outline-none transition focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 text-sm"
          />

          {createTask.isError ? (
            <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600">
              {getErrorMessage(createTask.error)}
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={createTask.isPending || !title.trim()}
              className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:opacity-60"
            >
              {createTask.isPending ? "Збереження..." : "Додати завдання"}
            </button>
          </div>
        </form>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                status === filter.value
                  ? "bg-zinc-900 text-white shadow-sm"
                  : "border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Global Query / Mutation Errors */}
        {tasksQuery.isError ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {getErrorMessage(tasksQuery.error)}
          </div>
        ) : null}
        {updateTask.isError ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {getErrorMessage(updateTask.error)}
          </div>
        ) : null}
        {deleteTask.isError ? (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {getErrorMessage(deleteTask.error)}
          </div>
        ) : null}

        {/* Task List */}
        {tasksQuery.isLoading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-200 bg-white p-12 text-zinc-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-800 border-t-transparent mb-3" />
            <p className="text-sm">Завантаження списку завдань...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white p-12 text-center text-zinc-500">
            <ListTodo className="h-10 w-10 text-zinc-300 mb-2" />
            <p className="font-medium text-zinc-700">Завдань не знайдено</p>
            <p className="text-xs text-zinc-400 mt-1">
              {status === "all"
                ? "Створіть своє перше завдання за формою вище"
                : "Немає завдань із вибраним статусом"}
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-zinc-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-zinc-900 leading-snug">
                      {task.title}
                    </h3>
                    {task.description ? (
                      <p className="text-sm text-zinc-600 whitespace-pre-line">
                        {task.description}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[task.status]}`}
                  >
                    {task.status === "done" && (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {task.status === "in_progress" && (
                      <Clock className="h-3 w-3" />
                    )}
                    {task.status === "todo" && (
                      <ListTodo className="h-3 w-3" />
                    )}
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Статус:</span>
                    <select
                      value={task.status}
                      disabled={
                        updateTask.isPending &&
                        updateTask.variables?.id === task.id
                      }
                      onChange={(event) =>
                        updateTask.mutate({
                          id: task.id,
                          nextStatus: event.target.value,
                        })
                      }
                      className="rounded-lg border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-800 outline-none transition focus:border-zinc-900 disabled:opacity-60"
                    >
                      {FILTERS.filter((filter) => filter.value !== "all").map(
                        (filter) => (
                          <option key={filter.value} value={filter.value}>
                            {filter.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={
                      deleteTask.isPending &&
                      deleteTask.variables === task.id
                    }
                    onClick={() => deleteTask.mutate(task.id)}
                    className="inline-flex items-center gap-1 rounded-lg p-1.5 text-zinc-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                    aria-label="Видалити завдання"
                    title="Видалити завдання"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

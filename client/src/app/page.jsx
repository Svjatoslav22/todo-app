"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, Trash2 } from "lucide-react";
import api from "@/lib/api";

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
  todo: "bg-zinc-100 text-zinc-700",
  in_progress: "bg-amber-100 text-amber-800",
  done: "bg-emerald-100 text-emerald-800",
};

function getErrorMessage(error) {
  return error?.response?.data?.message;
}

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("all");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [router]);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
    enabled: ready,
    retry: false,
  });

  const tasksQuery = useQuery({
    queryKey: ["tasks", status],
    queryFn: async () => {
      const params = status === "all" ? {} : { status };
      const { data } = await api.get("/tasks", { params });
      return data.tasks;
    },
    enabled: ready,
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
      localStorage.removeItem("token");
      router.replace("/login");
    }
  }, [meQuery.isError, router]);

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  function handleCreate(event) {
    event.preventDefault();
    if (!title) return;

    createTask.mutate({
      title,
      description: description || undefined,
    });
  }

  if (!ready) {
    return null;
  }

  const tasks = tasksQuery.data ?? [];

  return (
    <main className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-zinc-900">TODO</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-600">{meQuery.data?.email}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-800 hover:bg-zinc-100"
          >
            <LogOut className="h-4 w-4" />
            Вийти
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-2xl space-y-6 px-6 py-8">
        <form
          onSubmit={handleCreate}
          className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4"
        >
          <input
            type="text"
            required
            placeholder="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none focus:border-zinc-900"
          />
          {createTask.isError ? (
            <p className="text-sm text-red-600">
              {getErrorMessage(createTask.error)}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={createTask.isPending}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {createTask.isPending ? "Збереження..." : "Додати"}
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setStatus(filter.value)}
              className={`rounded-lg px-3 py-2 text-sm ${
                status === filter.value
                  ? "bg-zinc-900 text-white"
                  : "border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-100"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {tasksQuery.isError ? (
          <p className="text-sm text-red-600">
            {getErrorMessage(tasksQuery.error)}
          </p>
        ) : null}
        {updateTask.isError ? (
          <p className="text-sm text-red-600">
            {getErrorMessage(updateTask.error)}
          </p>
        ) : null}
        {deleteTask.isError ? (
          <p className="text-sm text-red-600">
            {getErrorMessage(deleteTask.error)}
          </p>
        ) : null}

        {tasksQuery.isLoading ? (
          <p className="text-zinc-600">Завантаження...</p>
        ) : tasks.length === 0 ? (
          <p className="text-zinc-600">Завдань ще немає</p>
        ) : (
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li
                key={task.id}
                className="rounded-xl border border-zinc-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-medium text-zinc-900">{task.title}</h2>
                    {task.description ? (
                      <p className="mt-1 text-sm text-zinc-600">
                        {task.description}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-1 text-xs ${STATUS_STYLES[task.status]}`}
                  >
                    {STATUS_LABELS[task.status]}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
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
                    className="rounded-lg border border-zinc-300 bg-white px-2 py-1 text-sm text-zinc-800 disabled:opacity-60"
                  >
                    {FILTERS.filter((filter) => filter.value !== "all").map(
                      (filter) => (
                        <option key={filter.value} value={filter.value}>
                          {filter.label}
                        </option>
                      ),
                    )}
                  </select>

                  <button
                    type="button"
                    disabled={
                      deleteTask.isPending &&
                      deleteTask.variables === task.id
                    }
                    onClick={() => deleteTask.mutate(task.id)}
                    className="rounded-lg p-2 text-zinc-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                    aria-label="Видалити завдання"
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Users,
  BarChart3,
  Activity,
  ArrowLeft,
  RotateCw,
  LogOut,
  Sparkles,
} from "lucide-react";
import api, { setAccessToken } from "@/lib/api";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminUsersTable from "@/components/admin/AdminUsersTable";
import AdminAuditLogs from "@/components/admin/AdminAuditLogs";
import UserTasksModal from "@/components/admin/UserTasksModal";
import { useToast } from "@/providers/ToastProvider";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState("users"); // "users" | "stats" | "logs"
  const [userPage, setUserPage] = useState(1);
  const [logsPage, setLogsPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inspectingUserId, setInspectingUserId] = useState(null);

  // Authenticate current user
  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const { data } = await api.get("/auth/me");
      return data.user;
    },
    retry: false,
  });

  const currentUser = meQuery.data;
  const isAdmin = currentUser?.role === "admin";

  // System Stats Query
  const statsQuery = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data.stats;
    },
    enabled: Boolean(isAdmin),
  });

  // Users List Query
  const usersQuery = useQuery({
    queryKey: ["admin", "users", userPage, search, roleFilter, statusFilter],
    queryFn: async () => {
      const params = { page: userPage, limit: 10 };
      if (search.trim()) params.search = search.trim();
      if (roleFilter !== "all") params.role = roleFilter;
      if (statusFilter !== "all") params.status = statusFilter;

      const { data } = await api.get("/admin/users", { params });
      return data;
    },
    enabled: Boolean(isAdmin),
  });

  // Audit Logs Query
  const logsQuery = useQuery({
    queryKey: ["admin", "logs", logsPage],
    queryFn: async () => {
      const { data } = await api.get("/admin/logs", {
        params: { page: logsPage, limit: 15 },
      });
      return data;
    },
    enabled: Boolean(isAdmin && activeTab === "logs"),
  });

  // Mutations
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
      toast.success("Роль успішно оновлено!", {
        description: res.data?.message,
      });
    },
    onError: (err) => {
      toast.error("Помилка зміни ролі", {
        description: err?.response?.data?.message || "Не вдалося змінити роль",
      });
    },
  });

  const toggleBanMutation = useMutation({
    mutationFn: ({ id, isBanned }) =>
      api.patch(`/admin/users/${id}/ban`, { isBanned }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "logs"] });
      toast.info("Статус користувача оновлено", {
        description: res.data?.message,
      });
    },
    onError: (err) => {
      toast.error("Помилка блокування", {
        description: err?.response?.data?.message || "Не вдалося виконати дію",
      });
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: (id) => api.post(`/admin/users/${id}/impersonate`),
    onSuccess: (res) => {
      const token = res.data?.token || res.data?.accessToken;
      if (token) {
        setAccessToken(token);
        queryClient.clear();
        toast.success("Імперсонація успішна!", {
          description: `Ви увійшли під користувачем ${res.data?.user?.email}.`,
        });
        router.push("/");
      }
    },
    onError: (err) => {
      toast.error("Не вдалося увійти", {
        description: err?.response?.data?.message || "Помилка імперсонації",
      });
    },
  });

  // Loading state
  if (meQuery.isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090a0f]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-2xl border-3 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold tracking-wide uppercase text-zinc-500">
            Перевірка прав доступу...
          </p>
        </div>
      </main>
    );
  }

  // Not logged in or Not an Admin: 403 Forbidden State
  if (!currentUser || !isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#090a0f] p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-3xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/70 p-8 shadow-2xl backdrop-blur-2xl space-y-5"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40 shadow-md shadow-rose-500/20">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
              Доступ 403: Заборонено
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Ця панель призначена виключно для адміністраторів Todo Pro. Ваш
              обліковий запис ({currentUser?.email || "гість"}) не має прав
              доступу до керування системою.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/">
              <Button
                variant="primary"
                className="w-full"
                leftIcon={<ArrowLeft className="h-4 w-4" />}
              >
                Повернутися до моїх завдань
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090a0f] text-slate-900 dark:text-zinc-100 transition-colors duration-200">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200/80 dark:border-white/10 bg-white/75 dark:bg-zinc-950/75 px-4 sm:px-8 backdrop-blur-2xl">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
            >
              До завдань
            </Button>
          </Link>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40 shadow-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Адмін-панель</span>
                <span className="rounded-md bg-purple-100 dark:bg-purple-950/80 px-1.5 py-0.2 text-[10px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  PRO
                </span>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Tooltip content="Оновити дані">
            <button
              type="button"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ["admin"] });
                toast.info("Дані оновлено");
              }}
              className="rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/80 dark:bg-zinc-900/80 p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 shadow-xs transition"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </Tooltip>

          <span className="text-xs font-semibold text-zinc-500 hidden sm:inline">
            {currentUser.email}
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-zinc-200/60 dark:border-white/5 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition select-none",
              activeTab === "users"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            )}
          >
            <Users className="h-4 w-4" />
            <span>Користувачі</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("stats")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition select-none",
              activeTab === "stats"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            )}
          >
            <BarChart3 className="h-4 w-4" />
            <span>Огляд та статистика</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition select-none",
              activeTab === "logs"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
            )}
          >
            <Activity className="h-4 w-4" />
            <span>Журнал подій (Logs)</span>
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "users" ? (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <AdminUsersTable
                users={usersQuery.data?.users || []}
                pagination={usersQuery.data?.pagination || {}}
                currentPage={userPage}
                onPageChange={setUserPage}
                search={search}
                onSearchChange={(val) => {
                  setSearch(val);
                  setUserPage(1);
                }}
                roleFilter={roleFilter}
                onRoleFilterChange={(val) => {
                  setRoleFilter(val);
                  setUserPage(1);
                }}
                statusFilter={statusFilter}
                onStatusFilterChange={(val) => {
                  setStatusFilter(val);
                  setUserPage(1);
                }}
                onInspectTasks={(id) => setInspectingUserId(id)}
                onImpersonate={(id) => impersonateMutation.mutate(id)}
                onUpdateRole={(id, role) =>
                  updateRoleMutation.mutate({ id, role })
                }
                onToggleBan={(id, isBanned) =>
                  toggleBanMutation.mutate({ id, isBanned })
                }
                currentAdminId={currentUser.id}
              />
            </motion.div>
          ) : activeTab === "stats" ? (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <AdminStatsCards stats={statsQuery.data} />
            </motion.div>
          ) : (
            <motion.div
              key="logs"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.15 }}
            >
              <AdminAuditLogs
                logs={logsQuery.data?.logs || []}
                pagination={logsQuery.data?.pagination || {}}
                currentPage={logsPage}
                onPageChange={setLogsPage}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* User Tasks Modal (Read-only inspection) */}
      <UserTasksModal
        userId={inspectingUserId}
        isOpen={Boolean(inspectingUserId)}
        onClose={() => setInspectingUserId(null)}
      />
    </div>
  );
}

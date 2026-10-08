"use client";

import { useState } from "react";
import {
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Eye,
  LogIn,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  UserX,
  UserCheck,
  Calendar,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import CustomSelect from "@/components/ui/CustomSelect";
import Tooltip from "@/components/ui/Tooltip";
import Dropdown from "@/components/ui/Dropdown";
import { cn } from "@/lib/utils";

export default function AdminUsersTable({
  users = [],
  pagination = {},
  currentPage = 1,
  onPageChange,
  search = "",
  onSearchChange,
  roleFilter = "all",
  onRoleFilterChange,
  statusFilter = "all",
  onStatusFilterChange,
  onInspectTasks,
  onImpersonate,
  onUpdateRole,
  onToggleBan,
  currentAdminId,
}) {
  return (
    <div className="space-y-4">
      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Пошук за email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none backdrop-blur-md transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <CustomSelect
            value={roleFilter}
            onChange={onRoleFilterChange}
            options={[
              { value: "all", label: "Всі ролі" },
              { value: "admin", label: "Адміністратори" },
              { value: "user", label: "Користувачі" },
            ]}
            size="sm"
          />

          <CustomSelect
            value={statusFilter}
            onChange={onStatusFilterChange}
            options={[
              { value: "all", label: "Всі статуси" },
              { value: "active", label: "Активні" },
              { value: "banned", label: "Заблоковані" },
            ]}
            size="sm"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 overflow-hidden shadow-xs backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
                <th className="py-3 px-4">Користувач</th>
                <th className="py-3 px-4">Роль</th>
                <th className="py-3 px-4">Завдань</th>
                <th className="py-3 px-4">Статус</th>
                <th className="py-3 px-4">Реєстрація</th>
                <th className="py-3 px-4 text-right">Дії</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Користувачів за вказаними фільтрами не знайдено
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrentAdmin = u.id === currentAdminId;
                  const isBanned = Boolean(u.isBanned);
                  const isAdmin = u.role === "admin";
                  const createdDate = new Date(u.createdAt).toLocaleDateString(
                    "uk-UA",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  );

                  return (
                    <tr
                      key={u.id}
                      className={cn(
                        "hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition select-none",
                        isBanned && "opacity-60 bg-rose-50/20 dark:bg-rose-950/10"
                      )}
                    >
                      {/* User Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar email={u.email} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                                {u.email}
                              </span>
                              {isCurrentAdmin && (
                                <span className="rounded bg-indigo-50 dark:bg-indigo-950/80 px-1 py-0.2 text-[9px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200/50">
                                  Ви
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              ID: #{u.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        {isAdmin ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/40">
                            <ShieldCheck className="h-3 w-3" />
                            Адміністратор
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                            Користувач
                          </span>
                        )}
                      </td>

                      {/* Tasks count */}
                      <td className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300 tabular-nums">
                        {u._count?.tasks ?? 0}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {isBanned ? (
                          <Badge variant="danger" size="sm">
                            Заблокований
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            Активний
                          </Badge>
                        )}
                      </td>

                      {/* Created date */}
                      <td className="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px] whitespace-nowrap">
                        {createdDate}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect tasks */}
                          <Tooltip content="Переглянути завдання">
                            <button
                              type="button"
                              onClick={() => onInspectTasks(u.id)}
                              className="rounded-lg p-1.5 text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </Tooltip>

                          {/* Impersonate */}
                          {!isCurrentAdmin && !isBanned && (
                            <Tooltip content="Увійти як цей користувач">
                              <button
                                type="button"
                                onClick={() => onImpersonate(u.id)}
                                className="rounded-lg p-1.5 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition"
                              >
                                <LogIn className="h-4 w-4" />
                              </button>
                            </Tooltip>
                          )}

                          {/* Toggle role & ban dropdown */}
                          {!isCurrentAdmin && (
                            <Dropdown
                              trigger={
                                <button
                                  type="button"
                                  className="rounded-lg p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              }
                              items={[
                                {
                                  label: isAdmin
                                    ? "Понизити до користувача"
                                    : "Зробити адміністратором",
                                  icon: Shield,
                                  onClick: () =>
                                    onUpdateRole(u.id, isAdmin ? "user" : "admin"),
                                },
                                {
                                  label: isBanned
                                    ? "Розблокувати акаунт"
                                    : "Заблокувати акаунт",
                                  icon: isBanned ? UserCheck : UserX,
                                  variant: isBanned ? "default" : "danger",
                                  onClick: () => onToggleBan(u.id, !isBanned),
                                },
                              ]}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-200/60 dark:border-white/5 px-4 py-3 bg-zinc-50/40 dark:bg-zinc-950/20 text-xs text-zinc-500">
            <div>
              Сторінка {pagination.page} з {pagination.totalPages} (всього{" "}
              {pagination.total} користувачів)
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                leftIcon={<ChevronLeft className="h-3.5 w-3.5" />}
              >
                Назад
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              >
                Вперед
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

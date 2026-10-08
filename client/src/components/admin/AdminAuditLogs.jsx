"use client";

import { Activity, ShieldCheck, ChevronLeft, ChevronRight } from "lucide-react";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const ACTION_CONFIG = {
  USER_LOGIN: { label: "Вхід", color: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
  USER_REGISTER: { label: "Реєстрація", color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
  ROLE_CHANGE: { label: "Зміна ролі", color: "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
  USER_BANNED: { label: "Блокування", color: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800" },
  USER_UNBANNED: { label: "Розблокування", color: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
  ADMIN_IMPERSONATE: { label: "Імперсонація", color: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" },
};

export default function AdminAuditLogs({
  logs = [],
  pagination = {},
  currentPage = 1,
  onPageChange,
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/80 dark:border-white/10 bg-white/70 dark:bg-zinc-900/60 overflow-hidden shadow-xs backdrop-blur-xl">
      <div className="p-4 border-b border-zinc-200/60 dark:border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-500" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
            Системний журнал дій (Audit Log)
          </h3>
        </div>
        <span className="text-xs text-zinc-400">
          Всього записів: {pagination.total || logs.length}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/60 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-950/40 text-zinc-400 uppercase tracking-wider text-[10px] font-bold">
              <th className="py-3 px-4">Подія</th>
              <th className="py-3 px-4">Деталі</th>
              <th className="py-3 px-4">Користувач</th>
              <th className="py-3 px-4">IP-адреса</th>
              <th className="py-3 px-4 text-right">Час</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-zinc-400">
                  Записів у журналі поки що немає
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const conf = ACTION_CONFIG[log.action] || {
                  label: log.action,
                  color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200",
                };
                const timeStr = new Date(log.createdAt).toLocaleString("uk-UA", {
                  day: "2-digit",
                  month: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                });

                return (
                  <tr
                    key={log.id}
                    className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition select-none"
                  >
                    <td className="py-3 px-4">
                      <span
                        className={cn(
                          "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold border",
                          conf.color
                        )}
                      >
                        {conf.label}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                      {log.details || "—"}
                    </td>
                    <td className="py-3 px-4 text-zinc-600 dark:text-zinc-400">
                      {log.user?.email || (log.userId ? `ID: #${log.userId}` : "Система")}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                      {log.ip || "127.0.0.1"}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                      {timeStr}
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
            Сторінка {pagination.page} з {pagination.totalPages}
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
  );
}

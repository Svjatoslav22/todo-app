"use client";

import { cn } from "@/lib/utils";

export default function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-zinc-200/70 dark:bg-zinc-800/60",
        className
      )}
      {...props}
    />
  );
}

export function TaskSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200/70 dark:border-white/5 bg-white/60 dark:bg-zinc-900/40 p-4 space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="h-5 w-5 rounded-lg shrink-0" />
          <Skeleton className="h-4 w-2/3 rounded-md" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-3 w-4/5 rounded-md ml-8" />
      <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/5">
        <Skeleton className="h-6 w-24 rounded-lg" />
        <Skeleton className="h-6 w-6 rounded-lg" />
      </div>
    </div>
  );
}

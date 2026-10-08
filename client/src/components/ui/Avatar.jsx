"use client";

import { cn } from "@/lib/utils";

export default function Avatar({
  email,
  name,
  src,
  size = "md",
  online = true,
  className,
}) {
  const label = name || email || "User";
  const initials = label
    .split("@")[0]
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizes = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  const dotSizes = {
    xs: "h-1.5 w-1.5",
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  };

  return (
    <div className="relative inline-flex shrink-0">
      <div
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-bold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 select-none bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500",
          sizes[size],
          className
        )}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={label}
            className="h-full w-full rounded-xl object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {online && (
        <span
          className={cn(
            "absolute -bottom-0.5 -right-0.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950",
            dotSizes[size]
          )}
        />
      )}
    </div>
  );
}

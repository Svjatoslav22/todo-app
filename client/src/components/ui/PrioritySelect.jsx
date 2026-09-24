"use client";

import { Flag } from "lucide-react";
import CustomSelect from "./CustomSelect";

export const PRIORITY_CONFIG = {
  urgent: {
    label: "Терміновий",
    badgeLabel: "P1",
    color: "text-rose-500",
    fill: "fill-rose-500",
    bg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/80 dark:border-rose-900/40",
  },
  high: {
    label: "Високий",
    badgeLabel: "P2",
    color: "text-amber-500",
    fill: "fill-amber-500",
    bg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200/80 dark:border-amber-900/40",
  },
  medium: {
    label: "Середній",
    badgeLabel: "P3",
    color: "text-indigo-500",
    fill: "fill-indigo-500",
    bg: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-200/80 dark:border-indigo-900/40",
  },
  low: {
    label: "Низький",
    badgeLabel: "P4",
    color: "text-teal-500",
    fill: "fill-teal-500",
    bg: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-200/80 dark:border-teal-900/40",
  },
  none: {
    label: "Без пріоритету",
    badgeLabel: "P5",
    color: "text-zinc-400",
    fill: "fill-none",
    bg: "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700",
  },
};

export const PRIORITY_OPTIONS = [
  {
    value: "urgent",
    label: "Терміновий (P1)",
    icon: <Flag className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />,
  },
  {
    value: "high",
    label: "Високий (P2)",
    icon: <Flag className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />,
  },
  {
    value: "medium",
    label: "Середній (P3)",
    icon: <Flag className="h-3.5 w-3.5 text-indigo-500 fill-indigo-500" />,
  },
  {
    value: "low",
    label: "Низький (P4)",
    icon: <Flag className="h-3.5 w-3.5 text-teal-500 fill-teal-500" />,
  },
  {
    value: "none",
    label: "Без пріоритету",
    icon: <Flag className="h-3.5 w-3.5 text-zinc-400" />,
  },
];

export default function PrioritySelect({
  value = "none",
  onChange,
  size = "md",
  className,
}) {
  return (
    <CustomSelect
      value={value}
      onChange={onChange}
      options={PRIORITY_OPTIONS}
      placeholder="Пріоритет"
      size={size}
      className={className}
    />
  );
}

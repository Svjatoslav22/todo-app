"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const Button = forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      leftIcon,
      rightIcon,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "relative inline-flex items-center justify-center font-medium transition-all duration-150 outline-none select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950";

    const variants = {
      primary:
        "bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-sm shadow-indigo-500/25 active:shadow-none border border-indigo-500/30",
      secondary:
        "bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 text-zinc-900 dark:text-zinc-100 border border-zinc-200/60 dark:border-white/5",
      outline:
        "border border-zinc-300 dark:border-zinc-700 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200",
      ghost:
        "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100",
      danger:
        "bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/25 border border-rose-500/30",
      glass:
        "glass-card hover:bg-white dark:hover:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 shadow-sm",
    };

    const sizes = {
      xs: "text-xs px-2.5 py-1 rounded-lg gap-1.5 h-7",
      sm: "text-xs px-3 py-1.5 rounded-xl gap-2 h-8",
      md: "text-sm px-4 py-2 rounded-xl gap-2 h-10",
      lg: "text-base px-5 py-2.5 rounded-2xl gap-2.5 h-12 font-semibold",
      icon: "p-2 rounded-xl h-9 w-9 justify-center",
      "icon-sm": "p-1.5 rounded-lg h-7 w-7 justify-center",
    };

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon
        )}
        <span>{children}</span>
        {!loading && rightIcon}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export default Button;

"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Tooltip({
  children,
  content,
  position = "top",
  delay = 200,
  className,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  function handleMouseEnter() {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  }

  function handleMouseLeave() {
    clearTimeout(timeoutRef.current);
    setIsVisible(false);
  }

  const positions = {
    top: "-top-2 left-1/2 -translate-x-1/2 -translate-y-full",
    bottom: "-bottom-2 left-1/2 -translate-x-1/2 translate-y-full",
    left: "top-1/2 -left-2 -translate-x-full -translate-y-1/2",
    right: "top-1/2 -right-2 translate-x-full -translate-y-1/2",
  };

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      <AnimatePresence>
        {isVisible && content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={cn(
              "absolute z-50 pointer-events-none whitespace-nowrap rounded-lg border border-zinc-200/80 dark:border-white/10 bg-zinc-900/90 dark:bg-zinc-800/95 px-2.5 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-md",
              positions[position],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

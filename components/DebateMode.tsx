"use client";

import { motion } from "framer-motion";
import { ThumbsUp, ThumbsDown, Swords } from "lucide-react";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface DebateModeProps {
  insights: AIInsights;
  className?: string;
}

export function DebateMode({ insights, className }: DebateModeProps) {
  const { lovedReasons, dislikedReasons } = insights.debateMode;

  if (!lovedReasons.length && !dislikedReasons.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-gradient-to-r from-emerald-500/5 via-transparent to-rose-500/5">
        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 shrink-0">
          <Swords className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">Audience Debate</h2>
          <p className="text-xs text-muted-foreground">
            The real reasons people loved and disliked it
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Loved side */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
              Why People Loved It
            </h3>
          </div>
          <ul className="space-y-2.5">
            {lovedReasons.map((reason, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                className="flex items-start gap-2.5 text-sm text-foreground/85"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Disliked side */}
        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-rose-500" />
            <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wide">
              Why People Disliked It
            </h3>
          </div>
          <ul className="space-y-2.5">
            {dislikedReasons.map((reason, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
                className="flex items-start gap-2.5 text-sm text-foreground/85"
              >
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0" />
                <span className="leading-relaxed">{reason}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}

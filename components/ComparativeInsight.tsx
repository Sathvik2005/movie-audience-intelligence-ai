"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface ComparativeInsightProps {
  insights: AIInsights;
  className?: string;
}

export function ComparativeInsight({ insights, className }: ComparativeInsightProps) {
  if (!insights.comparativeInsight || insights.comparativeInsight.length < 10) return null;

  // Detect if positive or negative comparison for coloring
  const isPositive =
    /above|better|higher|more positive|exceed|outperform/i.test(insights.comparativeInsight);
  const isNegative =
    /below|lower|less positive|weaker|underperfom/i.test(insights.comparativeInsight);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "rounded-2xl border shadow-lg p-5",
        isPositive
          ? "border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50/80 to-card dark:from-emerald-900/10"
          : isNegative
          ? "border-rose-200 dark:border-rose-800/50 bg-gradient-to-br from-rose-50/80 to-card dark:from-rose-900/10"
          : "border-sky-200 dark:border-sky-800/50 bg-gradient-to-br from-sky-50/80 to-card dark:from-sky-900/10",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex items-center justify-center h-10 w-10 rounded-xl shrink-0",
            isPositive
              ? "bg-emerald-100 dark:bg-emerald-900/40"
              : isNegative
              ? "bg-rose-100 dark:bg-rose-900/40"
              : "bg-sky-100 dark:bg-sky-900/40"
          )}
        >
          <TrendingUp
            className={cn(
              "h-5 w-5",
              isPositive
                ? "text-emerald-600 dark:text-emerald-400"
                : isNegative
                ? "text-rose-600 dark:text-rose-400"
                : "text-sky-600 dark:text-sky-400"
            )}
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Comparative Intelligence
          </p>
          <p className="text-sm font-medium text-foreground leading-relaxed">
            {insights.comparativeInsight}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

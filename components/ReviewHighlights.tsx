"use client";

import { motion } from "framer-motion";
import { MessageSquareQuote, ThumbsUp, ThumbsDown } from "lucide-react";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface ReviewHighlightsProps {
  insights: AIInsights;
  className?: string;
}

export function ReviewHighlights({ insights, className }: ReviewHighlightsProps) {
  const { bestPositive, bestNegative } = insights.reviewHighlights;
  if (!bestPositive && !bestNegative) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg p-6 space-y-5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <MessageSquareQuote className="h-5 w-5 text-sky-500" />
        <h2 className="text-xl font-bold text-foreground">Highlighted Reviews</h2>
        <span className="ml-auto text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-1">
          AI-extracted
        </span>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Best positive */}
        {bestPositive && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/50 dark:bg-emerald-900/10 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-900/50">
                <ThumbsUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                Best Positive Review
              </span>
            </div>
            <blockquote className="text-sm text-foreground/85 italic leading-relaxed border-l-2 border-emerald-400 pl-3">
              &ldquo;{bestPositive}&rdquo;
            </blockquote>
          </motion.div>
        )}

        {/* Best negative */}
        {bestNegative && (
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-rose-200 dark:border-rose-800/50 bg-rose-50/50 dark:bg-rose-900/10 p-4 space-y-3"
          >
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center h-7 w-7 rounded-full bg-rose-100 dark:bg-rose-900/50">
                <ThumbsDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
              </div>
              <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wide">
                Most Critical Review
              </span>
            </div>
            <blockquote className="text-sm text-foreground/85 italic leading-relaxed border-l-2 border-rose-400 pl-3">
              &ldquo;{bestNegative}&rdquo;
            </blockquote>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

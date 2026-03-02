"use client";

import { motion } from "framer-motion";
import type { AIInsights } from "@/types/insights";
import {
  getSentimentBarColor,
  getConfidenceBadgeColor,
  getControversyBadgeColor,
  getRewatchabilityColor,
} from "@/lib/sentiment";
import { cn } from "@/utils/helpers";

interface SentimentSummaryProps {
  insights: AIInsights;
  className?: string;
}

export function SentimentSummary({ insights, className }: SentimentSummaryProps) {
  const sentimentBadgeClass =
    insights.overallSentiment === "Positive"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
      : insights.overallSentiment === "Mixed"
      ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-200 dark:border-amber-800"
      : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300 border-rose-200 dark:border-rose-800";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg p-6 space-y-6",
        className
      )}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <span className="h-5 w-1 rounded-full bg-primary" />
          Audience Sentiment
        </h2>
        <span
          className={cn(
            "text-sm font-bold px-3 py-1 rounded-full border uppercase tracking-wide",
            sentimentBadgeClass
          )}
        >
          {insights.overallSentiment}
        </span>
      </div>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {insights.summary}
      </p>

      {/* Sentiment bars */}
      <div className="space-y-3">
        <SentimentBar
          label="Positive"
          percent={insights.positivePercentage}
          colorClass={getSentimentBarColor("Positive")}
          delay={0.2}
        />
        <SentimentBar
          label="Mixed"
          percent={insights.mixedPercentage}
          colorClass={getSentimentBarColor("Mixed")}
          delay={0.3}
        />
        <SentimentBar
          label="Negative"
          percent={insights.negativePercentage}
          colorClass={getSentimentBarColor("Negative")}
          delay={0.4}
        />
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MetricBadge
          label="Confidence"
          value={`${insights.confidenceLevel} (${insights.reviewsAnalyzed} reviews)`}
          className={getConfidenceBadgeColor(insights.confidenceLevel)}
        />
        <MetricBadge
          label="Rewatchability"
          value={insights.rewatchability}
          className={getRewatchabilityColor(insights.rewatchability)}
        />
        <MetricBadge
          label="Controversy Score"
          value={`${insights.controversyScore}%`}
          className={getControversyBadgeColor(insights.controversyScore)}
        />
        <MetricBadge
          label="Reviews Analyzed"
          value={`${insights.reviewsAnalyzed}`}
          className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
        />
      </div>
    </motion.div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function SentimentBar({
  label,
  percent,
  colorClass,
  delay,
}: {
  label: string;
  percent: number;
  colorClass: string;
  delay: number;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm font-bold text-foreground">{percent}%</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.9, delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

function MetricBadge({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) {
  return (
    <div className={cn("rounded-xl px-3 py-2.5 text-center", className)}>
      <p className="text-xs font-medium opacity-70 mb-0.5">{label}</p>
      <p className="text-sm font-bold leading-tight">{value}</p>
    </div>
  );
}

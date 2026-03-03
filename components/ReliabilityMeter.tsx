"use client";

import { motion } from "framer-motion";
import { ShieldCheck, AlertCircle, Info } from "lucide-react";
import type { AIInsights } from "@/types/insights";
import {
  getReliabilityLabel,
  getReliabilityColor,
} from "@/lib/sentiment";
import { cn } from "@/utils/helpers";

interface ReliabilityMeterProps {
  insights: AIInsights;
  className?: string;
}

const factors = (insights: AIInsights) => [
  {
    label: "Review Volume",
    value: Math.min(100, (insights.reviewsAnalyzed / 80) * 100),
    description: `${insights.reviewsAnalyzed} reviews analyzed`,
  },
  {
    label: "Confidence",
    value:
      insights.confidenceLevel === "High"
        ? 90
        : insights.confidenceLevel === "Medium"
        ? 55
        : 25,
    description: `${insights.confidenceLevel} confidence`,
  },
  {
    label: "Overall Reliability",
    value: insights.reliabilityScore,
    description: `${getReliabilityLabel(insights.reliabilityScore)} reliability`,
  },
];

export function ReliabilityMeter({ insights, className }: ReliabilityMeterProps) {
  const score = insights.reliabilityScore;
  const label = getReliabilityLabel(score);
  const factorList = factors(insights);

  const Icon =
    score >= 75
      ? ShieldCheck
      : score >= 45
      ? Info
      : AlertCircle;

  const iconColor =
    score >= 75
      ? "text-emerald-500"
      : score >= 45
      ? "text-amber-500"
      : "text-rose-500";

  const bgColor =
    score >= 75
      ? "bg-emerald-100 dark:bg-emerald-900/40"
      : score >= 45
      ? "bg-amber-100 dark:bg-amber-900/40"
      : "bg-rose-100 dark:bg-rose-900/40";

  const barColor =
    score >= 75
      ? "bg-emerald-500"
      : score >= 45
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg p-6 space-y-5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("flex items-center justify-center h-9 w-9 rounded-xl", bgColor)}>
            <Icon className={cn("h-5 w-5", iconColor)} />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Insight Reliability</h2>
            <p className="text-xs text-muted-foreground">Based on data quality & volume</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn("text-2xl font-black leading-none", getReliabilityColor(score))}>
            {score}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </div>
      </div>

      {/* Overall bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Reliability Score</span>
          <span className="font-mono">{score}/100</span>
        </div>
        <div className="h-3 rounded-full bg-muted overflow-hidden">
          <motion.div
            className={cn("h-full rounded-full", barColor)}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-2.5">
        {factorList.map((f) => (
          <div key={f.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">{f.label}</span>
              <span className="text-foreground font-mono">{Math.round(f.value)}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary/60"
                initial={{ width: 0 }}
                animate={{ width: `${f.value}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-xs text-muted-foreground/70">{f.description}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

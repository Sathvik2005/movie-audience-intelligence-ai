"use client";

import { motion } from "framer-motion";
import { Bot, Quote } from "lucide-react";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface AIReviewCardProps {
  insights: AIInsights;
  movieTitle: string;
  className?: string;
}

const ASPECT_LABELS: Array<{
  key: keyof AIInsights["aspectScores"];
  label: string;
  emoji: string;
}> = [
  { key: "story", label: "Story & Plot", emoji: "📖" },
  { key: "acting", label: "Acting", emoji: "🎭" },
  { key: "direction", label: "Direction", emoji: "🎬" },
  { key: "visuals", label: "Visuals", emoji: "🎨" },
  { key: "pacing", label: "Pacing", emoji: "⏱️" },
  { key: "emotionalImpact", label: "Emotional Impact", emoji: "💥" },
];

function aspectColor(score: number): string {
  if (score >= 8) return "bg-emerald-500";
  if (score >= 6) return "bg-sky-500";
  if (score >= 4) return "bg-amber-500";
  return "bg-rose-500";
}

function aspectTextColor(score: number): string {
  if (score >= 8) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 6) return "text-sky-600 dark:text-sky-400";
  if (score >= 4) return "text-amber-600 dark:text-amber-400";
  return "text-rose-600 dark:text-rose-400";
}

export function AIReviewCard({
  insights,
  movieTitle,
  className,
}: AIReviewCardProps) {
  const hasReview = insights.aiReview && insights.aiReview.length > 20;
  const hasAspects =
    insights.aspectScores &&
    Object.values(insights.aspectScores).some((v) => v > 0);

  if (!hasReview && !hasAspects) return null;

  const avgScore =
    hasAspects
      ? (
          Object.values(insights.aspectScores).reduce((a, b) => a + b, 0) / 6
        ).toFixed(1)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-violet-100 dark:bg-violet-900/40 shrink-0">
          <Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground">
            AI Critic&apos;s Review
          </h2>
          <p className="text-xs text-muted-foreground truncate">
            GPT analysis · Based on {insights.reviewsAnalyzed} audience reviews
          </p>
        </div>
        {avgScore && (
          <div className="shrink-0 text-center">
            <p className="text-2xl font-black text-foreground leading-none">
              {avgScore}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">avg / 10</p>
          </div>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* GPT-written review */}
        {hasReview && (
          <div className="relative pl-6">
            <Quote className="absolute left-0 top-0.5 h-4 w-4 text-violet-400/60" />
            <blockquote className="text-sm leading-relaxed text-foreground/90 italic">
              {insights.aiReview}
            </blockquote>
            <p className="mt-2 text-xs text-muted-foreground">
              — GPT synthesis of audience reception for{" "}
              <span className="font-medium text-foreground">{movieTitle}</span>
            </p>
          </div>
        )}

        {/* Aspect-based scores */}
        {hasAspects && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aspect Scores
            </h3>
            <div className="space-y-2.5">
              {ASPECT_LABELS.map(({ key, label, emoji }, i) => {
                const score = insights.aspectScores[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-sm shrink-0 w-36 text-foreground/80 flex items-center gap-1.5">
                      <span>{emoji}</span>
                      {label}
                    </span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full", aspectColor(score))}
                        initial={{ width: 0 }}
                        animate={{ width: `${score * 10}%` }}
                        transition={{
                          duration: 0.7,
                          delay: 0.1 + i * 0.07,
                          ease: "easeOut",
                        }}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold shrink-0 w-7 text-right",
                        aspectTextColor(score)
                      )}
                    >
                      {score}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

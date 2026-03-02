"use client";

import { motion } from "framer-motion";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface InsightPanelProps {
  insights: AIInsights;
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export function InsightPanel({ insights, className }: InsightPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg p-6 space-y-6",
        className
      )}
    >
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-primary" />
        Audience Intelligence
      </h2>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="space-y-5"
      >
        {/* Positive themes */}
        {insights.keyPositiveThemes.length > 0 && (
          <motion.div variants={item}>
            <TagSection
              title="✅ Loved By Audiences"
              tags={insights.keyPositiveThemes}
              tagClass="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-200 dark:hover:bg-emerald-900/70"
            />
          </motion.div>
        )}

        {/* Criticism themes */}
        {insights.keyCriticismThemes.length > 0 && (
          <motion.div variants={item}>
            <TagSection
              title="⚠️ Common Criticisms"
              tags={insights.keyCriticismThemes}
              tagClass="bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-800/60 hover:bg-rose-200 dark:hover:bg-rose-900/70"
            />
          </motion.div>
        )}

        {/* Emotions */}
        {insights.audienceEmotions.length > 0 && (
          <motion.div variants={item}>
            <TagSection
              title="🎭 Audience Emotions"
              tags={insights.audienceEmotions}
              tagClass="bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/40 dark:text-sky-300 dark:border-sky-800/60 hover:bg-sky-200 dark:hover:bg-sky-900/70"
            />
          </motion.div>
        )}

        {/* Audience type insight */}
        {insights.audienceTypeInsight && (
          <motion.div
            variants={item}
            className="rounded-xl border border-border bg-muted/40 p-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              👥 Best Suited For
            </h3>
            <p className="text-sm text-foreground leading-relaxed">
              {insights.audienceTypeInsight}
            </p>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}

function TagSection({
  title,
  tags,
  tagClass,
}: {
  title: string;
  tags: string[];
  tagClass: string;
}) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "text-xs font-medium px-3 py-1.5 rounded-full border",
              "cursor-default select-none transition-colors duration-150",
              tagClass
            )}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

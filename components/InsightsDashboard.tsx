"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, FileText, ChevronDown } from "lucide-react";
import type { AIInsights } from "@/types/insights";
import type { MovieMetadata } from "@/types/movie";
import { SentimentCharts } from "@/components/SentimentCharts";
import { DebateMode } from "@/components/DebateMode";
import { AudiencePersona } from "@/components/AudiencePersona";
import { ReviewHighlights } from "@/components/ReviewHighlights";
import { ComparativeInsight } from "@/components/ComparativeInsight";
import { MovieRecommendations } from "@/components/MovieRecommendations";
import { ReliabilityMeter } from "@/components/ReliabilityMeter";
import { cn } from "@/utils/helpers";

interface InsightsDashboardProps {
  insights: AIInsights;
  movie: MovieMetadata;
}

type ViewMode = "basic" | "executive";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export function InsightsDashboard({ insights, movie }: InsightsDashboardProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("executive");

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <LayoutDashboard className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            Intelligence Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1">
          <button
            onClick={() => setViewMode("basic")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              viewMode === "basic"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            Basic
          </button>
          <button
            onClick={() => setViewMode("executive")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              viewMode === "executive"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
            Executive
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "basic" ? (
          <motion.div
            key="basic"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-border bg-muted/30 p-6 text-center space-y-2"
          >
            <p className="text-muted-foreground text-sm">
              Showing summary view. Switch to{" "}
              <button
                onClick={() => setViewMode("executive")}
                className="text-primary underline underline-offset-2 font-medium"
              >
                Executive mode
              </button>{" "}
              for deep analytics, charts, debate mode, and recommendations.
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              {[
                { label: "Sentiment", value: insights.overallSentiment },
                { label: "Rewatchability", value: insights.rewatchability },
                { label: "Confidence", value: insights.confidenceLevel },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-3 text-center"
                >
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="font-bold text-foreground mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="executive"
            variants={container}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Row 1: Comparative Insight (full width) */}
            <motion.div variants={item}>
              <ComparativeInsight insights={insights} />
            </motion.div>

            {/* Row 2: Charts + Reliability */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={item} className="lg:col-span-2">
                <SentimentCharts insights={insights} />
              </motion.div>
              <motion.div variants={item}>
                <ReliabilityMeter insights={insights} />
              </motion.div>
            </div>

            {/* Row 3: Highlighted Reviews */}
            <motion.div variants={item}>
              <ReviewHighlights insights={insights} />
            </motion.div>

            {/* Row 4: Debate Mode + Audience Persona */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={item}>
                <DebateMode insights={insights} />
              </motion.div>
              <motion.div variants={item}>
                <AudiencePersona insights={insights} />
              </motion.div>
            </div>

            {/* Row 5: Recommendations */}
            <motion.div variants={item}>
              <MovieRecommendations insights={insights} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

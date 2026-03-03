"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface SentimentChartsProps {
  insights: AIInsights;
  className?: string;
}

const SENTIMENT_COLORS = {
  Positive: "#10b981",
  Mixed: "#f59e0b",
  Negative: "#ef4444",
};

const ASPECT_COLOR = "#6366f1";

const ASPECT_LABELS: Record<keyof AIInsights["aspectScores"], string> = {
  story: "Story",
  acting: "Acting",
  direction: "Direction",
  visuals: "Visuals",
  pacing: "Pacing",
  emotionalImpact: "Emotion",
};

// Custom pie tooltip
function PieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { fill: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{entry.name}</p>
      <p className="text-sm font-bold" style={{ color: entry.payload.fill }}>
        {entry.value}%
      </p>
    </div>
  );
}

// Custom bar tooltip
function BarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-card/95 backdrop-blur px-3 py-2 shadow-lg">
      <p className="text-xs font-semibold text-foreground">{label}</p>
      <p className="text-sm font-bold text-indigo-400">{payload[0].value} / 10</p>
    </div>
  );
}

export function SentimentCharts({ insights, className }: SentimentChartsProps) {
  const pieData = [
    { name: "Positive", value: insights.positivePercentage, fill: SENTIMENT_COLORS.Positive },
    { name: "Mixed", value: insights.mixedPercentage, fill: SENTIMENT_COLORS.Mixed },
    { name: "Negative", value: insights.negativePercentage, fill: SENTIMENT_COLORS.Negative },
  ].filter((d) => d.value > 0);

  const aspectData = (
    Object.entries(insights.aspectScores) as Array<
      [keyof AIInsights["aspectScores"], number]
    >
  ).map(([key, value]) => ({
    name: ASPECT_LABELS[key],
    score: value,
  }));

  // Emotion distribution — equal split across detected emotions
  const emotionData =
    insights.audienceEmotions.length > 0
      ? insights.audienceEmotions.map((emotion, i) => ({
          name: emotion,
          value: Math.round(100 / insights.audienceEmotions.length),
          fill: [
            "#6366f1",
            "#8b5cf6",
            "#ec4899",
            "#f43f5e",
            "#f97316",
          ][i % 5],
        }))
      : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg p-6 space-y-8",
        className
      )}
    >
      <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-violet-500 to-indigo-500" />
        Analytics Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sentiment Pie */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Sentiment Distribution
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  formatter={(value) => (
                    <span className="text-xs text-foreground/70">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aspect Bar Chart */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Aspect Scores (0–10)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aspectData}
                margin={{ top: 4, right: 4, left: -20, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,100,100,0.15)" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 10]}
                  tick={{ fontSize: 10, fill: "currentColor", opacity: 0.6 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} />
                <Bar dataKey="score" fill={ASPECT_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Emotion Distribution */}
      {emotionData.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Emotion Distribution
          </h3>
          <div className="flex gap-2 flex-wrap">
            {emotionData.map((e, i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: e.fill }}
                />
                <span className="text-sm font-medium text-foreground">
                  {e.name}
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  ~{e.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

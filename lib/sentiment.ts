// ──────────────────────────────────────────────────────────
// lib/sentiment.ts — Sentiment helpers and fallback builders
// ──────────────────────────────────────────────────────────

import type { AIInsights } from "@/types/insights";

/**
 * Builds a safe default AIInsights object when:
 * - No reviews are available
 * - AI request or parsing fails
 */
export function buildDefaultInsights(
  reviewCount: number,
  reason: string
): AIInsights {
  return {
    summary: reason,
    positivePercentage: 0,
    mixedPercentage: 0,
    negativePercentage: 0,
    overallSentiment: "Mixed",
    keyPositiveThemes: [],
    keyCriticismThemes: [],
    audienceEmotions: [],
    rewatchability: "Medium",
    audienceTypeInsight:
      "Audience type analysis unavailable due to insufficient review data.",
    controversyScore: 0,
    confidenceLevel: "Low",
    reviewsAnalyzed: reviewCount,
    aiReview: "",
    aspectScores: {
      story: 0,
      acting: 0,
      direction: 0,
      visuals: 0,
      pacing: 0,
      emotionalImpact: 0,
    },
    reviewHighlights: { bestPositive: "", bestNegative: "" },
    comparativeInsight: "",
    recommendedMovies: [],
    audiencePersona: "",
    debateMode: { lovedReasons: [], dislikedReasons: [] },
    reliabilityScore: 0,
  };
}

/**
 * Computes a 0-100 reliability score based on review count and sentiment variance.
 * More reviews + tighter sentiment spread = higher reliability.
 */
export function computeReliabilityScore(
  reviewCount: number,
  positive: number,
  mixed: number,
  negative: number
): number {
  // Volume score: 0-60 points
  const volumeScore = Math.min(60, (reviewCount / 80) * 60);

  // Variance penalty: highly polarised sentiment reduces reliability
  const variance = Math.sqrt(
    ((positive - 50) ** 2 + (mixed - 25) ** 2 + (negative - 25) ** 2) / 3
  );
  const variancePenalty = Math.min(30, variance * 0.5);

  return Math.round(Math.max(0, Math.min(100, volumeScore + 40 - variancePenalty)));
}

/**
 * Returns the Tailwind color class for a sentiment value.
 */
export function getSentimentColor(
  sentiment: "Positive" | "Mixed" | "Negative"
): string {
  switch (sentiment) {
    case "Positive":
      return "text-emerald-500";
    case "Mixed":
      return "text-amber-500";
    case "Negative":
      return "text-rose-500";
  }
}

/**
 * Returns the background bar color for sentiment percentage bars.
 */
export function getSentimentBarColor(
  sentiment: "Positive" | "Mixed" | "Negative"
): string {
  switch (sentiment) {
    case "Positive":
      return "bg-emerald-500";
    case "Mixed":
      return "bg-amber-500";
    case "Negative":
      return "bg-rose-500";
  }
}

/**
 * Returns Tailwind badge color classes for confidence level.
 */
export function getConfidenceBadgeColor(
  level: "High" | "Medium" | "Low"
): string {
  switch (level) {
    case "High":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
    case "Medium":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
    case "Low":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

/**
 * Returns Tailwind badge color classes for the controversy score.
 */
export function getControversyBadgeColor(score: number): string {
  if (score < 25) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
  if (score < 50) return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200";
  return "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200";
}

/**
 * Returns Tailwind badge color classes for rewatchability.
 */
export function getRewatchabilityColor(
  level: "High" | "Medium" | "Low"
): string {
  switch (level) {
    case "High":
      return "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200";
    case "Medium":
      return "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200";
    case "Low":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
}

/**
 * Returns a human-readable reliability label.
 */
export function getReliabilityLabel(score: number): string {
  if (score >= 75) return "High";
  if (score >= 45) return "Moderate";
  return "Low";
}

/**
 * Returns Tailwind color for reliability score.
 */
export function getReliabilityColor(score: number): string {
  if (score >= 75) return "text-emerald-500";
  if (score >= 45) return "text-amber-500";
  return "text-rose-500";
}

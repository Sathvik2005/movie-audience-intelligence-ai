// ──────────────────────────────────────────────────────────
// types/sentiment.ts — Sentiment breakdown types
// ──────────────────────────────────────────────────────────

export type OverallSentiment = "Positive" | "Mixed" | "Negative";
export type RewatchabilityLevel = "High" | "Medium" | "Low";
export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface SentimentBreakdown {
  positivePercentage: number;
  mixedPercentage: number;
  negativePercentage: number;
  overallSentiment: OverallSentiment;
}

// ──────────────────────────────────────────────────────────
// types/insights.ts — Full AI insight response types
// ──────────────────────────────────────────────────────────

import type {
  OverallSentiment,
  RewatchabilityLevel,
  ConfidenceLevel,
} from "@/types/sentiment";

export interface AspectScores {
  story: number;         // 0–10
  acting: number;        // 0–10
  direction: number;     // 0–10
  visuals: number;       // 0–10
  pacing: number;        // 0–10
  emotionalImpact: number; // 0–10
}

export interface AIInsights {
  summary: string;
  positivePercentage: number;
  mixedPercentage: number;
  negativePercentage: number;
  overallSentiment: OverallSentiment;
  keyPositiveThemes: string[];
  keyCriticismThemes: string[];
  audienceEmotions: string[];
  rewatchability: RewatchabilityLevel;
  audienceTypeInsight: string;
  controversyScore: number;
  confidenceLevel: ConfidenceLevel;
  reviewsAnalyzed: number;
  /** GPT-written critic's synthesis of the film based on audience reviews */
  aiReview: string;
  /** Aspect-based scores derived from review analysis */
  aspectScores: AspectScores;
}

export interface CacheEntry {
  data: import("@/types/movie").FullMovieInsightResponse;
  timestamp: number;
  ttl: number;
}

export interface ApiErrorResponse {
  error: string;
  code: string;
  statusCode: number;
  details?: string;
}

export interface ApiSuccessResponse {
  data: import("@/types/movie").FullMovieInsightResponse;
  fromCache: boolean;
  generatedAt: string;
}

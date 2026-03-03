// ──────────────────────────────────────────────────────────
// types/insights.ts — Full AI insight response types
// ──────────────────────────────────────────────────────────

import type {
  OverallSentiment,
  RewatchabilityLevel,
  ConfidenceLevel,
} from "@/types/sentiment";

export interface AspectScores {
  story: number;            // 0–10
  acting: number;           // 0–10
  direction: number;        // 0–10
  visuals: number;          // 0–10
  pacing: number;           // 0–10
  emotionalImpact: number;  // 0–10
}

export interface ReviewHighlights {
  bestPositive: string;  // most compelling positive audience statement
  bestNegative: string;  // most compelling critical audience statement
}

export interface DebateMode {
  lovedReasons: string[];    // concrete reasons audiences loved it
  dislikedReasons: string[]; // concrete reasons audiences disliked it
}

export interface RecommendedMovie {
  title: string;
  imdbId: string;
  reason: string;
  genre: string;
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
  /** GPT-written critic's synthesis based on audience reviews */
  aiReview: string;
  /** Aspect-based scores derived from review analysis */
  aspectScores: AspectScores;
  // ─── Elite intelligence layer ─────────────────────────
  /** Best positive + negative review snippets extracted by AI */
  reviewHighlights: ReviewHighlights;
  /** AI comparative insight vs genre average */
  comparativeInsight: string;
  /** 3 recommended similar movies based on genre & sentiment */
  recommendedMovies: RecommendedMovie[];
  /** AI-generated audience archetype persona */
  audiencePersona: string;
  /** Love vs dislike debate structure */
  debateMode: DebateMode;
  /** 0-100 reliability score based on review count and variance */
  reliabilityScore: number;
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

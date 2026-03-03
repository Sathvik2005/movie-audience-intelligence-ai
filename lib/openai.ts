// ──────────────────────────────────────────────────────────
// lib/openai.ts — OpenAI deep intelligence analysis engine
// ──────────────────────────────────────────────────────────

import OpenAI from "openai";
import type { AIInsights, RecommendedMovie } from "@/types/insights";
import { env } from "@/lib/env";
import { buildDefaultInsights, computeReliabilityScore } from "@/lib/sentiment";

const MAX_REVIEW_CHARS = 6_000;
const MAX_REVIEWS = 120;

let _client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return _client;
}

/**
 * Prepares the review payload — deduplicates, limits count and character budget.
 */
function prepareReviewPayload(reviews: string[]): {
  payload: string;
  count: number;
} {
  // Deduplicate
  const unique = [...new Set(reviews.map((r) => r.trim()).filter(Boolean))];
  const limited = unique.slice(0, MAX_REVIEWS);

  let aggregated = "";
  let included = 0;
  for (const review of limited) {
    const candidate =
      aggregated + (aggregated ? "\n---\n" : "") + review.slice(0, 800);
    if (candidate.length > MAX_REVIEW_CHARS) break;
    aggregated = candidate;
    included++;
  }

  return { payload: aggregated, count: included };
}

const SYSTEM_PROMPT = `You are an expert film critic and audience intelligence analyst.
Apply rigorous sentiment analysis: aspect-based scoring, intensity weighting, contradiction detection, emotional tone mapping.
You MUST return ONLY valid JSON — no markdown, no commentary, no code fences.`;

export interface MovieContext {
  title: string;
  year: string;
  director: string;
  genre: string;
}

function buildUserPrompt(movie: MovieContext, reviews: string): string {
  return `Movie: "${movie.title}" (${movie.year}) | Director: ${movie.director} | Genre: ${movie.genre}

Analyze the audience reviews below and return ONLY this exact JSON (no extra fields, no markdown):

{
  "summary": "2-3 sentence synthesis of overall audience reception with concrete strengths/weaknesses",
  "positivePercentage": <integer 0-100>,
  "mixedPercentage": <integer 0-100>,
  "negativePercentage": <integer 0-100>,
  "overallSentiment": "Positive" | "Mixed" | "Negative",
  "aspectScores": {
    "story": <integer 0-10>,
    "acting": <integer 0-10>,
    "direction": <integer 0-10>,
    "visuals": <integer 0-10>,
    "pacing": <integer 0-10>,
    "emotionalImpact": <integer 0-10>
  },
  "keyPositiveThemes": ["specific praised element", ...],
  "keyCriticismThemes": ["specific criticized element", ...],
  "audienceEmotions": ["dominant emotion 1", ...],
  "rewatchability": "High" | "Medium" | "Low",
  "audienceTypeInsight": "1-2 sentences on who would enjoy this film",
  "aiReview": "4-5 sentence flowing critic synthesis — specific, no bullet points",
  "reviewHighlights": {
    "bestPositive": "most compelling positive audience statement (direct quote or close paraphrase)",
    "bestNegative": "most compelling critical audience statement (direct quote or close paraphrase)"
  },
  "comparativeInsight": "one sentence comparing sentiment to genre average, e.g. Audience enthusiasm is 22% above typical sci-fi films",
  "audiencePersona": "2-3 sentence audience archetype description based on review patterns",
  "debateMode": {
    "lovedReasons": ["concrete reason 1", "reason 2", "reason 3"],
    "dislikedReasons": ["concrete reason 1", "reason 2", "reason 3"]
  },
  "recommendedMovies": [
    {"title": "Movie Title", "imdbId": "ttXXXXXXX", "reason": "because...", "genre": "Genre"},
    {"title": "Movie Title 2", "imdbId": "ttXXXXXXX", "reason": "because...", "genre": "Genre"},
    {"title": "Movie Title 3", "imdbId": "ttXXXXXXX", "reason": "because...", "genre": "Genre"}
  ]
}

Rules:
- positivePercentage + mixedPercentage + negativePercentage MUST equal exactly 100
- overallSentiment must match the dominant bucket
- keyPositiveThemes and keyCriticismThemes: 3-6 concrete items each
- audienceEmotions: 3-5 actual emotions from reviews
- recommendedMovies: use real IMDb IDs (ttXXXXXXX) for well-known films in same genre/tone
- debateMode reasons must be specific and evidence-based from reviews
- Return ONLY the JSON object

Audience Reviews:
${reviews}`;
}

/**
 * Sends reviews + movie context to OpenAI and returns structured AI insights.
 * Uses aspect-based sentiment analysis and generates a GPT-written critic review.
 * NEVER throws — always returns a valid AIInsights object.
 */
export async function analyzeReviews(
  reviews: string[],
  movie: MovieContext
): Promise<{ insights: AIInsights; reviewsAnalyzed: number }> {
  // Empty reviews — return default immediately
  if (!reviews.length) {
    console.warn("[OpenAI] No reviews to analyze, returning default insights.");
    return {
      insights: buildDefaultInsights(0, "No audience reviews found for this film."),
      reviewsAnalyzed: 0,
    };
  }

  const { payload, count } = prepareReviewPayload(reviews);
  console.log(`[OpenAI] Reviews count: ${count} | Sending to gpt-4o-mini…`);

  const client = getOpenAIClient();
  let rawContent: string | null = null;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(movie, payload) },
      ],
      temperature: 0.25,
      max_tokens: 2_000,
      response_format: { type: "json_object" },
    });

    rawContent = completion.choices[0]?.message?.content ?? null;
    console.log(`[OpenAI] Response received. Content length: ${rawContent?.length ?? 0}`);
  } catch (error) {
    console.error("[OpenAI] API request failed:", error);
    return {
      insights: buildDefaultInsights(
        count,
        "AI analysis is temporarily unavailable. Showing movie data without AI insights."
      ),
      reviewsAnalyzed: count,
    };
  }

  // safeParseAIResponse never throws — always returns valid AIInsights
  const parsed = safeParseAIResponse(rawContent, count);
  return { insights: parsed, reviewsAnalyzed: count };
}

/**
 * Safely parses and validates the raw JSON string returned by OpenAI.
 * NEVER throws — uses JSON substring-extraction as secondary fallback,
 * then returns buildDefaultInsights if all else fails.
 */
function safeParseAIResponse(raw: string | null, count: number): AIInsights {
  if (!raw || raw.trim().length === 0) {
    console.warn("[OpenAI] Empty response from OpenAI — returning default.");
    return buildDefaultInsights(count, "AI returned an empty response.");
  }

  // Primary parse attempt: strip markdown fences and parse
  const primaryCleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let parsed: Record<string, unknown> | null = null;

  try {
    parsed = JSON.parse(primaryCleaned) as Record<string, unknown>;
  } catch {
    // Secondary: extract the first {...} block from the response
    console.warn("[OpenAI] Primary JSON.parse failed — attempting substring extraction.");
    const match = primaryCleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]) as Record<string, unknown>;
      } catch {
        console.error("[OpenAI] Substring extraction also failed. Raw content:", raw.slice(0, 300));
      }
    }
  }

  if (!parsed) {
    return buildDefaultInsights(count, "AI response could not be parsed.");
  }

  // Validate and normalise numeric percentages
  const positive = clampPercent(parsed.positivePercentage);
  const mixed = clampPercent(parsed.mixedPercentage);
  const negative = clampPercent(parsed.negativePercentage);

  const total = positive + mixed + negative;
  const factor = total > 0 ? 100 / total : 1;

  const normalizedPositive = Math.round(positive * factor);
  const normalizedMixed = Math.round(mixed * factor);
  const normalizedNegative = 100 - normalizedPositive - normalizedMixed;

  const overallSentiment = resolveOverallSentiment(
    parsed.overallSentiment,
    normalizedPositive,
    normalizedMixed,
    normalizedNegative
  );

  const controversyScore = calculateControversyScore(normalizedPositive, normalizedMixed);
  const confidenceLevel = resolveConfidenceLevel(count);
  const reliabilityScore = computeReliabilityScore(
    count, normalizedPositive, normalizedMixed, normalizedNegative
  );

  return {
    summary:
      typeof parsed.summary === "string" && parsed.summary.trim()
        ? parsed.summary.trim()
        : "No summary available.",
    positivePercentage: normalizedPositive,
    mixedPercentage: normalizedMixed,
    negativePercentage: normalizedNegative,
    overallSentiment,
    keyPositiveThemes: ensureStringArray(parsed.keyPositiveThemes),
    keyCriticismThemes: ensureStringArray(parsed.keyCriticismThemes),
    audienceEmotions: ensureStringArray(parsed.audienceEmotions),
    rewatchability: resolveRewatchability(parsed.rewatchability),
    audienceTypeInsight:
      typeof parsed.audienceTypeInsight === "string" && parsed.audienceTypeInsight.trim()
        ? parsed.audienceTypeInsight.trim()
        : "Not enough data to determine audience type.",
    controversyScore,
    confidenceLevel,
    reviewsAnalyzed: count,
    aiReview:
      typeof parsed.aiReview === "string" ? parsed.aiReview.trim() : "",
    aspectScores: resolveAspectScores(parsed.aspectScores),
    reviewHighlights: resolveReviewHighlights(parsed.reviewHighlights),
    comparativeInsight:
      typeof parsed.comparativeInsight === "string" ? parsed.comparativeInsight.trim() : "",
    audiencePersona:
      typeof parsed.audiencePersona === "string" ? parsed.audiencePersona.trim() : "",
    debateMode: resolveDebateMode(parsed.debateMode),
    recommendedMovies: resolveRecommendedMovies(parsed.recommendedMovies),
    reliabilityScore,
  };
}

// ─── Helpers ─────────────────────────────────────────────

function clampPercent(value: unknown): number {
  const n = Number(value);
  if (isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

function ensureStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === "string");
  }
  return [];
}

function resolveOverallSentiment(
  rawValue: unknown,
  positive: number,
  mixed: number,
  negative: number
): AIInsights["overallSentiment"] {
  const valid = ["Positive", "Mixed", "Negative"];
  if (typeof rawValue === "string" && valid.includes(rawValue)) {
    return rawValue as AIInsights["overallSentiment"];
  }
  // Derive from percentages
  const max = Math.max(positive, mixed, negative);
  if (max === positive) return "Positive";
  if (max === mixed) return "Mixed";
  return "Negative";
}

function resolveRewatchability(value: unknown): AIInsights["rewatchability"] {
  if (value === "High" || value === "Medium" || value === "Low") return value;
  return "Medium";
}

function calculateControversyScore(positive: number, mixed: number): number {
  if (mixed > 20) return Math.min(100, 100 - positive);
  return mixed;
}

function resolveConfidenceLevel(reviewCount: number): AIInsights["confidenceLevel"] {
  if (reviewCount >= 80) return "High";
  if (reviewCount >= 40) return "Medium";
  return "Low";
}

function clampScore(value: unknown): number {
  const n = Number(value);
  if (isNaN(n)) return 5;
  return Math.min(10, Math.max(0, Math.round(n)));
}

function resolveAspectScores(raw: unknown): AIInsights["aspectScores"] {
  if (typeof raw !== "object" || raw === null) {
    return { story: 5, acting: 5, direction: 5, visuals: 5, pacing: 5, emotionalImpact: 5 };
  }
  const r = raw as Record<string, unknown>;
  return {
    story: clampScore(r.story),
    acting: clampScore(r.acting),
    direction: clampScore(r.direction),
    visuals: clampScore(r.visuals),
    pacing: clampScore(r.pacing),
    emotionalImpact: clampScore(r.emotionalImpact),
  };
}

function resolveReviewHighlights(raw: unknown): AIInsights["reviewHighlights"] {
  if (typeof raw !== "object" || raw === null) {
    return { bestPositive: "", bestNegative: "" };
  }
  const r = raw as Record<string, unknown>;
  return {
    bestPositive: typeof r.bestPositive === "string" ? r.bestPositive.trim() : "",
    bestNegative: typeof r.bestNegative === "string" ? r.bestNegative.trim() : "",
  };
}

function resolveDebateMode(raw: unknown): AIInsights["debateMode"] {
  if (typeof raw !== "object" || raw === null) {
    return { lovedReasons: [], dislikedReasons: [] };
  }
  const r = raw as Record<string, unknown>;
  return {
    lovedReasons: ensureStringArray(r.lovedReasons),
    dislikedReasons: ensureStringArray(r.dislikedReasons),
  };
}

function resolveRecommendedMovies(raw: unknown): RecommendedMovie[] {
  if (!Array.isArray(raw)) return [];
  return (raw as unknown[])
    .filter((item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null)
    .slice(0, 3)
    .map((item) => ({
      title: typeof item.title === "string" ? item.title.trim() : "Unknown",
      imdbId:
        typeof item.imdbId === "string" && /^tt\d+/.test(item.imdbId)
          ? item.imdbId
          : "",
      reason: typeof item.reason === "string" ? item.reason.trim() : "",
      genre: typeof item.genre === "string" ? item.genre.trim() : "",
    }))
    .filter((m) => m.title !== "Unknown");
}

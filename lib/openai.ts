// ──────────────────────────────────────────────────────────
// lib/openai.ts — OpenAI sentiment and insight analysis
// ──────────────────────────────────────────────────────────

import OpenAI from "openai";
import type { AIInsights } from "@/types/insights";
import { env } from "@/lib/env";
import { buildDefaultInsights } from "@/lib/sentiment";

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

const SYSTEM_PROMPT = `You are an expert film critic and professional audience intelligence analyst.
You apply rigorous sentiment analysis techniques including:
- Aspect-based sentiment analysis (story, acting, direction, visuals, pacing, emotional resonance)
- Sentiment intensity weighting (longer, more detailed reviews carry more weight)
- Contradiction detection (surface disagreements between reviewer groups)
- Emotional tone mapping to identify the dominant feelings expressed
You write balanced, specific, evidence-based analysis grounded strictly in what reviewers actually said.
You MUST return ONLY valid JSON — no markdown, no commentary, no code fences.`;

interface MovieContext {
  title: string;
  year: string;
  director: string;
  genre: string;
}

function buildUserPrompt(movie: MovieContext, reviews: string): string {
  return `Movie: "${movie.title}" (${movie.year}) | Director: ${movie.director} | Genre: ${movie.genre}

Analyze the audience reviews below using aspect-based sentiment analysis.
Return ONLY this exact JSON (no extra fields, no markdown, no code fences):

{
  "summary": "2-3 sentence synthesis of overall audience reception, citing concrete strengths and/or weaknesses",
  "positivePercentage": <integer 0-100>,
  "mixedPercentage": <integer 0-100>,
  "negativePercentage": <integer 0-100>,
  "overallSentiment": "Positive" | "Mixed" | "Negative",
  "aspectScores": {
    "story": <integer 0-10 reflecting audience opinion of plot/narrative>,
    "acting": <integer 0-10 reflecting audience opinion of performances>,
    "direction": <integer 0-10 reflecting audience opinion of direction/cinematography>,
    "visuals": <integer 0-10 reflecting audience opinion of visuals/effects/aesthetics>,
    "pacing": <integer 0-10 reflecting audience opinion of pacing/editing/flow>,
    "emotionalImpact": <integer 0-10 reflecting how emotionally resonant reviewers found the film>
  },
  "keyPositiveThemes": ["specific praised element", ...],
  "keyCriticismThemes": ["specific criticized element", ...],
  "audienceEmotions": ["dominant emotion from reviews", ...],
  "rewatchability": "High" | "Medium" | "Low",
  "audienceTypeInsight": "1-2 sentences on who would most enjoy this film based on review patterns",
  "aiReview": "Write a compelling 4-5 sentence critic synthesis of this film as seen through audience eyes. Be specific — name story elements, performances, and emotional beats reviewers mentioned. Acknowledge both strengths and weaknesses. Do NOT use bullet points."
}

Rules:
- positivePercentage + mixedPercentage + negativePercentage MUST equal exactly 100
- overallSentiment must correspond to the dominant percentage bucket
- aspectScores must reflect actual review content — do not guess
- keyPositiveThemes and keyCriticismThemes: 3-6 concrete items each (not vague)
- audienceEmotions: 3-5 items (actual emotions mentioned by reviewers)
- aiReview must be flowing prose, specific to this film and these reviews
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
      max_tokens: 1_200,
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

  const controversyScore = calculateControversyScore(
    normalizedPositive,
    normalizedMixed
  );
  const confidenceLevel = resolveConfidenceLevel(count);

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

function resolveAspectScores(
  raw: unknown
): AIInsights["aspectScores"] {
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

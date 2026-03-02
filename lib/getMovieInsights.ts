// ──────────────────────────────────────────────────────────
// lib/getMovieInsights.ts — Core data pipeline orchestrator
// ──────────────────────────────────────────────────────────

import { validateImdbId } from "@/utils/validation";
import { fetchMovieMetadata } from "@/lib/omdb";
import { getTMDBMovieId, fetchCast, fetchReviews } from "@/lib/tmdb";
import { analyzeReviews } from "@/lib/openai";
import { getCachedInsights, setCachedInsights } from "@/lib/cache";
import { validateEnv } from "@/lib/env";
import type { FullMovieInsightResponse } from "@/types/movie";

/**
 * Full movie insight pipeline:
 * 1. Validate environment variables
 * 2. Validate IMDb ID format
 * 3. Check server-side memory cache
 * 4. Fetch movie metadata from OMDb
 * 5. Convert IMDb ID → TMDB ID
 * 6. Fetch cast from TMDB
 * 7. Fetch audience reviews from TMDB
 * 8. Limit + clean reviews
 * 9. Analyze with OpenAI
 * 10. Cache result
 * 11. Return structured response
 */
export async function getMovieInsights(
  rawImdbId: string
): Promise<FullMovieInsightResponse> {
  try {
    return await runPipeline(rawImdbId);
  } catch (fatalError) {
    // This should never be reached, but guarantees the function never throws
    console.error("[Pipeline] FATAL — unexpected top-level error:", fatalError);
    throw fatalError; // re-throw so API route can return proper HTTP error
  }
}

async function runPipeline(
  rawImdbId: string
): Promise<FullMovieInsightResponse> {
  // Step 1: Validate environment
  validateEnv();

  // Step 2: Validate and normalize IMDb ID
  const imdbId = validateImdbId(rawImdbId);

  // Step 3: Check cache (server memory)
  const cached = getCachedInsights(imdbId);
  if (cached) {
    console.info(`[Pipeline] Cache hit for "${imdbId}"`);
    return cached;
  }

  console.log(`[Pipeline] Starting insight pipeline for "${imdbId}"`);

  // Step 4: Fetch OMDb metadata
  const movie = await fetchMovieMetadata(imdbId);
  console.log(`[Pipeline] OMDb metadata fetched: "${movie.title}" (${movie.year})`);

  // Step 5: Convert to TMDB ID
  const tmdbId = await getTMDBMovieId(imdbId);
  console.log(`[Pipeline] TMDB ID resolved: ${tmdbId}`);

  // Steps 6 & 7: Fetch cast and reviews in parallel
  const [cast, rawReviews] = await Promise.all([
    fetchCast(tmdbId),
    fetchReviews(tmdbId),
  ]);
  console.log(`[Pipeline] Cast: ${cast.length} members | Raw reviews: ${rawReviews.length}`);

  // Step 8: Analyze reviews with AI
  const { insights, reviewsAnalyzed } = await analyzeReviews(rawReviews, {
    title: movie.title,
    year: movie.year,
    director: movie.director,
    genre: movie.genre,
  });
  console.log(
    `[Pipeline] AI analysis complete. Sentiment: ${insights.overallSentiment} | Reviews analyzed: ${reviewsAnalyzed}`
  );

  // Step 9: Build structured response
  const result: FullMovieInsightResponse = {
    movie,
    cast,
    sentiment: insights,
    reviewCount: reviewsAnalyzed,
    cachedAt: Date.now(),
    fromCache: false,
  };

  // Step 10: Store in cache
  setCachedInsights(imdbId, result);

  return result;
}

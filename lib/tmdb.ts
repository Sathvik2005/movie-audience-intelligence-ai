// ──────────────────────────────────────────────────────────
// lib/tmdb.ts — TMDB API integration (cast + reviews)
// ──────────────────────────────────────────────────────────

import axios, { AxiosError } from "axios";
import type {
  CastMember,
  TMDBFindResponse,
  TMDBCreditsResponse,
  TMDBReviewsResponse,
} from "@/types/movie";
import { env } from "@/lib/env";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w185";
const MAX_CAST_MEMBERS = 12;
const MAX_REVIEW_PAGES = 5;

/** v4 read access tokens are JWTs (150+ chars); v3 keys are 32-char hex. */
function isV4Token(key: string): boolean {
  return key.length > 50;
}

function tmdbHeaders(): Record<string, string> {
  const key = env.TMDB_API_KEY;
  return isV4Token(key)
    ? { Authorization: `Bearer ${key}`, accept: "application/json" }
    : { accept: "application/json" };
}

function tmdbParams(
  extra: Record<string, string | number> = {}
): Record<string, string | number> {
  const key = env.TMDB_API_KEY;
  return isV4Token(key) ? extra : { api_key: key, ...extra };
}

/**
 * Converts an IMDb ID to a TMDB movie ID.
 */
export async function getTMDBMovieId(imdbId: string): Promise<number> {
  try {
    const { data } = await axios.get<TMDBFindResponse>(
      `${TMDB_BASE_URL}/find/${imdbId}`,
      {
        params: tmdbParams({ external_source: "imdb_id" }),
        headers: tmdbHeaders(),
        timeout: 10_000,
      }
    );

    const result = data.movie_results?.[0];
    if (!result) {
      throw new Error(
        `[TMDB] No movie found on TMDB for IMDb ID: "${imdbId}"`
      );
    }

    return result.id;
  } catch (error) {
    if (error instanceof AxiosError) {
      if (error.response?.status === 401) {
        throw new Error("[TMDB] Invalid API key. Check your TMDB_API_KEY.");
      }
      throw new Error(
        `[TMDB] Network error converting IMDb → TMDB ID: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Fetches the top cast members for a TMDB movie ID.
 */
export async function fetchCast(tmdbId: number): Promise<CastMember[]> {
  try {
    const { data } = await axios.get<TMDBCreditsResponse>(
      `${TMDB_BASE_URL}/movie/${tmdbId}/credits`,
      { params: tmdbParams(), headers: tmdbHeaders(), timeout: 10_000 }
    );

    return data.cast
      .slice(0, MAX_CAST_MEMBERS)
      .map((member) => ({
        id: member.id,
        name: member.name,
        character: member.character,
        profilePath: member.profile_path
          ? `${TMDB_IMAGE_BASE}${member.profile_path}`
          : null,
        order: member.order,
      }));
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        `[TMDB] Error fetching cast for movie ${tmdbId}: ${error.message}`
      );
    }
    throw error;
  }
}

/**
 * Fetches audience reviews for a TMDB movie ID.
 * Aggregates up to MAX_REVIEW_PAGES pages, returns plain review strings.
 */
export async function fetchReviews(tmdbId: number): Promise<string[]> {
  const reviews: string[] = [];

  try {
    for (let page = 1; page <= MAX_REVIEW_PAGES; page++) {
      const { data } = await axios.get<TMDBReviewsResponse>(
        `${TMDB_BASE_URL}/movie/${tmdbId}/reviews`,
        {
          params: tmdbParams({ page }),
          headers: tmdbHeaders(),
          timeout: 10_000,
        }
      );

      const pageReviews = data.results.map((r) => r.content.trim());
      reviews.push(...pageReviews);

      // Stop early if we've reached the last page
      if (page >= data.total_pages) break;
    }
  } catch (error) {
    if (error instanceof AxiosError) {
      // Non-critical: reviews failing shouldn't block the whole response
      console.warn(
        `[TMDB] Warning: Could not fetch reviews for movie ${tmdbId}: ${error.message}`
      );
      return reviews;
    }
    throw error;
  }

  return reviews;
}

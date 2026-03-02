// ──────────────────────────────────────────────────────────
// lib/omdb.ts — OMDb API integration
// ──────────────────────────────────────────────────────────

import axios, { AxiosError } from "axios";
import type {
  MovieMetadata,
  OMDbRawResponse,
  OMDbSearchResponse,
  MovieSearchResult,
} from "@/types/movie";
import { env } from "@/lib/env";

const OMDB_BASE_URL = "https://www.omdbapi.com";

/**
 * Fetches movie metadata from OMDb using the IMDb ID.
 * Returns a normalized MovieMetadata object.
 */
export async function fetchMovieMetadata(
  imdbId: string
): Promise<MovieMetadata> {
  let response: OMDbRawResponse;

  try {
    const { data } = await axios.get<OMDbRawResponse>(OMDB_BASE_URL, {
      params: { i: imdbId, apikey: env.OMDB_API_KEY, plot: "full" },
      timeout: 10_000,
    });
    response = data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        `[OMDb] Network error fetching movie "${imdbId}": ${error.message}`
      );
    }
    throw new Error(`[OMDb] Unexpected error: ${String(error)}`);
  }

  if (response.Response === "False") {
    throw new Error(
      `[OMDb] Movie not found: "${imdbId}". ${response.Error ?? "Unknown error"}`
    );
  }

  return normalizeOMDbResponse(response);
}

/**
 * Searches OMDb for movies matching the given title.
 * Returns up to 10 results from the first page.
 */
export async function searchMoviesByTitle(
  title: string
): Promise<MovieSearchResult[]> {
  try {
    const { data } = await axios.get<OMDbSearchResponse>(OMDB_BASE_URL, {
      params: { s: title, type: "movie", apikey: env.OMDB_API_KEY },
      timeout: 10_000,
    });

    if (data.Response === "False" || !data.Search) {
      return [];
    }

    return data.Search.map((item) => ({
      imdbId: item.imdbID,
      title: item.Title,
      year: item.Year,
      poster:
        item.Poster && item.Poster !== "N/A"
          ? item.Poster
          : "https://placehold.co/300x450/1e293b/94a3b8?text=No+Poster",
      type: item.Type,
    }));
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(
        `[OMDb] Network error searching for "${title}": ${error.message}`
      );
    }
    throw new Error(`[OMDb] Unexpected error: ${String(error)}`);
  }
}

function normalizeOMDbResponse(raw: OMDbRawResponse): MovieMetadata {
  return {
    imdbId: raw.imdbID,
    title: raw.Title,
    year: raw.Year,
    rated: raw.Rated ?? "N/A",
    released: raw.Released ?? "N/A",
    runtime: raw.Runtime ?? "N/A",
    genre: raw.Genre ?? "N/A",
    director: raw.Director ?? "N/A",
    writer: raw.Writer ?? "N/A",
    actors: raw.Actors ?? "N/A",
    plot: raw.Plot ?? "No plot available.",
    language: raw.Language ?? "N/A",
    country: raw.Country ?? "N/A",
    awards: raw.Awards ?? "N/A",
    poster:
      raw.Poster && raw.Poster !== "N/A"
        ? raw.Poster
        : "https://placehold.co/300x450/1e293b/94a3b8?text=No+Poster",
    imdbRating: raw.imdbRating ?? "N/A",
    imdbVotes: raw.imdbVotes ?? "N/A",
    type: raw.Type ?? "movie",
    boxOffice: raw.BoxOffice,
  };
}

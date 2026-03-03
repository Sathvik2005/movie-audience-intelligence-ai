// ──────────────────────────────────────────────────────────
// lib/cache.ts — In-memory server-side cache with TTL
// ──────────────────────────────────────────────────────────

import type { CacheEntry } from "@/types/insights";
import type { FullMovieInsightResponse } from "@/types/movie";

const CACHE_TTL_MS = 60 * 60 * 1_000; // 1 hour

/**
 * Module-level Map persists across requests in the same Node.js process.
 * In a multi-instance deployment, use Redis or similar instead.
 */
const memoryCache = new Map<string, CacheEntry>();

/**
 * Returns cached movie insights if present and not expired.
 */
export function getCachedInsights(
  imdbId: string
): FullMovieInsightResponse | null {
  const entry = memoryCache.get(imdbId.toLowerCase());
  if (!entry) return null;

  const isExpired = Date.now() > entry.timestamp + entry.ttl;
  if (isExpired) {
    memoryCache.delete(imdbId.toLowerCase());
    return null;
  }

  return { ...entry.data, fromCache: true };
}

/**
 * Stores movie insights in the in-memory cache.
 */
export function setCachedInsights(
  imdbId: string,
  data: FullMovieInsightResponse,
  ttlMs: number = CACHE_TTL_MS
): void {
  memoryCache.set(imdbId.toLowerCase(), {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

/**
 * Clears a specific entry (used for forced refresh).
 */
export function invalidateCacheEntry(imdbId: string): void {
  memoryCache.delete(imdbId.toLowerCase());
}

/**
 * Clears all entries from the cache (useful for testing).
 */
export function clearCache(): void {
  memoryCache.clear();
}

/**
 * Returns the number of entries currently in the cache.
 */
export function getCacheSize(): number {
  return memoryCache.size;
}

/**
 * Returns cache statistics for debugging.
 */
export function getCacheStats(): {
  size: number;
  keys: string[];
} {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}

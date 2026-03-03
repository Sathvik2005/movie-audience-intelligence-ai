// __tests__/cache.test.ts — Unit tests for the in-memory cache layer

import {
  getCachedInsights,
  setCachedInsights,
  invalidateCacheEntry,
  clearCache,
  getCacheSize,
} from "@/lib/cache";
import type { FullMovieInsightResponse } from "@/types/movie";

// ── helpers ───────────────────────────────────────────────

function makePayload(title = "Test Movie"): FullMovieInsightResponse {
  return {
    movie: {
      imdbId: "tt0000001",
      title,
      year: "2023",
      rated: "PG-13",
      released: "2023-01-01",
      runtime: "120 min",
      genre: "Drama",
      director: "Jane Doe",
      writer: "John Smith",
      actors: "Actor One, Actor Two",
      plot: "A test plot.",
      language: "English",
      country: "USA",
      awards: "N/A",
      poster: "https://placehold.co/300x450",
      imdbRating: "7.5",
      imdbVotes: "10,000",
      type: "movie",
    },
    cast: [],
    sentiment: {
      summary: "Good film.",
      positivePercentage: 70,
      mixedPercentage: 20,
      negativePercentage: 10,
      overallSentiment: "Positive",
      keyPositiveThemes: ["Great acting"],
      keyCriticismThemes: ["Slow pacing"],
      audienceEmotions: ["excited"],
      rewatchability: "High",
      audienceTypeInsight: "General audience",
      controversyScore: 20,
      confidenceLevel: "High",
      reviewsAnalyzed: 50,
      aiReview: "A compelling watch.",
      aspectScores: {
        story: 8,
        acting: 7,
        direction: 8,
        visuals: 7,
        pacing: 6,
        emotionalImpact: 8,
      },
      reviewHighlights: { bestPositive: "Great!", bestNegative: "Too slow." },
      comparativeInsight: "Above average for the genre.",
      recommendedMovies: [],
      audiencePersona: "Young adults who enjoy drama.",
      debateMode: { lovedReasons: ["acting"], dislikedReasons: ["pacing"] },
      reliabilityScore: 72,
    },
    reviewCount: 50,
    cachedAt: Date.now(),
    fromCache: false,
  };
}

// ── tests ─────────────────────────────────────────────────

beforeEach(() => {
  clearCache();
});

describe("getCachedInsights", () => {
  it("returns null for a cache miss", () => {
    expect(getCachedInsights("tt9999999")).toBeNull();
  });

  it("returns data after a cache set", () => {
    const payload = makePayload();
    setCachedInsights("tt0000001", payload);
    const result = getCachedInsights("tt0000001");
    expect(result).not.toBeNull();
    expect(result?.movie.title).toBe("Test Movie");
  });

  it("sets fromCache = true on a hit", () => {
    setCachedInsights("tt0000001", makePayload());
    expect(getCachedInsights("tt0000001")?.fromCache).toBe(true);
  });

  it("is case-insensitive for keys", () => {
    setCachedInsights("tt0000001", makePayload());
    expect(getCachedInsights("TT0000001")).not.toBeNull();
  });
});

describe("invalidateCacheEntry", () => {
  it("removes an existing entry", () => {
    setCachedInsights("tt0000001", makePayload());
    invalidateCacheEntry("tt0000001");
    expect(getCachedInsights("tt0000001")).toBeNull();
  });

  it("is a no-op for a missing key", () => {
    expect(() => invalidateCacheEntry("tt9999999")).not.toThrow();
  });
});

describe("clearCache / getCacheSize", () => {
  it("getCacheSize returns 0 on empty cache", () => {
    expect(getCacheSize()).toBe(0);
  });

  it("getCacheSize increments on set", () => {
    setCachedInsights("tt0000001", makePayload());
    setCachedInsights("tt0000002", makePayload("Another"));
    expect(getCacheSize()).toBe(2);
  });

  it("clearCache empties the store", () => {
    setCachedInsights("tt0000001", makePayload());
    clearCache();
    expect(getCacheSize()).toBe(0);
    expect(getCachedInsights("tt0000001")).toBeNull();
  });
});

describe("TTL expiry", () => {
  it("returns null for an expired entry", () => {
    // Set TTL of -1 ms so it expires immediately
    setCachedInsights("tt0000001", makePayload(), -1);
    expect(getCachedInsights("tt0000001")).toBeNull();
  });
});

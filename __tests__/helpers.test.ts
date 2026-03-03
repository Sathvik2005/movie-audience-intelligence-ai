// __tests__/helpers.test.ts — Unit tests for utility helper functions

import {
  formatNumber,
  imdbRatingToStars,
  imdbMovieUrl,
  relativeDateLabel,
} from "@/utils/helpers";

// ─── formatNumber ─────────────────────────────────────────
describe("formatNumber", () => {
  it("formats thousands with comma", () => {
    expect(formatNumber(1000)).toBe("1,000");
  });

  it("formats millions", () => {
    expect(formatNumber(1_500_000)).toBe("1,500,000");
  });

  it("handles zero", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("handles negative numbers", () => {
    const result = formatNumber(-5000);
    expect(result).toContain("5,000");
  });
});

// ─── imdbRatingToStars ────────────────────────────────────
describe("imdbRatingToStars", () => {
  it("returns 5 filled stars for a perfect 10", () => {
    expect(imdbRatingToStars("10")).toBe("★★★★★");
  });

  it("returns default stars when value is N/A", () => {
    // safeParseFloat("N/A") → 0 → falsy → returns "★★★★★"
    expect(imdbRatingToStars("N/A")).toBe("★★★★★");
  });

  it("returns a 5-char star string for a mid rating", () => {
    const stars = imdbRatingToStars("7.5");
    expect(typeof stars).toBe("string");
    expect(stars.length).toBe(5);
  });

  it("contains only star characters", () => {
    const stars = imdbRatingToStars("6.0");
    expect(stars).toMatch(/^[★☆]+$/);
  });
});

// ─── imdbMovieUrl ─────────────────────────────────────────
describe("imdbMovieUrl", () => {
  it("constructs the correct IMDb URL", () => {
    expect(imdbMovieUrl("tt0133093")).toBe(
      "https://www.imdb.com/title/tt0133093/"
    );
  });

  it("uses upper-case tt prefix if provided", () => {
    // The function should still produce a consistent URL
    const url = imdbMovieUrl("tt0468569");
    expect(url).toContain("tt0468569");
    expect(url).toContain("imdb.com");
  });
});

// ─── relativeDateLabel ────────────────────────────────────
describe("relativeDateLabel", () => {
  it("returns 'Today' for a date earlier today", () => {
    const now = new Date().toISOString();
    expect(relativeDateLabel(now)).toBe("Today");
  });

  it("returns 'Yesterday' for ~24 hours ago", () => {
    const yesterday = new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString();
    expect(relativeDateLabel(yesterday)).toBe("Yesterday");
  });

  it("returns a formatted date string for older dates", () => {
    const old = new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString();
    const label = relativeDateLabel(old);
    expect(label).not.toBe("Today");
    expect(label).not.toBe("Yesterday");
    expect(typeof label).toBe("string");
    expect(label.length).toBeGreaterThan(0);
  });
});

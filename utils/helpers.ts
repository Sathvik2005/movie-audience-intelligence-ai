// ──────────────────────────────────────────────────────────
// utils/helpers.ts — Shared utility functions
// ──────────────────────────────────────────────────────────

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merges Tailwind classes cleanly (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formats a number with commas: 1234567 → "1,234,567" */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

/** Truncates a string to maxLen and appends '…' if needed. */
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen - 1) + "…";
}

/** Returns a stable placeholder image URL when a profile photo is missing. */
export function castPlaceholderUrl(name: string): string {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("");
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=185&background=334155&color=94a3b8&bold=true`;
}

/** IMDb public movie link. */
export function imdbMovieUrl(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/`;
}

/** Safely parses a float, returns fallback on NaN. */
export function safeParseFloat(value: string, fallback = 0): number {
  const n = parseFloat(value);
  return isNaN(n) ? fallback : n;
}

/** Relative time string (Today, Yesterday, or date). */
export function relativeDateLabel(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Star rating: e.g. "7.5" → "★★★★½" (approx 5-star scale) */
export function imdbRatingToStars(ratingStr: string): string {
  const rating = safeParseFloat(ratingStr);
  if (!rating) return "★★★★★";
  const stars = Math.round((rating / 10) * 5);
  return "★".repeat(stars) + "☆".repeat(5 - stars);
}

// ─── Search History ───────────────────────────────────────

export const SEARCH_HISTORY_KEY = "ami_search_history";

export interface SearchHistoryEntry {
  imdbId: string;
  title: string;
  poster: string;
  searchedAt: number;
}

export function getSearchHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SearchHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToSearchHistory(entry: SearchHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getSearchHistory().filter(
      (h) => h.imdbId !== entry.imdbId
    );
    const updated = [entry, ...history].slice(0, 5);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be full or unavailable — fail silently
  }
}

export function removeFromSearchHistory(imdbId: string): void {
  if (typeof window === "undefined") return;
  try {
    const updated = getSearchHistory().filter((h) => h.imdbId !== imdbId);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // fail silently
  }
}

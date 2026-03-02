// ──────────────────────────────────────────────────────────
// utils/validation.ts — IMDb ID validation schema (Zod)
// ──────────────────────────────────────────────────────────

import { z } from "zod";

/**
 * IMDb IDs follow the pattern: tt + 7 to 9 digits.
 * Examples: tt0133093, tt0468569, tt15398776
 */
export const imdbIdSchema = z
  .string()
  .trim()
  .regex(
    /^tt\d{7,9}$/,
    'Invalid IMDb ID format. Expected format: "tt" followed by 7–9 digits (e.g., tt0133093).'
  );

/**
 * Validates and returns a normalized IMDb ID, or throws a ZodError.
 */
export function validateImdbId(raw: string): string {
  return imdbIdSchema.parse(raw.trim().toLowerCase());
}

/**
 * Returns a boolean without throwing.
 * Case-insensitive: "TT0133093" is treated the same as "tt0133093".
 */
export function isValidImdbId(raw: string): boolean {
  return imdbIdSchema.safeParse(raw.trim().toLowerCase()).success;
}

// __tests__/validation.test.ts — Unit tests for IMDb validation & helpers

import { validateImdbId, isValidImdbId } from "@/utils/validation";
import { truncate, safeParseFloat } from "@/utils/helpers";

// ─── validateImdbId ───────────────────────────────────────
describe("validateImdbId", () => {
  it("accepts a valid 7-digit IMDb ID", () => {
    expect(validateImdbId("tt0133093")).toBe("tt0133093");
  });

  it("accepts a valid 9-digit IMDb ID", () => {
    expect(validateImdbId("tt15398776")).toBe("tt15398776");
  });

  it("normalises uppercase prefix", () => {
    // trim().toLowerCase() applied before parse
    expect(validateImdbId("TT0468569")).toBe("tt0468569");
  });

  it("throws for an ID with too few digits", () => {
    expect(() => validateImdbId("tt01234")).toThrow();
  });

  it("throws for a plain title string", () => {
    expect(() => validateImdbId("Inception")).toThrow();
  });

  it("throws for an empty string", () => {
    expect(() => validateImdbId("")).toThrow();
  });
});

// ─── isValidImdbId ────────────────────────────────────────
describe("isValidImdbId", () => {
  it("returns true for a valid ID", () => {
    expect(isValidImdbId("tt0468569")).toBe(true);
  });

  it("returns false for an invalid ID", () => {
    expect(isValidImdbId("not-an-id")).toBe(false);
  });

  it("is case-insensitive", () => {
    expect(isValidImdbId("TT0468569")).toBe(true);
  });
});

// ─── truncate ─────────────────────────────────────────────
describe("truncate", () => {
  it("returns the full string when shorter than max", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates and appends ellipsis when over max", () => {
    expect(truncate("Hello World", 5)).toBe("Hell…");
  });

  it("handles exactly max length without truncating", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("handles empty string", () => {
    expect(truncate("", 10)).toBe("");
  });
});

// ─── safeParseFloat ───────────────────────────────────────
describe("safeParseFloat", () => {
  it("parses a valid numeric string", () => {
    expect(safeParseFloat("8.5")).toBe(8.5);
  });

  it("returns fallback for 'N/A'", () => {
    expect(safeParseFloat("N/A")).toBe(0);
  });

  it("returns fallback for an empty string", () => {
    expect(safeParseFloat("")).toBe(0);
  });

  it("accepts a custom fallback", () => {
    expect(safeParseFloat("N/A", -1)).toBe(-1);
  });

  it("parses integer strings", () => {
    expect(safeParseFloat("7")).toBe(7);
  });
});

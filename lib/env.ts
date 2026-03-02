// ──────────────────────────────────────────────────────────
// lib/env.ts — Environment variable validation at startup
// ──────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "" || value.includes("your_")) {
    throw new Error(
      `[ENV] Missing required environment variable: "${name}". ` +
        `Please copy .env.local.example to .env.local and fill in the values.`
    );
  }
  return value.trim();
}

export const env = {
  get OMDB_API_KEY(): string {
    return requireEnv("OMDB_API_KEY");
  },
  get TMDB_API_KEY(): string {
    return requireEnv("TMDB_API_KEY");
  },
  get OPENAI_API_KEY(): string {
    return requireEnv("OPENAI_API_KEY");
  },
};

/**
 * Called once at app startup to verify all required env vars exist.
 * Throws immediately rather than failing silently on first request.
 */
export function validateEnv(): void {
  const missing: string[] = [];
  const required = ["OMDB_API_KEY", "TMDB_API_KEY", "OPENAI_API_KEY"];

  for (const key of required) {
    const val = process.env[key];
    if (!val || val.trim() === "" || val.includes("your_")) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error(
      `[ENV] The following environment variables are not configured:\n` +
        missing.map((k) => `  - ${k}`).join("\n") +
        `\n\nCopy .env.local.example → .env.local and add your API keys.`
    );
    // In production we throw; in dev we warn so the UI can show a helpful error
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing environment variables: ${missing.join(", ")}`);
    }
  }
}

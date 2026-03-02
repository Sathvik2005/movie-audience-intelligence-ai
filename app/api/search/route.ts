// ──────────────────────────────────────────────────────────
// app/api/search/route.ts — Movie title search endpoint
// GET /api/search?q=the+matrix
// ──────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { searchMoviesByTitle } from "@/lib/omdb";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json(
      { error: "Query must be at least 2 characters." },
      { status: 400 }
    );
  }

  try {
    const results = await searchMoviesByTitle(q);
    return NextResponse.json({ results });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Search failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

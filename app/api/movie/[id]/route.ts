// ──────────────────────────────────────────────────────────
// app/api/movie/[id]/route.ts — Movie insights API endpoint
// ──────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { getMovieInsights } from "@/lib/getMovieInsights";
import { handleApiError } from "@/lib/errorHandler";
import type { ApiSuccessResponse } from "@/types/insights";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/movie/[id]
 *
 * Returns full AI-powered movie insights for the given IMDb ID.
 *
 * Success: 200 { data: FullMovieInsightResponse, fromCache: boolean, generatedAt: string }
 * Errors:  400 | 404 | 500 | 502 | 504  { error, code, statusCode }
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  const { id } = await params;
  const rawId = id?.trim() ?? "";

  if (!rawId) {
    return NextResponse.json(
      { error: "IMDb ID is required.", code: "MISSING_ID", statusCode: 400 },
      { status: 400 }
    );
  }

  try {
    const result = await getMovieInsights(rawId);

    const body: ApiSuccessResponse = {
      data: result,
      fromCache: result.fromCache ?? false,
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json(body, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    const { response, statusCode } = handleApiError(error);
    console.error(`[API /movie/${rawId}] Error:`, response);
    return NextResponse.json(response, { status: statusCode });
  }
}

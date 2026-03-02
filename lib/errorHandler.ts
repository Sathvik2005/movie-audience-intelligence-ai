// ──────────────────────────────────────────────────────────
// lib/errorHandler.ts — Centralized API error handling
// ──────────────────────────────────────────────────────────

import { ZodError } from "zod";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "@/types/insights";

export function handleApiError(error: unknown): {
  response: ApiErrorResponse;
  statusCode: number;
} {
  // Zod validation errors → 400 Bad Request
  if (error instanceof ZodError) {
    const messages = error.errors.map((e) => e.message).join("; ");
    return {
      statusCode: 400,
      response: {
        error: "Validation Error",
        code: "VALIDATION_ERROR",
        statusCode: 400,
        details: messages,
      },
    };
  }

  // Axios/network errors → differentiate upstream failures
  if (error instanceof AxiosError) {
    const upstreamStatus = error.response?.status;

    if (upstreamStatus === 401 || upstreamStatus === 403) {
      return {
        statusCode: 502,
        response: {
          error: "Upstream API authentication failed. Check your API keys.",
          code: "UPSTREAM_AUTH_ERROR",
          statusCode: 502,
        },
      };
    }

    if (upstreamStatus === 404) {
      return {
        statusCode: 404,
        response: {
          error: "Resource not found on upstream API.",
          code: "UPSTREAM_NOT_FOUND",
          statusCode: 404,
        },
      };
    }

    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return {
        statusCode: 504,
        response: {
          error: "Upstream API request timed out. Please try again.",
          code: "UPSTREAM_TIMEOUT",
          statusCode: 504,
        },
      };
    }

    return {
      statusCode: 502,
      response: {
        error: "A network error occurred. Please try again.",
        code: "NETWORK_ERROR",
        statusCode: 502,
      },
    };
  }

  // Known Error instances
  if (error instanceof Error) {
    const msg = error.message;

    if (msg.includes("[OMDb]") && msg.includes("not found")) {
      return {
        statusCode: 404,
        response: {
          error: "Movie not found. Please verify the IMDb ID and try again.",
          code: "MOVIE_NOT_FOUND",
          statusCode: 404,
        },
      };
    }

    if (msg.includes("[ENV]")) {
      return {
        statusCode: 500,
        response: {
          error: "Server configuration error. Contact the administrator.",
          code: "CONFIG_ERROR",
          statusCode: 500,
        },
      };
    }

    if (msg.includes("Invalid IMDb ID")) {
      return {
        statusCode: 400,
        response: {
          error: msg,
          code: "INVALID_IMDB_ID",
          statusCode: 400,
        },
      };
    }

    return {
      statusCode: 500,
      response: {
        error: "An unexpected error occurred. Please try again.",
        code: "INTERNAL_ERROR",
        statusCode: 500,
        details:
          process.env.NODE_ENV === "development" ? msg : undefined,
      },
    };
  }

  // Fallback for non-Error objects
  return {
    statusCode: 500,
    response: {
      error: "An unknown error occurred.",
      code: "UNKNOWN_ERROR",
      statusCode: 500,
    },
  };
}

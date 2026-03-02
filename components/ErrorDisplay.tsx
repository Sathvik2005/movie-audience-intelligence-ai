"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/utils/helpers";

interface ErrorDisplayProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  className?: string;
}

const CODE_HINTS: Record<string, string> = {
  INVALID_IMDB_ID:
    'IMDb IDs must start with "tt" followed by 7–9 digits. Example: tt0133093',
  MOVIE_NOT_FOUND:
    "We couldn't find this movie. Try verifying the IMDb ID on imdb.com.",
  CONFIG_ERROR:
    "The server is missing API keys. Check your .env.local configuration.",
  UPSTREAM_AUTH_ERROR:
    "One or more API keys are invalid. Check OMDB_API_KEY, TMDB_API_KEY, and OPENAI_API_KEY.",
  UPSTREAM_TIMEOUT:
    "Upstream API timed out. Try again in a few seconds.",
  NETWORK_ERROR:
    "A network problem occurred. Please check your connection and try again.",
  MISSING_ID: 'No IMDb ID was provided. Example: "tt0133093".',
};

export function ErrorDisplay({
  title = "Something went wrong",
  message,
  code,
  onRetry,
  className,
}: ErrorDisplayProps) {
  const hint = code ? CODE_HINTS[code] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "flex flex-col items-center text-center gap-5 py-14 px-4",
        className
      )}
    >
      <div className="rounded-full bg-destructive/10 p-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
      </div>

      <div className="space-y-2 max-w-md">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
        {hint && (
          <p className="text-sm text-muted-foreground/70 italic">{hint}</p>
        )}
        {code && (
          <p className="text-xs text-muted-foreground/50 font-mono">
            Error code: {code}
          </p>
        )}
      </div>

      <div className="flex gap-3 mt-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold",
              "bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            )}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}
        <Link
          href="/"
          className={cn(
            "inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold",
            "border border-border bg-card hover:bg-muted transition-colors"
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </Link>
      </div>
    </motion.div>
  );
}

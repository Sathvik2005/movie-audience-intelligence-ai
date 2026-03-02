"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { SearchBar } from "@/components/SearchBar";
import { MovieCard } from "@/components/MovieCard";
import { CastList } from "@/components/CastList";
import { SentimentSummary } from "@/components/SentimentSummary";
import { InsightPanel } from "@/components/InsightPanel";
import { AIReviewCard } from "@/components/AIReviewCard";
import { Loading } from "@/components/Loading";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { PageSkeleton } from "@/components/SkeletonLoader";
import { addToSearchHistory } from "@/utils/helpers";

import type { FullMovieInsightResponse } from "@/types/movie";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/insights";

type Status = "idle" | "loading" | "success" | "error";

interface FetchState {
  status: Status;
  data: FullMovieInsightResponse | null;
  error: ApiErrorResponse | null;
  fromCache: boolean;
}

export default function MovieInsightPage() {
  const params = useParams();
  const imdbId = (params?.id as string) ?? "";

  const [state, setState] = useState<FetchState>({
    status: "idle",
    data: null,
    error: null,
    fromCache: false,
  });

  // Cache badge dismiss
  const [showCacheBadge, setShowCacheBadge] = useState(false);

  const fetchInsights = useCallback(async (id: string) => {
    if (!id) return;

    setState({ status: "loading", data: null, error: null, fromCache: false });

    try {
      const res = await fetch(`/api/movie/${encodeURIComponent(id)}`);
      const json = (await res.json()) as
        | ApiSuccessResponse
        | ApiErrorResponse;

      if (!res.ok) {
        setState({
          status: "error",
          data: null,
          error: json as ApiErrorResponse,
          fromCache: false,
        });
        return;
      }

      const success = json as ApiSuccessResponse;
      setState({
        status: "success",
        data: success.data,
        error: null,
        fromCache: success.fromCache,
      });

      // Save to search history
      addToSearchHistory({
        imdbId: id,
        title: success.data.movie.title,
        poster: success.data.movie.poster,
        searchedAt: Date.now(),
      });

      if (success.fromCache) {
        setShowCacheBadge(true);
        setTimeout(() => setShowCacheBadge(false), 3000);
      }
    } catch {
      setState({
        status: "error",
        data: null,
        error: {
          error: "Failed to connect to the server. Please check your connection.",
          code: "NETWORK_ERROR",
          statusCode: 0,
        },
        fromCache: false,
      });
    }
  }, []);

  useEffect(() => {
    if (imdbId) fetchInsights(imdbId);
  }, [imdbId, fetchInsights]);

  return (
    <div className="space-y-8">
      {/* Back + search row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="w-full">
          <SearchBar initialValue={imdbId} />
        </div>
      </div>

      {/* Cache badge */}
      <AnimatePresence>
        {showCacheBadge && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium"
          >
            <CheckCircle2 className="h-4 w-4" />
            Loaded from cache — instant result
          </motion.div>
        )}
      </AnimatePresence>

      {/* States */}
      {state.status === "loading" && (
        <div className="space-y-8">
          <Loading message={`Analyzing ${imdbId}…`} />
          <PageSkeleton />
        </div>
      )}

      {state.status === "error" && state.error && (
        <ErrorDisplay
          title="Analysis Failed"
          message={state.error.error}
          code={state.error.code}
          onRetry={() => fetchInsights(imdbId)}
        />
      )}

      {state.status === "success" && state.data && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Movie metadata */}
          <MovieCard movie={state.data.movie} />

          {/* Cast */}
          {state.data.cast.length > 0 && (
            <CastList cast={state.data.cast} />
          )}

          {/* AI Insights grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SentimentSummary insights={state.data.sentiment} />
            <InsightPanel insights={state.data.sentiment} />
          </div>

          {/* AI Critic's Review + Aspect Scores */}
          <AIReviewCard
            insights={state.data.sentiment}
            movieTitle={state.data.movie.title}
          />

          {/* Footer meta */}
          <p className="text-center text-xs text-muted-foreground pb-4">
            Analysis based on {state.data.reviewCount} audience reviews ·{" "}
            {state.data.fromCache ? "Served from cache" : "Fresh data"} ·
            Powered by OpenAI GPT
          </p>
        </motion.div>
      )}
    </div>
  );
}

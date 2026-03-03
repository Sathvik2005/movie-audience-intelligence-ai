"use client";

import { motion } from "framer-motion";
import { Film, ExternalLink, Sparkles } from "lucide-react";
import Link from "next/link";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface MovieRecommendationsProps {
  insights: AIInsights;
  className?: string;
}

const GENRE_COLORS: Record<string, string> = {
  Action: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  Drama: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  Comedy: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Sci-Fi": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  Thriller: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  Horror: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Romance: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Fantasy: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function genreClass(genre: string): string {
  for (const [key, val] of Object.entries(GENRE_COLORS)) {
    if (genre.toLowerCase().includes(key.toLowerCase())) return val;
  }
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

export function MovieRecommendations({
  insights,
  className,
}: MovieRecommendationsProps) {
  const movies = insights.recommendedMovies.filter((m) => m.title);
  if (movies.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg p-6 space-y-5",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-amber-500" />
        <h2 className="text-xl font-bold text-foreground">AI Recommendations</h2>
        <span className="ml-auto text-xs text-muted-foreground">
          Based on genre &amp; audience sentiment
        </span>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {movies.map((movie, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 + i * 0.08 }}
            className="rounded-xl border border-border bg-muted/30 hover:bg-muted/60 transition-colors p-4 space-y-3 group"
          >
            {/* Movie icon + title */}
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 shrink-0 mt-0.5">
                <Film className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                  {movie.title}
                </h3>
                {movie.genre && (
                  <span
                    className={cn(
                      "mt-1 inline-block text-xs px-2 py-0.5 rounded-full font-medium",
                      genreClass(movie.genre)
                    )}
                  >
                    {movie.genre}
                  </span>
                )}
              </div>
            </div>

            {/* Reason */}
            {movie.reason && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {movie.reason}
              </p>
            )}

            {/* IMDb link */}
            {movie.imdbId && (
              <Link
                href={`/movie/${movie.imdbId}`}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline group-hover:gap-2 transition-all"
              >
                Analyze this film
                <ExternalLink className="h-3 w-3 opacity-60" />
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

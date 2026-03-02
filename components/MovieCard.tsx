"use client";

import Image from "next/image";
import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Clock, Film, Globe, Trophy, ExternalLink } from "lucide-react";
import type { MovieMetadata } from "@/types/movie";
import { imdbMovieUrl, safeParseFloat } from "@/utils/helpers";
import { cn } from "@/utils/helpers";

const POSTER_FALLBACK =
  "https://placehold.co/300x450/1e293b/94a3b8?text=No+Poster";

interface MovieCardProps {
  movie: MovieMetadata;
  className?: string;
}

export function MovieCard({ movie, className }: MovieCardProps) {
  const [posterSrc, setPosterSrc] = useState(movie.poster);
  const rating = safeParseFloat(movie.imdbRating);
  const ratingPercent = `${((rating / 10) * 100).toFixed(0)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Poster */}
        <div className="relative w-full sm:w-52 shrink-0 aspect-[2/3] sm:aspect-auto sm:h-auto">
          <Image
            src={posterSrc}
            alt={`${movie.title} poster`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 208px"
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            priority
            onError={() => setPosterSrc(POSTER_FALLBACK)}
          />
          {/* Rating overlay */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-sm px-3 py-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-white">
                {movie.imdbRating !== "N/A" ? movie.imdbRating : "—"}
              </span>
              <span className="text-xs text-white/70">/10</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col gap-4">
          {/* Title & year */}
          <div>
            <div className="flex flex-wrap items-start gap-2 mb-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
                {movie.title}
              </h1>
              <span className="shrink-0 mt-1 text-sm text-muted-foreground border border-border rounded-md px-2 py-0.5">
                {movie.year}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {movie.genre.split(", ").map((g) => (
                <span
                  key={g}
                  className="text-xs rounded-full bg-primary/10 text-primary px-2.5 py-0.5 font-medium"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* IMDb rating bar */}
          {rating > 0 && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  IMDb Rating
                </span>
                <span className="text-sm font-bold text-amber-500">
                  {movie.imdbRating} / 10
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-amber-400"
                  initial={{ width: 0 }}
                  animate={{ width: ratingPercent }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              {movie.imdbVotes !== "N/A" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Based on {movie.imdbVotes} votes
                </p>
              )}
            </div>
          )}

          {/* Plot */}
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
            {movie.plot}
          </p>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {movie.director !== "N/A" && (
              <MetaItem icon={<Film className="h-3.5 w-3.5" />} label="Director">
                {movie.director}
              </MetaItem>
            )}
            {movie.runtime !== "N/A" && (
              <MetaItem icon={<Clock className="h-3.5 w-3.5" />} label="Runtime">
                {movie.runtime}
              </MetaItem>
            )}
            {movie.language !== "N/A" && (
              <MetaItem icon={<Globe className="h-3.5 w-3.5" />} label="Language">
                {movie.language.split(",")[0]}
              </MetaItem>
            )}
            {movie.awards && movie.awards !== "N/A" && (
              <MetaItem icon={<Trophy className="h-3.5 w-3.5" />} label="Awards">
                {movie.awards.slice(0, 40)}
                {movie.awards.length > 40 ? "…" : ""}
              </MetaItem>
            )}
          </div>

          {/* IMDb link */}
          <div className="mt-auto pt-2">
            <a
              href={imdbMovieUrl(movie.imdbId)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-medium",
                "text-amber-500 hover:text-amber-400 transition-colors"
              )}
            >
              View on IMDb
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function MetaItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-xs text-muted-foreground uppercase tracking-wider font-medium">
        {icon}
        {label}
      </span>
      <span className="text-sm text-foreground font-medium truncate">
        {children}
      </span>
    </div>
  );
}

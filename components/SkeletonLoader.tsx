"use client";

import { cn } from "@/utils/helpers";

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg shimmer",
        className
      )}
      aria-hidden="true"
    />
  );
}

export function MovieCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        {/* Poster */}
        <Skeleton className="w-full sm:w-52 h-72 sm:h-auto sm:min-h-[320px] shrink-0 rounded-none" />

        {/* Details */}
        <div className="flex-1 p-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CastListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-1.5 rounded-full" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <Skeleton className="w-full aspect-square rounded-xl" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SentimentSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-1.5 rounded-full" />
          <Skeleton className="h-6 w-44" />
        </div>
        <Skeleton className="h-7 w-24 rounded-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>

      <div className="space-y-4">
        {["Positive", "Mixed", "Negative"].map((s) => (
          <div key={s} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-3 w-full rounded-full" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function InsightPanelSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-lg p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-1.5 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>

      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2.5">
            <Skeleton className="h-3 w-32" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((__, j) => (
                <Skeleton key={j} className="h-7 w-24 rounded-full" />
              ))}
            </div>
          </div>
        ))}

        <Skeleton className="h-16 w-full rounded-xl" />
      </div>
    </div>
  );
}

/** Full page skeleton while the API is loading */
export function PageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <MovieCardSkeleton />
      <CastListSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SentimentSkeleton />
        <InsightPanelSkeleton />
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, X, Clock, Trash2, Loader2, Film } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { isValidImdbId } from "@/utils/validation";
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  type SearchHistoryEntry,
} from "@/utils/helpers";
import { cn } from "@/utils/helpers";
import type { MovieSearchResult } from "@/types/movie";

interface SearchBarProps {
  initialValue?: string;
  onSearch?: (imdbId: string) => void;
}

export function SearchBar({ initialValue = "", onSearch }: SearchBarProps) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  // Close all dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowHistory(false);
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const runSearch = useCallback(async (query: string) => {
    setIsSearching(true);
    setShowResults(true);
    setShowHistory(false);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = (await res.json()) as { results: MovieSearchResult[] };
        setSearchResults(data.results ?? []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /**
   * Immediately search OMDb for `title` and navigate to the top result.
   * Called on form submit when no cached results are available yet.
   */
  const searchAndNavigate = useCallback(
    async (title: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setIsSearching(true);
      setShowResults(false);
      setError(null);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(title)}`
        );
        if (!res.ok) {
          setError("Search failed. Please try again.");
          return;
        }
        const data = (await res.json()) as { results: MovieSearchResult[] };
        if (!data.results || data.results.length === 0) {
          setError(`No movies found for "${title}". Try a different title.`);
          return;
        }
        const top = data.results[0]!;
        addToSearchHistory({
          imdbId: top.imdbId,
          title: top.title,
          poster: top.poster,
          searchedAt: Date.now(),
        });
        if (onSearch) {
          onSearch(top.imdbId);
        } else {
          router.push(`/movie/${top.imdbId}`);
        }
      } catch {
        setError("Failed to search. Please check your connection.");
      } finally {
        setIsSearching(false);
      }
    },
    [onSearch, router]
  );

  function handleInputChange(raw: string) {
    setValue(raw);
    setError(null);
    const trimmed = raw.trim();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!trimmed) {
      setSearchResults([]);
      setShowResults(false);
      setShowHistory(history.length > 0);
      return;
    }
    if (isValidImdbId(trimmed)) {
      setSearchResults([]);
      setShowResults(false);
      setShowHistory(false);
      return;
    }
    if (trimmed.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      void runSearch(trimmed);
    }, 400);
  }

  function handleSelectResult(result: MovieSearchResult) {
    setShowResults(false);
    setShowHistory(false);
    setValue(result.title);
    setError(null);
    addToSearchHistory({
      imdbId: result.imdbId,
      title: result.title,
      poster: result.poster,
      searchedAt: Date.now(),
    });
    if (onSearch) {
      onSearch(result.imdbId);
    } else {
      router.push(`/movie/${result.imdbId}`);
    }
  }

  function handleSubmit(imdbId: string) {
    const trimmed = imdbId.trim();
    if (!trimmed) {
      setError("Please enter a movie title or IMDb ID.");
      return;
    }

    // Direct IMDb ID — navigate immediately
    if (isValidImdbId(trimmed)) {
      const normalized = trimmed.toLowerCase();
      setError(null);
      setShowHistory(false);
      setShowResults(false);
      if (onSearch) {
        onSearch(normalized);
      } else {
        router.push(`/movie/${normalized}`);
      }
      return;
    }

    if (trimmed.length < 2) {
      setError(
        "Enter a movie title (e.g. The Matrix) or IMDb ID (e.g. tt0133093)."
      );
      return;
    }

    // If dropdown results are already loaded → pick the top one immediately
    if (searchResults.length > 0) {
      handleSelectResult(searchResults[0]!);
      return;
    }

    // No cached results yet — do an instant search-and-navigate
    void searchAndNavigate(trimmed);
  }

  function handleRemoveHistory(imdbId: string, e: React.MouseEvent) {
    e.stopPropagation();
    removeFromSearchHistory(imdbId);
    setHistory(getSearchHistory());
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(value);
        }}
      >
        <div
          className={cn(
            "flex items-center gap-2 rounded-2xl border-2 bg-card px-4 py-3",
            "transition-all duration-200 shadow-sm",
            error
              ? "border-rose-400 dark:border-rose-600"
              : "border-border hover:border-primary/50 focus-within:border-primary"
          )}
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 shrink-0 text-primary animate-spin" />
          ) : (
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => {
              const trimmed = value.trim();
              if (!trimmed && history.length > 0) setShowHistory(true);
              else if (trimmed && searchResults.length > 0) setShowResults(true);
            }}
            placeholder="Search by title (e.g. The Matrix) or IMDb ID…"
            className={cn(
              "flex-1 bg-transparent outline-none text-foreground",
              "placeholder:text-muted-foreground text-base"
            )}
            aria-label="Movie search input"
            autoComplete="off"
            spellCheck={false}
          />

          {value && (
            <button
              type="button"
              onClick={() => {
                setValue("");
                setError(null);
                setSearchResults([]);
                setShowResults(false);
                setShowHistory(history.length > 0);
                inputRef.current?.focus();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear input"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          <button
            type="submit"
            className={cn(
              "shrink-0 rounded-xl px-4 py-1.5 text-sm font-semibold",
              "bg-primary text-primary-foreground",
              "hover:opacity-90 transition-opacity",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            )}
          >
            {isValidImdbId(value.trim()) ? "Analyze" : "Search"}
          </button>
        </div>
      </form>

      {/* Validation error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 ml-2 text-sm text-rose-500 dark:text-rose-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Dropdown: Search results OR History */}
      <AnimatePresence>
        {((showResults && (isSearching || searchResults.length > 0)) ||
          (showHistory && history.length > 0)) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute top-full mt-2 w-full z-50",
              "rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
            )}
          >
            {/* ── Title search results ── */}
            {showResults && (
              <>
                <div className="flex items-center px-4 pt-3 pb-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Film className="h-3 w-3" />
                    Search Results
                  </span>
                </div>

                {isSearching && (
                  <div className="px-4 py-4 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching…
                  </div>
                )}

                {!isSearching && searchResults.length === 0 && (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    No movies found for &quot;{value}&quot;.
                  </p>
                )}

                {!isSearching && searchResults.length > 0 && (
                  <ul className="py-2 max-h-80 overflow-y-auto">
                    {searchResults.map((result) => (
                      <li key={result.imdbId}>
                        <button
                          onClick={() => handleSelectResult(result)}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors"
                        >
                          <div className="relative h-12 w-8 shrink-0 rounded overflow-hidden bg-muted">
                            <Image
                              src={result.poster}
                              alt={result.title}
                              fill
                              sizes="32px"
                              className="object-cover"
                              unoptimized={result.poster.includes("placehold.co")}
                            />
                          </div>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-foreground truncate">
                              {result.title}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {result.year} · {result.imdbId}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {/* ── Search history ── */}
            {showHistory && history.length > 0 && (
              <>
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <Clock className="h-3 w-3" />
                    Recent Searches
                  </span>
                  <button
                    onClick={() => {
                      setHistory([]);
                      setShowHistory(false);
                      localStorage.removeItem("ami_search_history");
                    }}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Clear all
                  </button>
                </div>

                <ul className="py-2">
                  {history.map((entry) => (
                    <li key={entry.imdbId}>
                      <button
                        onClick={() => {
                          setValue(entry.imdbId);
                          setShowHistory(false);
                          handleSubmit(entry.imdbId);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/50 transition-colors group"
                      >
                        <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-foreground truncate">
                            {entry.title || entry.imdbId}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {entry.imdbId}
                          </span>
                        </span>
                        <button
                          onClick={(e) => handleRemoveHistory(entry.imdbId, e)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                          aria-label="Remove from history"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

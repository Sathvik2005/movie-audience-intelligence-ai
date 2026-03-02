"use client";

import { motion } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";
import { Sparkles, TrendingUp, Brain, Film } from "lucide-react";

const FEATURED_MOVIES = [
  { title: "The Matrix", id: "tt0133093" },
  { title: "Inception", id: "tt1375666" },
  { title: "Interstellar", id: "tt0816692" },
  { title: "The Dark Knight", id: "tt0468569" },
];

const FEATURES = [
  {
    icon: <Brain className="h-5 w-5 text-violet-500" />,
    title: "AI Sentiment Analysis",
    desc: "Deep analysis of audience reviews powered by GPT.",
  },
  {
    icon: <TrendingUp className="h-5 w-5 text-emerald-500" />,
    title: "Theme Detection",
    desc: "Automatically extracts positive & negative themes.",
  },
  {
    icon: <Film className="h-5 w-5 text-sky-500" />,
    title: "Cast & Metadata",
    desc: "Full cast grid with movie metadata from OMDb & TMDB.",
  },
  {
    icon: <Sparkles className="h-5 w-5 text-amber-500" />,
    title: "Audience Profiling",
    desc: "Emotions, rewatchability, and audience type insights.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="flex flex-col items-center text-center gap-6 pt-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3 w-3 text-amber-400" />
            AI-Powered Audience Intelligence Engine
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight">
            Understand What{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-sky-500">
              Audiences Really Think
            </span>
          </h1>

          <p className="max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Type any movie title or IMDb ID to instantly generate AI-powered
            sentiment analysis, key themes, emotional profiles, cast details,
            and deep audience insights.
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <SearchBar />
          <p className="mt-2 text-xs text-muted-foreground">
            Try:{" "}
            <span className="font-medium text-foreground">The Matrix</span>
            {" · "}
            <span className="font-medium text-foreground">Inception</span>
            {" · or any title / "}
            <code className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">
              tt0133093
            </code>
          </p>
        </motion.div>
      </section>

      {/* Quick access movies */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="space-y-4"
      >
        <h2 className="text-center text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Try These Movies
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          {FEATURED_MOVIES.map(({ title, id }) => (
            <a
              key={id}
              href={`/movie/${id}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors hover:border-primary/50"
            >
              {title}
            </a>
          ))}
        </div>
      </motion.section>

      {/* Features grid */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {FEATURES.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-5 space-y-2 hover:shadow-md transition-shadow"
          >
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              {icon}
            </div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </div>
        ))}
      </motion.section>
    </div>
  );
}

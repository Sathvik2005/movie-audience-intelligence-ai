# 🎬 AI Movie Audience Intelligence Platform

> **Top 1% AI-powered audience intelligence engine** — not a movie lookup tool, a full analytics platform.

Enter any IMDb ID and get AI-generated sentiment analysis, theme detection, emotion profiling, debate mode, audience persona, review highlights, comparative insights, reliability scoring, and AI-matched movie recommendations — all powered by GPT-4o-mini and rendered with Recharts.

---

## Product Philosophy

This project is built as a **production-grade AI audience intelligence engine** rather than a simple movie lookup tool. The system treats audience reviews as raw signal and runs them through a multi-stage AI pipeline to surface structured, actionable insights — the kind a studio executive, film critic, or data analyst would actually find useful.

The platform operates in two modes:
- **Basic view** — the essentials: sentiment, themes, emotions, rewatchability
- **Executive view** — the full analytics suite: charts, debate mode, persona, comparative stats, recommendations, reliability meter

---

## Architecture

```
User Input (IMDb ID)
        │
        ▼
Next.js 16.1.6 Frontend (App Router + Turbopack)
        │
        ▼
API Route → /api/movie/[id]
        │
        ▼
getMovieInsights() pipeline:
  1. Zod IMDb ID validation
  2. Server memory cache check (1-hour TTL)
  3. OMDb API → title, poster, rating, plot, director, runtime
  4. TMDB API → IMDb → TMDB ID conversion
  5. TMDB API → cast (top 12 members)
  6. TMDB API → audience reviews (up to 5 pages, ~100 reviews)
  7. Review cleaning + 100 review cap + 4000 char budget
  8. OpenAI GPT-4o-mini → 13-field structured JSON (2000 max_tokens)
  9. Reliability score computed from review volume + sentiment variance
 10. Cache result → return FullMovieInsightResponse
        │
        ▼
InsightsDashboard renders analytics UI with Basic/Executive toggle
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|--------|
| Frontend | Next.js 16.1.6 (App Router, Turbopack) | SSR + CSR, file-based routing, API routes |
| Language | TypeScript (strict) | Full type safety, no `any` |
| Styling | TailwindCSS + glassmorphism CSS utilities | Rapid, scalable, premium dark theme |
| Animations | Framer Motion 11 | Staggered enters, AnimatePresence, spring physics |
| Charts | Recharts | PieChart (sentiment), BarChart (aspects), custom tooltips |
| AI | OpenAI GPT-4o-mini | Structured 13-field JSON analysis, 2000 tokens |
| Movie Data | OMDb API | IMDb metadata (title, rating, poster, plot) |
| Cast + Reviews | TMDB API | Cast grid + audience review corpus |
| Validation | Zod | Runtime schema validation with clean error messages |
| HTTP | Axios | Interceptors, timeout control, response typing |
| Theming | next-themes | Persistent dark/light mode, SSR-safe |
| Testing | Jest 30 + ts-jest | 41 tests across 3 suites, 100% passing |

---

## Features

### Core Intelligence
- Full movie metadata — poster, rating, plot, director, runtime, awards
- Cast grid with profile photos (12 top-billed actors, staggered animation)
- AI sentiment analysis — Positive / Mixed / Negative percentages
- Animated sentiment bars with proportional widths
- Key positive and criticism themes (badge-style tags)
- Audience emotion profile chips
- Rewatchability indicator (High / Medium / Low)
- Audience type insight paragraph

### Advanced Analytics (Executive Mode)
- **Sentiment Charts** — Recharts PieChart for sentiment split + BarChart for 6 aspect scores (acting, story, visuals, pacing, emotional impact, overall) with custom glassmorphism tooltips
- **Debate Mode** — Structured love vs. dislike two-column breakdown showing exactly what audiences fought over
- **Audience Persona** — AI-generated archetype card (e.g., "The Cinephile", "The Action Fan") with dynamic emoji + genre inference
- **Review Highlights** — Best positive quote and most critical negative quote extracted by AI from the review corpus
- **Comparative Insight** — Single-sentence stat comparing this film to its genre average (color-coded positive/negative)
- **Movie Recommendations** — 3 AI-matched similar films with genre tags, IMDb links, and analysis reasons
- **Reliability Meter** — 0–100 score with animated bar and 3-factor breakdown (Review Volume, AI Confidence, Overall)
- **Executive / Basic toggle** — Switch between full analytics and essentials view

### Platform Engineering
- **Controversy Score** — formula-derived divisiveness metric
- **AI Confidence Level** — High / Medium / Low based on review count
- **Cache indicator** — "Loaded from cache" badge fades after 3 seconds
- **Search history** — last 5 searches persisted in `localStorage`
- **Dark mode** — persistent, SSR-safe via next-themes
- **Skeleton loaders** — structural preview while fetching
- **Graceful error UI** — contextual hints per error code

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn
- API keys (see below)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Sathvik2005/movie-audience-intelligence-ai.git
cd movie-audience-intelligence-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local and add your API keys

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable | Where to get it |
|----------|----------------|
| `OMDB_API_KEY` | [omdbapi.com/apikey.aspx](https://www.omdbapi.com/apikey.aspx) — free tier available |
| `TMDB_API_KEY` | [developer.themoviedb.org](https://developer.themoviedb.org) — use **API Read Access Token** |
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |

> ⚠️ **TMDB key**: Go to Settings → API → copy the **API Read Access Token** (Bearer token), not the v3 API key.

---

## Project Structure

```
├── app/
│   ├── layout.tsx              # Root layout with ThemeProvider, nav, footer
│   ├── globals.css             # Tailwind + CSS variables + shimmer animation
│   ├── page.tsx                # Home page with search + feature grid
│   ├── movie/[id]/page.tsx     # Movie insight page (client component)
│   └── api/movie/[id]/route.ts # REST API endpoint
│
├── components/
│   ├── InsightsDashboard.tsx    # ★ Main analytics orchestrator (Basic/Executive toggle)
│   ├── SentimentCharts.tsx      # ★ Recharts pie + aspect bar + emotion distribution
│   ├── DebateMode.tsx           # ★ Love vs Dislike two-column debate card
│   ├── AudiencePersona.tsx      # ★ AI archetype card with dynamic emoji
│   ├── ReviewHighlights.tsx     # ★ Best positive + most critical quote side-by-side
│   ├── ComparativeInsight.tsx   # ★ Genre-comparative stat callout
│   ├── MovieRecommendations.tsx # ★ 3 AI-recommended similar films with links
│   ├── ReliabilityMeter.tsx     # ★ 0-100 score with factor breakdown
│   ├── AIReviewCard.tsx         # AI summary card
│   ├── SearchBar.tsx            # Search input with history dropdown
│   ├── MovieCard.tsx            # Poster + metadata + animated rating bar
│   ├── CastList.tsx             # Staggered cast grid with images
│   ├── SentimentSummary.tsx     # Animated bars + metric badges
│   ├── InsightPanel.tsx         # Theme tags + emotion chips + audience insight
│   ├── SkeletonLoader.tsx       # All skeleton variants + PageSkeleton
│   ├── Loading.tsx              # Spinner with animated pipeline steps
│   ├── ErrorDisplay.tsx         # Error UI with contextual hints
│   ├── ThemeToggle.tsx          # Sun/Moon toggle
│   └── ThemeProvider.tsx        # next-themes wrapper
│
├── lib/
│   ├── openai.ts                # GPT-4o-mini pipeline: 13-field JSON, 5 parsers
│   ├── sentiment.ts             # Helpers: reliabilityScore, labels, default builder
│   ├── cache.ts                 # In-memory Map cache with 1-hour TTL
│   ├── getMovieInsights.ts      # Core pipeline orchestrator
│   ├── omdb.ts                  # OMDb API client
│   ├── tmdb.ts                  # TMDB API client (IMDb→TMDB, cast, reviews)
│   ├── errorHandler.ts          # Centralized API error handler
│   └── env.ts                   # Environment variable validation
│
├── types/
│   ├── insights.ts              # AIInsights (13 fields), CacheEntry, API response types
│   ├── movie.ts                 # MovieMetadata, CastMember, FullMovieInsightResponse
│   └── sentiment.ts             # Sentiment breakdown types
│
├── utils/
│   ├── validation.ts            # Zod IMDb ID schema
│   └── helpers.ts               # cn(), formatNumber, search history utilities
│
├── __tests__/
│   ├── cache.test.ts            # Cache TTL, eviction, hit/miss tests
│   ├── helpers.test.ts          # Utility function tests
│   └── validation.test.ts       # Zod schema validation tests
│
├── .env.local.example
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

> ★ = new component added in the Phase 1–9 platform upgrade

---

## API Reference

### `GET /api/movie/[id]`

**Parameters**: `id` — IMDb ID (e.g., `tt0133093`)

**Success Response** (200):
```json
{
  "data": {
    "movie": { "title": "The Matrix", "year": "1999", "imdbRating": "8.7", ... },
    "cast": [{ "name": "Keanu Reeves", "character": "Neo", ... }],
    "sentiment": {
      "summary": "...",
      "positivePercentage": 78,
      "mixedPercentage": 18,
      "negativePercentage": 4,
      "overallSentiment": "Positive",
      "keyPositiveThemes": ["Visual effects", "Storytelling"],
      "keyCriticismThemes": ["Pacing"],
      "audienceEmotions": ["Excited", "Mind-blown"],
      "rewatchability": "High",
      "audienceTypeInsight": "...",
      "controversyScore": 22,
      "confidenceLevel": "High",
      "reviewsAnalyzed": 87,
      "reviewHighlights": {
        "bestPositive": "A groundbreaking cinematic experience...",
        "bestNegative": "The third act felt rushed and..."
      },
      "comparativeInsight": "Scores 12% above average for sci-fi films of its era.",
      "audiencePersona": "The Visionary Thinker — drawn to films that challenge perception.",
      "debateMode": {
        "lovedReasons": ["Revolutionary visuals", "Philosophical depth"],
        "dislikedReasons": ["Slow first act", "Confusing for casual viewers"]
      },
      "recommendedMovies": [
        { "title": "Inception", "imdbId": "tt1375666", "reason": "similarly mind-bending structure", "genre": "Sci-Fi" }
      ],
      "reliabilityScore": 84,
      "aspectScores": {
        "acting": 8, "story": 9, "visuals": 10, "pacing": 7,
        "emotionalImpact": 8, "overall": 9
      }
    },
    "reviewCount": 87,
    "fromCache": false
  },
  "fromCache": false,
  "generatedAt": "2026-03-03T10:00:00.000Z"
}
```

**Error Response** (400 / 404 / 500 / 502 / 504):
```json
{
  "error": "Invalid IMDb ID format.",
  "code": "INVALID_IMDB_ID",
  "statusCode": 400
}
```

---

## Caching Strategy

- **Server-side**: In-memory `Map` with 1-hour TTL. Cache survives across requests within the same Node.js process instance.
- **Client-side**: On success, the movie title is stored in `localStorage` for the search history dropdown (last 5 entries).
- **Repeated requests**: API returns `fromCache: true` and the UI shows a "Loaded from cache" badge that fades after 3 seconds.

---

## Deployment (Vercel)

1. Push code to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add environment variables in the Vercel dashboard:
   - `OMDB_API_KEY`
   - `TMDB_API_KEY`
   - `OPENAI_API_KEY`
4. Deploy — Vercel handles the rest

> **Note**: The in-memory cache will reset on each Vercel serverless function cold start. For persistent caching across instances, replace with Redis or Vercel KV.

---

## Technical Notes

- **TMDB API key**: Must be the long-form **Bearer token** (API Read Access Token), not the short v3 key
- **OpenAI model**: `gpt-4o-mini` with `response_format: { type: 'json_object' }`, `max_tokens: 2000`
- **Review source**: TMDB only (up to 5 pages, ~100 reviews max, 4000 char budget for GPT)
- **IMDb ID format**: `tt` followed by 7–9 digits (validated via Zod at runtime)
- **Next.js 16**: API route `params` must be typed as `Promise<{ id: string }>` and awaited

---

## Future Extensions

- [ ] Redis / Vercel KV for distributed persistent cache
- [ ] TMDB title search (no IMDb ID required)
- [ ] Historical trend analysis (audience reception over time)
- [ ] Export insights as PDF / shareable image card
- [ ] Webhook integration for automated film monitoring
- [ ] Multi-movie head-to-head comparison view

---

## License

MIT
  

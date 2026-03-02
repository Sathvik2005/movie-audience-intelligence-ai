# 🎬 AI Movie Insight Builder

> **AI-powered audience intelligence engine** — not just a movie lookup tool.

Enter any IMDb ID and get AI-generated sentiment analysis, theme detection, emotion profiling, rewatchability scores, and audience type insights — all powered by GPT.

---

## Product Philosophy

This project is built as a **mini AI-powered audience intelligence engine** rather than a simple movie lookup tool. The system treats audience reviews as raw data and runs them through an AI pipeline to surface structured, actionable insights — the kind a studio executive or film critic would actually find useful.

---

## Architecture

```
User Input (IMDb ID)
        │
        ▼
Next.js 14 Frontend (App Router)
        │
        ▼
API Route → /api/movie/[id]
        │
        ▼
getMovieInsights() pipeline:
  1. Zod IMDb ID validation
  2. Server memory cache check
  3. OMDb API → title, poster, rating, plot
  4. TMDB API → IMDb → TMDB ID conversion
  5. TMDB API → cast (top 12 members)
  6. TMDB API → audience reviews (up to 5 pages)
  7. Review cleaning + 100 review limit + 4000 char budget
  8. OpenAI GPT  → structured sentiment + insights JSON
  9. Cache result (1-hour TTL)
 10. Return FullMovieInsightResponse
        │
        ▼
Frontend renders premium animated UI
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14 (App Router) | Seamless SSR/CSR, file-based routing, API routes |
| Language | TypeScript (strict) | Type safety, maintainability |
| Styling | TailwindCSS + custom CSS variables | Rapid, scalable, themeable |
| Animations | Framer Motion | Production-quality motion with minimal code |
| AI | OpenAI GPT-3.5-turbo | Fast, cost-effective, JSON mode support |
| Movie Data | OMDb API | IMDb metadata (title, rating, poster, plot) |
| Cast + Reviews | TMDB API | Rich cast data + audience review corpus |
| Validation | Zod | Runtime schema validation, clean error messages |
| HTTP | Axios | Interceptors, timeout control, response typing |
| Theming | next-themes | Persistent dark/light mode with SSR safety |

---

## Features

### Core
- Full movie metadata (poster, rating, plot, director, runtime, awards)
- Cast grid with profile photos (12 top-billed actors)
- AI-powered sentiment analysis (Positive / Mixed / Negative %)
- Animated sentiment bars with proportional widths
- Key positive and criticism themes (badge-style tags)
- Audience emotion profile
- Rewatchability indicator (High / Medium / Low)
- Audience type insight paragraph

### Advanced
- **Controversy Score** — formula-derived metric showing how divisive a film is
- **AI Confidence Level** — based on number of reviews analyzed (High / Medium / Low)
- **Instant cache indicator** — fades out after 3 seconds when served from cache
- **Search history** — last 5 searches persisted in `localStorage`, shown as dropdown
- **Dark mode toggle** — persistent via `localStorage`, SSR-safe
- **Skeleton loaders** — preview structure while data loads
- **Graceful error UI** — contextual hints per error code

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm / pnpm / yarn
- API keys (see below)

### Installation

```bash
# 1. Clone or download the project
cd ai-movie-insight-builder

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
│   ├── SearchBar.tsx           # Search input with history dropdown
│   ├── MovieCard.tsx           # Poster + metadata + animated rating bar
│   ├── CastList.tsx            # Staggered cast grid with images
│   ├── SentimentSummary.tsx    # Animated bars + metric badges
│   ├── InsightPanel.tsx        # Theme tags + emotion chips + audience insight
│   ├── SkeletonLoader.tsx      # All skeleton variants + PageSkeleton
│   ├── Loading.tsx             # Spinner with animated pipeline steps
│   ├── ErrorDisplay.tsx        # Error UI with contextual hints
│   ├── ThemeToggle.tsx         # Sun/Moon toggle button
│   └── ThemeProvider.tsx       # next-themes wrapper
│
├── lib/
│   ├── env.ts                  # Environment variable validation
│   ├── omdb.ts                 # OMDb API client
│   ├── tmdb.ts                 # TMDB API client (IMDb→TMDB, cast, reviews)
│   ├── openai.ts               # OpenAI analysis + safe JSON parsing
│   ├── cache.ts                # In-memory server cache with TTL
│   ├── sentiment.ts            # Helpers + default insight builder
│   ├── errorHandler.ts         # Centralized API error handler
│   └── getMovieInsights.ts     # Core data pipeline orchestrator
│
├── types/
│   ├── movie.ts                # MovieMetadata, CastMember, API response types
│   ├── sentiment.ts            # Sentiment breakdown types
│   └── insights.ts             # AIInsights, CacheEntry, API response types
│
├── utils/
│   ├── validation.ts           # Zod IMDb ID schema
│   └── helpers.ts              # cn(), formatNumber, search history utilities
│
├── .env.local.example
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

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
      "reviewsAnalyzed": 87
    },
    "reviewCount": 87,
    "fromCache": false
  },
  "fromCache": false,
  "generatedAt": "2026-03-02T10:00:00.000Z"
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

## Assumptions

- TMDB API key is a **Bearer token** (API Read Access Token), not a v3 API key
- OpenAI model: `gpt-3.5-turbo` with `response_format: { type: 'json_object' }`
- Reviews are sourced from TMDB only (up to 5 pages, ~100 reviews max)
- IMDb IDs must match pattern `tt` + 7–9 digits

---

## Future Extensions

- [ ] Redis / Vercel KV for distributed cache
- [ ] TMDB search by title (instead of requiring exact IMDb ID)
- [ ] Historical trend analysis (compare audience reception over time)
- [ ] Multi-movie comparison view
- [ ] Export insights as PDF/image
- [ ] Webhook integration for automated movie monitoring

---

## License

MIT

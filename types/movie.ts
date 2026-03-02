// ──────────────────────────────────────────────
// types/movie.ts — Movie metadata & cast types
// ──────────────────────────────────────────────

export interface MovieMetadata {
  imdbId: string;
  title: string;
  year: string;
  rated: string;
  released: string;
  runtime: string;
  genre: string;
  director: string;
  writer: string;
  actors: string;
  plot: string;
  language: string;
  country: string;
  awards: string;
  poster: string;
  imdbRating: string;
  imdbVotes: string;
  type: string;
  boxOffice?: string;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profilePath: string | null;
  order: number;
}

export interface OMDbRawResponse {
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  imdbRating: string;
  imdbVotes: string;
  imdbID: string;
  Type: string;
  BoxOffice?: string;
  Response: "True" | "False";
  Error?: string;
}

export interface TMDBFindResponse {
  movie_results: Array<{ id: number; title: string }>;
}

export interface TMDBCreditsResponse {
  cast: Array<{
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
    order: number;
  }>;
}

export interface TMDBReviewsResponse {
  results: Array<{
    id: string;
    author: string;
    content: string;
    created_at: string;
  }>;
  total_pages: number;
  total_results: number;
}

export interface FullMovieInsightResponse {
  movie: MovieMetadata;
  cast: CastMember[];
  sentiment: import("@/types/insights").AIInsights;
  reviewCount: number;
  cachedAt?: number;
  fromCache?: boolean;
}

export interface OMDbSearchItem {
  Title: string;
  Year: string;
  imdbID: string;
  Type: string;
  Poster: string;
}

export interface OMDbSearchResponse {
  Search?: OMDbSearchItem[];
  totalResults?: string;
  Response: "True" | "False";
  Error?: string;
}

export interface MovieSearchResult {
  imdbId: string;
  title: string;
  year: string;
  poster: string;
  type: string;
}

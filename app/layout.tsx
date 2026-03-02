import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Movie Insight Builder",
  description:
    "AI-powered audience intelligence engine. Enter any IMDb ID to generate deep sentiment analysis, key themes, emotions, and audience insights.",
  keywords: ["movies", "AI", "sentiment analysis", "audience insights", "IMDb"],
  openGraph: {
    title: "AI Movie Insight Builder",
    description: "AI-powered audience intelligence engine for movies.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Navigation */}
          <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="text-xl">🎬</span>
                <span className="font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
                  AI Movie Insights
                </span>
              </Link>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-xs text-muted-foreground px-2 py-1 rounded-full border border-border">
                  Powered by GPT
                </span>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="container mx-auto max-w-6xl px-4 py-8">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-border/40 mt-16 py-6">
            <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
              <p>
                Built with Next.js 14 · OpenAI · TMDB · OMDb ·{" "}
                <a
                  href="https://github.com"
                  className="underline hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              </p>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

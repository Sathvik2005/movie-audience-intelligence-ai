"use client";

import { motion } from "framer-motion";
import { Users, Sparkles } from "lucide-react";
import type { AIInsights } from "@/types/insights";
import { cn } from "@/utils/helpers";

interface AudiencePersonaProps {
  insights: AIInsights;
  className?: string;
}

const PERSONA_ICONS = ["🎬", "🧪", "🎭", "🌌", "💡", "🕵️", "🔥", "🎯"];

function pickIcon(persona: string): string {
  const lower = persona.toLowerCase();
  if (lower.includes("sci") || lower.includes("tech")) return "🧪";
  if (lower.includes("action") || lower.includes("thriller")) return "🔥";
  if (lower.includes("drama") || lower.includes("emotion")) return "🎭";
  if (lower.includes("mystery") || lower.includes("detective")) return "🕵️";
  if (lower.includes("intellect") || lower.includes("philos")) return "💡";
  if (lower.includes("fantasy") || lower.includes("space") || lower.includes("epic")) return "🌌";
  return PERSONA_ICONS[Math.floor(Math.random() * PERSONA_ICONS.length)];
}

export function AudiencePersona({ insights, className }: AudiencePersonaProps) {
  if (!insights.audiencePersona || insights.audiencePersona.length < 20) return null;

  const icon = pickIcon(insights.audiencePersona);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Gradient header strip */}
      <div className="h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />

      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-violet-100 dark:bg-violet-900/40 text-2xl shrink-0">
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Audience Persona</h2>
              <span className="flex items-center gap-1 text-xs bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full font-medium">
                <Sparkles className="h-3 w-3" />
                AI-Generated
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Who is the ideal viewer for this film?</p>
          </div>
        </div>

        {/* Persona text */}
        <p className="text-sm leading-relaxed text-foreground/90 rounded-xl bg-muted/40 border border-border p-4">
          {insights.audiencePersona}
        </p>

        {/* Audience type tag */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Best suited for:{" "}
            <span className="font-medium text-foreground">
              {insights.audienceTypeInsight}
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

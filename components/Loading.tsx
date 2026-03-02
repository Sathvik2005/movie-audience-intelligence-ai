"use client";

import { motion } from "framer-motion";
import { cn } from "@/utils/helpers";

interface LoadingProps {
  message?: string;
  className?: string;
}

export function Loading({ message = "Analyzing movie…", className }: LoadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16",
        className
      )}
      aria-live="polite"
      aria-label={message}
    >
      <div className="relative h-14 w-14">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-primary/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        {/* Inner spinning arc */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        {/* Center emoji */}
        <div className="absolute inset-0 flex items-center justify-center text-xl">
          🎬
        </div>
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-foreground">{message}</p>
        <p className="text-sm text-muted-foreground mt-1">
          Fetching data &amp; running AI analysis…
        </p>
      </div>

      {/* Pipeline steps */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="flex flex-col items-start gap-1.5 mt-2 text-xs text-muted-foreground"
      >
        {[
          "Fetching movie metadata…",
          "Loading cast information…",
          "Collecting audience reviews…",
          "Running AI sentiment analysis…",
        ].map((step, i) => (
          <motion.p
            key={step}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5 + i * 0.8 }}
            className="flex items-center gap-1.5"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
            {step}
          </motion.p>
        ))}
      </motion.div>
    </div>
  );
}

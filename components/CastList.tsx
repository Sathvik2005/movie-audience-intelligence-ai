"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { CastMember } from "@/types/movie";
import { castPlaceholderUrl } from "@/utils/helpers";
import { cn } from "@/utils/helpers";

interface CastListProps {
  cast: CastMember[];
  className?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export function CastList({ cast, className }: CastListProps) {
  if (!cast.length) return null;

  return (
    <div className={cn("space-y-4", className)}>
      <SectionHeader>Cast</SectionHeader>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4"
      >
        {cast.map((member) => (
          <motion.div key={member.id} variants={item}>
            <CastCard member={member} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function CastCard({ member }: { member: CastMember }) {
  const imgSrc = member.profilePath ?? castPlaceholderUrl(member.name);

  return (
    <div className="group flex flex-col items-center gap-2">
      {/* Photo */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-border shadow-sm group-hover:shadow-md transition-shadow">
        <Image
          src={imgSrc}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
          unoptimized={!member.profilePath}
        />
      </div>

      {/* Name & character */}
      <div className="text-center w-full">
        <p className="text-xs font-semibold text-foreground leading-tight truncate">
          {member.name}
        </p>
        {member.character && (
          <p className="text-xs text-muted-foreground truncate leading-tight mt-0.5">
            {member.character}
          </p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
      <span className="h-5 w-1 rounded-full bg-primary" />
      {children}
    </h2>
  );
}

"use client";
import { cn } from "@/src/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  ring?: boolean;
}

export function Avatar({ src, alt = "Avatar", fallback, size = "md", className, ring = false }: AvatarProps) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
    "2xl": "w-24 h-24 text-2xl",
  };

  const ringClass = ring ? "ring-2 ring-[#1DB954] ring-offset-2 ring-offset-[#09090b]" : "";

  if (!src) {
    return (
      <div className={cn("rounded-full bg-zinc-800 flex items-center justify-center font-semibold text-zinc-300 flex-shrink-0", sizes[size], ringClass, className)}>
        {fallback?.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <div className={cn("rounded-full overflow-hidden flex-shrink-0 relative", sizes[size], ringClass, className)}>
      <Image src={src} alt={alt} fill className="object-cover" unoptimized />
    </div>
  );
}

export function AvatarGroup({ avatars, max = 3, size = "sm" }: { avatars: string[]; max?: number; size?: "xs" | "sm" | "md" }) {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visible.map((src, i) => (
        <Avatar key={i} src={src} size={size} className="border-2 border-[#09090b]" />
      ))}
      {remaining > 0 && (
        <div className={cn("rounded-full bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-300 border-2 border-[#09090b]",
          size === "xs" ? "w-6 h-6" : size === "sm" ? "w-8 h-8" : "w-10 h-10"
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
}

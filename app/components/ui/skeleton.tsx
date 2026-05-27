"use client";
import { cn } from "@/src/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "circle" | "text";
}

export function Skeleton({ className, variant = "default" }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-zinc-800/80",
        variant === "circle" ? "rounded-full" : "rounded-xl",
        variant === "text" ? "h-4 rounded" : "",
        className
      )}
    />
  );
}

export function SongCardSkeleton() {
  return (
    <div className="bg-[#121214] rounded-3xl p-4 border border-zinc-800/50">
      <Skeleton className="w-full aspect-square rounded-2xl mb-3" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-3" />
      <Skeleton className="h-2 w-full mb-2" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function ArtistCardSkeleton() {
  return (
    <div className="bg-[#121214] rounded-3xl p-4 border border-zinc-800/50 text-center">
      <Skeleton variant="circle" className="w-20 h-20 mx-auto mb-3" />
      <Skeleton className="h-4 w-2/3 mx-auto mb-2" />
      <Skeleton className="h-3 w-1/2 mx-auto mb-3" />
      <Skeleton className="h-8 w-full rounded-2xl" />
    </div>
  );
}

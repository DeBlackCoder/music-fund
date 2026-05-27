"use client";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
  color?: "green" | "amber" | "blue" | "purple";
  size?: "sm" | "md" | "lg";
}

export function Progress({ value, max = 100, className, showLabel = false, color = "green", size = "md" }: ProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    green: "from-[#1DB954] to-[#17a34a]",
    amber: "from-amber-500 to-amber-400",
    blue: "from-blue-500 to-blue-400",
    purple: "from-purple-500 to-purple-400",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn("w-full bg-zinc-800 rounded-full overflow-hidden", sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className={cn("h-full rounded-full bg-gradient-to-r", colors[color])}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-zinc-400 mt-1">{Math.round(percentage)}%</span>
      )}
    </div>
  );
}

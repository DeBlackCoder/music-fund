"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color?: "green" | "blue" | "purple" | "amber" | "red";
  subtitle?: string;
}

export function DashboardStatCard({ title, value, change, icon, color = "green", subtitle }: DashboardStatCardProps) {
  const colors = {
    green: { bg: "bg-[#1DB954]/10", text: "text-[#1DB954]", border: "border-[#1DB954]/20" },
    blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20" },
    amber: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    red: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  };

  const c = colors[color];
  const isPositive = change !== undefined && change >= 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center border", c.bg, c.border)}>
          <span className={c.text}>{icon}</span>
        </div>
        {change !== undefined && (
          <div className={cn("flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-xl", isPositive ? "bg-[#1DB954]/10 text-[#1DB954]" : "bg-red-500/10 text-red-400")}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-zinc-400">{title}</p>
      {subtitle && <p className="text-xs text-zinc-600 mt-1">{subtitle}</p>}
    </motion.div>
  );
}

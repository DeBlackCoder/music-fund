"use client";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, glass = false, onClick }: CardProps) {
  const base = "rounded-3xl border border-zinc-800/50 overflow-hidden";
  const bg = glass ? "glass" : "bg-[#121214]";
  const hoverClass = hover ? "card-hover cursor-pointer" : "";

  if (hover || onClick) {
    return (
      <motion.div
        whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(29,185,84,0.08)" }}
        transition={{ duration: 0.3 }}
        className={cn(base, bg, hoverClass, className)}
        onClick={onClick}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cn(base, bg, className)}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pb-0", className)}>{children}</div>;
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6", className)}>{children}</div>;
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("p-6 pt-0", className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn("text-lg font-semibold text-white", className)}>{children}</h3>;
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-zinc-400 mt-1", className)}>{children}</p>;
}

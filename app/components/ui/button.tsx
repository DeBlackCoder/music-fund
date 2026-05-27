"use client";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "accent" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "md", loading, children, className, disabled, ...props }, ref) => {
    const variants = {
      default: "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700",
      accent: "bg-[#1DB954] hover:bg-[#17a34a] text-black font-semibold shadow-lg shadow-[#1DB954]/20",
      outline: "bg-transparent hover:bg-zinc-800/50 text-white border border-zinc-600 hover:border-zinc-500",
      ghost: "bg-transparent hover:bg-zinc-800/50 text-zinc-300 hover:text-white",
      destructive: "bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30",
      secondary: "bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-xl",
      md: "px-4 py-2 text-sm rounded-2xl",
      lg: "px-6 py-3 text-base rounded-2xl",
      icon: "p-2 rounded-xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={cn(
          "inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || loading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

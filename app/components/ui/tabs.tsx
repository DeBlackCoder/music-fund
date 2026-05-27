"use client";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  children?: (activeTab: string) => React.ReactNode;
  variant?: "default" | "pills" | "underline";
}

export function Tabs({ tabs, defaultTab, onChange, className, children, variant = "default" }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={cn(
        "flex gap-1",
        variant === "default" && "bg-zinc-900/50 p-1 rounded-2xl border border-zinc-800",
        variant === "pills" && "gap-2",
        variant === "underline" && "border-b border-zinc-800 gap-0"
      )}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 cursor-pointer",
              variant === "default" && "rounded-xl flex-1 justify-center",
              variant === "pills" && "rounded-2xl px-4 py-2",
              variant === "underline" && "rounded-none px-4 py-3 border-b-2 -mb-px",
              active === tab.id
                ? variant === "underline"
                  ? "text-[#1DB954] border-[#1DB954]"
                  : "text-white"
                : "text-zinc-400 hover:text-zinc-200 border-transparent"
            )}
          >
            {active === tab.id && variant !== "underline" && (
              <motion.div
                layoutId={`tab-bg-${variant}`}
                className={cn(
                  "absolute inset-0 rounded-xl",
                  variant === "default" ? "bg-zinc-800" : "bg-[#1DB954]/10 border border-[#1DB954]/20"
                )}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span className={cn("text-xs px-1.5 py-0.5 rounded-full", active === tab.id ? "bg-[#1DB954]/20 text-[#1DB954]" : "bg-zinc-800 text-zinc-500")}>
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        ))}
      </div>
      {children && (
        <div className="mt-4">
          {children(active)}
        </div>
      )}
    </div>
  );
}

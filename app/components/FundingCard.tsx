"use client";
import { motion } from "framer-motion";
import { Users, Clock, Trophy } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { formatCurrency, getFundingPercentage } from "@/src/lib/utils";
import type { Song } from "@/src/types";
import { useState } from "react";
import { toast } from "sonner";

interface FundingCardProps {
  song: Song;
  sticky?: boolean;
}

const supportAmounts = [500, 1000, 5000];

export function FundingCard({ song, sticky = false }: FundingCardProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState("");
  const percentage = getFundingPercentage(song.amountRaised, song.fundingGoal);

  const handleSupport = () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;
    if (!amount) return;
    toast.success(`Thank you for supporting with ${formatCurrency(amount)}! 🎵`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#121214] rounded-3xl border border-zinc-800/50 p-6 ${sticky ? "lg:sticky lg:top-24" : ""}`}
    >
      {/* Progress */}
      <div className="mb-5">
        <div className="flex justify-between items-end mb-2">
          <div>
            <p className="text-3xl font-black text-white">{formatCurrency(song.amountRaised)}</p>
            <p className="text-sm text-zinc-400">raised of {formatCurrency(song.fundingGoal)}</p>
          </div>
          <span className="text-2xl font-black text-[#1DB954]">{percentage}%</span>
        </div>
        <Progress value={percentage} size="lg" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: Users, label: "Supporters", value: song.supporters.toLocaleString() },
          { icon: Clock, label: "Days Left", value: song.daysLeft > 0 ? song.daysLeft.toString() : "Ended" },
          { icon: Trophy, label: "Goal", value: formatCurrency(song.fundingGoal) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="bg-zinc-900/50 rounded-2xl p-3 text-center border border-zinc-800/30">
            <Icon className="w-4 h-4 text-zinc-500 mx-auto mb-1" />
            <p className="text-sm font-bold text-white">{value}</p>
            <p className="text-xs text-zinc-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Amount Selection */}
      <div className="mb-4">
        <p className="text-sm font-semibold text-zinc-300 mb-3">Choose amount</p>
        <div className="grid grid-cols-3 gap-2 mb-3">
          {supportAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => { setSelectedAmount(amount); setCustomAmount(""); }}
              className={`py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${selectedAmount === amount && !customAmount ? "bg-[#1DB954] text-black" : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-600"}`}
            >
              {formatCurrency(amount)}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Custom amount (₦)"
          value={customAmount}
          onChange={(e) => { setCustomAmount(e.target.value); setSelectedAmount(null); }}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1DB954]/50 transition-all"
        />
      </div>

      <Button variant="accent" size="lg" className="w-full" onClick={handleSupport}>
        Support This Song 🎵
      </Button>

      <p className="text-xs text-zinc-600 text-center mt-3">
        Deadline: {new Date(song.deadline).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
      </p>
    </motion.div>
  );
}

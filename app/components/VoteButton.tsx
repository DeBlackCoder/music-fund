"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Vote, Loader2 } from "lucide-react";
import { useInitializeVote } from "@/src/hooks/useVoting";
import { usePlatformSettings } from "@/src/hooks/usePlatformSettings";
import { formatFullCurrency } from "@/src/lib/utils";
import { toast } from "sonner";

interface VoteButtonProps {
  campaignId: string;
  campaignSlug: string;
  campaignStatus: string;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg" | "icon";
  className?: string;
}

export function VoteButton({
  campaignId,
  campaignSlug,
  campaignStatus,
  variant = "default",
  size = "md",
  className,
}: VoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [voteCount, setVoteCount] = useState(1);
  const [voterEmail, setVoterEmail] = useState("");

  const { data: settings } = usePlatformSettings();
  const initializeVote = useInitializeVote();

  const votePrice = settings?.votePrice || 100;
  const totalAmount = voteCount * votePrice;

  const handleVote = async () => {
    if (campaignStatus !== "active") {
      toast.error("This campaign is not accepting votes");
      return;
    }

    if (!voterEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(voterEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (voteCount < 1) {
      toast.error("Vote count must be at least 1");
      return;
    }

    try {
      const result = await initializeVote.mutateAsync({
        campaignId,
        voteCount,
        voterEmail,
      });

      // Store reference for verification
      localStorage.setItem("pendingVoteRef", result.transactionRef);
      localStorage.setItem("pendingCampaignSlug", campaignSlug);

      // Redirect to Paystack payment page
      window.location.href = result.authorizationUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to initialize vote");
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setIsOpen(true)}
        disabled={campaignStatus !== "active"}
      >
        <Vote className="w-4 h-4 mr-2" />
        Vote
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle>Vote for this Campaign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Your Email</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={voterEmail}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoterEmail(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
              />
              <p className="text-xs text-zinc-500">Used for your payment receipt only</p>
            </div>

            {/* Vote count */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-300">Number of Votes</label>
              <Input
                type="number"
                min="1"
                value={voteCount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setVoteCount(Math.max(1, parseInt(e.target.value) || 1))
                }
                className="bg-zinc-800 border-zinc-700 text-white"
              />
              <p className="text-xs text-zinc-500">
                Each vote costs {formatFullCurrency(votePrice)}
              </p>
            </div>

            {/* Summary */}
            <div className="p-4 bg-zinc-800 rounded-xl space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Vote Count</span>
                <span className="font-semibold text-white">{voteCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Price per Vote</span>
                <span className="text-white">{formatFullCurrency(votePrice)}</span>
              </div>
              <div className="h-px bg-zinc-700 my-1" />
              <div className="flex justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="text-lg font-bold text-[#1DB954]">
                  {formatFullCurrency(totalAmount)}
                </span>
              </div>
            </div>

            <Button
              onClick={handleVote}
              disabled={initializeVote.isPending || voteCount < 1 || !voterEmail}
              className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold"
            >
              {initializeVote.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Proceed to Payment"
              )}
            </Button>

            <p className="text-xs text-center text-zinc-500">
              You will be redirected to Paystack to complete your payment
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

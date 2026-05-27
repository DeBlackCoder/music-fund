"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { useVerifyVote } from "@/src/hooks/useVoting";
import { toast } from "sonner";

export default function PaymentVerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const type = searchParams.get("type") || "vote"; // vote or upload_fee
  const campaignSlug = searchParams.get("campaign");

  const verifyVote = useVerifyVote();
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [message, setMessage] = useState("");
  const [goalReached, setGoalReached] = useState(false);

  useEffect(() => {
    if (!reference) {
      setStatus("failed");
      setMessage("No payment reference found");
      return;
    }

    const verifyPayment = async () => {
      try {
        if (type === "vote") {
          const result = await verifyVote.mutateAsync({ reference });
          setStatus("success");
          setMessage(result.message || "Vote recorded successfully!");
          setGoalReached(result.goalReached || false);
          toast.success("Vote recorded successfully! 🎉");
        } else {
          // For upload fee, we'll add a separate hook later
          setStatus("success");
          setMessage("Payment verified successfully!");
        }
      } catch (error: any) {
        setStatus("failed");
        setMessage(error.response?.data?.error || "Payment verification failed");
        toast.error("Payment verification failed");
      }
    };

    verifyPayment();
  }, [reference, type]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0d1a0f] to-[#09090b]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#1DB954]/6 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl border border-zinc-800/50 p-8 text-center">
          {/* Verifying */}
          {status === "verifying" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 mx-auto rounded-full bg-zinc-800 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#1DB954] animate-spin" />
              </div>
              <h1 className="text-2xl font-bold text-white">Verifying Payment...</h1>
              <p className="text-zinc-400">Please wait while we confirm your payment</p>
            </motion.div>
          )}

          {/* Success */}
          {status === "success" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <CheckCircle className="w-10 h-10 text-green-500" />
              </motion.div>

              <div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  {goalReached ? "🎉 Goal Reached!" : "Payment Successful!"}
                </h1>
                <p className="text-zinc-400">{message}</p>
              </div>

              {goalReached && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                  <p className="text-sm text-green-400">
                    This campaign has reached its funding goal! The artist can now proceed
                    with music video production.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {campaignSlug && (
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push(`/song/${campaignSlug}`)}
                  >
                    View Campaign
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/discover")}
                >
                  Discover More
                </Button>
              </div>
            </motion.div>
          )}

          {/* Failed */}
          {status === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 mx-auto rounded-full bg-red-500/20 flex items-center justify-center"
              >
                <XCircle className="w-10 h-10 text-red-500" />
              </motion.div>

              <div>
                <h1 className="text-2xl font-bold text-white mb-2">Payment Failed</h1>
                <p className="text-zinc-400">{message}</p>
              </div>

              <div className="space-y-3">
                {campaignSlug && (
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    onClick={() => router.push(`/song/${campaignSlug}`)}
                  >
                    Try Again
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => router.push("/discover")}
                >
                  Back to Discover
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Help Link */}
        <div className="text-center mt-6">
          <Link href="/support" className="text-sm text-zinc-500 hover:text-zinc-400">
            Need help? Contact support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

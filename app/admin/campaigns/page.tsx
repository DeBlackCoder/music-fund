"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Music,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Eye,
  Calendar,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { useIsAuthenticated } from "@/src/hooks/useAuth";
import {
  useAdminCampaigns,
  useApproveCampaign,
  useRejectCampaign,
} from "@/src/hooks/useAdminCampaigns";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { toast } from "sonner";

function CampaignsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "all";

  const { isAuthenticated, user, isLoading: authLoading } = useIsAuthenticated();
  const [status, setStatus] = useState(statusParam);
  const [page, setPage] = useState(1);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading } = useAdminCampaigns({ status, page, limit: 20 });
  const approveMutation = useApproveCampaign();
  const rejectMutation = useRejectCampaign();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to access admin panel");
      router.push("/auth/login");
      return;
    }
    if (!authLoading && user?.role !== "admin") {
      toast.error("Access denied. Admin only.");
      router.push("/discover");
    }
  }, [isAuthenticated, user, authLoading, router]);

  const handleApprove = async (campaignId: string) => {
    if (confirm("Are you sure you want to approve this campaign?")) {
      await approveMutation.mutateAsync(campaignId);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    await rejectMutation.mutateAsync({
      campaignId: selectedCampaign.id,
      reason: rejectionReason,
    });
    setShowRejectDialog(false);
    setRejectionReason("");
    setSelectedCampaign(null);
  };

  const openRejectDialog = (campaign: any) => {
    setSelectedCampaign(campaign);
    setShowRejectDialog(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  const getStatusBadge = (s: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", label: "Pending" },
      active: { color: "bg-green-500/20 text-green-500 border-green-500/30", label: "Active" },
      goal_reached: { color: "bg-blue-500/20 text-blue-500 border-blue-500/30", label: "Goal Reached" },
      rejected: { color: "bg-red-500/20 text-red-500 border-red-500/30", label: "Rejected" },
      ended: { color: "bg-zinc-500/20 text-zinc-500 border-zinc-500/30", label: "Ended" },
    };
    const variant = variants[s] || variants.pending;
    return (
      <Badge variant="outline" className={variant.color}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Button variant="ghost" onClick={() => router.push("/admin")} className="mb-4">
          ← Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold mb-2">Campaign Management</h1>
        <p className="text-zinc-400">Review and manage artist campaigns</p>
      </motion.div>

      {/* Stats */}
      {data?.stats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          {[
            { label: "Total", value: data.stats.total },
            { label: "Pending", value: data.stats.pending },
            { label: "Active", value: data.stats.active },
            { label: "Goal Reached", value: data.stats.goalReached },
            { label: "Rejected", value: data.stats.rejected },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#121214] rounded-2xl border border-zinc-800/50 p-4">
              <p className="text-sm text-zinc-400 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-6 overflow-x-auto pb-2"
      >
        {["all", "pending", "active", "goal_reached", "rejected", "ended"].map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            onClick={() => { setStatus(s); setPage(1); }}
            className="capitalize"
          >
            {s.replace("_", " ")}
          </Button>
        ))}
      </motion.div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        </div>
      ) : data?.campaigns.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No campaigns found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.campaigns.map((campaign, index) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                <img
                  src={campaign.coverImage}
                  alt={campaign.title}
                  className="w-full md:w-32 h-32 rounded-2xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{campaign.title}</h3>
                      <p className="text-sm text-zinc-400">by {campaign.artist.artistName}</p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Goal Amount</p>
                      <p className="font-bold text-white">{formatCurrency(campaign.goalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Raised</p>
                      <p className="font-bold text-[#1DB954]">{formatCurrency(campaign.raisedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Votes</p>
                      <p className="font-bold text-white">{campaign.voteCount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Days Left</p>
                      <p className="font-bold text-white">{campaign.daysLeft}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Created {formatDate(campaign.createdAt)}</span>
                    {campaign.approvedAt && (
                      <>
                        <span>•</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Approved {formatDate(campaign.approvedAt)}</span>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/song/${campaign.slug}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                    {campaign.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApprove(campaign.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(campaign)}
                          disabled={rejectMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span className="flex items-center px-4 text-zinc-400">
            Page {page} of {data.pagination.pages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === data.pagination.pages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Campaign</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this campaign. The artist will be notified.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter rejection reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
                setSelectedCampaign(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Reject Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminCampaignsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        </div>
      }
    >
      <CampaignsContent />
    </Suspense>
  );
}

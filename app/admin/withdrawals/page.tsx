"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  User,
  Music,
  CreditCard,
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
  useAdminWithdrawals,
  useApproveWithdrawal,
  useRejectWithdrawal,
} from "@/src/hooks/useAdminWithdrawals";
import { formatCurrency, formatDate } from "@/src/lib/utils";
import { toast } from "sonner";

function WithdrawalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "all";
  
  const { isAuthenticated, user, isLoading: authLoading } = useIsAuthenticated();
  const [status, setStatus] = useState(statusParam);
  const [page, setPage] = useState(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data, isLoading } = useAdminWithdrawals({ status, page, limit: 20 });
  const approveMutation = useApproveWithdrawal();
  const rejectMutation = useRejectWithdrawal();

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

  const handleApprove = async (withdrawalId: string) => {
    if (confirm("Are you sure you want to approve this withdrawal? This will process the payment.")) {
      await approveMutation.mutateAsync(withdrawalId);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }

    await rejectMutation.mutateAsync({
      withdrawalId: selectedWithdrawal.id,
      reason: rejectionReason,
    });

    setShowRejectDialog(false);
    setRejectionReason("");
    setSelectedWithdrawal(null);
  };

  const openRejectDialog = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setShowRejectDialog(true);
  };

  const openDetailsDialog = (withdrawal: any) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsDialog(true);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      pending: { color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", label: "Pending" },
      approved: { color: "bg-green-500/20 text-green-500 border-green-500/30", label: "Approved" },
      processed: { color: "bg-blue-500/20 text-blue-500 border-blue-500/30", label: "Processed" },
      rejected: { color: "bg-red-500/20 text-red-500 border-red-500/30", label: "Rejected" },
    };

    const variant = variants[status] || variants.pending;
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
        <Button
          variant="ghost"
          onClick={() => router.push("/admin")}
          className="mb-4"
        >
          ← Back to Dashboard
        </Button>
        <h1 className="text-4xl font-bold mb-2">Withdrawal Management</h1>
        <p className="text-zinc-400">Review and process artist withdrawal requests</p>
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
            { label: "Total", value: data.stats.total, color: "zinc" },
            { label: "Pending", value: data.stats.pending, color: "yellow" },
            { label: "Approved", value: data.stats.approved, color: "green" },
            { label: "Processed", value: data.stats.processed, color: "blue" },
            { label: "Rejected", value: data.stats.rejected, color: "red" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-[#121214] rounded-2xl border border-zinc-800/50 p-4"
            >
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
        {["all", "pending", "approved", "processed", "rejected"].map((s) => (
          <Button
            key={s}
            variant={status === s ? "default" : "outline"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className="capitalize"
          >
            {s}
          </Button>
        ))}
      </motion.div>

      {/* Withdrawals List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
        </div>
      ) : data?.withdrawals.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-400">No withdrawal requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.withdrawals.map((withdrawal, index) => (
            <motion.div
              key={withdrawal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Artist Info */}
                <div className="flex items-center gap-4">
                  <img
                    src={withdrawal.artist.avatar || '/placeholder-avatar.png'}
                    alt={withdrawal.artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-white">{withdrawal.artist.artistName}</p>
                    <p className="text-sm text-zinc-400">{withdrawal.artist.email}</p>
                    <p className="text-xs text-zinc-500">{withdrawal.artist.phone}</p>
                  </div>
                </div>

                {/* Withdrawal Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-zinc-400 mb-1">Campaign</p>
                      <p className="font-bold text-white">{withdrawal.campaign.title}</p>
                    </div>
                    {getStatusBadge(withdrawal.status)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Amount</p>
                      <p className="font-bold text-white">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Commission</p>
                      <p className="font-bold text-red-500">
                        -{formatCurrency(withdrawal.platformCommission)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Net Amount</p>
                      <p className="font-bold text-[#1DB954]">
                        {formatCurrency(withdrawal.netAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-zinc-400 mb-4">
                    <Clock className="w-4 h-4" />
                    <span>Requested {formatDate(withdrawal.requestedAt)}</span>
                    {withdrawal.processedAt && (
                      <>
                        <span>•</span>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Processed {formatDate(withdrawal.processedAt)}</span>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(withdrawal)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Bank Details
                    </Button>

                    {withdrawal.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApprove(withdrawal.id)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => openRejectDialog(withdrawal)}
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
          <Button
            variant="outline"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
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

      {/* Bank Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bank Account Details</DialogTitle>
            <DialogDescription>
              Artist's bank account information for withdrawal processing
            </DialogDescription>
          </DialogHeader>
          {selectedWithdrawal && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-zinc-400 mb-1">Account Name</p>
                <p className="font-bold text-white">
                  {selectedWithdrawal.bankDetails.accountName}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Account Number</p>
                <p className="font-bold text-white">
                  {selectedWithdrawal.bankDetails.accountNumber}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Bank Name</p>
                <p className="font-bold text-white">
                  {selectedWithdrawal.bankDetails.bankName}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-400 mb-1">Bank Code</p>
                <p className="font-bold text-white">
                  {selectedWithdrawal.bankDetails.bankCode}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Withdrawal</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this withdrawal request. The artist
              will be notified.
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
                setSelectedWithdrawal(null);
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
              Reject Withdrawal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AdminWithdrawalsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    }>
      <WithdrawalsContent />
    </Suspense>
  );
}

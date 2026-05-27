"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Settings, Loader2, Save, DollarSign, TrendingUp } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useIsAuthenticated } from "@/src/hooks/useAuth";
import { usePlatformSettings } from "@/src/hooks/usePlatformSettings";
import { useUpdatePlatformSettings } from "@/src/hooks/useAdminSettings";
import { formatCurrency } from "@/src/lib/utils";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useIsAuthenticated();
  const { data: settings, isLoading: settingsLoading } = usePlatformSettings();
  const updateMutation = useUpdatePlatformSettings();

  const [formData, setFormData] = useState({
    uploadFee: 0,
    votePrice: 0,
    platformCommission: 0,
    minGoalAmount: 0,
    maxGoalAmount: 0,
    defaultCampaignDuration: 0,
  });

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

  useEffect(() => {
    if (settings) {
      setFormData({
        uploadFee: settings.uploadFee,
        votePrice: settings.votePrice,
        platformCommission: settings.platformCommission,
        minGoalAmount: settings.minGoalAmount,
        maxGoalAmount: settings.maxGoalAmount,
        defaultCampaignDuration: settings.defaultCampaignDuration,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.uploadFee < 0) {
      toast.error("Upload fee cannot be negative");
      return;
    }
    if (formData.votePrice < 0) {
      toast.error("Vote price cannot be negative");
      return;
    }
    if (formData.platformCommission < 0 || formData.platformCommission > 100) {
      toast.error("Platform commission must be between 0 and 100");
      return;
    }
    if (formData.minGoalAmount < 0) {
      toast.error("Minimum goal amount cannot be negative");
      return;
    }
    if (formData.maxGoalAmount < formData.minGoalAmount) {
      toast.error("Maximum goal amount must be greater than minimum");
      return;
    }
    if (formData.defaultCampaignDuration < 1) {
      toast.error("Campaign duration must be at least 1 day");
      return;
    }

    await updateMutation.mutateAsync(formData);
  };

  const handleChange = (field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData((prev) => ({ ...prev, [field]: numValue }));
  };

  if (authLoading || settingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-4xl mx-auto">
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
        <h1 className="text-4xl font-bold mb-2">Platform Settings</h1>
        <p className="text-zinc-400">Configure platform fees and limits</p>
      </motion.div>

      {/* Current Settings Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <div className="bg-[#121214] rounded-2xl border border-zinc-800/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Upload Fee</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(settings?.uploadFee || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#121214] rounded-2xl border border-zinc-800/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Vote Price</p>
              <p className="text-2xl font-bold text-white">
                {formatCurrency(settings?.votePrice || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-[#121214] rounded-2xl border border-zinc-800/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-zinc-400">Commission</p>
              <p className="text-2xl font-bold text-white">
                {settings?.platformCommission || 0}%
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Settings Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Payment Settings */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#1DB954]" />
              Payment Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Upload Fee (₦)
                </label>
                <Input
                  type="number"
                  value={formData.uploadFee}
                  onChange={(e) => handleChange("uploadFee", e.target.value)}
                  placeholder="2000"
                  min="0"
                  step="100"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Fee charged to artists for uploading songs
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Vote Price (₦)
                </label>
                <Input
                  type="number"
                  value={formData.votePrice}
                  onChange={(e) => handleChange("votePrice", e.target.value)}
                  placeholder="100"
                  min="0"
                  step="10"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Price per vote for fans
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Platform Commission (%)
                </label>
                <Input
                  type="number"
                  value={formData.platformCommission}
                  onChange={(e) => handleChange("platformCommission", e.target.value)}
                  placeholder="10"
                  min="0"
                  max="100"
                  step="0.5"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Percentage taken from withdrawals
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Campaign Settings */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-[#1DB954]" />
              Campaign Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Minimum Goal Amount (₦)
                </label>
                <Input
                  type="number"
                  value={formData.minGoalAmount}
                  onChange={(e) => handleChange("minGoalAmount", e.target.value)}
                  placeholder="50000"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Minimum fundraising goal for campaigns
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Maximum Goal Amount (₦)
                </label>
                <Input
                  type="number"
                  value={formData.maxGoalAmount}
                  onChange={(e) => handleChange("maxGoalAmount", e.target.value)}
                  placeholder="10000000"
                  min="0"
                  step="100000"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Maximum fundraising goal for campaigns
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Default Campaign Duration (days)
                </label>
                <Input
                  type="number"
                  value={formData.defaultCampaignDuration}
                  onChange={(e) => handleChange("defaultCampaignDuration", e.target.value)}
                  placeholder="30"
                  min="1"
                  step="1"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Default number of days for campaigns
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-800" />

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-[#1DB954] hover:bg-[#1ed760]"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-3xl"
      >
        <h3 className="text-lg font-bold text-white mb-2">⚠️ Important</h3>
        <p className="text-sm text-zinc-300">
          Changes to these settings will affect all new campaigns and transactions. Existing
          campaigns will continue with their original settings. Please review carefully before
          saving.
        </p>
      </motion.div>
    </div>
  );
}

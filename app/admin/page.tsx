"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  Music,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Settings,
  Eye,
} from "lucide-react";
import { DashboardStatCard } from "@/app/components/DashboardStatCard";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { useIsAuthenticated } from "@/src/hooks/useAuth";
import { useAdminAnalytics } from "@/src/hooks/useAdminAnalytics";
import { useAdminCampaigns } from "@/src/hooks/useAdminCampaigns";
import { useAdminWithdrawals } from "@/src/hooks/useAdminWithdrawals";
import { formatCurrency } from "@/src/lib/utils";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();
  const { data: analytics, isLoading: analyticsLoading } = useAdminAnalytics();
  const { data: pendingCampaigns } = useAdminCampaigns({ status: 'pending', limit: 5 });
  const { data: pendingWithdrawals } = useAdminWithdrawals({ status: 'pending', limit: 5 });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast.error("Please login to access admin panel");
      router.push("/auth/login");
      return;
    }

    if (!isLoading && user?.role !== "admin") {
      toast.error("Access denied. Admin only.");
      router.push("/discover");
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
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
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-zinc-400">Manage platform operations</p>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Total Users",
            value: analyticsLoading ? "Loading..." : analytics?.overview.totalUsers.toLocaleString() || "0",
            change: analytics?.recentActivity.newUsersLast30Days || 0,
            icon: <Users className="w-5 h-5" />,
            color: "blue" as const,
          },
          {
            title: "Active Campaigns",
            value: analyticsLoading ? "Loading..." : analytics?.overview.activeCampaigns.toLocaleString() || "0",
            change: analytics?.recentActivity.newCampaignsLast30Days || 0,
            icon: <Music className="w-5 h-5" />,
            color: "purple" as const,
          },
          {
            title: "Total Raised",
            value: analyticsLoading ? "Loading..." : formatCurrency(analytics?.financial.totalRaised || 0),
            change: 0,
            icon: <DollarSign className="w-5 h-5" />,
            color: "green" as const,
          },
          {
            title: "Platform Earnings",
            value: analyticsLoading ? "Loading..." : formatCurrency(analytics?.financial.totalRevenue || 0),
            change: 0,
            icon: <TrendingUp className="w-5 h-5" />,
            color: "amber" as const,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <DashboardStatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">Pending Campaigns</h3>
              <p className="text-sm text-zinc-400">Awaiting approval</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-4">
            {analytics?.overview.pendingCampaigns || 0}
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/admin/campaigns?status=pending')}
          >
            View Pending
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">Withdrawal Requests</h3>
              <p className="text-sm text-zinc-400">Pending approval</p>
            </div>
          </div>
          <div className="text-3xl font-bold text-white mb-4">
            {pendingWithdrawals?.stats.pending || 0}
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/admin/withdrawals?status=pending')}
          >
            View Requests
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">
              <Settings className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-bold text-white">Platform Settings</h3>
              <p className="text-sm text-zinc-400">Configure fees</p>
            </div>
          </div>
          <div className="text-sm text-zinc-400 mb-4">
            Upload Fee, Vote Price, Commission
          </div>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => router.push('/admin/settings')}
          >
            Manage Settings
          </Button>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#1DB954]" />
            Financial Overview
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Raised</span>
              <span className="font-bold text-white">
                {formatCurrency(analytics?.financial.totalRaised || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Upload Fees</span>
              <span className="font-bold text-white">
                {formatCurrency(analytics?.financial.uploadFeesCollected || 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Commission Earned</span>
              <span className="font-bold text-white">
                {formatCurrency(analytics?.financial.platformEarnings || 0)}
              </span>
            </div>
            <div className="h-px bg-zinc-800" />
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-bold">Total Revenue</span>
              <span className="font-bold text-[#1DB954] text-lg">
                {formatCurrency(analytics?.financial.totalRevenue || 0)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Campaign Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-[#1DB954]" />
            Campaign Statistics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Total Campaigns</span>
              <span className="font-bold text-white">
                {analytics?.overview.totalCampaigns || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Active</span>
              <Badge variant="outline" className="bg-green-500/20 text-green-500 border-green-500/30">
                {analytics?.overview.activeCampaigns || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Goal Reached</span>
              <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                {analytics?.overview.goalReachedCampaigns || 0}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Pending Approval</span>
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                {analytics?.overview.pendingCampaigns || 0}
              </Badge>
            </div>
            <div className="h-px bg-zinc-800" />
            <div className="flex justify-between items-center">
              <span className="text-zinc-400 font-bold">Total Votes</span>
              <span className="font-bold text-[#1DB954] text-lg">
                {analytics?.overview.totalVotes.toLocaleString() || 0}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Artists */}
      {analytics?.topArtists && analytics.topArtists.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6 mb-8"
        >
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#1DB954]" />
            Top Artists
          </h3>
          <div className="space-y-4">
            {analytics.topArtists.slice(0, 5).map((artist, index) => (
              <div key={artist.artistId} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <img
                  src={artist.avatar || '/placeholder-avatar.png'}
                  alt={artist.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1">
                  <p className="font-bold text-white">{artist.artistName}</p>
                  <p className="text-sm text-zinc-400">{artist.campaignCount} campaigns</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">{formatCurrency(artist.totalRaised)}</p>
                  <p className="text-sm text-zinc-400">{artist.totalVotes.toLocaleString()} votes</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-6 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-3xl"
      >
        <h3 className="text-lg font-bold text-white mb-2">Admin Panel</h3>
        <p className="text-zinc-300 mb-4">
          Manage all platform operations from this dashboard. You can:
        </p>
        <ul className="space-y-2 text-sm text-zinc-400">
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#1DB954]" />
            Approve or reject artist campaigns
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#1DB954]" />
            Process withdrawal requests
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#1DB954]" />
            Configure platform fees and settings
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-[#1DB954]" />
            View detailed analytics and reports
          </li>
        </ul>
      </motion.div>
    </div>
  );
}

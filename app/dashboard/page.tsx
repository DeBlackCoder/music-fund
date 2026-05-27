"use client";
import { motion } from "framer-motion";
import { DollarSign, Users, Music, TrendingUp, Bell, Plus, Eye, Loader2, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { DashboardStatCard } from "@/app/components/DashboardStatCard";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Tabs } from "@/app/components/ui/tabs";
import { useIsAuthenticated } from "@/src/hooks/useAuth";
import { useArtistDashboard } from "@/src/hooks/useArtistDashboard";
import { formatCurrency, getFundingPercentage, getTimeAgo, formatFullCurrency } from "@/src/lib/utils";
import { toast } from "sonner";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "campaigns", label: "Campaigns" },
  { id: "votes", label: "Recent Votes" },
];

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useIsAuthenticated();
  const { data: dashboardData, isLoading: dashboardLoading } = useArtistDashboard();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login to access dashboard");
      router.push("/auth/login");
      return;
    }

    if (!authLoading && user?.role !== "artist") {
      toast.error("Only artists can access this dashboard");
      router.push("/discover");
    }
  }, [isAuthenticated, user, authLoading, router]);

  if (authLoading || dashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "artist" || !dashboardData) {
    return null;
  }

  // Format chart data
  const earningsChartData = dashboardData.charts.monthlyEarnings.map((item: any) => ({
    name: monthNames[item._id.month - 1],
    value: item.earnings,
  }));

  const votesChartData = dashboardData.charts.monthlyEarnings.map((item: any) => ({
    name: monthNames[item._id.month - 1],
    value: item.votes,
  }));

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <Avatar
            src={user.profileImage || "https://i.pravatar.cc/150"}
            alt={user.fullName}
            size="xl"
            ring
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">
                {user.artistName || user.fullName}
              </h1>
              {user.verified && <CheckCircle className="w-5 h-5 text-[#1DB954]" />}
            </div>
            <p className="text-zinc-400 text-sm">Artist Dashboard</p>
          </div>
        </div>
        <Link href="/upload">
          <Button variant="accent">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </Link>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            title: "Total Raised",
            value: formatCurrency(dashboardData.overview.totalRaised),
            change: 0,
            icon: <DollarSign className="w-5 h-5" />,
            color: "green" as const,
          },
          {
            title: "Total Votes",
            value: dashboardData.overview.totalVotes.toLocaleString(),
            change: 0,
            icon: <Users className="w-5 h-5" />,
            color: "blue" as const,
          },
          {
            title: "Active Campaigns",
            value: dashboardData.overview.activeCampaigns.toString(),
            change: 0,
            icon: <Music className="w-5 h-5" />,
            color: "purple" as const,
          },
          {
            title: "Followers",
            value: dashboardData.overview.followerCount.toLocaleString(),
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

      {/* Available for Withdrawal */}
      {dashboardData.overview.availableForWithdrawal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-3xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                Available for Withdrawal
              </h3>
              <p className="text-3xl font-black text-[#1DB954]">
                {formatFullCurrency(dashboardData.overview.availableForWithdrawal)}
              </p>
            </div>
            <Button variant="accent" size="lg">
              Request Withdrawal
            </Button>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="overview">
        {(activeTab) => (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Earnings Chart */}
                <div className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-bold text-white">Earnings Overview</h3>
                      <p className="text-sm text-zinc-400">Monthly funding received</p>
                    </div>
                  </div>
                  {earningsChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={earningsChartData}>
                        <defs>
                          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1DB954" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1DB954" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis
                          dataKey="name"
                          stroke="#52525b"
                          tick={{ fill: "#71717a", fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#52525b"
                          tick={{ fill: "#71717a", fontSize: 12 }}
                          tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}K`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#121214",
                            border: "1px solid #27272a",
                            borderRadius: "12px",
                            color: "#fafafa",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#1DB954"
                          strokeWidth={2}
                          fill="url(#earningsGrad)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-zinc-500">
                      No earnings data yet
                    </div>
                  )}
                </div>

                {/* Votes Chart */}
                <div className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6">
                  <div className="mb-6">
                    <h3 className="font-bold text-white">Votes Received</h3>
                    <p className="text-sm text-zinc-400">Monthly vote count</p>
                  </div>
                  {votesChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={votesChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis
                          dataKey="name"
                          stroke="#52525b"
                          tick={{ fill: "#71717a", fontSize: 12 }}
                        />
                        <YAxis
                          stroke="#52525b"
                          tick={{ fill: "#71717a", fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#121214",
                            border: "1px solid #27272a",
                            borderRadius: "12px",
                            color: "#fafafa",
                          }}
                        />
                        <Bar dataKey="value" fill="#1DB954" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[220px] flex items-center justify-center text-zinc-500">
                      No votes data yet
                    </div>
                  )}
                </div>

                {/* Campaign Performance */}
                <div className="lg:col-span-2 bg-[#121214] rounded-3xl border border-zinc-800/50 p-6">
                  <h3 className="font-bold text-white mb-4">Recent Campaigns</h3>
                  {dashboardData.recentCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardData.recentCampaigns.map((campaign: any) => {
                        const pct = getFundingPercentage(
                          campaign.raisedAmount,
                          campaign.goalAmount
                        );
                        return (
                          <div key={campaign.id}>
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                  {campaign.title}
                                </p>
                                <p className="text-xs text-zinc-500">
                                  {campaign.voteCount} votes
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    campaign.status === "goal_reached"
                                      ? "success"
                                      : campaign.status === "active"
                                      ? "accent"
                                      : "muted"
                                  }
                                >
                                  {campaign.status}
                                </Badge>
                                <span className="text-sm font-bold text-[#1DB954]">
                                  {pct}%
                                </span>
                              </div>
                            </div>
                            <Progress value={pct} size="sm" />
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm">No campaigns yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === "campaigns" && (
              <div className="space-y-4">
                {dashboardData.recentCampaigns.length > 0 ? (
                  dashboardData.recentCampaigns.map((campaign: any, i: number) => {
                    const pct = getFundingPercentage(
                      campaign.raisedAmount,
                      campaign.goalAmount
                    );
                    return (
                      <motion.div
                        key={campaign.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-5"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-white truncate">
                                {campaign.title}
                              </h3>
                              <Badge
                                variant={
                                  campaign.status === "goal_reached"
                                    ? "success"
                                    : campaign.status === "active"
                                    ? "accent"
                                    : "muted"
                                }
                              >
                                {campaign.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-400 mb-2">
                              {campaign.voteCount} votes
                            </p>
                            <Progress value={pct} size="sm" />
                            <div className="flex justify-between mt-1">
                              <span className="text-xs text-[#1DB954] font-semibold">
                                {formatCurrency(campaign.raisedAmount)}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {pct}% of {formatCurrency(campaign.goalAmount)}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <Link href={`/song/${campaign.slug}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="text-center py-20">
                    <p className="text-zinc-500 text-lg">No campaigns yet</p>
                    <Link href="/upload">
                      <Button variant="accent" className="mt-4">
                        <Plus className="w-4 h-4" />
                        Create Your First Campaign
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === "votes" && (
              <div className="bg-[#121214] rounded-3xl border border-zinc-800/50 overflow-hidden">
                <div className="p-5 border-b border-zinc-800/50">
                  <h3 className="font-bold text-white">Recent Votes</h3>
                </div>
                {dashboardData.recentVotes.length > 0 ? (
                  <div className="divide-y divide-zinc-800/30">
                    {dashboardData.recentVotes.map((vote: any, i: number) => (
                      <motion.div
                        key={vote.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-4 p-4 hover:bg-zinc-800/20 transition-colors"
                      >
                        <Avatar
                          src={vote.voter.avatar}
                          alt={vote.voter.name}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-white">{vote.voter.name}</p>
                          <p className="text-sm text-zinc-400 truncate">
                            Voted for "{vote.campaign.title}"
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1DB954]">
                            {vote.voteCount} votes
                          </p>
                          <p className="text-xs text-zinc-500">
                            {formatCurrency(vote.amount)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500">
                    No votes received yet
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </Tabs>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  Heart, Share2, Users, Clock, Trophy, CheckCircle,
  Copy, ChevronRight, TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";
import { AudioPlayer } from "@/app/components/AudioPlayer";
import { VoteButton } from "@/app/components/VoteButton";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { mockSongs, productionStages, liveActivityFeed } from "@/src/lib/mock-data";
import { formatCurrency, getFundingPercentage } from "@/src/lib/utils";

/* ─── helpers ─────────────────────────────────────────────── */

function getTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const sharePlatforms = [
  { id: "whatsapp", label: "WhatsApp", color: "#25D366", emoji: "💬" },
  { id: "twitter", label: "Twitter/X", color: "#1DA1F2", emoji: "🐦" },
  { id: "copy", label: "Copy Link", color: "#52525b", emoji: "🔗" },
];

/* ─── page ────────────────────────────────────────────────── */

export default function SongPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const song = mockSongs.find((s) => s.slug === slug) ?? mockSongs[0];

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(song.likeCount ?? 0);
  const [activeTab, setActiveTab] = useState<"story" | "activity" | "production">("story");

  const percentage = getFundingPercentage(song.amountRaised, song.fundingGoal);

  // Mock preview window — real data comes from campaign.previewStart / previewEnd
  const previewStart: number = (song as any).previewStart ?? 0;
  const previewEnd: number = (song as any).previewEnd ?? previewStart + 60;

  const handleLike = () => {
    setLiked((v) => !v);
    setLikeCount((c) => (liked ? c - 1 : c + 1));
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied!");
      return;
    }
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`Check out "${song.title}" on MusicFund! ${url}`)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Supporting "${song.title}" on MusicFund!`)}&url=${encodeURIComponent(url)}`,
    };
    window.open(urls[platform], "_blank");
  };

  return (
    <div className="min-h-screen bg-[#080a09] text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-10">

          {/* ── LEFT COLUMN ─────────────────────────────────── */}
          <div className="space-y-8">

            {/* Cover + basic info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <div className="relative w-full sm:w-56 h-56 rounded-3xl overflow-hidden flex-shrink-0">
                <Image
                  src={song.coverArt}
                  alt={song.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {song.status === "goal_reached" && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="success" className="bg-[#1DB954] text-black font-bold">
                      <Trophy className="w-3 h-3 mr-1" /> Goal Reached
                    </Badge>
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h1 className="text-3xl font-black leading-tight">{song.title}</h1>
                    <Link
                      href={`/artist/${song.artistId}`}
                      className="text-zinc-400 hover:text-[#1DB954] transition text-sm mt-1 inline-block"
                    >
                      {typeof song.artist === "string" ? song.artist : song.artist.artistName}
                    </Link>
                  </div>
                  <Badge variant="outline" className="flex-shrink-0">{song.genre}</Badge>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed line-clamp-3">
                  {song.description}
                </p>

                {/* Tags */}
                {song.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {song.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all ${
                      liked
                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked ? "fill-red-400" : ""}`} />
                    {likeCount.toLocaleString()}
                  </button>

                  {sharePlatforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleShare(p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500 transition"
                    >
                      <span>{p.emoji}</span>
                      <span className="hidden sm:inline">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── AUDIO PLAYER ─────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <AudioPlayer
                src={song.audioPreview ?? song.audioFile ?? ""}
                previewStart={previewStart}
                previewEnd={previewEnd}
                title={song.title}
                artist={typeof song.artist === "string" ? song.artist : song.artist.artistName}
              />
            </motion.div>

            {/* ── TABS ─────────────────────────────────────── */}
            <div>
              <div className="flex gap-1 border-b border-zinc-800 mb-6">
                {(["story", "activity", "production"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                      activeTab === tab
                        ? "border-[#1DB954] text-white"
                        : "border-transparent text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Story */}
              {activeTab === "story" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="prose prose-invert prose-sm max-w-none"
                >
                  <p className="text-zinc-300 leading-relaxed whitespace-pre-line">
                    {song.story ?? song.description}
                  </p>
                </motion.div>
              )}

              {/* Activity */}
              {activeTab === "activity" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {liveActivityFeed.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 bg-zinc-900 rounded-2xl border border-zinc-800"
                    >
                      <img
                        src={item.avatar}
                        alt={item.user}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white">
                          <span className="font-semibold">{item.user}</span>{" "}
                          {item.action === "supported" && (
                            <span className="text-zinc-400">
                              voted{" "}
                              <span className="text-[#1DB954] font-semibold">
                                {formatCurrency(item.amount ?? 0)}
                              </span>
                            </span>
                          )}
                          {item.action === "commented" && (
                            <span className="text-zinc-400">left a comment</span>
                          )}
                          {item.action === "shared" && (
                            <span className="text-zinc-400">shared this campaign</span>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-zinc-600 flex-shrink-0">{item.time}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Production */}
              {activeTab === "production" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  {productionStages.map((stage, i) => (
                    <div
                      key={stage.id}
                      className={`flex items-start gap-4 p-4 rounded-2xl border transition-colors ${
                        stage.status === "completed"
                          ? "bg-[#1DB954]/5 border-[#1DB954]/20"
                          : stage.status === "in-progress"
                          ? "bg-zinc-800/60 border-zinc-700"
                          : "bg-zinc-900 border-zinc-800 opacity-50"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold ${
                          stage.status === "completed"
                            ? "bg-[#1DB954] text-black"
                            : stage.status === "in-progress"
                            ? "bg-zinc-700 text-white"
                            : "bg-zinc-800 text-zinc-600"
                        }`}
                      >
                        {stage.status === "completed" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          i + 1
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-white">{stage.label}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{stage.description}</p>
                        {stage.date && (
                          <p className="text-xs text-zinc-600 mt-1">{stage.date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────────── */}
          <div className="space-y-6">

            {/* Funding progress card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-5"
            >
              <div>
                <div className="flex items-end justify-between mb-1">
                  <span className="text-3xl font-black text-white">
                    {formatCurrency(song.amountRaised)}
                  </span>
                  <span className="text-sm text-zinc-400">
                    of {formatCurrency(song.fundingGoal)}
                  </span>
                </div>
                <Progress value={percentage} className="h-3 rounded-full" />
                <div className="flex justify-between text-xs text-zinc-500 mt-1.5">
                  <span className="text-[#1DB954] font-bold">{percentage}% funded</span>
                  <span>{song.voteCount?.toLocaleString() ?? 0} votes</span>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Users, label: "Supporters", value: song.supporters?.toLocaleString() ?? "0" },
                  { icon: Clock, label: "Days Left", value: song.daysLeft > 0 ? `${song.daysLeft}d` : "Ended" },
                  { icon: TrendingUp, label: "Funded", value: `${percentage}%` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-zinc-800 rounded-2xl p-3 text-center">
                    <Icon className="w-4 h-4 text-[#1DB954] mx-auto mb-1" />
                    <p className="text-sm font-bold text-white">{value}</p>
                    <p className="text-[10px] text-zinc-500">{label}</p>
                  </div>
                ))}
              </div>

              {/* Vote CTA */}
              <VoteButton
                campaignId={song.id}
                campaignSlug={song.slug}
                campaignStatus={song.status}
                variant="default"
                size="lg"
                className="w-full bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold"
              />

              <p className="text-xs text-center text-zinc-500">
                Each vote directly funds this artist's music video
              </p>
            </motion.div>

            {/* Artist card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5"
            >
              <p className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Artist</p>
              <Link href={`/artist/${song.artistId}`} className="flex items-center gap-3 group">
                <img
                  src={song.artistAvatar}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-[#1DB954] transition truncate">
                    {typeof song.artist === "string" ? song.artist : song.artist.artistName}
                  </p>
                  <p className="text-xs text-zinc-400">{song.genre}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-[#1DB954] transition" />
              </Link>
            </motion.div>

            {/* Top supporters */}
            {song.topSupporters?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3"
              >
                <p className="text-xs text-zinc-500 uppercase tracking-widest">Top Supporters</p>
                {song.topSupporters.slice(0, 5).map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600 w-4">{i + 1}</span>
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{s.name}</p>
                      {s.message && (
                        <p className="text-xs text-zinc-500 truncate">"{s.message}"</p>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#1DB954]">
                      {formatCurrency(s.amount)}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

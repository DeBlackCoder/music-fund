"use client";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, TrendingUp, Flame, Clock, Star, Loader2 } from "lucide-react";
import { useState } from "react";
import { SongCard } from "@/app/components/SongCard";
import { ArtistCard } from "@/app/components/ArtistCard";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Tabs } from "@/app/components/ui/tabs";
import { useCampaigns } from "@/src/hooks/useCampaigns";
import { mockArtists, mockGenres } from "@/src/lib/mock-data";
import type { Song, Campaign } from "@/src/types";

const tabs = [
  { id: "all", label: "All", icon: <Star className="w-3.5 h-3.5" /> },
  { id: "trending", label: "Trending", icon: <Flame className="w-3.5 h-3.5" /> },
  { id: "new", label: "New", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "top", label: "Top Funded", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { id: "artists", label: "Artists" },
];

// Convert Campaign to Song format for backward compatibility
function campaignToSong(campaign: Campaign): Song {
  return {
    ...campaign,
    fundingGoal: campaign.goalAmount,
    amountRaised: campaign.raisedAmount,
    supporters: campaign.voteCount,
    coverArt: campaign.coverImage,
    audioPreview: campaign.audioFile,
    topSupporters: [],
    recentActivity: [],
    comments: [],
  };
}

export default function DiscoverPage() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch campaigns based on active tab
  const { data: campaignsData, isLoading } = useCampaigns({
    status: "active",
    genre: selectedGenre || undefined,
    sort: activeTab === "top" ? "-raisedAmount" : activeTab === "new" ? "-createdAt" : "-voteCount",
    limit: 50,
  });

  const campaigns = campaignsData?.campaigns || [];
  const songs = campaigns.map(campaignToSong);

  const filterSongs = (songs: Song[]) => {
    return songs.filter((s) => {
      const matchSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.artist.name?.toLowerCase().includes(search.toLowerCase());
      return matchSearch;
    });
  };

  const filteredSongs = filterSongs(songs);

  return (
    <div className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-black text-white mb-2">Discover</h1>
        <p className="text-zinc-400">Find your next favorite African artist to support</p>
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-3 mb-8"
      >
        <div className="flex-1">
          <Input
            placeholder="Search songs, artists, genres..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-2xl text-sm text-zinc-300 hover:border-zinc-500 transition-colors cursor-pointer">
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
        </button>
      </motion.div>

      {/* Genre Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-2 flex-wrap mb-8"
      >
        <button
          onClick={() => setSelectedGenre(null)}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all cursor-pointer ${
            !selectedGenre
              ? "bg-[#1DB954] text-black"
              : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
          }`}
        >
          All Genres
        </button>
        {mockGenres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => setSelectedGenre(selectedGenre === genre.name ? null : genre.name)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedGenre === genre.name
                ? "bg-[#1DB954] text-black"
                : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
            }`}
          >
            <span>{genre.icon}</span>
            {genre.name}
          </button>
        ))}
      </motion.div>

      {/* Tabs */}
      <Tabs tabs={tabs} defaultTab="all" onTabChange={setActiveTab}>
        {(currentTab) => (
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {currentTab === "artists" ? (
              <div>
                <h2 className="text-xl font-bold text-white mb-5">All Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {mockArtists.map((artist, i) => (
                    <motion.div
                      key={artist.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <ArtistCard artist={artist} />
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Loading State */}
                {isLoading && (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1DB954]" />
                  </div>
                )}

                {/* Featured row */}
                {currentTab === "all" && !isLoading && filteredSongs.length > 0 && (
                  <div className="mb-10">
                    <h2 className="text-xl font-bold text-white mb-5">Featured Campaigns</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredSongs.slice(0, 4).map((song, i) => (
                        <motion.div
                          key={song.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08 }}
                        >
                          <SongCard song={song} variant="featured" />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {!isLoading && (
                  <>
                    <h2 className="text-xl font-bold text-white mb-5">
                      {currentTab === "trending"
                        ? "🔥 Trending"
                        : currentTab === "new"
                        ? "✨ New Campaigns"
                        : currentTab === "top"
                        ? "🏆 Top Funded"
                        : "All Campaigns"}
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                      {filteredSongs.map((song, i) => (
                        <motion.div
                          key={song.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.06 }}
                        >
                          <SongCard song={song} />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {!isLoading && filteredSongs.length === 0 && (
                  <div className="text-center py-20">
                    <p className="text-zinc-500 text-lg">No campaigns found</p>
                    <p className="text-zinc-600 text-sm mt-2">
                      Try a different search or genre
                    </p>
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

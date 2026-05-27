"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, MapPin, Music, Heart, Share2, ExternalLink, Play, Pause } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { SongCard } from "@/app/components/SongCard";
import { AudioPlayer } from "@/app/components/AudioPlayer";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Tabs } from "@/app/components/ui/tabs";
import { Progress } from "@/app/components/ui/progress";
import { mockArtists, mockSongs } from "@/src/lib/mock-data";
import { formatNumber, formatCurrency, getFundingPercentage } from "@/src/lib/utils";

const tabs = [
  { id: "campaigns", label: "Campaigns" },
  { id: "about", label: "About" },
  { id: "music", label: "Music" },
];

/* ── MusicRow: song list item with inline player ─────────── */
function MusicRow({
  song,
  index,
  audioSrc,
  previewStart,
  previewEnd,
}: {
  song: any;
  index: number;
  audioSrc: string;
  previewStart: number;
  previewEnd: number;
}) {
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-[#121214] rounded-2xl border border-zinc-800/50 hover:border-zinc-700 transition-colors overflow-hidden"
    >
      <div className="flex items-center gap-4 p-4">
        {/* Cover + play toggle */}
        <button
          onClick={() => setPlayerOpen((v) => !v)}
          className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 group"
        >
          <Image src={song.coverArt} alt={song.title} fill className="object-cover" unoptimized />
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            {playerOpen
              ? <Pause className="w-5 h-5 text-white fill-white" />
              : <Play className="w-5 h-5 text-white fill-white" />
            }
          </div>
        </button>

        {/* Info */}
        <Link href={`/song/${song.slug}`} className="flex-1 min-w-0">
          <p className="font-semibold text-white truncate hover:text-[#1DB954] transition">{song.title}</p>
          <p className="text-sm text-zinc-400">{song.genre}</p>
          <Progress value={getFundingPercentage(song.amountRaised, song.fundingGoal)} size="sm" className="mt-2" />
        </Link>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-[#1DB954]">{getFundingPercentage(song.amountRaised, song.fundingGoal)}%</p>
          <p className="text-xs text-zinc-500">{song.daysLeft}d left</p>
        </div>
      </div>

      {/* Inline player */}
      {playerOpen && audioSrc && (
        <div className="px-4 pb-4">
          <AudioPlayer
            src={audioSrc}
            previewStart={previewStart}
            previewEnd={previewEnd}
            title={song.title}
            artist={typeof song.artist === "string" ? song.artist : song.artist?.artistName}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function ArtistProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const artist = ((mockArtists as any[]).find((a) => a.username === username) || mockArtists[0]) as any;
  const artistSongs = mockSongs.filter((s) => s.artistId === artist.id);
  const [following, setFollowing] = useState(false);

  const socialIcons: Record<string, { label: string; emoji: string }> = {
    instagram: { label: "Instagram", emoji: "📸" },
    twitter: { label: "Twitter/X", emoji: "🐦" },
    youtube: { label: "YouTube", emoji: "▶️" },
    spotify: { label: "Spotify", emoji: "🎵" },
  };

  return (
    <div className="min-h-screen">
      {/* Banner */}
      <div className="relative h-64 sm:h-80 overflow-hidden">
        <Image src={artist.banner} alt={`${artist.name} banner`} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#09090b]/40 to-[#09090b]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/30 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Profile Header */}
        <div className="relative -mt-20 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Avatar src={artist.avatar} alt={artist.name} size="2xl" ring={artist.verified} className="border-4 border-[#09090b] shadow-2xl" />
            </motion.div>
            <div className="flex-1 pb-2">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black text-white">{artist.name}</h1>
                  {artist.verified && (
                    <div className="flex items-center gap-1 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-2 py-0.5">
                      <CheckCircle className="w-4 h-4 text-[#1DB954]" />
                      <span className="text-xs text-[#1DB954] font-medium">Verified</span>
                    </div>
                  )}
                  <Badge variant="accent">⭐ Featured</Badge>
                </div>
                <div className="flex items-center gap-2 text-zinc-400 mb-3">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{artist.location}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(artist.genre as string[]).map((g) => <Badge key={g} variant="muted">{g}</Badge>)}
                </div>
              </motion.div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex gap-2 pb-2">
              <Button variant={following ? "outline" : "accent"} onClick={() => setFollowing(!following)}>
                {following ? "Following" : "Follow"}
              </Button>
              <Button variant="outline" size="icon"><Heart className="w-4 h-4" /></Button>
              <Button variant="outline" size="icon"><Share2 className="w-4 h-4" /></Button>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Followers", value: formatNumber(artist.followers) },
            { label: "Supporters", value: formatNumber(artist.supporters), accent: true },
            { label: "Total Raised", value: formatCurrency(artist.totalRaised) },
            { label: "Campaigns", value: mockSongs.filter((s) => s.artistId === artist.id).length.toString() },
            { label: "Success Rate", value: "87%" },
          ].map(({ label, value, accent }) => (
            <div key={label} className="bg-[#121214] rounded-2xl border border-zinc-800/50 p-4 text-center">
              <p className={`text-xl font-black ${accent ? "text-[#1DB954]" : "text-white"}`}>{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </motion.div>

        {/* Social Links */}
        {artist.socialLinks && Object.keys(artist.socialLinks).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-3 mb-8 flex-wrap">
            {Object.entries(artist.socialLinks as Record<string, string>).map(([platform, handle]) => {
              const info = socialIcons[platform];
              if (!handle || !info) return null;
              return (
                <a key={platform} href="#" className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
                  <span>{info.emoji}</span>
                  <span className="hidden sm:inline">{handle as string}</span>
                </a>
              );
            })}
            <a href="#" className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-2xl text-sm text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors">
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Spotify</span>
            </a>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs tabs={tabs} defaultTab="campaigns">
          {(activeTab) => (
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {activeTab === "campaigns" && (
                <div>
                  {(artistSongs.length > 0 ? artistSongs : mockSongs.slice(0, 4)).length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {(artistSongs.length > 0 ? artistSongs : mockSongs.slice(0, 4)).map((song, i) => (
                        <motion.div key={song.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                          <SongCard song={song} />
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Music className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                      <p className="text-zinc-500">No active campaigns yet</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "about" && (
                <div className="max-w-2xl space-y-4">
                  <div className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6">
                    <h3 className="font-bold text-white mb-3">Biography</h3>
                    <p className="text-zinc-300 leading-relaxed">{artist.bio}</p>
                  </div>
                  <div className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6">
                    <h3 className="font-bold text-white mb-4">Genres</h3>
                    <div className="flex gap-2 flex-wrap">
                      {(artist.genre as string[]).map((g) => <Badge key={g} variant="accent" className="text-sm px-3 py-1">{g}</Badge>)}
                    </div>
                  </div>
                  <div className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6">
                    <h3 className="font-bold text-white mb-4">Verification Status</h3>
                    {artist.verified ? (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#1DB954]/10 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-[#1DB954]" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">🟢 Verified Artist</p>
                          <p className="text-sm text-zinc-400">Identity and ownership confirmed</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <p className="text-zinc-400 text-sm">Not yet verified</p>
                        <Link href="/verify">
                          <Button variant="accent" size="sm">Apply for Verification</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "music" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mockSongs.slice(0, 6).map((song, i) => {
                    const previewStart: number = (song as any).previewStart ?? 0;
                    const previewEnd: number = (song as any).previewEnd ?? previewStart + 60;
                    const audioSrc: string = (song as any).audioPreview ?? (song as any).audioFile ?? "";
                    return (
                      <MusicRow
                        key={song.id}
                        song={song}
                        index={i}
                        audioSrc={audioSrc}
                        previewStart={previewStart}
                        previewEnd={previewEnd}
                      />
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </Tabs>
      </div>
    </div>
  );
}

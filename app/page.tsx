"use client";

import { motion } from "framer-motion";
import {
  Play,
  ArrowRight,
  Star,
  TrendingUp,
  Users,
  Music,
  Globe,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

import { SongCard } from "@/app/components/SongCard";
import { ArtistCard } from "@/app/components/ArtistCard";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Avatar } from "@/app/components/ui/avatar";

import {
  mockSongs,
  mockArtists,
  mockTestimonials,
  communityStats,
} from "@/src/lib/mock-data";

import {
  formatCurrency,
  getFundingPercentage,
} from "@/src/lib/utils";
import Hero from "@/app/components/Hero";

/* ───────────────────────── DATA ───────────────────────── */

const floatingAlbums = [
  { src: "https://picsum.photos/seed/float1/200/200", cls: "top-[22%] left-[4%] w-28 h-28 -rotate-[8deg]", delay: 0 },
  { src: "https://picsum.photos/seed/float2/200/200", cls: "top-[15%] right-[5%] w-20 h-20 rotate-[6deg]", delay: 0.5 },
  { src: "https://picsum.photos/seed/float3/200/200", cls: "bottom-[30%] left-[3%] w-24 h-24 rotate-[5deg]", delay: 1 },
  { src: "https://picsum.photos/seed/float4/200/200", cls: "bottom-[20%] right-[4%] w-[70px] h-[70px] -rotate-[5deg]", delay: 1.5 },
];

const stats = [
  { icon: Users, label: "Artists", value: communityStats.totalArtists.toLocaleString() },
  { icon: Music, label: "Songs", value: communityStats.songsLaunched.toLocaleString() },
  { icon: TrendingUp, label: "Raised", value: communityStats.totalRaised },
  { icon: Globe, label: "Countries", value: communityStats.countriesReached.toString() },
];

/* ───────────────────────── COMPONENTS ───────────────────────── */

function PulseDot() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute h-full w-full rounded-full bg-[#1DB954] opacity-75" />
      <span className="relative h-2 w-2 rounded-full bg-[#1DB954]" />
    </span>
  );
}

function SectionHeader({
  label,
  heading,
  href,
}: {
  label: string;
  heading: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
      <div>
        <p className="text-xs uppercase tracking-widest text-[#1DB954] font-bold">
          {label}
        </p>
        <h2 className="text-3xl font-black text-white">{heading}</h2>
      </div>

      {href && (
        <Link href={href}>
          <Button variant="ghost" className="text-zinc-400 hover:text-white">
            See all <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      )}
    </div>
  );
}

/* ───────────────────────── PAGE ───────────────────────── */

export default function HomePage() {
  const fundedSongs = mockSongs
    .filter((s) => s.status === "goal_reached" || s.status === "active")
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#080a09] text-white">

      {/* ───────── HERO ───────── */}
      <Hero />

      {/* ───────── SONGS ───────── */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <SectionHeader label="Trending" heading="Hot Campaigns" href="/discover" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockSongs.slice(0, 8).map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      </section>

      {/* ───────── ARTISTS ───────── */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <SectionHeader label="Artists" heading="Featured Creators" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockArtists.slice(0, 8).map((artist) => (
            <ArtistCard key={artist.id} artist={artist} />
          ))}
        </div>
      </section>

      {/* ───────── FUNDING ───────── */}
      <section className="py-20 max-w-6xl mx-auto px-4">
        <SectionHeader label="Success" heading="Recently Funded" />

        <div className="grid md:grid-cols-3 gap-6">
          {fundedSongs.map((song) => (
            <div key={song.id} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
              <Image src={song.coverArt} alt="" width={300} height={300} className="rounded-lg" />
              <h3 className="mt-3 font-bold">{song.title}</h3>
              <p className="text-sm text-zinc-400">
                {typeof song.artist === "string" ? song.artist : song.artist.artistName}
              </p>

              <Progress
                value={getFundingPercentage(song.amountRaised, song.fundingGoal)}
                className="mt-3"
              />

              <p className="text-xs text-[#1DB954] mt-2">
                {formatCurrency(song.amountRaised)}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
"use client";
import { motion } from "framer-motion";
import { CheckCircle, Users, Music } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { formatNumber, formatCurrency } from "@/src/lib/utils";
import type { Artist } from "@/src/types";
import { useState } from "react";

interface ArtistCardProps {
  artist: Artist;
  variant?: "default" | "compact" | "featured";
}

export function ArtistCard({ artist, variant = "default" }: ArtistCardProps) {
  const [following, setFollowing] = useState(false);

  if (variant === "compact") {
    return (
      <Link href={`/artist/${artist.username}`}>
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 p-3 rounded-2xl hover:bg-zinc-800/50 transition-colors cursor-pointer"
        >
          <Avatar src={artist.avatar} alt={artist.name} size="md" ring={artist.verified} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <p className="text-sm font-medium text-white truncate">{artist.name}</p>
              {artist.verified && <CheckCircle className="w-3 h-3 text-[#1DB954] flex-shrink-0" />}
            </div>
            <p className="text-xs text-zinc-400 truncate">{artist.genre[0]}</p>
          </div>
          <span className="text-xs text-zinc-500">{formatNumber(artist.followers)}</span>
        </motion.div>
      </Link>
    );
  }

  if (variant === "featured") {
    return (
      <Link href={`/artist/${artist.username}`}>
        <motion.div
          whileHover={{ y: -6 }}
          transition={{ duration: 0.3 }}
          className="relative rounded-3xl overflow-hidden cursor-pointer group"
          style={{ minHeight: 280 }}
        >
          <Image src={artist.banner} alt={artist.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          <div className="absolute inset-0 p-5 flex flex-col justify-end">
            <Avatar src={artist.avatar} alt={artist.name} size="lg" ring={artist.verified} className="mb-3" />
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-white">{artist.name}</h3>
              {artist.verified && <CheckCircle className="w-4 h-4 text-[#1DB954]" />}
            </div>
            <p className="text-sm text-zinc-300 mb-2">{artist.location}</p>
            <div className="flex gap-2 flex-wrap">
              {artist.genre.slice(0, 2).map((g) => (
                <Badge key={g} variant="accent">{g}</Badge>
              ))}
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
      transition={{ duration: 0.3 }}
      className="bg-[#121214] rounded-3xl border border-zinc-800/50 overflow-hidden"
    >
      <div className="relative h-24 overflow-hidden">
        <Image src={artist.banner} alt={`${artist.name} banner`} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#121214]" />
      </div>
      <div className="px-4 pb-4 -mt-8 relative">
        <div className="flex items-end justify-between mb-3">
          <Avatar src={artist.avatar} alt={artist.name} size="xl" ring={artist.verified} className="border-4 border-[#121214]" />
          <Button
            variant={following ? "outline" : "accent"}
            size="sm"
            onClick={() => setFollowing(!following)}
          >
            {following ? "Following" : "Follow"}
          </Button>
        </div>
        <div className="flex items-center gap-1.5 mb-1">
          <h3 className="font-bold text-white">{artist.name}</h3>
          {artist.verified && <CheckCircle className="w-4 h-4 text-[#1DB954]" />}
        </div>
        <p className="text-xs text-zinc-400 mb-2">{artist.location}</p>
        <div className="flex gap-1.5 flex-wrap mb-3">
          {artist.genre.slice(0, 2).map((g) => (
            <Badge key={g} variant="muted">{g}</Badge>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-zinc-800/50">
          <div className="text-center">
            <p className="text-sm font-bold text-white">{formatNumber(artist.followers)}</p>
            <p className="text-xs text-zinc-500">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-[#1DB954]">{formatNumber(artist.supporters)}</p>
            <p className="text-xs text-zinc-500">Supporters</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">{formatCurrency(artist.totalRaised)}</p>
            <p className="text-xs text-zinc-500">Raised</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Heart, Users, Clock } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Progress } from "@/app/components/ui/progress";
import { VoteButton } from "@/app/components/VoteButton";
import { formatCurrency, getFundingPercentage } from "@/src/lib/utils";
import type { Song } from "@/src/types";

interface SongCardProps {
  song: Song;
  variant?: "default" | "compact" | "featured";
}

export function SongCard({ song, variant = "default" }: SongCardProps) {
  const [liked, setLiked] = useState(false);
  const percentage = getFundingPercentage(
    song.amountRaised,
    song.fundingGoal
  );

  /* ───────────── COMPACT ───────────── */
  if (variant === "compact") {
    return (
      <Link href={`/song/${song.slug}`}>
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition cursor-pointer"
        >
          <div className="relative w-12 h-12 rounded-lg overflow-hidden">
            <Image
              src={song.coverArt}
              alt={song.title}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{song.title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {song.artist.artistName}
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold text-green-500">
              {percentage}%
            </p>
            <p className="text-xs text-muted-foreground">
              {song.daysLeft}d
            </p>
          </div>
        </motion.div>
      </Link>
    );
  }

  /* ───────────── FEATURED ───────────── */
  if (variant === "featured") {
    return (
      <Link href={`/song/${song.slug}`}>
        <motion.div
          whileHover={{ y: -6 }}
          className="relative aspect-[3/4] rounded-2xl overflow-hidden group"
        >
          <Image
            src={song.coverArt}
            alt={song.title}
            fill
            className="object-cover group-hover:scale-110 transition"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute bottom-0 p-4 w-full">
            <Badge className="mb-2">{song.genre}</Badge>
            <h3 className="text-white font-bold">{song.title}</h3>
            <p className="text-sm text-muted-foreground">{song.artist.artistName}</p>

            <Progress value={percentage} className="mt-2" />

            <div className="flex justify-between text-xs mt-2">
              <span className="text-green-400">
                {formatCurrency(song.amountRaised)} raised
              </span>
              <span className="text-muted-foreground">
                {song.daysLeft}d left
              </span>
            </div>
          </div>

          <Button
            size="icon"
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition"
          >
            <Play className="w-4 h-4" />
          </Button>
        </motion.div>
      </Link>
    );
  }

  /* ───────────── DEFAULT ───────────── */
  return (
    <Card className="overflow-hidden group">
      <Link href={`/song/${song.slug}`}>
        {/* Image */}
        <div className="relative aspect-square">
          <Image
            src={song.coverArt}
            alt={song.title}
            fill
            className="object-cover group-hover:scale-105 transition"
          />

          {/* Play button */}
          <VoteButton
            campaignId={song.id}
            campaignSlug={song.slug}
            campaignStatus={song.status}
            size="icon"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition"
          />

          {/* Like button */}
          <Button
            size="icon"
            variant="secondary"
            className="absolute top-3 right-3"
            onClick={(e) => {
              e.preventDefault();
              setLiked(!liked);
            }}
          >
            <Heart
              className={`w-4 h-4 ${
                liked ? "text-red-500 fill-red-500" : ""
              }`}
            />
          </Button>

          {/* Funded badge */}
          {song.status === "goal_reached" && (
            <div className="absolute top-3 left-3">
              <Badge variant="success">Goal Reached!</Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold truncate">{song.title}</h3>
            <p className="text-xs text-muted-foreground">{song.artist.artistName}</p>
          </div>

          <Badge variant="outline">{song.genre}</Badge>

          <Progress value={percentage} />

          <div className="flex justify-between text-xs">
            <span className="text-green-500 font-semibold">
              {formatCurrency(song.amountRaised)}
            </span>
            <span className="text-muted-foreground">
              {formatCurrency(song.fundingGoal)} goal
            </span>
          </div>

          {/* Stats */}
          <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {song.supporters.toLocaleString()}
            </div>

            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {song.daysLeft > 0
                ? `${song.daysLeft}d left`
                : "Ended"}
            </div>

            <span className="text-green-500 font-bold">
              {percentage}%
            </span>
          </div>
        </div>
      </Link>
    </Card>
  );
}
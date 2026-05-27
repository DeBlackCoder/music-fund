"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart, ListMusic, Shuffle, Repeat, ChevronUp, ChevronDown, X } from "lucide-react";
import Image from "next/image";
import { useState, useRef } from "react";
import { mockSongs } from "@/src/lib/mock-data";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(35);
  const [volume, setVolume] = useState(80);
  const [muted, setMuted] = useState(false);
  const [liked, setLiked] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const song = mockSongs[currentIndex];
  const duration = "3:42";
  const currentTime = `${Math.floor((progress / 100) * 222 / 60)}:${String(Math.floor((progress / 100) * 222 % 60)).padStart(2, "0")}`;

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setProgress(Math.round((x / rect.width) * 100));
  };

  const next = () => setCurrentIndex((i) => (i + 1) % mockSongs.length);
  const prev = () => setCurrentIndex((i) => (i - 1 + mockSongs.length) % mockSongs.length);

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5, type: "spring", bounce: 0.2 }}
      className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-zinc-800/50"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {/* Progress bar - top */}
      <div
        ref={progressRef}
        className="h-1 bg-zinc-800 cursor-pointer group"
        onClick={handleProgressClick}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-[#1DB954] to-[#17a34a] relative"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" />
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Song Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
              <Image src={song.coverArt} alt={song.title} fill className="object-cover" unoptimized />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="flex items-end gap-0.5 h-4">
                    {[1,2,3,4,5].map((i) => (
                      <div key={i} className="waveform-bar w-0.5 bg-[#1DB954] rounded-full" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{song.title}</p>
              <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
            </div>
            <button onClick={() => setLiked(!liked)} className="flex-shrink-0 cursor-pointer">
              <Heart className={`w-4 h-4 transition-colors ${liked ? "fill-red-500 text-red-500" : "text-zinc-500 hover:text-zinc-300"}`} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden sm:block text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
              <Shuffle className="w-4 h-4" />
            </button>
            <button onClick={prev} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <SkipBack className="w-5 h-5" />
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg cursor-pointer"
            >
              {isPlaying
                ? <Pause className="w-5 h-5 text-black fill-black" />
                : <Play className="w-5 h-5 text-black fill-black ml-0.5" />
              }
            </motion.button>
            <button onClick={next} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
              <SkipForward className="w-5 h-5" />
            </button>
            <button className="hidden sm:block text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time & Volume */}
          <div className="hidden md:flex items-center gap-3 flex-1 justify-end">
            <span className="text-xs text-zinc-500 tabular-nums">{currentTime} / {duration}</span>
            <button onClick={() => setMuted(!muted)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <div
              className="w-20 h-1 bg-zinc-700 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setVolume(Math.round(((e.clientX - rect.left) / rect.width) * 100));
              }}
            >
              <div className="h-full bg-zinc-300 rounded-full" style={{ width: `${muted ? 0 : volume}%` }} />
            </div>
            <button onClick={() => setShowQueue(!showQueue)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
              <ListMusic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Queue Panel */}
      <AnimatePresence>
        {showQueue && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-zinc-800/50 bg-[#0d0d0f]/95 backdrop-blur-xl max-h-64 overflow-y-auto"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Queue</h3>
                <button onClick={() => setShowQueue(false)} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {mockSongs.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => setCurrentIndex(i)}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-800/50 transition-colors cursor-pointer ${i === currentIndex ? "bg-zinc-800/50" : ""}`}
                >
                  <div className="relative w-9 h-9 rounded-lg overflow-hidden flex-shrink-0">
                    <Image src={s.coverArt} alt={s.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <p className={`text-xs font-medium truncate ${i === currentIndex ? "text-[#1DB954]" : "text-white"}`}>{s.title}</p>
                    <p className="text-xs text-zinc-500 truncate">{s.artist}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

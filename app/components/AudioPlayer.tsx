"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface AudioPlayerProps {
  src: string;
  previewStart?: number; // seconds
  previewEnd?: number;   // seconds (defaults to previewStart + 60)
  title?: string;
  artist?: string;
}

const PREVIEW_DURATION = 60;

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  src,
  previewStart = 0,
  previewEnd,
  title,
  artist,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);

  const end = previewEnd ?? previewStart + PREVIEW_DURATION;
  const windowDuration = end - previewStart;

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(previewStart);
  const [muted, setMuted] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Seek to previewStart once metadata is ready
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      audio.currentTime = previewStart;
      setCurrentTime(previewStart);
      setLoaded(true);
    };
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, [src, previewStart]);

  // RAF loop for playhead + auto-stop at end
  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;
      setCurrentTime(audio.currentTime);

      if (audio.currentTime >= end) {
        audio.pause();
        audio.currentTime = previewStart;
        setCurrentTime(previewStart);
        setIsPlaying(false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    if (isPlaying) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, end, previewStart]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio || !loaded) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.currentTime >= end || audio.currentTime < previewStart) {
        audio.currentTime = previewStart;
      }
      audio.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  };

  // Scrub within the preview window
  const handleScrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !loaded) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - left) / width));
    const newTime = previewStart + ratio * windowDuration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const elapsed = Math.max(0, currentTime - previewStart);
  const progressPct = windowDuration > 0 ? (elapsed / windowDuration) * 100 : 0;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 space-y-3">
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Title row */}
      {(title || artist) && (
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            {title && <p className="text-sm font-semibold text-white truncate">{title}</p>}
            {artist && <p className="text-xs text-zinc-400 truncate">{artist}</p>}
          </div>
          <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full whitespace-nowrap">
            1-min preview
          </span>
        </div>
      )}

      {/* Progress bar */}
      <div
        className="relative h-2 bg-zinc-800 rounded-full cursor-pointer group"
        onClick={handleScrub}
      >
        <div
          className="absolute left-0 top-0 h-full bg-[#1DB954] rounded-full transition-all"
          style={{ width: `${progressPct}%` }}
        />
        {/* Thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition"
          style={{ left: `calc(${progressPct}% - 6px)` }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          size="icon"
          variant={isPlaying ? "outline" : "accent"}
          className="w-9 h-9 rounded-full flex-shrink-0"
          onClick={toggle}
          disabled={!loaded}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
        </Button>

        <div className="flex-1 flex items-center justify-between text-xs text-zinc-500">
          <span>{formatTime(elapsed)}</span>
          <span>{formatTime(windowDuration)}</span>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="text-zinc-500 hover:text-zinc-300 transition"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

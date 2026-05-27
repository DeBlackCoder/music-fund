"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Play, Pause, SkipBack } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface PreviewTrimmerProps {
  audioUrl: string;
  previewStart: number;
  onChange: (startSeconds: number) => void;
}

const PREVIEW_DURATION = 60; // seconds

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function PreviewTrimmer({ audioUrl, previewStart, onChange }: PreviewTrimmerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Clamp start so the 60s window always fits
  const clampedStart = Math.min(previewStart, Math.max(0, duration - PREVIEW_DURATION));
  const previewEnd = clampedStart + PREVIEW_DURATION;

  // ── audio events ──────────────────────────────────────────
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      setDuration(audio.duration);
      setLoaded(true);
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  // ── playhead RAF loop ─────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (!audio) return;
      setCurrentTime(audio.currentTime);

      // Auto-stop at preview end
      if (audio.currentTime >= previewEnd) {
        audio.pause();
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
  }, [isPlaying, previewEnd]);

  // ── play / pause ──────────────────────────────────────────
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !loaded) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      // Start from previewStart if we're outside the window
      if (audio.currentTime < clampedStart || audio.currentTime >= previewEnd) {
        audio.currentTime = clampedStart;
      }
      audio.play();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio || !loaded) return;
    audio.currentTime = clampedStart;
    audio.play();
    setIsPlaying(true);
  };

  // ── drag to reposition the 60s window ────────────────────
  const getStartFromEvent = useCallback(
    (clientX: number): number => {
      const track = trackRef.current;
      if (!track || duration === 0) return 0;
      const { left, width } = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - left) / width));
      const raw = ratio * duration - PREVIEW_DURATION / 2;
      return Math.max(0, Math.min(duration - PREVIEW_DURATION, raw));
    },
    [duration]
  );

  const onMouseDown = (e: React.MouseEvent) => {
    if (!loaded) return;
    setIsDragging(true);
    const newStart = getStartFromEvent(e.clientX);
    onChange(newStart);

    // Stop playback while dragging
    audioRef.current?.pause();
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onMove = (e: MouseEvent) => {
      onChange(getStartFromEvent(e.clientX));
    };
    const onUp = () => setIsDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isDragging, getStartFromEvent, onChange]);

  // ── derived percentages for the timeline ─────────────────
  const startPct = duration > 0 ? (clampedStart / duration) * 100 : 0;
  const widthPct = duration > 0 ? (PREVIEW_DURATION / duration) * 100 : 0;
  const playheadPct = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="space-y-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Info */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">
          {loaded
            ? `Song duration: ${formatTime(duration)}`
            : "Loading audio…"}
        </span>
        <span className="text-[#1DB954] font-semibold">
          Preview: {formatTime(clampedStart)} – {formatTime(previewEnd)}
        </span>
      </div>

      {/* Timeline */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        className={`relative h-14 rounded-xl overflow-hidden select-none ${
          loaded ? "cursor-pointer" : "cursor-not-allowed opacity-50"
        }`}
      >
        {/* Full track background */}
        <div className="absolute inset-0 bg-zinc-800 rounded-xl" />

        {/* Waveform-style bars (decorative) */}
        <div className="absolute inset-0 flex items-center gap-px px-1">
          {Array.from({ length: 120 }).map((_, i) => {
            const h = 20 + Math.sin(i * 0.4) * 12 + Math.sin(i * 1.1) * 8 + Math.random() * 10;
            const inWindow =
              duration > 0 &&
              i / 120 >= clampedStart / duration &&
              i / 120 < previewEnd / duration;
            return (
              <div
                key={i}
                className={`flex-1 rounded-full transition-colors ${
                  inWindow ? "bg-[#1DB954]/70" : "bg-zinc-600/40"
                }`}
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>

        {/* Selected window highlight */}
        <div
          className="absolute top-0 bottom-0 bg-[#1DB954]/20 border-x-2 border-[#1DB954] rounded pointer-events-none"
          style={{ left: `${startPct}%`, width: `${widthPct}%` }}
        >
          {/* Drag handle labels */}
          <div className="absolute -top-5 left-0 text-[10px] text-[#1DB954] font-bold whitespace-nowrap">
            {formatTime(clampedStart)}
          </div>
          <div className="absolute -top-5 right-0 text-[10px] text-[#1DB954] font-bold whitespace-nowrap">
            {formatTime(previewEnd)}
          </div>
        </div>

        {/* Playhead */}
        {loaded && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
            style={{ left: `${playheadPct}%` }}
          />
        )}
      </div>

      <p className="text-xs text-zinc-500">
        Drag the timeline to choose which 60-second section fans will hear
      </p>

      {/* Playback controls */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={restart}
          disabled={!loaded}
        >
          <SkipBack className="w-4 h-4" />
        </Button>

        <Button
          type="button"
          variant={isPlaying ? "outline" : "accent"}
          size="sm"
          onClick={togglePlay}
          disabled={!loaded}
          className="min-w-[120px]"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" /> Stop Preview
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" /> Play Preview
            </>
          )}
        </Button>

        <span className="text-xs text-zinc-500 ml-auto">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>
    </div>
  );
}

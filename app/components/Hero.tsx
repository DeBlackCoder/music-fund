"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Play, ArrowRight, TrendingUp, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Separator } from "@/app/components/ui/separator";

/* ─── types ─────────────────────────────────────────────────── */

interface FloatingAlbum {
  src: string;
  className: string;
  delay: number;
  floatDuration: number;
  floatDistance: number;
  rotation: string;
}

/* ─── data ──────────────────────────────────────────────────── */

const floatingAlbums: FloatingAlbum[] = [
  {
    src: "https://picsum.photos/seed/float1/300/300",
    className: "top-[18%] left-[5%] w-32 h-32",
    delay: 0,
    floatDuration: 6,
    floatDistance: 14,
    rotation: "-8deg",
  },
  {
    src: "https://picsum.photos/seed/float2/300/300",
    className: "top-[10%] right-[6%] w-24 h-24",
    delay: 0.4,
    floatDuration: 7.5,
    floatDistance: 10,
    rotation: "7deg",
  },
  {
    src: "https://picsum.photos/seed/float3/300/300",
    className: "bottom-[22%] left-[3%] w-28 h-28",
    delay: 0.8,
    floatDuration: 8,
    floatDistance: 12,
    rotation: "5deg",
  },
  {
    src: "https://picsum.photos/seed/float4/300/300",
    className: "bottom-[16%] right-[4%] w-20 h-20",
    delay: 1.2,
    floatDuration: 6.5,
    floatDistance: 9,
    rotation: "-6deg",
  },
  {
    src: "https://picsum.photos/seed/float5/300/300",
    className: "top-[45%] right-[2%] w-16 h-16",
    delay: 0.6,
    floatDuration: 9,
    floatDistance: 8,
    rotation: "12deg",
  },
];

const stats = [
  { icon: Users,      label: "Artists",       value: "4,200+" },
  { icon: TrendingUp, label: "Total Raised",  value: "$8.4M"  },
  { icon: Zap,        label: "Success Rate",  value: "87%"    },
];

/* ─── sub-components ────────────────────────────────────────── */

function FloatingAlbumCard({ album }: { album: FloatingAlbum }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75, rotate: album.rotation }}
      animate={{
        opacity: 0.65,
        scale: 1,
        rotate: album.rotation,
        y: [0, -album.floatDistance, 0],
      }}
      transition={{
        opacity: { delay: album.delay, duration: 0.8 },
        scale:   { delay: album.delay, duration: 0.8 },
        y: {
          delay: album.delay,
          duration: album.floatDuration,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className={`absolute ${album.className} rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl`}
      style={{ rotate: album.rotation }}
      whileHover={{ opacity: 1, scale: 1.06, zIndex: 20 }}
    >
      <Image src={album.src} alt="" fill className="object-cover" unoptimized />
      {/* green tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1DB954]/10 to-transparent" />
    </motion.div>
  );
}

function AnimatedCounter({ value, delay = 0 }: { value: string; delay?: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      {value}
    </motion.span>
  );
}

/* ─── hero ──────────────────────────────────────────────────── */

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const rawY       = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const rawOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const y          = useSpring(rawY,       { stiffness: 100, damping: 30 });
  const opacity    = useSpring(rawOpacity, { stiffness: 100, damping: 30 });

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#080a09]"
    >

      {/* ── LAYERED BACKGROUND ──────────────────────────────── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#080a09] via-[#0c1a0e] to-[#080a09]" />

        {/* large radial glow — top-left */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full bg-[#1DB954]/[0.07] blur-[120px]" />

        {/* secondary glow — bottom-right */}
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#1DB954]/[0.05] blur-[100px]" />

        {/* subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#1DB954]/[0.03] blur-[80px]" />

        {/* grid lines */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), " +
              "linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 85% 85% at 50% 50%, black 25%, transparent 100%)",
          }}
        />

        {/* noise grain texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />
      </div>

      {/* ── FLOATING ALBUMS (desktop only) ──────────────────── */}
      <div className="absolute inset-0 hidden lg:block pointer-events-none">
        {floatingAlbums.map((album, i) => (
          <FloatingAlbumCard key={i} album={album} />
        ))}
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-24 pb-20"
      >

        {/* Live badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <Badge
            variant="outline"
            className="gap-2 px-4 py-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase border-[#1DB954]/30 bg-[#1DB954]/[0.08] text-[#1DB954] rounded-full"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1DB954] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1DB954]" />
            </span>
            Music funding for Africa
          </Badge>
        </motion.div>

        {/* Headline */}
        <div className="overflow-hidden mb-3">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.04em] text-white"
          >
            Fund the next
          </motion.h1>
        </div>

        <div className="overflow-hidden mb-3">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.32, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.04em] relative inline-block"
          >
            <span className="text-[#1DB954] relative">
              African hit
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.9, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="absolute -bottom-1 left-0 right-0 h-[3px] bg-[#1DB954]/40 rounded-full origin-left"
              />
            </span>
          </motion.h1>
        </div>

        <div className="overflow-hidden mb-8">
          <motion.h1
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.44, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(3.2rem,8vw,7rem)] font-black leading-[0.9] tracking-[-0.04em] text-white/30"
          >
            before the world.
          </motion.h1>
        </div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-zinc-400 text-lg max-w-lg mx-auto leading-relaxed font-light mb-10"
        >
          Support artists before the world hears them.
          <br className="hidden sm:block" />
          Be early. Earn exclusive access. Be part of the story.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
        >
          <Link href="/discover">
            <Button
              size="lg"
              className="
                group relative overflow-hidden
                bg-[#1DB954] text-black font-bold text-base px-8 py-6
                hover:bg-[#1DB954] rounded-xl
                shadow-[0_0_32px_rgba(29,185,84,0.35)]
                hover:shadow-[0_0_52px_rgba(29,185,84,0.55)]
                transition-shadow duration-300
              "
            >
              {/* shimmer sweep on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              <Play className="w-5 h-5 fill-black mr-1" />
              Explore Campaigns
            </Button>
          </Link>

          <Link href="/upload">
            <Button
              size="lg"
              variant="outline"
              className="
                text-base px-8 py-6 rounded-xl
                border-white/15 text-white/80
                hover:border-white/35 hover:text-white hover:bg-white/[0.04]
                transition-all duration-200
              "
            >
              Start a Campaign
              <ArrowRight className="w-5 h-5 ml-1" />
            </Button>
          </Link>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="flex items-center justify-center gap-0 flex-wrap"
        >
          {stats.map(({ icon: Icon, label, value }, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center px-8">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-[#1DB954]" />
                  <span className="text-[10px] text-zinc-500 uppercase tracking-[0.14em] font-semibold">
                    {label}
                  </span>
                </div>
                <span className="text-2xl font-black text-white tracking-tight">
                  <AnimatedCounter value={value} delay={0.9 + i * 0.1} />
                </span>
              </div>
              {i < stats.length - 1 && (
                <Separator
                  orientation="vertical"
                  className="h-10 bg-zinc-800"
                />
              )}
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── SCROLL INDICATOR ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
          className="w-5 h-8 border border-zinc-700 rounded-full flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-[#1DB954] rounded-full" />
        </motion.div>
        <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
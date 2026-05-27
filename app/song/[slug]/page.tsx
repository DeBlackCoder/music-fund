"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, Share2, Users, Clock, Trophy, Send, ChevronRight, Copy, CheckCircle, Flag, Trash2, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState } from "react";
import { toast } from "sonner";
import { CommentCard } from "@/app/components/CommentCard";
import { ActivityCard } from "@/app/components/ActivityCard";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Progress } from "@/app/components/ui/progress";
import { Tabs } from "@/app/components/ui/tabs";
import { Textarea } from "@/app/components/ui/input";
import { mockSongs, supportTiers, paymentMethods, productionStages, liveActivityFeed } from "@/src/lib/mock-data";
import { formatCurrency, getFundingPercentage, getTimeAgo } from "@/src/lib/utils";

const tabs = [
  { id: "story", label: "Story" },
  { id: "comments", label: "Comments" },
  { id: "activity", label: "Activity" },
  { id: "production", label: "Production" },
];

const sharePlatforms = [
  { id: "whatsapp", label: "WhatsApp", color: "#25D366", emoji: "💬" },
  { id: "facebook", label: "Facebook", color: "#1877F2", emoji: "📘" },
  { id: "instagram", label: "Instagram", color: "#E1306C", emoji: "📸" },
  { id: "tiktok", label: "TikTok", color: "#000000", emoji: "🎵" },
  { id: "twitter", label: "Twitter/X", color: "#1DA1F2", emoji: "🐦" },
  { id: "copy", label: "Copy Link", color: "#52525b", emoji: "🔗" },
];

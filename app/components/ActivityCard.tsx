"use client";
import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2, Trophy } from "lucide-react";
import { Avatar } from "@/app/components/ui/avatar";
import { formatCurrency, getTimeAgo } from "@/src/lib/utils";
import type { Activity } from "@/src/types";

interface ActivityCardProps {
  activity: Activity;
}

const activityConfig = {
  support: { icon: Heart, color: "text-[#1DB954]", bg: "bg-[#1DB954]/10" },
  comment: { icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
  share: { icon: Share2, color: "text-purple-400", bg: "bg-purple-400/10" },
  milestone: { icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10" },
};

export function ActivityCard({ activity }: ActivityCardProps) {
  const config = activityConfig[activity.type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3 py-3 border-b border-zinc-800/30 last:border-0"
    >
      <div className="relative flex-shrink-0">
        {activity.avatar ? (
          <Avatar src={activity.avatar} alt={activity.user} size="sm" />
        ) : (
          <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
        )}
        {activity.avatar && (
          <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full ${config.bg} flex items-center justify-center border border-[#09090b]`}>
            <Icon className={`w-2.5 h-2.5 ${config.color}`} />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-300">
          <span className="font-semibold text-white">{activity.user}</span>{" "}
          {activity.type === "support" && activity.amount && (
            <>supported with <span className="text-[#1DB954] font-semibold">{formatCurrency(activity.amount)}</span></>
          )}
          {activity.type === "comment" && activity.message && (
            <>commented: <span className="text-zinc-400 italic">&ldquo;{activity.message}&rdquo;</span></>
          )}
          {activity.type === "milestone" && activity.message && (
            <span className="text-amber-400">{activity.message}</span>
          )}
          {activity.type === "share" && "shared this campaign"}
        </p>
        <p className="text-xs text-zinc-600 mt-0.5">{getTimeAgo(activity.date)}</p>
      </div>
    </motion.div>
  );
}

"use client";
import { motion } from "framer-motion";
import { Heart, Reply } from "lucide-react";
import { Avatar } from "@/app/components/ui/avatar";
import { getTimeAgo } from "@/src/lib/utils";
import type { Comment } from "@/src/types";
import { useState } from "react";

interface CommentCardProps {
  comment: Comment;
  isReply?: boolean;
}

export function CommentCard({ comment, isReply = false }: CommentCardProps) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(comment.likes);

  const handleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-3 ${isReply ? "ml-10 mt-3" : ""}`}
    >
      <Avatar src={comment.avatar} alt={comment.user} size="sm" className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <div className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-white">{comment.user}</span>
            <span className="text-xs text-zinc-500">{getTimeAgo(comment.date)}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{comment.text}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 px-1">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Heart className={`w-3 h-3 ${liked ? "fill-red-400 text-red-400" : ""}`} />
            {likes}
          </button>
          <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
            <Reply className="w-3 h-3" />
            Reply
          </button>
        </div>
        {comment.replies?.map((reply) => (
          <CommentCard key={reply.id} comment={reply} isReply />
        ))}
      </div>
    </motion.div>
  );
}

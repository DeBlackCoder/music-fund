"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Heart, MessageCircle, Trophy, Settings, X } from "lucide-react";
import { Avatar } from "@/app/components/ui/avatar";
import { getTimeAgo } from "@/src/lib/utils";
import { mockNotifications } from "@/src/lib/mock-data";
import type { Notification } from "@/src/types";

const icons = {
  support: { Icon: Heart, color: "text-[#1DB954]", bg: "bg-[#1DB954]/10" },
  comment: { Icon: MessageCircle, color: "text-blue-400", bg: "bg-blue-400/10" },
  milestone: { Icon: Trophy, color: "text-amber-400", bg: "bg-amber-400/10" },
  system: { Icon: Settings, color: "text-zinc-400", bg: "bg-zinc-400/10" },
};

interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-80 bg-[#121214] border border-zinc-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-zinc-400" />
                <span className="font-semibold text-white text-sm">Notifications</span>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {mockNotifications.map((notif) => {
                const { Icon, color, bg } = icons[notif.type];
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-3 p-4 border-b border-zinc-800/30 hover:bg-zinc-800/30 transition-colors cursor-pointer ${!notif.read ? "bg-zinc-800/20" : ""}`}
                  >
                    <div className="relative flex-shrink-0">
                      {notif.avatar ? (
                        <Avatar src={notif.avatar} alt="" size="sm" />
                      ) : (
                        <div className={`w-8 h-8 rounded-full ${bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${color}`} />
                        </div>
                      )}
                      {!notif.read && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[#1DB954] rounded-full border border-[#121214]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{notif.title}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{notif.message}</p>
                      <p className="text-xs text-zinc-600 mt-1">{getTimeAgo(notif.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-3 text-center">
              <button className="text-xs text-[#1DB954] hover:underline cursor-pointer">View all notifications</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

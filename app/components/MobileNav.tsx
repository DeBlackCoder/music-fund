"use client";
import { motion } from "framer-motion";
import { Home, Compass, Upload, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/discover", icon: Compass, label: "Discover" },
  { href: "/upload", icon: Upload, label: "Upload" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/artist/kofi-mensah", icon: User, label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-20 left-0 right-0 z-40 md:hidden px-4">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, type: "spring", bounce: 0.2 }}
        className="glass rounded-3xl border border-zinc-800/50 px-2 py-2"
      >
        <div className="flex items-center justify-around">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-colors">
                <div className={`relative ${isActive ? "text-[#1DB954]" : "text-zinc-500"}`}>
                  <Icon className="w-5 h-5" />
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-indicator"
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1DB954] rounded-full"
                    />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "text-[#1DB954]" : "text-zinc-600"}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

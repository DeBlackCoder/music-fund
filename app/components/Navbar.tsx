"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Search, Bell, Upload, Menu, X, LogIn, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Avatar } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { NotificationDropdown } from "@/app/components/NotificationDropdown";
import { useIsAuthenticated } from "@/src/hooks/useAuth";
import { mockNotifications } from "@/src/lib/mock-data";
import { toast } from "sonner";

const publicNavLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
];

const authenticatedNavLinks = [
  { href: "/", label: "Home" },
  { href: "/discover", label: "Discover" },
  { href: "/dashboard", label: "Dashboard", requiresRole: "artist" },
  { href: "/admin", label: "Admin", requiresRole: "admin" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { isAuthenticated, user, isLoading } = useIsAuthenticated();
  const unread = mockNotifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/");
    window.location.reload();
  };

  // Filter nav links based on authentication and role
  const navLinks = isAuthenticated
    ? authenticatedNavLinks.filter((link) => {
        if (!link.requiresRole) return true;
        return user?.role === link.requiresRole;
      })
    : publicNavLinks;

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-zinc-800/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-[#1DB954] flex items-center justify-center">
              <Music2 className="w-4 h-4 text-black" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Vibefund</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-white bg-zinc-800"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search */}
          <Link href="/discover" className="hidden md:flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-2xl px-4 py-2 text-sm text-zinc-400 hover:border-zinc-600 transition-colors flex-1 max-w-xs">
            <Search className="w-4 h-4" />
            <span>Search artists, songs...</span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {/* Upload button - only for artists */}
                {user?.role === "artist" && (
                  <Link href="/upload" className="hidden sm:block">
                    <Button variant="accent" size="sm">
                      <Upload className="w-3.5 h-3.5" />
                      Upload
                    </Button>
                  </Link>
                )}

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-zinc-600 transition-colors cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-zinc-400" />
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#1DB954] rounded-full text-[10px] font-bold text-black flex items-center justify-center">
                        {unread}
                      </span>
                    )}
                  </button>
                  <NotificationDropdown open={notifOpen} onClose={() => setNotifOpen(false)} />
                </div>

                {/* Avatar with dropdown */}
                <div className="relative group">
                  <Link href={user?.role === "admin" ? "/admin" : "/dashboard"}>
                    <Avatar 
                      src={user?.profileImage || "https://i.pravatar.cc/150"} 
                      alt={user?.fullName || "Profile"} 
                      size="sm" 
                      ring 
                      className="cursor-pointer" 
                    />
                  </Link>
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-3 border-b border-zinc-800">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.artistName || user?.fullName}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      {user?.role === "artist" && (
                        <Link 
                          href="/dashboard"
                          className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                          Dashboard
                        </Link>
                      )}
                      {user?.role === "admin" && (
                        <Link 
                          href="/admin"
                          className="block px-3 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors"
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Login/Signup buttons for non-authenticated users */}
                <Link href="/auth/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    <LogIn className="w-3.5 h-3.5" />
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" className="hidden sm:block">
                  <Button variant="accent" size="sm">
                    Artist Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center cursor-pointer"
            >
              {mobileOpen ? <X className="w-4 h-4 text-zinc-400" /> : <Menu className="w-4 h-4 text-zinc-400" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-zinc-800/50 bg-[#09090b]/95 backdrop-blur-xl"
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-4 py-3 rounded-2xl text-sm font-medium transition-colors ${
                      pathname === link.href ? "text-white bg-zinc-800" : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                
                {isAuthenticated ? (
                  <>
                    {user?.role === "artist" && (
                      <Link href="/upload" onClick={() => setMobileOpen(false)}>
                        <Button variant="accent" size="md" className="w-full mt-2">
                          <Upload className="w-4 h-4" />
                          Upload Campaign
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      size="md" 
                      className="w-full mt-2 text-red-400 hover:text-red-300"
                      onClick={() => {
                        setMobileOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" size="md" className="w-full mt-2">
                        <LogIn className="w-4 h-4" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setMobileOpen(false)}>
                      <Button variant="accent" size="md" className="w-full">
                        Artist Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

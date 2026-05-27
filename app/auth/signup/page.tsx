"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, Eye, EyeOff, ArrowRight, Mic2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { useRegister } from "@/src/hooks/useAuth";

const GENRES = ["Afrobeats", "Amapiano", "Afro-Soul", "Gengetone", "Afro-Blues", "Highlife", "Afro-Hip-Hop", "Mbalax"];
const TOTAL_STEPS = 2;

export default function SignupPage() {
  const router = useRouter();
  const register = useRegister();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    artistName: "",
    genre: "",
    location: "",
  });

  const update = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleNext = () => {
    if (!form.fullName || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.artistName) {
      toast.error("Please enter your artist name");
      return;
    }

    try {
      await register.mutateAsync({
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: "artist",
        artistName: form.artistName,
        phone: form.phone || undefined,
      });
      toast.success("Account created! Welcome to MusicFund 🎵");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#09090b] via-[#0d1a0f] to-[#09090b]" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#1DB954]/6 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-[#1DB954] flex items-center justify-center">
              <Music2 className="w-5 h-5 text-black" />
            </div>
            <span className="font-black text-white text-2xl">MusicFund</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1DB954]/10 border border-[#1DB954]/20 mb-4">
            <Mic2 className="w-3.5 h-3.5 text-[#1DB954]" />
            <span className="text-xs font-semibold text-[#1DB954]">Artist Account</span>
          </div>
          <h1 className="text-3xl font-black text-white mb-2">Create your account</h1>
          <p className="text-zinc-400">Start funding your music career</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                i < step ? "bg-[#1DB954]" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>

        <div className="glass rounded-3xl border border-zinc-800/50 p-8">
          <AnimatePresence mode="wait">

            {/* Step 1: Account Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Your details</h2>
                  <p className="text-sm text-zinc-400 mb-4">Set up your artist account</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Full Name *</label>
                  <Input
                    placeholder="e.g. John Doe"
                    value={form.fullName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("fullName", e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#1DB954]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Email address *</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("email", e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#1DB954]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+234 800 000 0000"
                    value={form.phone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("phone", e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#1DB954]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Password *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("password", e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#1DB954] pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button variant="accent" size="lg" className="w-full mt-2" onClick={handleNext}>
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Artist Profile */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Artist Profile</h2>
                  <p className="text-sm text-zinc-400 mb-4">Tell fans about your music</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Stage Name / Artist Name *</label>
                  <Input
                    placeholder="e.g. DJ Awesome"
                    value={form.artistName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("artistName", e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#1DB954]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-300">Location</label>
                  <Input
                    placeholder="e.g. Lagos, Nigeria"
                    value={form.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => update("location", e.target.value)}
                    className="bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-[#1DB954]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Primary Genre</label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => update("genre", g)}
                        className={`px-3 py-1.5 rounded-2xl text-sm transition-all cursor-pointer ${
                          form.genre === g
                            ? "bg-[#1DB954] text-black font-semibold"
                            : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1DB954]/5 border border-[#1DB954]/20 rounded-2xl p-3">
                  <p className="text-xs text-zinc-400">
                    <span className="text-[#1DB954] font-medium">🟢 Next Steps</span> — After
                    signup, complete your profile, upload songs, and launch your first campaign!
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                    Back
                  </Button>
                  <Button
                    variant="accent"
                    size="lg"
                    className="flex-1"
                    loading={register.isPending}
                    onClick={handleSubmit}
                  >
                    Create Account 🎵
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          <p className="text-center text-sm text-zinc-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-[#1DB954] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-600 mt-4">
          By signing up, you agree to our{" "}
          <a href="#" className="text-zinc-400 hover:text-zinc-300">Terms of Service</a>{" "}
          and{" "}
          <a href="#" className="text-zinc-400 hover:text-zinc-300">Privacy Policy</a>
        </p>
      </motion.div>
    </div>
  );
}

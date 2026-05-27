"use client";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Shield, Phone, Instagram, Twitter, FileText, Camera, ChevronRight, ChevronLeft, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Avatar } from "@/app/components/ui/avatar";

const steps = [
  { id: 1, label: "Phone", icon: Phone },
  { id: 2, label: "Socials", icon: Instagram },
  { id: 3, label: "Face Photo", icon: Camera },
  { id: 4, label: "Declaration", icon: FileText },
];

export default function VerifyPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    phone: "", instagram: "", twitter: "", youtube: "",
    faceUploaded: false, declaration: false,
  });

  const update = (k: string, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.declaration) { toast.error("Please accept the declaration"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-[#1DB954]/20 border-2 border-[#1DB954] flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-[#1DB954]" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Request Submitted!</h1>
          <p className="text-zinc-400 mb-6">Your verification request is under review. We&apos;ll notify you within 24–48 hours.</p>
          <div className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-5 mb-6 text-left">
            <h3 className="font-semibold text-white mb-3">What happens next?</h3>
            <div className="space-y-3">
              {[
                { icon: "🔍", text: "Our team reviews your submission" },
                { icon: "✅", text: "Identity and ownership verified" },
                { icon: "🟢", text: "Verified badge added to your profile" },
                { icon: "⭐", text: "Eligible for Featured Artist status" },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-lg">{icon}</span>
                  <span className="text-sm text-zinc-300">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <Button variant="accent" size="lg" onClick={() => window.location.href = "/dashboard"}>
            Back to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-4 py-2 mb-4">
          <Shield className="w-4 h-4 text-[#1DB954]" />
          <span className="text-sm text-[#1DB954] font-medium">Artist Verification</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Get Verified</h1>
        <p className="text-zinc-400">Build trust with supporters and unlock premium features</p>

        {/* Badge Preview */}
        <div className="flex items-center justify-center gap-4 mt-6">
          {[
            { icon: "🟢", label: "Verified Artist", desc: "Identity confirmed" },
            { icon: "⭐", label: "Featured Artist", desc: "Top performers" },
          ].map(({ icon, label, desc }) => (
            <div key={label} className="bg-[#121214] rounded-2xl border border-zinc-800/50 px-4 py-3 text-center">
              <span className="text-2xl">{icon}</span>
              <p className="text-sm font-semibold text-white mt-1">{label}</p>
              <p className="text-xs text-zinc-500">{desc}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Stepper */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isActive = s.id === step;
          const isDone = s.id < step;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all ${isDone ? "bg-[#1DB954] border-[#1DB954]" : isActive ? "bg-[#1DB954]/10 border-[#1DB954]" : "bg-zinc-900 border-zinc-700"}`}>
                  {isDone ? <CheckCircle className="w-5 h-5 text-black" /> : <Icon className={`w-4 h-4 ${isActive ? "text-[#1DB954]" : "text-zinc-500"}`} />}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${isActive ? "text-[#1DB954]" : isDone ? "text-zinc-400" : "text-zinc-600"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-[#1DB954] transition-all duration-500 ${isDone ? "w-full" : "w-0"}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-[#121214] rounded-3xl border border-zinc-800/50 p-6 sm:p-8 mb-6"
        >
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Phone Verification</h2>
                <p className="text-sm text-zinc-400">We&apos;ll send a verification code to confirm your number</p>
              </div>
              <Input
                label="Phone Number *"
                type="tel"
                placeholder="+234 800 000 0000"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                icon={<Phone className="w-4 h-4" />}
              />
              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-zinc-800/30">
                <p className="text-sm text-zinc-400">📱 A 6-digit OTP will be sent to this number. Standard SMS rates may apply.</p>
              </div>
              {form.phone && (
                <Button variant="outline" size="sm" onClick={() => toast.success("OTP sent! (Demo: use any 6 digits)")}>
                  Send OTP
                </Button>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Social Media Handles</h2>
                <p className="text-sm text-zinc-400">Link your social profiles to verify your artist identity</p>
              </div>
              <Input label="Instagram Handle *" placeholder="@yourname" value={form.instagram} onChange={(e) => update("instagram", e.target.value)} icon={<Instagram className="w-4 h-4 text-pink-400" />} />
              <Input label="Twitter/X Handle" placeholder="@yourname" value={form.twitter} onChange={(e) => update("twitter", e.target.value)} icon={<Twitter className="w-4 h-4 text-blue-400" />} />
              <Input label="YouTube Channel" placeholder="Channel name or URL" value={form.youtube} onChange={(e) => update("youtube", e.target.value)} icon={<span className="text-red-400 text-xs font-bold">YT</span>} />
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                <p className="text-sm text-amber-400 font-medium mb-1">⚠️ Important</p>
                <p className="text-xs text-zinc-400">Your social profiles must show music content and match the name on your Vibefund account.</p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Face Photo</h2>
                <p className="text-sm text-zinc-400">Upload a clear photo of your face holding a handwritten note with today&apos;s date and &quot;Vibefund&quot;</p>
              </div>
              <motion.div
                whileHover={{ borderColor: "#1DB954" }}
                onClick={() => update("faceUploaded", true)}
                className={`border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all ${form.faceUploaded ? "border-[#1DB954] bg-[#1DB954]/5" : "border-zinc-700 hover:border-zinc-500"}`}
              >
                {form.faceUploaded ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-[#1DB954]" />
                    </div>
                    <p className="font-semibold text-[#1DB954]">Photo uploaded!</p>
                    <p className="text-xs text-zinc-500">verification_photo.jpg</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Camera className="w-12 h-12 text-zinc-500" />
                    <p className="font-medium text-zinc-300">Click to upload face photo</p>
                    <p className="text-xs text-zinc-500">JPG, PNG up to 10MB</p>
                    <Badge variant="outline">Browse Files</Badge>
                  </div>
                )}
              </motion.div>
              <div className="bg-[#121214] rounded-2xl border border-zinc-800/30 p-4">
                <p className="text-sm font-medium text-zinc-300 mb-2">📋 Photo requirements:</p>
                <ul className="space-y-1 text-xs text-zinc-500">
                  <li>• Clear, well-lit face photo</li>
                  <li>• Hold a paper with &quot;Vibefund&quot; + today&apos;s date</li>
                  <li>• No filters or heavy editing</li>
                  <li>• Photo is only used for verification, never shared publicly</li>
                </ul>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Song Ownership Declaration</h2>
                <p className="text-sm text-zinc-400">Confirm that you own the rights to the music you&apos;ll upload</p>
              </div>
              <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/30 p-5 text-sm text-zinc-300 leading-relaxed space-y-3">
                <p>By submitting this verification request, I declare that:</p>
                <ul className="space-y-2 text-zinc-400">
                  <li className="flex gap-2"><span className="text-[#1DB954] flex-shrink-0">1.</span> I am the original creator and rights holder of all music I upload to Vibefund.</li>
                  <li className="flex gap-2"><span className="text-[#1DB954] flex-shrink-0">2.</span> I have not plagiarized or copied any existing copyrighted work.</li>
                  <li className="flex gap-2"><span className="text-[#1DB954] flex-shrink-0">3.</span> I understand that false declarations may result in account suspension.</li>
                  <li className="flex gap-2"><span className="text-[#1DB954] flex-shrink-0">4.</span> I agree to Vibefund&apos;s Terms of Service and Artist Agreement.</li>
                </ul>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  onClick={() => update("declaration", !form.declaration)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${form.declaration ? "bg-[#1DB954] border-[#1DB954]" : "border-zinc-600"}`}
                >
                  {form.declaration && <CheckCircle className="w-3.5 h-3.5 text-black" />}
                </div>
                <span className="text-sm text-zinc-300">I confirm that all information provided is accurate and I agree to the declaration above.</span>
              </label>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4">
        {step > 1 && (
          <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep((s) => s - 1)}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
        )}
        {step < 4 ? (
          <Button variant="accent" size="lg" className="flex-1" onClick={() => setStep((s) => s + 1)}>
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button variant="accent" size="lg" className="flex-1" loading={loading} onClick={handleSubmit}>
            Submit for Verification 🟢
          </Button>
        )}
      </div>
    </div>
  );
}

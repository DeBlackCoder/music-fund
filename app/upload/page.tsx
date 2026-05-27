"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Music,
  Image as ImageIcon,
  Loader2,
  CheckCircle,
  DollarSign,
  Scissors,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Card } from "@/app/components/ui/card";
import { PreviewTrimmer } from "@/app/components/PreviewTrimmer";
import { useIsAuthenticated } from "@/src/hooks/useAuth";
import { usePlatformSettings } from "@/src/hooks/usePlatformSettings";
import { useCreateCampaign } from "@/src/hooks/useCampaigns";
import { formatFullCurrency } from "@/src/lib/utils";
import { toast } from "sonner";

const GENRES = [
  "Afrobeats", "Amapiano", "Afro-Soul", "Gengetone",
  "Afro-Blues", "Highlife", "Afro-Hip-Hop", "Mbalax",
];

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useIsAuthenticated();
  const { data: settings } = usePlatformSettings();
  const createCampaign = useCreateCampaign();

  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1); // 1: Upload Fee  2: Song Details  3: Campaign Details
  const [uploadFeePaid, setUploadFeePaid] = useState(false);
  const [uploadFeeRef, setUploadFeeRef] = useState("");

  const [audioObjectUrl, setAudioObjectUrl] = useState(""); // local blob URL for trimmer
  const [coverPreview, setCoverPreview] = useState("");
  const [previewStart, setPreviewStart] = useState(0); // seconds

  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    description: "",
    story: "",
    goalAmount: "",
    tags: "",
    audioFile: "",   // final URL after upload
    coverImage: "",  // final URL after upload
  });

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to upload");
      router.push("/auth/login");
    } else if (user?.role !== "artist") {
      toast.error("Only artists can upload songs");
      router.push("/discover");
    }
  }, [isAuthenticated, user, router]);

  // ── file pickers ──────────────────────────────────────────
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error("Audio file must be under 50 MB");
      return;
    }
    // Revoke previous blob
    if (audioObjectUrl) URL.revokeObjectURL(audioObjectUrl);
    const url = URL.createObjectURL(file);
    setAudioObjectUrl(url);
    setPreviewStart(0);
    // TODO: upload to R2 and set formData.audioFile = uploadedUrl
    setFormData((f) => ({ ...f, audioFile: url }));
    toast.success("Audio loaded — choose your 1-minute preview below");
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Cover image must be under 5 MB");
      return;
    }
    const url = URL.createObjectURL(file);
    setCoverPreview(url);
    // TODO: upload to R2 and set formData.coverImage = uploadedUrl
    setFormData((f) => ({ ...f, coverImage: url }));
  };

  // ── step navigation ───────────────────────────────────────
  const handlePayUploadFee = async () => {
    toast.info("Upload fee payment coming soon!");
    setUploadFeePaid(true);
    setUploadFeeRef("UPLOAD-DEMO-123");
    setStep(2);
  };

  const handleStep2Continue = () => {
    if (!formData.audioFile) {
      toast.error("Please upload an audio file");
      return;
    }
    if (!formData.coverImage) {
      toast.error("Please upload a cover image");
      return;
    }
    if (!formData.title || !formData.genre || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(3);
  };

  const handleSubmit = async () => {
    if (!formData.goalAmount) {
      toast.error("Please enter a funding goal");
      return;
    }
    if (!uploadFeePaid) {
      toast.error("Please pay the upload fee first");
      return;
    }

    try {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (settings?.defaultCampaignDuration || 30));

      await createCampaign.mutateAsync({
        title: formData.title,
        genre: formData.genre,
        description: formData.description,
        story: formData.story,
        goalAmount: parseInt(formData.goalAmount),
        deadline: deadline.toISOString(),
        tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
        audioFile: formData.audioFile,
        coverImage: formData.coverImage,
        previewStart,
        uploadFeeTransactionRef: uploadFeeRef,
      } as any);

      toast.success("Campaign created! Waiting for admin approval.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create campaign");
    }
  };

  if (!isAuthenticated || user?.role !== "artist") return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">Upload Your Song</h1>
        <p className="text-zinc-400">Create a campaign to fund your music video production</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4 mb-12">
        {[
          { num: 1, label: "Upload Fee" },
          { num: 2, label: "Song Details" },
          { num: 3, label: "Campaign" },
        ].map(({ num, label }) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                step >= num ? "bg-[#1DB954] text-black" : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {step > num ? <CheckCircle className="w-5 h-5" /> : num}
            </div>
            <span className={`text-sm ${step >= num ? "text-white" : "text-zinc-500"}`}>
              {label}
            </span>
            {num < 3 && (
              <div className={`w-12 h-0.5 ${step > num ? "bg-[#1DB954]" : "bg-zinc-800"}`} />
            )}
          </div>
        ))}
      </div>

      {/* ── STEP 1: Upload Fee ── */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 bg-zinc-900 border-zinc-800">
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto rounded-full bg-[#1DB954]/20 flex items-center justify-center">
                <DollarSign className="w-10 h-10 text-[#1DB954]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-2">Upload Fee Required</h2>
                <p className="text-zinc-400">
                  A one-time fee is required to upload your song and create a campaign
                </p>
              </div>
              <div className="p-6 bg-zinc-800 rounded-2xl">
                <div className="text-4xl font-bold text-[#1DB954] mb-2">
                  {formatFullCurrency(settings?.uploadFee || 2000)}
                </div>
                <p className="text-sm text-zinc-400">One-time upload fee</p>
              </div>
              <ul className="space-y-2 text-left">
                {[
                  "Platform hosting and storage",
                  "Campaign review and approval",
                  "Payment processing setup",
                  "Email notifications",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#1DB954]" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button variant="accent" size="lg" className="w-full" onClick={handlePayUploadFee}>
                Pay Upload Fee
              </Button>
              <p className="text-xs text-zinc-500">Secure payment powered by Paystack</p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── STEP 2: Song Details + Preview Trimmer ── */}
      {step === 2 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 bg-zinc-900 border-zinc-800 space-y-6">
            <h2 className="text-2xl font-bold">Song Details</h2>

            {/* Audio Upload */}
            <div>
              <Label>Audio File * <span className="text-zinc-500 font-normal">(MP3 / WAV, max 50 MB)</span></Label>
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mp3,audio/mpeg,audio/wav"
                className="hidden"
                onChange={handleAudioChange}
              />
              <div
                onClick={() => audioInputRef.current?.click()}
                className={`mt-2 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${
                  audioObjectUrl
                    ? "border-[#1DB954] bg-[#1DB954]/5"
                    : "border-zinc-700 hover:border-[#1DB954]"
                }`}
              >
                <Music className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
                {audioObjectUrl ? (
                  <p className="text-sm text-[#1DB954] font-medium">Audio loaded ✓ — drag the timeline below to pick your preview</p>
                ) : (
                  <>
                    <p className="text-sm text-zinc-400 mb-1">Click to upload your full song</p>
                    <p className="text-xs text-zinc-600">Fans will only hear the 1-minute preview you select</p>
                  </>
                )}
              </div>
            </div>

            {/* Preview Trimmer — shown once audio is loaded */}
            {audioObjectUrl && (
              <div className="p-5 bg-zinc-800/60 rounded-2xl border border-zinc-700 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <Scissors className="w-4 h-4 text-[#1DB954]" />
                  <h3 className="font-semibold text-white text-sm">Choose Your 1-Minute Preview</h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Drag the highlighted window to the best part of your song. This is what fans will hear before voting.
                </p>
                <PreviewTrimmer
                  audioUrl={audioObjectUrl}
                  previewStart={previewStart}
                  onChange={setPreviewStart}
                />
              </div>
            )}

            {/* Cover Image */}
            <div>
              <Label>Cover Image * <span className="text-zinc-500 font-normal">(JPG / PNG, max 5 MB)</span></Label>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleCoverChange}
              />
              <div
                onClick={() => coverInputRef.current?.click()}
                className={`mt-2 border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition ${
                  coverPreview
                    ? "border-[#1DB954]"
                    : "border-zinc-700 hover:border-[#1DB954] p-8 text-center"
                }`}
              >
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-48 object-cover" />
                ) : (
                  <>
                    <ImageIcon className="w-10 h-10 mx-auto mb-3 text-zinc-500" />
                    <p className="text-sm text-zinc-400">Click to upload cover art</p>
                  </>
                )}
              </div>
            </div>

            {/* Song Title */}
            <div>
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                placeholder="e.g. My Amazing Song"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-2 bg-zinc-800 border-zinc-700"
              />
            </div>

            {/* Genre */}
            <div>
              <Label>Genre *</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFormData({ ...formData, genre: g })}
                    className={`px-3 py-1.5 rounded-2xl text-sm transition-all cursor-pointer ${
                      formData.genre === g
                        ? "bg-[#1DB954] text-black font-semibold"
                        : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <textarea
                id="description"
                placeholder="Tell fans about your song..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-2 w-full min-h-[100px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button variant="accent" size="lg" className="flex-1" onClick={handleStep2Continue}>
                Continue
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ── STEP 3: Campaign Details ── */}
      {step === 3 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-8 bg-zinc-900 border-zinc-800 space-y-6">
            <h2 className="text-2xl font-bold">Campaign Details</h2>

            {/* Funding Goal */}
            <div>
              <Label htmlFor="goalAmount">Funding Goal (₦) *</Label>
              <Input
                id="goalAmount"
                type="number"
                placeholder="e.g. 500000"
                value={formData.goalAmount}
                onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })}
                className="mt-2 bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Minimum: {formatFullCurrency(settings?.minGoalAmount || 50000)}
              </p>
            </div>

            {/* Story */}
            <div>
              <Label htmlFor="story">Campaign Story (Optional)</Label>
              <textarea
                id="story"
                placeholder="Share the story behind your music video..."
                value={formData.story}
                onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                className="mt-2 w-full min-h-[120px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
              />
            </div>

            {/* Tags */}
            <div>
              <Label htmlFor="tags">Tags (Optional)</Label>
              <Input
                id="tags"
                placeholder="e.g. afrobeats, love, dance"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="mt-2 bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500 mt-1">Separate tags with commas</p>
            </div>

            {/* Preview summary */}
            <div className="p-4 bg-zinc-800 rounded-2xl flex items-center gap-3">
              <Scissors className="w-5 h-5 text-[#1DB954] flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-white">1-Minute Preview Selected</p>
                <p className="text-xs text-zinc-400">
                  Fans will hear seconds {Math.floor(previewStart)}–{Math.floor(previewStart) + 60} of your song
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-2xl">
              <p className="text-sm text-zinc-300">
                <strong className="text-[#1DB954]">Note:</strong> Your campaign will be reviewed
                by our admin team before going live. You'll receive an email once approved.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="lg" className="flex-1" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button
                variant="accent"
                size="lg"
                className="flex-1"
                onClick={handleSubmit}
                disabled={createCampaign.isPending}
              >
                {createCampaign.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Campaign"
                )}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

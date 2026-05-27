// User Types
export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'artist' | 'admin';
  profileImage?: string;
  artistName?: string;
  bio?: string;
  genre?: string[];
  location?: string;
  verified: boolean;
  followers: number;
  following: number;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    spotify?: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Artist extends User {
  role: 'artist';
  artistName: string;
  totalRaised: number;
  activeCampaigns: number;
  completedCampaigns: number;
}

// Campaign Types (formerly Song)
export interface Campaign {
  id: string;
  slug: string;
  artistId: string;
  artist: {
    id: string;
    name: string;
    artistName: string;
    avatar: string;
    verified: boolean;
  };
  title: string;
  audioFile: string;
  coverImage: string;
  genre: string;
  description: string;
  story?: string;
  goalAmount: number;
  raisedAmount: number;
  voteCount: number;
  likeCount: number;
  shareCount: number;
  status: 'pending' | 'active' | 'goal_reached' | 'rejected' | 'ended';
  uploadFeePaid: boolean;
  uploadFeeAmount: number;
  deadline: string;
  daysLeft: number;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  goalReachedAt?: string;
  tags: string[];
  referralLink: string;
  analytics: {
    views: number;
    clicks: number;
    uniqueVisitors: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Legacy alias for backward compatibility
export interface Song extends Campaign {
  // Mapped fields for old components
  fundingGoal: number;
  amountRaised: number;
  supporters: number;
  coverArt: string;
  audioPreview?: string;
  topSupporters: Supporter[];
  recentActivity: Activity[];
  comments: Comment[];
}

// Vote Types
export interface Vote {
  id: string;
  campaignId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    avatar: string;
  };
  voteCount: number;
  amount: number;
  votePrice: number;
  transactionRef: string;
  status: 'pending' | 'successful' | 'failed';
  createdAt: string;
}

// Platform Settings
export interface PlatformSettings {
  uploadFee: number;
  votePrice: number;
  platformCommission: number;
  minGoalAmount: number;
  maxGoalAmount: number;
  defaultCampaignDuration: number;
}

// Withdrawal Types
export interface Withdrawal {
  id: string;
  artistId: string;
  campaignId: string;
  amount: number;
  platformCommission: number;
  netAmount: number;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  requestedAt: string;
  processedAt?: string;
  rejectionReason?: string;
}

export interface Supporter {
  id: string;
  name: string;
  avatar: string;
  amount: number;
  message?: string;
  date: string;
}

export interface Activity {
  id: string;
  type: "support" | "comment" | "share" | "milestone";
  user: string;
  avatar: string;
  amount?: number;
  message?: string;
  date: string;
}

export interface Comment {
  id: string;
  user: string;
  avatar: string;
  text: string;
  likes: number;
  date: string;
  replies?: Comment[];
}

export interface DashboardStats {
  totalEarnings: number;
  totalSupporters: number;
  activeCampaigns: number;
  completedCampaigns: number;
  monthlyGrowth: number;
  topGenre: string;
}

export interface Notification {
  id: string;
  type:
    | 'upload_success'
    | 'payment_received'
    | 'new_vote'
    | 'new_follower'
    | 'goal_reached'
    | 'withdrawal_approved'
    | 'withdrawal_rejected'
    | 'campaign_approved'
    | 'campaign_rejected'
    | 'system';
  title: string;
  message: string;
  read: boolean;
  date: string;
  avatar?: string;
  metadata?: any;
}

export interface Genre {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  text: string;
  rating: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "artist" | "supporter" | "admin";
  status: "active" | "suspended" | "pending";
  joinDate: string;
  totalTransactions: number;
}

export interface AdminCampaign {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  status: 'pending' | 'active' | 'goal_reached' | 'rejected' | 'ended';
  goalAmount: number;
  raisedAmount: number;
  voteCount: number;
  submittedDate: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

export interface ChartData {
  name: string;
  value: number;
  prev?: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  volume: number;
  progress: number;
  duration: number;
  queue: Song[];
}

export interface VerificationRequest {
  id: string;
  artistId: string;
  artistName: string;
  avatar: string;
  phone: string;
  instagramHandle: string;
  twitterHandle: string;
  declaration: boolean;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
}

export interface ProductionStage {
  id: string;
  label: string;
  description: string;
  status: "pending" | "in-progress" | "completed";
  date?: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export interface SupportTier {
  amount: number;
  label: string;
  perk: string;
  color: string;
}

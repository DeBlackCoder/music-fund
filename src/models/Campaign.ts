import mongoose, { Schema, Document, Model } from 'mongoose';
import { nanoid } from 'nanoid';

export interface ICampaign extends Document {
  _id: string;
  slug: string;
  artistId: mongoose.Types.ObjectId;
  title: string;
  audioFile: string;
  coverImage: string;
  previewStart: number;  // seconds into the full track where the 1-min preview begins
  previewEnd: number;    // previewStart + 60
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
  uploadFeeTransactionRef?: string;
  deadline: Date;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  rejectedAt?: Date;
  rejectionReason?: string;
  goalReachedAt?: Date;
  tags: string[];
  referralLink: string;
  analytics: {
    views: number;
    clicks: number;
    uniqueVisitors: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CampaignSchema = new Schema<ICampaign>(
  {
    slug: {
      type: String,
      unique: true,
      default: () => nanoid(10),
    },
    artistId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Song title is required'],
      trim: true,
    },
    audioFile: {
      type: String,
      required: [true, 'Audio file is required'],
    },
    coverImage: {
      type: String,
      required: [true, 'Cover image is required'],
    },
    previewStart: {
      type: Number,
      default: 0,
      min: 0,
    },
    previewEnd: {
      type: Number,
      default: 60,
      min: 1,
    },
    genre: {
      type: String,
      required: [true, 'Genre is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: 1000,
    },
    story: {
      type: String,
      maxlength: 2000,
    },
    goalAmount: {
      type: Number,
      required: [true, 'Goal amount is required'],
      min: 0,
    },
    raisedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    voteCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    likeCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'goal_reached', 'rejected', 'ended'],
      default: 'pending',
    },
    uploadFeePaid: {
      type: Boolean,
      default: false,
    },
    uploadFeeAmount: {
      type: Number,
      required: true,
    },
    uploadFeeTransactionRef: String,
    deadline: {
      type: Date,
      required: true,
    },
    approvedAt: Date,
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectedAt: Date,
    rejectionReason: String,
    goalReachedAt: Date,
    tags: [String],
    referralLink: {
      type: String,
      unique: true,
    },
    analytics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      uniqueVisitors: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Generate referral link before saving
CampaignSchema.pre('save', function (next) {
  if (!this.referralLink) {
    this.referralLink = `${process.env.NEXT_PUBLIC_APP_URL}/song/${this.slug}`;
  }
  next();
});

// Check if goal is reached and update status
CampaignSchema.methods.checkGoalReached = function () {
  if (this.raisedAmount >= this.goalAmount && this.status === 'active') {
    this.status = 'goal_reached';
    this.goalReachedAt = new Date();
    return true;
  }
  return false;
};

// Indexes
CampaignSchema.index({ slug: 1 });
CampaignSchema.index({ artistId: 1 });
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ createdAt: -1 });
CampaignSchema.index({ raisedAmount: -1 });
CampaignSchema.index({ voteCount: -1 });

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign ||
  mongoose.model<ICampaign>('Campaign', CampaignSchema);

export default Campaign;

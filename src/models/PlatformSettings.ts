import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlatformSettings extends Document {
  _id: string;
  uploadFee: number;
  votePrice: number;
  platformCommission: number; // Percentage (e.g., 10 for 10%)
  minGoalAmount: number;
  maxGoalAmount: number;
  defaultCampaignDuration: number; // Days
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const PlatformSettingsSchema = new Schema<IPlatformSettings>(
  {
    uploadFee: {
      type: Number,
      required: true,
      default: 2000,
      min: 0,
    },
    votePrice: {
      type: Number,
      required: true,
      default: 100,
      min: 1,
    },
    platformCommission: {
      type: Number,
      required: true,
      default: 10,
      min: 0,
      max: 100,
    },
    minGoalAmount: {
      type: Number,
      default: 50000,
      min: 0,
    },
    maxGoalAmount: {
      type: Number,
      default: 10000000,
      min: 0,
    },
    defaultCampaignDuration: {
      type: Number,
      default: 30,
      min: 1,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

const PlatformSettings: Model<IPlatformSettings> =
  mongoose.models.PlatformSettings ||
  mongoose.model<IPlatformSettings>('PlatformSettings', PlatformSettingsSchema);

export default PlatformSettings;

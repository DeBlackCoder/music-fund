import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVote extends Document {
  _id: string;
  campaignId: mongoose.Types.ObjectId;
  voterEmail: string;           // Anonymous voter identified by email
  userId?: mongoose.Types.ObjectId; // Optional — only set if voter is a logged-in artist
  voteCount: number;
  amount: number;
  votePrice: number;
  transactionRef: string;
  paystackRef: string;
  status: 'pending' | 'successful' | 'failed';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    voterEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    voteCount: {
      type: Number,
      required: true,
      min: 1,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    votePrice: {
      type: Number,
      required: true,
    },
    transactionRef: {
      type: String,
      required: true,
      unique: true,
    },
    paystackRef: {
      type: String,
      unique: true,
      sparse: true,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed'],
      default: 'pending',
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

VoteSchema.index({ campaignId: 1 });
VoteSchema.index({ voterEmail: 1 });
VoteSchema.index({ transactionRef: 1 });
VoteSchema.index({ status: 1 });
VoteSchema.index({ createdAt: -1 });

const Vote: Model<IVote> =
  mongoose.models.Vote || mongoose.model<IVote>('Vote', VoteSchema);

export default Vote;

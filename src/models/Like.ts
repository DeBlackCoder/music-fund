import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILike extends Document {
  _id: string;
  campaignId: mongoose.Types.ObjectId;
  visitorId: string; // Anonymous identifier stored in browser localStorage
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    visitorId: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Prevent duplicate likes from same visitor
LikeSchema.index({ campaignId: 1, visitorId: 1 }, { unique: true });

const Like: Model<ILike> =
  mongoose.models.Like || mongoose.model<ILike>('Like', LikeSchema);

export default Like;

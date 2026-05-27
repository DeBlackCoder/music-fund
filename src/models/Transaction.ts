import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  campaignId?: mongoose.Types.ObjectId;
  type: 'upload_fee' | 'vote' | 'withdrawal' | 'commission';
  amount: number;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  transactionRef: string;
  paystackRef?: string;
  description: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    type: {
      type: String,
      enum: ['upload_fee', 'vote', 'withdrawal', 'commission'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'successful', 'failed', 'refunded'],
      default: 'pending',
    },
    transactionRef: {
      type: String,
      required: true,
      unique: true,
    },
    paystackRef: String,
    description: {
      type: String,
      required: true,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ campaignId: 1 });
TransactionSchema.index({ transactionRef: 1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ createdAt: -1 });

const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;

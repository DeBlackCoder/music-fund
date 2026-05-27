import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotification extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
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
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'upload_success',
        'payment_received',
        'new_vote',
        'new_follower',
        'goal_reached',
        'withdrawal_approved',
        'withdrawal_rejected',
        'campaign_approved',
        'campaign_rejected',
        'system',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Indexes
NotificationSchema.index({ userId: 1, read: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification: Model<INotification> =
  mongoose.models.Notification ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;

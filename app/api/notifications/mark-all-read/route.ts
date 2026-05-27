import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Notification from '@/src/models/Notification';
import { requireAuth } from '@/src/middleware/auth';
import { handleError, successResponse } from '@/src/middleware/error-handler';

// PUT - Mark all notifications as read
export const PUT = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    // Update all unread notifications for user
    const result = await Notification.updateMany(
      { userId: user.userId, read: false },
      { $set: { read: true } }
    );

    return successResponse({
      message: 'All notifications marked as read',
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    return handleError(error);
  }
});

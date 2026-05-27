import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Notification from '@/src/models/Notification';
import { requireAuth } from '@/src/middleware/auth';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

// PUT - Mark notification as read
export const PUT = requireAuth(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await connectDB();

      const { id } = params;

      // Find notification
      const notification = await Notification.findById(id);
      if (!notification) {
        return errorResponse('Notification not found', 404);
      }

      // Check if notification belongs to user
      if (notification.userId.toString() !== user.userId) {
        return errorResponse('Unauthorized', 403);
      }

      // Mark as read
      notification.read = true;
      await notification.save();

      return successResponse({
        message: 'Notification marked as read',
        notification: {
          id: notification._id.toString(),
          read: notification.read,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  }
);

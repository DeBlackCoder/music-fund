import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Notification from '@/src/models/Notification';
import { requireAuth } from '@/src/middleware/auth';
import { handleError, successResponse } from '@/src/middleware/error-handler';

// GET - Get user notifications
export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    // Build query
    const query: any = { userId: user.userId };
    if (unreadOnly) {
      query.read = false;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .sort('-createdAt')
      .limit(limit)
      .skip(skip);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId: user.userId,
      read: false,
    });

    // Format response
    const formattedNotifications = notifications.map((notification) => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      metadata: notification.metadata,
      createdAt: notification.createdAt,
    }));

    return successResponse({
      notifications: formattedNotifications,
      unreadCount,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
});

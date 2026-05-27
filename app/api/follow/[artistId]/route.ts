import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import Follow from '@/src/models/Follow';
import Notification from '@/src/models/Notification';
import { authenticate } from '@/src/middleware/auth';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

// POST - Follow an artist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  try {
    await connectDB();

    const authResult = await authenticate(request);
    if ('error' in authResult) {
      return errorResponse(authResult.error, authResult.status);
    }
    const user = authResult.user;

    const { artistId } = await params;

    // Can't follow yourself
    if (artistId === user.userId) {
      return errorResponse('You cannot follow yourself', 400);
    }

    // Check if artist exists
    const artist = await User.findById(artistId);
    if (!artist) {
      return errorResponse('Artist not found', 404);
    }

    if (artist.role !== 'artist') {
      return errorResponse('You can only follow artists', 400);
    }

    // Check if already following
    const existingFollow = await Follow.findOne({
      followerId: user.userId,
      followingId: artistId,
    });

    if (existingFollow) {
      return errorResponse('You are already following this artist', 400);
    }

    // Create follow
    await Follow.create({
      followerId: user.userId,
      followingId: artistId,
    });

    // Update follower/following counts
    await User.findByIdAndUpdate(artistId, { $inc: { followers: 1 } });
    await User.findByIdAndUpdate(user.userId, { $inc: { following: 1 } });

    // Get follower details
    const follower = await User.findById(user.userId);

    // Notify artist
    await Notification.create({
      userId: artistId,
      type: 'new_follower',
      title: 'New Follower! 👥',
      message: `${follower?.fullName || 'Someone'} started following you`,
      metadata: {
        followerId: user.userId,
      },
    });

    return successResponse({
      message: 'Successfully followed artist',
      following: true,
    });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE - Unfollow an artist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ artistId: string }> }
) {
  try {
    await connectDB();

    const authResult = await authenticate(request);
    if ('error' in authResult) {
      return errorResponse(authResult.error, authResult.status);
    }
    const user = authResult.user;

    const { artistId } = await params;

    // Find and delete follow
    const follow = await Follow.findOneAndDelete({
      followerId: user.userId,
      followingId: artistId,
    });

    if (!follow) {
      return errorResponse('You are not following this artist', 400);
    }

    // Update follower/following counts
    await User.findByIdAndUpdate(artistId, { $inc: { followers: -1 } });
    await User.findByIdAndUpdate(user.userId, { $inc: { following: -1 } });

    return successResponse({
      message: 'Successfully unfollowed artist',
      following: false,
    });
  } catch (error) {
    return handleError(error);
  }
}

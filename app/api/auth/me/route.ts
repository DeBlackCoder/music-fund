import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import { requireAuth } from '@/src/middleware/auth';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export const GET = requireAuth(async (request: NextRequest, user) => {
  try {
    await connectDB();

    // Find user by ID
    const userData = await User.findById(user.userId);
    if (!userData) {
      return errorResponse('User not found', 404);
    }

    // Return user data
    const response = {
      id: userData._id.toString(),
      fullName: userData.fullName,
      email: userData.email,
      role: userData.role,
      artistName: userData.artistName,
      profileImage: userData.profileImage,
      verified: userData.verified,
      bio: userData.bio,
      genre: userData.genre,
      location: userData.location,
      followers: userData.followers,
      following: userData.following,
      socialLinks: userData.socialLinks,
      phone: userData.phone,
      createdAt: userData.createdAt,
    };

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
});

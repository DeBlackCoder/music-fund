import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import { signToken } from '@/src/lib/jwt';
import { validateRequest, loginSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request
    const validation = validateRequest(loginSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { email, password } = validation.data;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return errorResponse('Invalid email or password', 401);
    }

    // Check if user is active
    if (!user.isActive) {
      return errorResponse('Account is deactivated. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return errorResponse('Invalid email or password', 401);
    }

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return user data (without password)
    const userData = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      artistName: user.artistName,
      profileImage: user.profileImage,
      verified: user.verified,
      bio: user.bio,
      location: user.location,
      followers: user.followers,
      following: user.following,
      socialLinks: user.socialLinks,
    };

    return successResponse({
      token,
      user: userData,
    });
  } catch (error) {
    return handleError(error);
  }
}

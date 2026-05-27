import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import User from '@/src/models/User';
import { signToken } from '@/src/lib/jwt';
import { sendEmail, welcomeEmail } from '@/src/lib/email';
import { validateRequest, registerSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request
    const validation = validateRequest(registerSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { fullName, email, password, role, artistName, phone } = validation.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse('Email already registered', 409);
    }

    // If role is artist, artistName is required
    if (role === 'artist' && !artistName) {
      return errorResponse('Artist name is required for artist accounts', 400);
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      password,
      role,
      artistName: role === 'artist' ? artistName : undefined,
      phone,
    });

    // Generate JWT token
    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Send welcome email (non-blocking)
    sendEmail({
      to: email,
      subject: 'Welcome to MusicFund!',
      html: welcomeEmail(fullName),
    }).catch((err) => console.error('Failed to send welcome email:', err));

    // Return user data (without password)
    const userData = {
      id: user._id.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      artistName: user.artistName,
      profileImage: user.profileImage,
      verified: user.verified,
    };

    return successResponse(
      {
        token,
        user: userData,
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
}

import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import PlatformSettings from '@/src/models/PlatformSettings';
import Transaction from '@/src/models/Transaction';
import User from '@/src/models/User';
import { initializePayment } from '@/src/lib/paystack';
import { generateTransactionRef, convertToKobo } from '@/src/lib/utils';
import { requireArtist } from '@/src/middleware/auth';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export const POST = requireArtist(async (request: NextRequest, user) => {
  try {
    await connectDB();

    // Get platform settings
    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return errorResponse('Platform settings not configured', 500);
    }

    const uploadFee = settings.uploadFee;

    // Get user details
    const userData = await User.findById(user.userId);
    if (!userData) {
      return errorResponse('User not found', 404);
    }

    // Generate transaction reference
    const transactionRef = generateTransactionRef('UPLOAD');

    // Create transaction record
    const transaction = await Transaction.create({
      userId: user.userId,
      type: 'upload_fee',
      amount: uploadFee,
      status: 'pending',
      transactionRef,
      description: 'Upload fee payment',
    });

    // Initialize Paystack payment
    const paymentData = await initializePayment({
      email: userData.email,
      amount: convertToKobo(uploadFee),
      reference: transactionRef,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/upload/verify?reference=${transactionRef}`,
      metadata: {
        userId: user.userId,
        type: 'upload_fee',
        transactionId: transaction._id.toString(),
      },
    });

    return successResponse({
      transactionRef,
      amount: uploadFee,
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
    });
  } catch (error) {
    return handleError(error);
  }
});

import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Transaction from '@/src/models/Transaction';
import PlatformSettings from '@/src/models/PlatformSettings';
import User from '@/src/models/User';
import { requireArtist } from '@/src/middleware/auth';
import { validateRequest, createCampaignSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export const POST = requireArtist(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request
    const validation = validateRequest(createCampaignSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { title, genre, description, story, goalAmount, deadline, tags } = validation.data;
    const { audioFile, coverImage, uploadFeeTransactionRef, previewStart } = body;

    // Validate required files
    if (!audioFile || !coverImage) {
      return errorResponse('Audio file and cover image are required', 400);
    }

    // Validate preview trim point
    const trimStart = typeof previewStart === 'number' && previewStart >= 0 ? previewStart : 0;

    // Get platform settings
    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return errorResponse('Platform settings not configured', 500);
    }

    // Validate goal amount
    if (goalAmount < settings.minGoalAmount || goalAmount > settings.maxGoalAmount) {
      return errorResponse(
        `Goal amount must be between ₦${settings.minGoalAmount.toLocaleString()} and ₦${settings.maxGoalAmount.toLocaleString()}`,
        400
      );
    }

    // Verify upload fee payment
    const uploadFeeTransaction = await Transaction.findOne({
      transactionRef: uploadFeeTransactionRef,
      userId: user.userId,
      type: 'upload_fee',
      status: 'successful',
    });

    if (!uploadFeeTransaction) {
      return errorResponse('Valid upload fee payment not found. Please pay the upload fee first.', 400);
    }

    // Check if this transaction was already used
    const existingCampaign = await Campaign.findOne({
      uploadFeeTransactionRef,
    });

    if (existingCampaign) {
      return errorResponse('This upload fee payment has already been used', 400);
    }

    // Get artist details
    const artist = await User.findById(user.userId);
    if (!artist) {
      return errorResponse('Artist not found', 404);
    }

    // Create campaign
    const campaign = await Campaign.create({
      artistId: user.userId,
      title,
      audioFile,
      coverImage,
      previewStart: trimStart,
      previewEnd: trimStart + 60,
      genre,
      description,
      story,
      goalAmount,
      deadline: new Date(deadline),
      tags: tags || [],
      uploadFeePaid: true,
      uploadFeeAmount: uploadFeeTransaction.amount,
      uploadFeeTransactionRef,
      status: 'pending', // Requires admin approval
    });

    return successResponse(
      {
        message: 'Campaign created successfully. Waiting for admin approval.',
        campaign: {
          id: campaign._id.toString(),
          slug: campaign.slug,
          title: campaign.title,
          status: campaign.status,
          referralLink: campaign.referralLink,
        },
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
});

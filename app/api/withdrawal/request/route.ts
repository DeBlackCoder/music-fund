import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Withdrawal from '@/src/models/Withdrawal';
import PlatformSettings from '@/src/models/PlatformSettings';
import { requireArtist } from '@/src/middleware/auth';
import { validateRequest, withdrawalRequestSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';
import { calculateCommission } from '@/src/lib/utils';

export const POST = requireArtist(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request
    const validation = validateRequest(withdrawalRequestSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { campaignId, bankDetails } = validation.data;

    // Find campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    // Check if campaign belongs to artist
    if (campaign.artistId.toString() !== user.userId) {
      return errorResponse('Unauthorized', 403);
    }

    // Check if campaign goal is reached
    if (campaign.status !== 'goal_reached') {
      return errorResponse('Campaign goal must be reached before withdrawal', 400);
    }

    // Check if withdrawal already exists
    const existingWithdrawal = await Withdrawal.findOne({
      campaignId,
      status: { $in: ['pending', 'approved', 'processed'] },
    });

    if (existingWithdrawal) {
      return errorResponse('A withdrawal request already exists for this campaign', 400);
    }

    // Get platform settings
    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return errorResponse('Platform settings not configured', 500);
    }

    // Calculate commission and net amount
    const amount = campaign.raisedAmount;
    const commission = calculateCommission(amount, settings.platformCommission);
    const netAmount = amount - commission;

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      artistId: user.userId,
      campaignId,
      amount,
      platformCommission: commission,
      netAmount,
      bankDetails,
      status: 'pending',
    });

    return successResponse(
      {
        message: 'Withdrawal request submitted successfully. Awaiting admin approval.',
        withdrawal: {
          id: withdrawal._id.toString(),
          amount,
          platformCommission: commission,
          netAmount,
          status: withdrawal.status,
          requestedAt: withdrawal.requestedAt,
        },
      },
      201
    );
  } catch (error) {
    return handleError(error);
  }
});

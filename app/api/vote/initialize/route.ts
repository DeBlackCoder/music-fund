import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import PlatformSettings from '@/src/models/PlatformSettings';
import Vote from '@/src/models/Vote';
import { initializePayment } from '@/src/lib/paystack';
import { generateTransactionRef, convertToKobo } from '@/src/lib/utils';
import { validateRequest } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';
import { z } from 'zod';

// Anonymous vote schema — no auth required, just email + campaign + count
const anonymousVoteSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  voteCount: z.number().min(1, 'Vote count must be at least 1'),
  voterEmail: z.string().email('Valid email is required'),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validation = validateRequest(anonymousVoteSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { campaignId, voteCount, voterEmail } = validation.data;

    // Find campaign
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    // Check if campaign is active
    if (campaign.status !== 'active') {
      return errorResponse('This campaign is not accepting votes', 400);
    }

    // Check if deadline has passed
    if (new Date() > campaign.deadline) {
      return errorResponse('Campaign deadline has passed', 400);
    }

    // Get platform settings
    const settings = await PlatformSettings.findOne();
    if (!settings) {
      return errorResponse('Platform settings not configured', 500);
    }

    const votePrice = settings.votePrice;
    const totalAmount = voteCount * votePrice;

    // Generate transaction reference
    const transactionRef = generateTransactionRef('VOTE');

    // Create vote record (no userId — anonymous voter)
    const vote = await Vote.create({
      campaignId,
      voterEmail,
      voteCount,
      amount: totalAmount,
      votePrice,
      transactionRef,
      status: 'pending',
    });

    // Initialize Paystack payment
    const paymentData = await initializePayment({
      email: voterEmail,
      amount: convertToKobo(totalAmount),
      reference: transactionRef,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify?reference=${transactionRef}&type=vote&campaign=${campaign.slug}`,
      metadata: {
        voterEmail,
        campaignId,
        voteCount,
        type: 'vote',
        voteId: vote._id.toString(),
      },
    });

    return successResponse({
      transactionRef,
      voteCount,
      votePrice,
      totalAmount,
      authorizationUrl: paymentData.data.authorization_url,
      accessCode: paymentData.data.access_code,
    });
  } catch (error) {
    return handleError(error);
  }
}

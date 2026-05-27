import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Like from '@/src/models/Like';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

// POST - Like a campaign (anonymous, identified by visitorId from client)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { slug } = params;
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId || typeof visitorId !== 'string' || visitorId.length < 8) {
      return errorResponse('Valid visitor ID is required', 400);
    }

    const campaign = await Campaign.findOne({ slug });
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    // Check if already liked
    const existingLike = await Like.findOne({
      campaignId: campaign._id,
      visitorId,
    });

    if (existingLike) {
      return errorResponse('You have already liked this campaign', 400);
    }

    await Like.create({ campaignId: campaign._id, visitorId });

    campaign.likeCount += 1;
    await campaign.save();

    return successResponse({
      message: 'Campaign liked successfully',
      liked: true,
      likeCount: campaign.likeCount,
    });
  } catch (error) {
    return handleError(error);
  }
}

// DELETE - Unlike a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const { slug } = params;
    const body = await request.json();
    const { visitorId } = body;

    if (!visitorId || typeof visitorId !== 'string') {
      return errorResponse('Valid visitor ID is required', 400);
    }

    const campaign = await Campaign.findOne({ slug });
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    const like = await Like.findOneAndDelete({
      campaignId: campaign._id,
      visitorId,
    });

    if (!like) {
      return errorResponse('You have not liked this campaign', 400);
    }

    campaign.likeCount = Math.max(0, campaign.likeCount - 1);
    await campaign.save();

    return successResponse({
      message: 'Campaign unliked successfully',
      liked: false,
      likeCount: campaign.likeCount,
    });
  } catch (error) {
    return handleError(error);
  }
}

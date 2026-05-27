import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Notification from '@/src/models/Notification';
import { authenticate } from '@/src/middleware/auth';
import { validateRequest, rejectCampaignSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const authResult = await authenticate(request);
    if ('error' in authResult) {
      return errorResponse(authResult.error, authResult.status);
    }
    const user = authResult.user;
    if (user.role !== 'admin') {
      return errorResponse('Insufficient permissions', 403);
    }

    const { id } = await params;
    const body = await request.json();

    // Validate request
    const validation = validateRequest(rejectCampaignSchema, { campaignId: id, ...body });
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { reason } = validation.data;

    // Find campaign
    const campaign = await Campaign.findById(id).populate('artistId');
    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    // Check if campaign is pending
    if (campaign.status !== 'pending') {
      return errorResponse('Only pending campaigns can be rejected', 400);
    }

    // Update campaign status
    campaign.status = 'rejected';
    campaign.rejectedAt = new Date();
    campaign.rejectionReason = reason;
    await campaign.save();

    const artist = campaign.artistId as any;

    // Notify artist
    await Notification.create({
      userId: artist._id,
      type: 'campaign_rejected',
      title: 'Campaign Rejected',
      message: `Your campaign "${campaign.title}" has been rejected. Reason: ${reason}`,
      metadata: {
        campaignId: campaign._id.toString(),
        reason,
      },
    });

    return successResponse({
      message: 'Campaign rejected successfully',
      campaign: {
        id: campaign._id.toString(),
        slug: campaign.slug,
        title: campaign.title,
        status: campaign.status,
        rejectedAt: campaign.rejectedAt,
        rejectionReason: campaign.rejectionReason,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

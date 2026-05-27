import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Notification from '@/src/models/Notification';
import User from '@/src/models/User';
import { sendEmail, campaignApprovedEmail } from '@/src/lib/email';
import { requireAdmin } from '@/src/middleware/auth';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export const POST = requireAdmin(
  async (request: NextRequest, user, { params }: { params: { id: string } }) => {
    try {
      await connectDB();

      const { id } = params;

      // Find campaign
      const campaign = await Campaign.findById(id).populate('artistId');
      if (!campaign) {
        return errorResponse('Campaign not found', 404);
      }

      // Check if already approved
      if (campaign.status === 'active') {
        return errorResponse('Campaign is already approved', 400);
      }

      // Check if campaign is pending
      if (campaign.status !== 'pending') {
        return errorResponse('Only pending campaigns can be approved', 400);
      }

      // Update campaign status
      campaign.status = 'active';
      campaign.approvedAt = new Date();
      campaign.approvedBy = user.userId as any;
      await campaign.save();

      const artist = campaign.artistId as any;

      // Notify artist
      await Notification.create({
        userId: artist._id,
        type: 'campaign_approved',
        title: 'Campaign Approved! 🎉',
        message: `Your campaign "${campaign.title}" has been approved and is now live!`,
        metadata: {
          campaignId: campaign._id.toString(),
          campaignSlug: campaign.slug,
        },
      });

      // Send email notification
      sendEmail({
        to: artist.email,
        subject: 'Your Campaign Has Been Approved!',
        html: campaignApprovedEmail(
          artist.artistName || artist.fullName,
          campaign.title,
          campaign.referralLink
        ),
      }).catch((err) => console.error('Failed to send approval email:', err));

      return successResponse({
        message: 'Campaign approved successfully',
        campaign: {
          id: campaign._id.toString(),
          slug: campaign.slug,
          title: campaign.title,
          status: campaign.status,
          approvedAt: campaign.approvedAt,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  }
);

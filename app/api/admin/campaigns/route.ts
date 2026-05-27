import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import { requireAdmin } from '@/src/middleware/auth';
import { calculateDaysLeft } from '@/src/lib/utils';
import { handleError, successResponse } from '@/src/middleware/error-handler';

// GET - List all campaigns (admin only)
export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || '-createdAt';

    // Build query
    const query: any = {};

    if (status !== 'all') {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const campaigns = await Campaign.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('artistId', 'fullName artistName email profileImage verified')
      .populate('approvedBy', 'fullName email');

    const total = await Campaign.countDocuments(query);

    // Format response
    const formattedCampaigns = campaigns.map((campaign) => {
      const artist = campaign.artistId as any;
      const approver = campaign.approvedBy as any;

      return {
        id: campaign._id.toString(),
        slug: campaign.slug,
        title: campaign.title,
        artist: {
          id: artist._id.toString(),
          name: artist.fullName,
          artistName: artist.artistName,
          email: artist.email,
          avatar: artist.profileImage,
          verified: artist.verified,
        },
        coverImage: campaign.coverImage,
        audioFile: campaign.audioFile,
        genre: campaign.genre,
        description: campaign.description,
        goalAmount: campaign.goalAmount,
        raisedAmount: campaign.raisedAmount,
        voteCount: campaign.voteCount,
        status: campaign.status,
        uploadFeePaid: campaign.uploadFeePaid,
        uploadFeeAmount: campaign.uploadFeeAmount,
        deadline: campaign.deadline,
        daysLeft: calculateDaysLeft(campaign.deadline),
        createdAt: campaign.createdAt,
        approvedAt: campaign.approvedAt,
        approvedBy: approver
          ? {
              id: approver._id.toString(),
              name: approver.fullName,
              email: approver.email,
            }
          : null,
        rejectedAt: campaign.rejectedAt,
        rejectionReason: campaign.rejectionReason,
        analytics: campaign.analytics,
      };
    });

    // Get statistics
    const stats = {
      total: await Campaign.countDocuments(),
      pending: await Campaign.countDocuments({ status: 'pending' }),
      active: await Campaign.countDocuments({ status: 'active' }),
      goalReached: await Campaign.countDocuments({ status: 'goal_reached' }),
      rejected: await Campaign.countDocuments({ status: 'rejected' }),
      ended: await Campaign.countDocuments({ status: 'ended' }),
    };

    return successResponse({
      campaigns: formattedCampaigns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      stats,
    });
  } catch (error) {
    return handleError(error);
  }
});

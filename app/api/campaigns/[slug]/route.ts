import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Vote from '@/src/models/Vote';
import { calculateDaysLeft } from '@/src/lib/utils';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await connectDB();

    const { slug } = await params;

    // Find campaign
    const campaign = await Campaign.findOne({ slug }).populate(
      'artistId',
      'fullName artistName profileImage verified bio location socialLinks followers'
    );

    if (!campaign) {
      return errorResponse('Campaign not found', 404);
    }

    // Increment view count
    campaign.analytics.views += 1;
    await campaign.save();

    // Get top voters
    const topVoters = await Vote.aggregate([
      {
        $match: {
          campaignId: campaign._id,
          status: 'successful',
        },
      },
      {
        $group: {
          _id: '$userId',
          totalVotes: { $sum: '$voteCount' },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          userId: '$_id',
          name: '$user.fullName',
          avatar: '$user.profileImage',
          totalVotes: 1,
          totalAmount: 1,
        },
      },
    ]);

    const artist = campaign.artistId as any;

    // Format response
    const response = {
      id: campaign._id.toString(),
      slug: campaign.slug,
      title: campaign.title,
      artist: {
        id: artist._id.toString(),
        name: artist.fullName,
        artistName: artist.artistName,
        avatar: artist.profileImage,
        verified: artist.verified,
        bio: artist.bio,
        location: artist.location,
        socialLinks: artist.socialLinks,
        followers: artist.followers,
      },
      coverImage: campaign.coverImage,
      audioFile: campaign.audioFile,
      genre: campaign.genre,
      description: campaign.description,
      story: campaign.story,
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      voteCount: campaign.voteCount,
      likeCount: campaign.likeCount,
      shareCount: campaign.shareCount,
      status: campaign.status,
      deadline: campaign.deadline,
      daysLeft: calculateDaysLeft(campaign.deadline),
      tags: campaign.tags,
      referralLink: campaign.referralLink,
      analytics: campaign.analytics,
      topVoters,
      createdAt: campaign.createdAt,
      goalReachedAt: campaign.goalReachedAt,
    };

    return successResponse(response);
  } catch (error) {
    return handleError(error);
  }
}
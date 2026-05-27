import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import User from '@/src/models/User';
import { calculateDaysLeft } from '@/src/lib/utils';
import { handleError, successResponse } from '@/src/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'active';
    const genre = searchParams.get('genre');
    const artistId = searchParams.get('artistId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || '-createdAt'; // -createdAt, -voteCount, -raisedAmount

    // Build query
    const query: any = {};

    if (status === 'active') {
      query.status = 'active';
    } else if (status === 'goal_reached') {
      query.status = 'goal_reached';
    } else if (status === 'all') {
      query.status = { $in: ['active', 'goal_reached', 'ended'] };
    } else {
      query.status = status;
    }

    if (genre) {
      query.genre = genre;
    }

    if (artistId) {
      query.artistId = artistId;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const campaigns = await Campaign.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('artistId', 'fullName artistName profileImage verified');

    const total = await Campaign.countDocuments(query);

    // Format response
    const formattedCampaigns = campaigns.map((campaign) => {
      const artist = campaign.artistId as any;
      return {
        id: campaign._id.toString(),
        slug: campaign.slug,
        title: campaign.title,
        artist: {
          id: artist._id.toString(),
          name: artist.fullName,
          artistName: artist.artistName,
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
        likeCount: campaign.likeCount,
        shareCount: campaign.shareCount,
        status: campaign.status,
        deadline: campaign.deadline,
        daysLeft: calculateDaysLeft(campaign.deadline),
        referralLink: campaign.referralLink,
        createdAt: campaign.createdAt,
      };
    });

    return successResponse({
      campaigns: formattedCampaigns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

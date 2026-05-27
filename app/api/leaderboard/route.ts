import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import User from '@/src/models/User';
import { handleError, successResponse } from '@/src/middleware/error-handler';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'votes'; // votes, raised, followers, likes
    const period = searchParams.get('period') || 'all'; // daily, weekly, monthly, all
    const limit = parseInt(searchParams.get('limit') || '10');

    let dateFilter: any = {};

    // Calculate date filter based on period
    if (period === 'daily') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      dateFilter = { createdAt: { $gte: yesterday } };
    } else if (period === 'weekly') {
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);
      dateFilter = { createdAt: { $gte: lastWeek } };
    } else if (period === 'monthly') {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      dateFilter = { createdAt: { $gte: lastMonth } };
    }

    let leaderboard: any[] = [];

    if (type === 'votes') {
      // Most voted campaigns
      leaderboard = await Campaign.find({
        status: { $in: ['active', 'goal_reached'] },
        ...dateFilter,
      })
        .sort('-voteCount')
        .limit(limit)
        .populate('artistId', 'fullName artistName profileImage verified');

      leaderboard = leaderboard.map((campaign, index) => {
        const artist = campaign.artistId as any;
        return {
          rank: index + 1,
          campaign: {
            id: campaign._id.toString(),
            slug: campaign.slug,
            title: campaign.title,
            coverImage: campaign.coverImage,
          },
          artist: {
            id: artist._id.toString(),
            name: artist.fullName,
            artistName: artist.artistName,
            avatar: artist.profileImage,
            verified: artist.verified,
          },
          voteCount: campaign.voteCount,
          raisedAmount: campaign.raisedAmount,
        };
      });
    } else if (type === 'raised') {
      // Most money raised
      leaderboard = await Campaign.find({
        status: { $in: ['active', 'goal_reached'] },
        ...dateFilter,
      })
        .sort('-raisedAmount')
        .limit(limit)
        .populate('artistId', 'fullName artistName profileImage verified');

      leaderboard = leaderboard.map((campaign, index) => {
        const artist = campaign.artistId as any;
        return {
          rank: index + 1,
          campaign: {
            id: campaign._id.toString(),
            slug: campaign.slug,
            title: campaign.title,
            coverImage: campaign.coverImage,
          },
          artist: {
            id: artist._id.toString(),
            name: artist.fullName,
            artistName: artist.artistName,
            avatar: artist.profileImage,
            verified: artist.verified,
          },
          voteCount: campaign.voteCount,
          raisedAmount: campaign.raisedAmount,
        };
      });
    } else if (type === 'followers') {
      // Most followed artists
      const artists = await User.find({
        role: 'artist',
        ...dateFilter,
      })
        .sort('-followers')
        .limit(limit);

      leaderboard = artists.map((artist, index) => ({
        rank: index + 1,
        artist: {
          id: artist._id.toString(),
          name: artist.fullName,
          artistName: artist.artistName,
          avatar: artist.profileImage,
          verified: artist.verified,
          bio: artist.bio,
        },
        followers: artist.followers,
        activeCampaigns: 0, // Will be populated below
      }));

      // Get active campaigns count for each artist
      for (const item of leaderboard) {
        const count = await Campaign.countDocuments({
          artistId: item.artist.id,
          status: 'active',
        });
        item.activeCampaigns = count;
      }
    } else if (type === 'likes') {
      // Most liked campaigns
      leaderboard = await Campaign.find({
        status: { $in: ['active', 'goal_reached'] },
        ...dateFilter,
      })
        .sort('-likeCount')
        .limit(limit)
        .populate('artistId', 'fullName artistName profileImage verified');

      leaderboard = leaderboard.map((campaign, index) => {
        const artist = campaign.artistId as any;
        return {
          rank: index + 1,
          campaign: {
            id: campaign._id.toString(),
            slug: campaign.slug,
            title: campaign.title,
            coverImage: campaign.coverImage,
          },
          artist: {
            id: artist._id.toString(),
            name: artist.fullName,
            artistName: artist.artistName,
            avatar: artist.profileImage,
            verified: artist.verified,
          },
          likeCount: campaign.likeCount,
          voteCount: campaign.voteCount,
        };
      });
    }

    return successResponse({
      type,
      period,
      leaderboard,
    });
  } catch (error) {
    return handleError(error);
  }
}

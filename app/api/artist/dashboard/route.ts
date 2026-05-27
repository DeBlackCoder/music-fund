import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Vote from '@/src/models/Vote';
import Transaction from '@/src/models/Transaction';
import Withdrawal from '@/src/models/Withdrawal';
import Follow from '@/src/models/Follow';
import { requireArtist } from '@/src/middleware/auth';
import { handleError, successResponse } from '@/src/middleware/error-handler';

export const GET = requireArtist(async (request: NextRequest, user) => {
  try {
    await connectDB();

    // Campaign statistics
    const totalCampaigns = await Campaign.countDocuments({ artistId: user.userId });
    const activeCampaigns = await Campaign.countDocuments({
      artistId: user.userId,
      status: 'active',
    });
    const goalReachedCampaigns = await Campaign.countDocuments({
      artistId: user.userId,
      status: 'goal_reached',
    });
    const pendingCampaigns = await Campaign.countDocuments({
      artistId: user.userId,
      status: 'pending',
    });

    // Financial statistics
    const totalRaisedResult = await Campaign.aggregate([
      { $match: { artistId: user.userId, status: { $in: ['active', 'goal_reached'] } } },
      { $group: { _id: null, total: { $sum: '$raisedAmount' } } },
    ]);
    const totalRaised = totalRaisedResult[0]?.total || 0;

    const totalVotesResult = await Campaign.aggregate([
      { $match: { artistId: user.userId } },
      { $group: { _id: null, total: { $sum: '$voteCount' } } },
    ]);
    const totalVotes = totalVotesResult[0]?.total || 0;

    // Withdrawal statistics
    const totalWithdrawnResult = await Withdrawal.aggregate([
      {
        $match: {
          artistId: user.userId,
          status: { $in: ['approved', 'processed'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$netAmount' } } },
    ]);
    const totalWithdrawn = totalWithdrawnResult[0]?.total || 0;

    const pendingWithdrawals = await Withdrawal.countDocuments({
      artistId: user.userId,
      status: 'pending',
    });

    // Follower count
    const followerCount = await Follow.countDocuments({ followingId: user.userId });

    // Recent campaigns
    const recentCampaigns = await Campaign.find({ artistId: user.userId })
      .sort('-createdAt')
      .limit(5)
      .select('title slug status goalAmount raisedAmount voteCount createdAt');

    // Recent votes (last 10)
    const recentVotes = await Vote.find({
      campaignId: { $in: await Campaign.find({ artistId: user.userId }).distinct('_id') },
      status: 'successful',
    })
      .sort('-createdAt')
      .limit(10)
      .populate('userId', 'fullName profileImage')
      .populate('campaignId', 'title slug');

    const formattedRecentVotes = recentVotes.map((vote) => {
      const voter = vote.userId as any;
      const campaign = vote.campaignId as any;
      return {
        id: vote._id.toString(),
        voter: {
          name: voter.fullName,
          avatar: voter.profileImage,
        },
        campaign: {
          title: campaign.title,
          slug: campaign.slug,
        },
        voteCount: vote.voteCount,
        amount: vote.amount,
        createdAt: vote.createdAt,
      };
    });

    // Monthly earnings chart (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyEarnings = await Vote.aggregate([
      {
        $match: {
          campaignId: {
            $in: await Campaign.find({ artistId: user.userId }).distinct('_id'),
          },
          status: 'successful',
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          earnings: { $sum: '$amount' },
          votes: { $sum: '$voteCount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    return successResponse({
      overview: {
        totalCampaigns,
        activeCampaigns,
        goalReachedCampaigns,
        pendingCampaigns,
        totalRaised,
        totalVotes,
        totalWithdrawn,
        pendingWithdrawals,
        followerCount,
        availableForWithdrawal: totalRaised - totalWithdrawn,
      },
      recentCampaigns: recentCampaigns.map((c) => ({
        id: c._id.toString(),
        title: c.title,
        slug: c.slug,
        status: c.status,
        goalAmount: c.goalAmount,
        raisedAmount: c.raisedAmount,
        voteCount: c.voteCount,
        createdAt: c.createdAt,
      })),
      recentVotes: formattedRecentVotes,
      charts: {
        monthlyEarnings,
      },
    });
  } catch (error) {
    return handleError(error);
  }
});

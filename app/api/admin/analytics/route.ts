import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import User from '@/src/models/User';
import Transaction from '@/src/models/Transaction';
import Vote from '@/src/models/Vote';
import { requireAdmin } from '@/src/middleware/auth';
import { handleError, successResponse } from '@/src/middleware/error-handler';

export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    await connectDB();

    // Overall statistics
    const totalUsers = await User.countDocuments();
    const totalArtists = await User.countDocuments({ role: 'artist' });
    const totalFans = await User.countDocuments({ role: 'fan' });

    const totalCampaigns = await Campaign.countDocuments();
    const activeCampaigns = await Campaign.countDocuments({ status: 'active' });
    const goalReachedCampaigns = await Campaign.countDocuments({ status: 'goal_reached' });
    const pendingCampaigns = await Campaign.countDocuments({ status: 'pending' });

    // Financial statistics
    const totalRaisedResult = await Campaign.aggregate([
      { $match: { status: { $in: ['active', 'goal_reached'] } } },
      { $group: { _id: null, total: { $sum: '$raisedAmount' } } },
    ]);
    const totalRaised = totalRaisedResult[0]?.total || 0;

    const platformEarningsResult = await Transaction.aggregate([
      { $match: { type: 'commission', status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const platformEarnings = platformEarningsResult[0]?.total || 0;

    const uploadFeesResult = await Transaction.aggregate([
      { $match: { type: 'upload_fee', status: 'successful' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const uploadFeesCollected = uploadFeesResult[0]?.total || 0;

    const totalVotes = await Vote.countDocuments({ status: 'successful' });

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast30Days = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const newCampaignsLast30Days = await Campaign.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    const votesLast30Days = await Vote.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
      status: 'successful',
    });

    // Revenue chart (last 12 months)
    const revenueByMonth = await Transaction.aggregate([
      {
        $match: {
          type: { $in: ['upload_fee', 'commission'] },
          status: 'successful',
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    // Top artists by raised amount
    const topArtists = await Campaign.aggregate([
      {
        $match: { status: { $in: ['active', 'goal_reached'] } },
      },
      {
        $group: {
          _id: '$artistId',
          totalRaised: { $sum: '$raisedAmount' },
          totalVotes: { $sum: '$voteCount' },
          campaignCount: { $sum: 1 },
        },
      },
      {
        $sort: { totalRaised: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'artist',
        },
      },
      {
        $unwind: '$artist',
      },
      {
        $project: {
          artistId: '$_id',
          name: '$artist.fullName',
          artistName: '$artist.artistName',
          avatar: '$artist.profileImage',
          totalRaised: 1,
          totalVotes: 1,
          campaignCount: 1,
        },
      },
    ]);

    // Genre distribution
    const genreDistribution = await Campaign.aggregate([
      {
        $match: { status: { $in: ['active', 'goal_reached'] } },
      },
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
          totalRaised: { $sum: '$raisedAmount' },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    return successResponse({
      overview: {
        totalUsers,
        totalArtists,
        totalFans,
        totalCampaigns,
        activeCampaigns,
        goalReachedCampaigns,
        pendingCampaigns,
        totalVotes,
      },
      financial: {
        totalRaised,
        platformEarnings,
        uploadFeesCollected,
        totalRevenue: platformEarnings + uploadFeesCollected,
      },
      recentActivity: {
        newUsersLast30Days,
        newCampaignsLast30Days,
        votesLast30Days,
      },
      charts: {
        revenueByMonth,
        genreDistribution,
      },
      topArtists,
    });
  } catch (error) {
    return handleError(error);
  }
});

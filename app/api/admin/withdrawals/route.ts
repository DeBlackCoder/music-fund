import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Withdrawal from '@/src/models/Withdrawal';
import { requireAdmin } from '@/src/middleware/auth';
import { handleError, successResponse } from '@/src/middleware/error-handler';

// GET - List all withdrawal requests (admin only)
export const GET = requireAdmin(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const sort = searchParams.get('sort') || '-requestedAt';

    // Build query
    const query: any = {};

    if (status !== 'all') {
      query.status = status;
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const withdrawals = await Withdrawal.find(query)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .populate('artistId', 'fullName artistName email profileImage phone')
      .populate('campaignId', 'title slug')
      .populate('processedBy', 'fullName email');

    const total = await Withdrawal.countDocuments(query);

    // Format response
    const formattedWithdrawals = withdrawals.map((withdrawal) => {
      const artist = withdrawal.artistId as any;
      const campaign = withdrawal.campaignId as any;
      const processor = withdrawal.processedBy as any;

      return {
        id: withdrawal._id.toString(),
        artist: {
          id: artist._id.toString(),
          name: artist.fullName,
          artistName: artist.artistName,
          email: artist.email,
          phone: artist.phone,
          avatar: artist.profileImage,
        },
        campaign: {
          id: campaign._id.toString(),
          title: campaign.title,
          slug: campaign.slug,
        },
        amount: withdrawal.amount,
        platformCommission: withdrawal.platformCommission,
        netAmount: withdrawal.netAmount,
        bankDetails: withdrawal.bankDetails,
        status: withdrawal.status,
        requestedAt: withdrawal.requestedAt,
        processedAt: withdrawal.processedAt,
        processedBy: processor
          ? {
              id: processor._id.toString(),
              name: processor.fullName,
              email: processor.email,
            }
          : null,
        rejectionReason: withdrawal.rejectionReason,
        transactionRef: withdrawal.transactionRef,
      };
    });

    // Get statistics
    const stats = {
      total: await Withdrawal.countDocuments(),
      pending: await Withdrawal.countDocuments({ status: 'pending' }),
      approved: await Withdrawal.countDocuments({ status: 'approved' }),
      processed: await Withdrawal.countDocuments({ status: 'processed' }),
      rejected: await Withdrawal.countDocuments({ status: 'rejected' }),
    };

    return successResponse({
      withdrawals: formattedWithdrawals,
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

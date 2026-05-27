import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Withdrawal from '@/src/models/Withdrawal';
import Notification from '@/src/models/Notification';
import Transaction from '@/src/models/Transaction';
import { authenticate } from '@/src/middleware/auth';
import { generateTransactionRef } from '@/src/lib/utils';
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

    // Find withdrawal
    const withdrawal = await Withdrawal.findById(id).populate('artistId campaignId');
    if (!withdrawal) {
      return errorResponse('Withdrawal request not found', 404);
    }

    // Check if already processed
    if (withdrawal.status !== 'pending') {
      return errorResponse('Only pending withdrawals can be approved', 400);
    }

    // Generate transaction reference
    const transactionRef = generateTransactionRef('WITHDRAW');

    // Update withdrawal status
    withdrawal.status = 'approved';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = user.userId as any;
    withdrawal.transactionRef = transactionRef;
    await withdrawal.save();

    const artist = withdrawal.artistId as any;
    const campaign = withdrawal.campaignId as any;

    // Create transaction record
    await Transaction.create({
      userId: artist._id,
      campaignId: campaign._id,
      type: 'withdrawal',
      amount: withdrawal.netAmount,
      status: 'successful',
      transactionRef,
      description: `Withdrawal for campaign "${campaign.title}"`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        grossAmount: withdrawal.amount,
        commission: withdrawal.platformCommission,
        netAmount: withdrawal.netAmount,
      },
    });

    // Record platform commission
    await Transaction.create({
      userId: artist._id,
      campaignId: campaign._id,
      type: 'commission',
      amount: withdrawal.platformCommission,
      status: 'successful',
      transactionRef: `${transactionRef}-COMMISSION`,
      description: `Platform commission for campaign "${campaign.title}"`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        commissionPercentage: (withdrawal.platformCommission / withdrawal.amount) * 100,
      },
    });

    // Notify artist
    await Notification.create({
      userId: artist._id,
      type: 'withdrawal_approved',
      title: 'Withdrawal Approved! 💰',
      message: `Your withdrawal request of ₦${withdrawal.netAmount.toLocaleString()} has been approved and will be processed shortly.`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        amount: withdrawal.netAmount,
      },
    });

    // TODO: Integrate with Paystack Transfer API to send money to artist's bank account
    // This would require additional implementation with Paystack's transfer recipient and transfer APIs

    return successResponse({
      message: 'Withdrawal approved successfully',
      withdrawal: {
        id: withdrawal._id.toString(),
        status: withdrawal.status,
        netAmount: withdrawal.netAmount,
        transactionRef,
        processedAt: withdrawal.processedAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

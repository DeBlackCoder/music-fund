import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Withdrawal from '@/src/models/Withdrawal';
import Notification from '@/src/models/Notification';
import { authenticate } from '@/src/middleware/auth';
import { validateRequest, rejectWithdrawalSchema } from '@/src/middleware/validation';
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
    const validation = validateRequest(rejectWithdrawalSchema, { withdrawalId: id, ...body });
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { reason } = validation.data;

    // Find withdrawal
    const withdrawal = await Withdrawal.findById(id).populate('artistId campaignId');
    if (!withdrawal) {
      return errorResponse('Withdrawal request not found', 404);
    }

    // Check if already processed
    if (withdrawal.status !== 'pending') {
      return errorResponse('Only pending withdrawals can be rejected', 400);
    }

    // Update withdrawal status
    withdrawal.status = 'rejected';
    withdrawal.processedAt = new Date();
    withdrawal.processedBy = user.userId as any;
    withdrawal.rejectionReason = reason;
    await withdrawal.save();

    const artist = withdrawal.artistId as any;

    // Notify artist
    await Notification.create({
      userId: artist._id,
      type: 'withdrawal_rejected',
      title: 'Withdrawal Rejected',
      message: `Your withdrawal request has been rejected. Reason: ${reason}`,
      metadata: {
        withdrawalId: withdrawal._id.toString(),
        reason,
      },
    });

    return successResponse({
      message: 'Withdrawal rejected successfully',
      withdrawal: {
        id: withdrawal._id.toString(),
        status: withdrawal.status,
        rejectionReason: withdrawal.rejectionReason,
        processedAt: withdrawal.processedAt,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}

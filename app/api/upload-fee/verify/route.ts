import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Transaction from '@/src/models/Transaction';
import { verifyPayment } from '@/src/lib/paystack';
import { requireArtist } from '@/src/middleware/auth';
import { validateRequest, verifyPaymentSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export const POST = requireArtist(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request
    const validation = validateRequest(verifyPaymentSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { reference } = validation.data;

    // Find transaction
    const transaction = await Transaction.findOne({ transactionRef: reference });
    if (!transaction) {
      return errorResponse('Transaction not found', 404);
    }

    // Check if transaction belongs to user
    if (transaction.userId.toString() !== user.userId) {
      return errorResponse('Unauthorized', 403);
    }

    // Check if already verified
    if (transaction.status === 'successful') {
      return successResponse({
        message: 'Payment already verified',
        verified: true,
        amount: transaction.amount,
      });
    }

    // Verify payment with Paystack
    const paymentVerification = await verifyPayment(reference);

    if (paymentVerification.data.status === 'success') {
      // Update transaction
      transaction.status = 'successful';
      transaction.paystackRef = paymentVerification.data.reference;
      transaction.metadata = paymentVerification.data;
      await transaction.save();

      return successResponse({
        message: 'Upload fee payment verified successfully',
        verified: true,
        amount: transaction.amount,
        transactionRef: reference,
      });
    } else {
      // Payment failed
      transaction.status = 'failed';
      await transaction.save();

      return errorResponse('Payment verification failed', 400);
    }
  } catch (error) {
    return handleError(error);
  }
});

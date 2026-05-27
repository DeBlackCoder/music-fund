import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import Campaign from '@/src/models/Campaign';
import Vote from '@/src/models/Vote';
import Transaction from '@/src/models/Transaction';
import Notification from '@/src/models/Notification';
import User from '@/src/models/User';
import { verifyPayment } from '@/src/lib/paystack';
import { sendEmail, newVoteEmail, goalReachedEmail } from '@/src/lib/email';
import { validateRequest, verifyPaymentSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    const validation = validateRequest(verifyPaymentSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    const { reference } = validation.data;

    // Find vote record by reference
    const vote = await Vote.findOne({ transactionRef: reference });
    if (!vote) {
      return errorResponse('Vote record not found', 404);
    }

    // Already verified
    if (vote.status === 'successful') {
      return successResponse({
        message: 'Vote already verified',
        verified: true,
        voteCount: vote.voteCount,
        amount: vote.amount,
      });
    }

    // Verify payment with Paystack
    const paymentVerification = await verifyPayment(reference);

    if (paymentVerification.data.status === 'success') {
      vote.status = 'successful';
      vote.paystackRef = paymentVerification.data.reference;
      vote.metadata = paymentVerification.data;
      await vote.save();

      // Update campaign
      const campaign = await Campaign.findById(vote.campaignId).populate('artistId');
      if (campaign) {
        campaign.voteCount += vote.voteCount;
        campaign.raisedAmount += vote.amount;

        // Check if goal is reached
        const goalReached = campaign.raisedAmount >= campaign.goalAmount;
        if (goalReached && campaign.status === 'active') {
          campaign.status = 'goal_reached';
          campaign.goalReachedAt = new Date();

          const artist = campaign.artistId as any;
          await Notification.create({
            userId: artist._id,
            type: 'goal_reached',
            title: 'Goal Reached! 🎉',
            message: `Your campaign "${campaign.title}" has reached its funding goal of ₦${campaign.goalAmount.toLocaleString()}!`,
            metadata: { campaignId: campaign._id.toString() },
          });

          sendEmail({
            to: artist.email,
            subject: 'Congratulations! Your Campaign Goal is Reached!',
            html: goalReachedEmail(artist.artistName || artist.fullName, campaign.title, campaign.raisedAmount),
          }).catch((err) => console.error('Failed to send goal reached email:', err));
        }

        await campaign.save();

        // Create transaction record
        await Transaction.create({
          voterEmail: vote.voterEmail,
          campaignId: campaign._id,
          type: 'vote',
          amount: vote.amount,
          status: 'successful',
          transactionRef: reference,
          paystackRef: paymentVerification.data.reference,
          description: `Vote for "${campaign.title}"`,
          metadata: paymentVerification.data,
        });

        // Notify artist about new vote
        const artist = campaign.artistId as any;
        await Notification.create({
          userId: artist._id,
          type: 'new_vote',
          title: 'New Vote Received! 🎵',
          message: `Someone voted ${vote.voteCount} times for "${campaign.title}"`,
          metadata: {
            campaignId: campaign._id.toString(),
            voterEmail: vote.voterEmail,
            voteCount: vote.voteCount,
            amount: vote.amount,
          },
        });

        sendEmail({
          to: artist.email,
          subject: 'New Vote Received!',
          html: newVoteEmail(
            artist.artistName || artist.fullName,
            vote.voterEmail,
            vote.voteCount,
            vote.amount,
            campaign.title
          ),
        }).catch((err) => console.error('Failed to send new vote email:', err));
      }

      return successResponse({
        message: 'Vote verified and recorded successfully',
        verified: true,
        voteCount: vote.voteCount,
        amount: vote.amount,
        transactionRef: reference,
        goalReached: campaign?.status === 'goal_reached',
      });
    } else {
      vote.status = 'failed';
      await vote.save();
      return errorResponse('Payment verification failed', 400);
    }
  } catch (error) {
    return handleError(error);
  }
}

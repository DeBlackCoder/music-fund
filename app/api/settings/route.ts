import { NextRequest } from 'next/server';
import { connectDB } from '@/src/lib/db';
import PlatformSettings from '@/src/models/PlatformSettings';
import { requireAdmin } from '@/src/middleware/auth';
import { validateRequest, updatePlatformSettingsSchema } from '@/src/middleware/validation';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';

// GET - Get platform settings (public)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await PlatformSettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = await PlatformSettings.create({
        uploadFee: 2000,
        votePrice: 100,
        platformCommission: 10,
        minGoalAmount: 50000,
        maxGoalAmount: 10000000,
        defaultCampaignDuration: 30,
      });
    }

    return successResponse({
      uploadFee: settings.uploadFee,
      votePrice: settings.votePrice,
      platformCommission: settings.platformCommission,
      minGoalAmount: settings.minGoalAmount,
      maxGoalAmount: settings.maxGoalAmount,
      defaultCampaignDuration: settings.defaultCampaignDuration,
    });
  } catch (error) {
    return handleError(error);
  }
}

// PUT - Update platform settings (admin only)
export const PUT = requireAdmin(async (request: NextRequest, user) => {
  try {
    await connectDB();

    const body = await request.json();

    // Validate request
    const validation = validateRequest(updatePlatformSettingsSchema, body);
    if (!validation.success) {
      return errorResponse(validation.error, 400);
    }

    let settings = await PlatformSettings.findOne();

    if (!settings) {
      // Create new settings
      settings = await PlatformSettings.create({
        ...validation.data,
        updatedBy: user.userId,
      });
    } else {
      // Update existing settings
      Object.assign(settings, validation.data);
      settings.updatedBy = user.userId as any;
      await settings.save();
    }

    return successResponse({
      uploadFee: settings.uploadFee,
      votePrice: settings.votePrice,
      platformCommission: settings.platformCommission,
      minGoalAmount: settings.minGoalAmount,
      maxGoalAmount: settings.maxGoalAmount,
      defaultCampaignDuration: settings.defaultCampaignDuration,
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    return handleError(error);
  }
});

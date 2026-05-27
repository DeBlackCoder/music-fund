import { z } from 'zod';
import { NextResponse } from 'next/server';

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: any
): { success: true; data: T } | { success: false; error: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: messages.join(', ') };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Common validation schemas
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['artist']),
  artistName: z.string().optional(),
  phone: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const createCampaignSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  genre: z.string().min(1, 'Genre is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  story: z.string().optional(),
  goalAmount: z.number().min(50000, 'Goal must be at least ₦50,000'),
  deadline: z.string().datetime(),
  tags: z.array(z.string()).optional(),
});

export const initializeVoteSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  voteCount: z.number().min(1, 'Vote count must be at least 1'),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Transaction reference is required'),
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).optional(),
  artistName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  genre: z.array(z.string()).optional(),
  socialLinks: z
    .object({
      instagram: z.string().url().optional(),
      twitter: z.string().url().optional(),
      youtube: z.string().url().optional(),
      spotify: z.string().url().optional(),
    })
    .optional(),
});

export const withdrawalRequestSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  bankDetails: z.object({
    accountName: z.string().min(1, 'Account name is required'),
    accountNumber: z.string().length(10, 'Account number must be 10 digits'),
    bankName: z.string().min(1, 'Bank name is required'),
    bankCode: z.string().min(1, 'Bank code is required'),
  }),
});

export const updatePlatformSettingsSchema = z.object({
  uploadFee: z.number().min(0).optional(),
  votePrice: z.number().min(1).optional(),
  platformCommission: z.number().min(0).max(100).optional(),
  minGoalAmount: z.number().min(0).optional(),
  maxGoalAmount: z.number().min(0).optional(),
  defaultCampaignDuration: z.number().min(1).optional(),
});

export const approveCampaignSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
});

export const rejectCampaignSchema = z.object({
  campaignId: z.string().min(1, 'Campaign ID is required'),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

export const approveWithdrawalSchema = z.object({
  withdrawalId: z.string().min(1, 'Withdrawal ID is required'),
});

export const rejectWithdrawalSchema = z.object({
  withdrawalId: z.string().min(1, 'Withdrawal ID is required'),
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters'),
});

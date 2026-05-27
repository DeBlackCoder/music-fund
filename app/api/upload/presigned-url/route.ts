import { NextRequest } from 'next/server';
import { getPresignedUploadUrl } from '@/src/lib/cloudflare-r2';
import { requireArtist } from '@/src/middleware/auth';
import { handleError, successResponse, errorResponse } from '@/src/middleware/error-handler';
import { nanoid } from 'nanoid';

export const POST = requireArtist(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    const { fileType, contentType } = body;

    if (!fileType || !contentType) {
      return errorResponse('fileType and contentType are required', 400);
    }

    // Validate file type
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg'];
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (fileType === 'audio' && !allowedAudioTypes.includes(contentType)) {
      return errorResponse('Invalid audio file type. Allowed: MP3, WAV, OGG', 400);
    }

    if (fileType === 'image' && !allowedImageTypes.includes(contentType)) {
      return errorResponse('Invalid image file type. Allowed: JPEG, PNG, WEBP', 400);
    }

    // Generate unique file key
    const extension = contentType.split('/')[1];
    const fileKey = `${fileType}s/${user.userId}/${nanoid()}.${extension}`;

    // Get presigned URL
    const presignedUrl = await getPresignedUploadUrl(fileKey, contentType, 3600); // 1 hour expiry

    return successResponse({
      presignedUrl,
      fileKey,
      expiresIn: 3600,
    });
  } catch (error) {
    return handleError(error);
  }
});

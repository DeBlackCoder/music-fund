import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from '@/src/lib/jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check cookies
  const token = request.cookies.get('token')?.value;
  return token || null;
}

export async function authenticate(
  request: NextRequest
): Promise<{ user: JWTPayload } | { error: string; status: number }> {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return { error: 'No token provided', status: 401 };
    }

    const user = verifyToken(token);
    return { user };
  } catch (error) {
    return { error: 'Invalid or expired token', status: 401 };
  }
}

export function requireAuth(
  handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const result = await authenticate(request);

    if ('error' in result) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status }
      );
    }

    return handler(request, result.user);
  };
}

export function requireRole(...allowedRoles: Array<'artist' | 'fan' | 'admin'>) {
  return (
    handler: (request: NextRequest, user: JWTPayload) => Promise<NextResponse>
  ) => {
    return requireAuth(async (request, user) => {
      if (!allowedRoles.includes(user.role)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Insufficient permissions',
          },
          { status: 403 }
        );
      }

      return handler(request, user);
    });
  };
}

export const requireArtist = requireRole('artist');
export const requireAdmin = requireRole('admin');
export const requireArtistOrAdmin = requireRole('artist', 'admin');

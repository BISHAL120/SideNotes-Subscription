import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from './auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  image?: string | null;
}

export async function getAuthSession(): Promise<{ user: AuthUser; session: unknown } | null> {
  try {
    const reqHeaders = await headers();
    const sessionData = await auth.api.getSession({
      headers: reqHeaders,
    });

    if (sessionData && sessionData.user) {
      return {
        user: {
          id: sessionData.user.id,
          name: sessionData.user.name,
          email: sessionData.user.email,
          role: (((sessionData.user as { role?: string }).role === 'admin' ? 'admin' : 'user') as 'admin' | 'user'),
          image: sessionData.user.image,
        },
        session: sessionData.session,
      };
    }
  } catch (err) {
    console.warn('[API Auth] Session check error:', (err as Error).message);
  }
  return null;
}

export async function requireAuthUser(): Promise<
  | { user: AuthUser; session: unknown; errorResponse?: never }
  | { user?: never; session?: never; errorResponse: NextResponse }
> {
  const session = await getAuthSession();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      ),
    };
  }
  return { user: session.user, session: session.session };
}

export async function requireAdminUser(): Promise<
  | { user: AuthUser; session: unknown; errorResponse?: never }
  | { user?: never; session?: never; errorResponse: NextResponse }
> {
  const session = await getAuthSession();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      ),
    };
  }

  if (session.user.role !== 'admin') {
    return {
      errorResponse: NextResponse.json(
        { success: false, error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      ),
    };
  }

  return { user: session.user, session: session.session };
}

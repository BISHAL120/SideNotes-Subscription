import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';
import { requireAdminUser } from '@/lib/api-auth';
import { handleRouteError } from '@/lib/api-utils';

export async function GET() {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return handleRouteError('stats:GET', error);
  }
}

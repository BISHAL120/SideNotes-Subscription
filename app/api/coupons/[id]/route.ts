import { NextRequest, NextResponse } from 'next/server';
import { deleteCoupon } from '@/lib/db';
import { requireAdminUser } from '@/lib/api-auth';
import { handleRouteError } from '@/lib/api-utils';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const { id } = await params;
    const deleted = await deleteCoupon(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Coupon not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Coupon removed' });
  } catch (error) {
    return handleRouteError('coupons/[id]:DELETE', error);
  }
}

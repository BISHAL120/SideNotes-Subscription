import { NextRequest, NextResponse } from 'next/server';
import { createCoupon, getAllCoupons } from '@/lib/db';
import { getAuthSession, requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';
import { Coupon } from '@/types/product';

export async function GET() {
  try {
    const session = await getAuthSession();
    const isAdmin = session?.user.role === 'admin';

    const coupons = await getAllCoupons({ activeOnly: !isAdmin });
    if (isAdmin) {
      return NextResponse.json({ success: true, coupons });
    }

    return NextResponse.json({
      success: true,
      coupons: coupons.map(({ id, code, discountAmount, discountPercent, minSpend, description }) => ({
        id,
        code,
        discountAmount,
        discountPercent,
        minSpend,
        description,
      })),
    });
  } catch (error) {
    return handleRouteError('coupons:GET', error);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await readJsonBody<Partial<Coupon>>(request);
    const coupon = await createCoupon(body);
    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    return handleRouteError('coupons:POST', error);
  }
}

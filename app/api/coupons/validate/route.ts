import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '@/lib/db';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody<{ code?: unknown; subtotal?: unknown }>(request);
    const code = typeof body.code === 'string' ? body.code : '';
    const subtotal = Number(body.subtotal);

    const result = await validateCoupon(code, Number.isFinite(subtotal) ? subtotal : 0);
    const coupon = result.coupon
      ? {
          code: result.coupon.code,
          discountAmount: result.coupon.discountAmount,
          discountPercent: result.coupon.discountPercent,
          minSpend: result.coupon.minSpend,
          description: result.coupon.description,
        }
      : undefined;

    return NextResponse.json({
      success: result.valid,
      valid: result.valid,
      discount: result.discount,
      code: result.code,
      coupon,
      message: result.message,
    });
  } catch (error) {
    return handleRouteError('coupons/validate:POST', error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { isValidOrderStatus, updateOrderStatus } from '@/lib/db';
import { requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const { id } = await params;
    const body = await readJsonBody<{ status?: unknown }>(request);
    if (!isValidOrderStatus(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Status must be COMPLETED, PROCESSING, REFUNDED or CANCELLED.' },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(id, body.status);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (error) {
    return handleRouteError('orders/[id]:PATCH', error);
  }
}

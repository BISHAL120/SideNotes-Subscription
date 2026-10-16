import { NextRequest, NextResponse } from 'next/server';
import {
  createOrder,
  getAllOrders,
  getProductBySlug,
  redeemCoupon,
  toPublicProduct,
  validateCoupon,
  ValidationError,
} from '@/lib/db';
import { getAuthSession } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';
import { priceForVariant } from '@/lib/license-tiers';
import { CartItem } from '@/types/product';

const PAYMENT_METHODS = ['bkash', 'nagad', 'card', 'cod'];
const MAX_ITEMS = 20;
const MAX_QUANTITY = 20;

interface OrderRequestItem {
  slug?: unknown;
  quantity?: unknown;
  variant?: unknown;
}

interface OrderRequestBody {
  items?: OrderRequestItem[];
  couponCode?: unknown;
  customerName?: unknown;
  customerEmail?: unknown;
  customerPhone?: unknown;
  company?: unknown;
  notes?: unknown;
  paymentMethod?: unknown;
}

export async function GET() {
  const sessionData = await getAuthSession();
  if (!sessionData) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized: Please sign in to view order history.' },
      { status: 401 }
    );
  }

  try {
    const orders =
      sessionData.user.role === 'admin'
        ? await getAllOrders()
        : await getAllOrders({ userId: sessionData.user.id });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    return handleRouteError('orders:GET', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonBody<OrderRequestBody>(request);
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      throw new ValidationError('Order must contain at least one digital product.');
    }
    if (rawItems.length > MAX_ITEMS) {
      throw new ValidationError('Order contains too many line items.');
    }

    const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
    const customerEmail =
      typeof body.customerEmail === 'string' ? body.customerEmail.trim().toLowerCase() : '';
    const customerPhone =
      typeof body.customerPhone === 'string' ? body.customerPhone.replace(/\s+/g, '') : '';

    if (!customerName) throw new ValidationError('Customer name is required.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      throw new ValidationError('A valid delivery email address is required.');
    }
    if (!/^(?:\+?880|0)1[3-9]\d{8}$/.test(customerPhone)) {
      throw new ValidationError('A valid Bangladeshi mobile number is required.');
    }

    const paymentMethod =
      typeof body.paymentMethod === 'string' && PAYMENT_METHODS.includes(body.paymentMethod)
        ? body.paymentMethod
        : 'bkash';

    const items: CartItem[] = [];
    for (const entry of rawItems) {
      const slug = typeof entry.slug === 'string' ? entry.slug.trim() : '';
      const quantity = Math.trunc(Number(entry.quantity));
      const variant = typeof entry.variant === 'string' ? entry.variant : undefined;

      if (!slug) throw new ValidationError('Each order item requires a product slug.');
      if (!Number.isFinite(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
        throw new ValidationError(`Item quantity must be between 1 and ${MAX_QUANTITY}.`);
      }

      const product = await getProductBySlug(slug);
      if (!product) throw new ValidationError(`Product "${slug}" is no longer available.`);
      if (product.stock < quantity) {
        throw new ValidationError(`Only ${product.stock} units of "${product.name}" remain in stock.`);
      }

      items.push({
        product: toPublicProduct(product),
        quantity,
        selectedVariant: variant,
        unitPrice: priceForVariant(product.price, variant),
      });
    }

    const subtotal = items.reduce(
      (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
      0
    );

    let discount = 0;
    let couponCode: string | undefined;
    if (typeof body.couponCode === 'string' && body.couponCode.trim() !== '') {
      const coupon = await validateCoupon(body.couponCode, subtotal);
      if (coupon.valid) {
        discount = coupon.discount;
        couponCode = coupon.code;
      }
    }

    const total = Math.max(0, subtotal - discount);
    const sessionData = await getAuthSession();

    const order = await createOrder({
      userId: sessionData?.user.id,
      customerName,
      customerEmail,
      customerPhone,
      company: typeof body.company === 'string' ? body.company.trim() || undefined : undefined,
      notes: typeof body.notes === 'string' ? body.notes.trim() || undefined : undefined,
      couponCode,
      paymentMethod,
      items,
      subtotal,
      discount,
      total,
    });

    if (couponCode) await redeemCoupon(couponCode);

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    return handleRouteError('orders:POST', error);
  }
}

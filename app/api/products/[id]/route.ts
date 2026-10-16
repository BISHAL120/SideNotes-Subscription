import { NextRequest, NextResponse } from 'next/server';
import { deleteProduct, getProductBySlug, toPublicProduct, updateProduct } from '@/lib/db';
import { getAuthSession, requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';
import { Product } from '@/types/product';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthSession();
    const isAdmin = session?.user.role === 'admin';

    const product = await getProductBySlug(id, { includeInactive: isAdmin });
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      product: isAdmin ? product : toPublicProduct(product),
    });
  } catch (error) {
    return handleRouteError('products/[id]:GET', error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const { id } = await params;
    const body = await readJsonBody<Partial<Product>>(request);
    const product = await updateProduct(id, body);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return handleRouteError('products/[id]:PUT', error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const { id } = await params;
    const deleted = await deleteProduct(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    return handleRouteError('products/[id]:DELETE', error);
  }
}

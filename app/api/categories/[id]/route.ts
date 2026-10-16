import { NextRequest, NextResponse } from 'next/server';
import { deleteCategory, updateCategory } from '@/lib/db';
import { requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';
import { Category } from '@/types/product';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const { id } = await params;
    const body = await readJsonBody<Partial<Category>>(request);
    const category = await updateCategory(id, body);
    if (!category) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, category });
  } catch (error) {
    return handleRouteError('categories/[id]:PUT', error);
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
    const deleted = await deleteCategory(id);
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return handleRouteError('categories/[id]:DELETE', error);
  }
}

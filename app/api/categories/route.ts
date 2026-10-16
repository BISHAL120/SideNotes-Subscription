import { NextRequest, NextResponse } from 'next/server';
import { createCategory, getAllCategories } from '@/lib/db';
import { requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';
import { Category } from '@/types/product';

export async function GET() {
  try {
    const categories = await getAllCategories();
    return NextResponse.json({ success: true, categories });
  } catch (error) {
    return handleRouteError('categories:GET', error);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await readJsonBody<Partial<Category>>(request);
    const category = await createCategory(body);
    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    return handleRouteError('categories:POST', error);
  }
}

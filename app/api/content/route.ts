import { NextRequest, NextResponse } from 'next/server';
import { getCmsContent, updateCmsContent } from '@/lib/db';
import { requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';
import { SiteCmsData } from '@/types/cms';

export async function GET() {
  try {
    const content = await getCmsContent();
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return handleRouteError('content:GET', error);
  }
}

export async function PUT(request: NextRequest) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await readJsonBody<Partial<SiteCmsData>>(request);
    const content = await updateCmsContent(body);
    return NextResponse.json({ success: true, content });
  } catch (error) {
    return handleRouteError('content:PUT', error);
  }
}

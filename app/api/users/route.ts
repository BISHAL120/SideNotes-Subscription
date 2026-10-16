import { NextRequest, NextResponse } from 'next/server';
import { countAdmins, getAllUsers, isValidRole, updateUserRole, ValidationError } from '@/lib/db';
import { requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';

export async function GET() {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const users = await getAllUsers();
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return handleRouteError('users:GET', error);
  }
}

export async function PATCH(request: NextRequest) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await readJsonBody<{ userId?: unknown; role?: unknown }>(request);
    const userId = typeof body.userId === 'string' ? body.userId.trim() : '';

    if (!userId) throw new ValidationError('User ID is required.');
    if (!isValidRole(body.role)) throw new ValidationError('Role must be "admin" or "user".');
    if (userId === authCheck.user.id && body.role === 'user') {
      throw new ValidationError('You cannot remove your own administrator access.', 409);
    }
    if (body.role === 'user' && (await countAdmins()) <= 1) {
      throw new ValidationError('At least one administrator must remain.', 409);
    }

    const success = await updateUserRole(userId, body.role);
    if (!success) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError('users:PATCH', error);
  }
}

import { NextResponse } from 'next/server';
import { ValidationError } from './db';

export function handleRouteError(context: string, error: unknown): NextResponse {
  console.error(`[api:${context}]`, error);
  if (error instanceof ValidationError) {
    return NextResponse.json({ success: false, error: error.message }, { status: error.status });
  }
  return NextResponse.json(
    { success: false, error: 'Something went wrong. Please try again.' },
    { status: 500 }
  );
}

export async function readJsonBody<T extends object = Record<string, unknown>>(
  request: Request
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError('Request body must be valid JSON.');
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Request body must be a JSON object.');
  }
  return body as T;
}

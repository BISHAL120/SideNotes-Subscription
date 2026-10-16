import { NextRequest, NextResponse } from 'next/server';
import { createProduct, getAllProducts, toPublicProduct } from '@/lib/db';
import { getAuthSession, requireAdminUser } from '@/lib/api-auth';
import { handleRouteError, readJsonBody } from '@/lib/api-utils';
import { Product } from '@/types/product';

export async function GET(request: NextRequest) {
  try {
    const session = await getAuthSession();
    const isAdmin = session?.user.role === 'admin';
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('q');
    const featured = searchParams.get('featured');

    let products = await getAllProducts({ includeInactive: isAdmin });

    if (category) {
      products = products.filter(
        product => product.category.toLowerCase() === category.toLowerCase()
      );
    }

    if (search) {
      const query = search.toLowerCase();
      products = products.filter(
        product =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    if (featured === 'true') {
      products = products.filter(product => product.isFeatured);
    }

    return NextResponse.json({
      success: true,
      products: isAdmin ? products : products.map(toPublicProduct),
    });
  } catch (error) {
    return handleRouteError('products:GET', error);
  }
}

export async function POST(request: NextRequest) {
  const authCheck = await requireAdminUser();
  if (authCheck.errorResponse) return authCheck.errorResponse;

  try {
    const body = await readJsonBody<Partial<Product>>(request);
    const product = await createProduct(body);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return handleRouteError('products:POST', error);
  }
}

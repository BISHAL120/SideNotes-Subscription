import { notFound } from 'next/navigation';
import { getAllProducts, getProductBySlug, toPublicProduct } from '@/lib/db';
import { ProductDetail } from './ProductDetail';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const publicProduct = toPublicProduct(product);
  const allProducts = await getAllProducts();
  const related = allProducts
    .filter(item => item.id !== product.id && item.category === product.category)
    .slice(0, 4)
    .map(toPublicProduct);

  return <ProductDetail product={publicProduct} related={related} />;
}

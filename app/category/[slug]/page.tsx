import { notFound } from 'next/navigation';
import { getAllCategories, getAllProducts, toPublicProduct } from '@/lib/db';
import { CategoryCatalog } from './CategoryCatalog';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [categories, products] = await Promise.all([getAllCategories(), getAllProducts()]);

  const category = categories.find(
    entry => entry.slug === slug || entry.subcategories?.some(sub => sub.slug === slug)
  );

  if (!category) {
    notFound();
  }

  return <CategoryCatalog category={category} products={products.map(toPublicProduct)} />;
}

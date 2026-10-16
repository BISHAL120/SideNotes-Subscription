import { Product } from '@/types/product';
import { digitalProducts } from './digital-products';

export const products: Product[] = digitalProducts;

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find(p => p.slug === slug);
};

export const getAppleExclusiveProducts = (): Product[] => {
  return products.filter(p => p.isAppleExclusive || p.brand.toLowerCase() === 'openai' || p.category.includes('SaaS'));
};

export const getHotDeals = (): Product[] => {
  return products.filter(p => p.isHotDeal || (p.originalPrice && p.originalPrice > p.price));
};

export const getTopSelling = (): Product[] => {
  return products.filter(p => p.isTopSelling || p.rating >= 4.9);
};

export const getNewArrivals = (): Product[] => {
  return products.filter(p => p.isNewArrival || p.isFeatured);
};

'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import { products as seedProducts } from '@/data/products';

export function useCatalogProducts(): Product[] {
  const [catalog, setCatalog] = useState<Product[]>(seedProducts);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (cancelled) return;
        if (data?.success && Array.isArray(data.products) && data.products.length > 0) {
          setCatalog(data.products as Product[]);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return catalog;
}

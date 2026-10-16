'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { formatPrice } from '@/lib/format-price';
import { useCart } from '@/context/CartContext';
import { Star, ShoppingBag, Zap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-300 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden">
      {/* Top Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col gap-1 items-start">
          {product.discountBadge ? (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-[#F58220] text-white shadow-xs">
              {product.discountBadge}
            </span>
          ) : product.digitalAssetType ? (
            <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-neutral-900 text-purple-300 border border-neutral-700 shadow-xs uppercase">
              {product.digitalAssetType}
            </span>
          ) : null}
        </div>
      </div>

      {/* Product Image Link */}
      <Link
        href={`/product/${product.slug}`}
        className="block relative w-full aspect-square p-4 bg-neutral-950 flex items-center justify-center overflow-hidden"
      >
        <Image
          src={product.images?.[0] ?? 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[10px] font-bold text-white/90">
          <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-xs">
            <Zap className="w-3 h-3 text-[#F58220]" />
            <span>Instant Access</span>
          </span>
          {product.fileFormat && (
            <span className="text-neutral-300 text-[9px] truncate max-w-[100px]">
              {product.fileFormat}
            </span>
          )}
        </div>
      </Link>

      {/* Content & Details */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">
            <span className="text-[#F58220] font-bold">{product.brand}</span>
            <span>·</span>
            <span className="truncate">{product.category}</span>
          </div>

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="text-xs sm:text-sm font-bold text-neutral-900 hover:text-[#F58220] transition-colors line-clamp-2 leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1 text-[11px] text-amber-500">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-bold text-neutral-800">{product.rating}</span>
            <span className="text-neutral-400 text-[10px]">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="pt-3 mt-2 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black text-neutral-900 tabular-nums leading-tight">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[10px] text-neutral-400 line-through tabular-nums">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-neutral-900 hover:bg-[#F58220] text-white text-xs font-bold transition-colors flex items-center gap-1 shrink-0 shadow-sm"
            title="Add to Cart"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#F58220] group-hover:text-white" />
            <span className="hidden sm:inline">Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

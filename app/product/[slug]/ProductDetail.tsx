'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatPrice } from '@/lib/format-price';
import { LICENSE_TIERS, priceForVariant } from '@/lib/license-tiers';
import { useCart } from '@/context/CartContext';
import { ProductCard } from '@/components/products/ProductCard';
import { Product } from '@/types/product';
import {
  ChevronRight,
  Star,
  ShieldCheck,
  Zap,
  RotateCcw,
  ShoppingBag,
  Share2,
  ExternalLink,
  DownloadCloud,
  KeyRound,
  FileCode,
  Check
} from 'lucide-react';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80';

interface ProductDetailProps {
  product: Product;
  related: Product[];
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, related }) => {
  const router = useRouter();
  const { addToCart, updateQuantity, items } = useCart();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedLicense, setSelectedLicense] = useState(LICENSE_TIERS[0].name);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'desc' | 'warranty' | 'reviews'>('specs');
  const [copiedLink, setCopiedLink] = useState(false);

  const images =
    product.images.length > 0 ? product.images : [FALLBACK_IMAGE];
  const activeImage = images[selectedImageIndex] ?? images[0];
  const unitPrice = priceForVariant(product.price, selectedLicense);
  const availableKeys = product.availableKeys ?? product.stock;
  const maxQuantity = Math.max(1, Math.min(20, product.stock > 0 ? product.stock : 20));

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedLicense);
  };

  const handleBuyNow = () => {
    const existing = items.find(
      item => item.product.id === product.id && item.selectedVariant === selectedLicense
    );
    if (existing) {
      updateQuantity(product.id, quantity, selectedLicense);
    } else {
      addToCart(product, quantity, selectedLicense);
    }
    router.push('/checkout');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4">
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-4 overflow-x-auto no-scrollbar">
          <Link href="/" className="hover:text-neutral-900 transition-colors shrink-0">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <Link href="/products" className="hover:text-neutral-900 transition-colors shrink-0">
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-[#F58220] font-semibold truncate">{product.category}</span>
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
          <span className="text-neutral-900 font-semibold truncate">{product.name}</span>
        </nav>

        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-4 sm:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Product Gallery & Badges (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="relative w-full aspect-square bg-neutral-950 rounded-2xl border border-neutral-800 overflow-hidden flex items-center justify-center">
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                />

                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {product.discountBadge && (
                    <span className="px-3 py-1 rounded-lg text-xs font-black bg-[#F58220] text-white shadow-md">
                      {product.discountBadge}
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-neutral-900/90 backdrop-blur-xs text-purple-300 border border-neutral-700 uppercase">
                    {product.digitalAssetType || 'DIGITAL PRODUCT'}
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-bold text-white bg-black/60 backdrop-blur-md p-2.5 rounded-xl border border-white/10">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Instant Digital Key Delivery</span>
                  </span>
                  {product.fileSize && (
                    <span className="text-neutral-300 text-[11px] font-mono">
                      {product.fileSize}
                    </span>
                  )}
                </div>
              </div>

              {images.length > 1 && (
                <div className="flex items-center gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden bg-neutral-950 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-[#F58220] ring-2 ring-orange-500/20'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} view ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Purchase & Details (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-orange-50 font-bold text-[#F58220] uppercase tracking-wider border border-orange-200">
                      {product.brand}
                    </span>
                    <span className="text-neutral-400">·</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock ({availableKeys} Keys Ready)
                    </span>
                  </div>

                  <button
                    onClick={handleShare}
                    className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors text-xs flex items-center gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                  </button>
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight leading-snug">
                  {product.name}
                </h1>

                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.round(product.rating) ? 'fill-current' : 'text-neutral-300'
                        }`}
                      />
                    ))}
                    <span className="font-bold text-neutral-800 ml-1">{product.rating}</span>
                  </div>
                  <span className="text-neutral-400">|</span>
                  <span className="text-neutral-500 font-medium">
                    {product.reviewCount} verified ratings
                  </span>
                  {product.version && (
                    <>
                      <span className="text-neutral-400">|</span>
                      <span className="text-neutral-700 font-mono font-bold bg-neutral-100 px-2 py-0.5 rounded">
                        {product.version}
                      </span>
                    </>
                  )}
                </div>

                <div className="mt-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200/80 flex flex-wrap items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-neutral-900 tabular-nums">
                    {formatPrice(unitPrice)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-sm sm:text-base text-neutral-400 line-through tabular-nums">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                        Save {formatPrice(product.originalPrice - product.price)}
                      </span>
                    </>
                  )}
                  {selectedLicense !== LICENSE_TIERS[0].name && (
                    <span className="text-[11px] font-semibold text-neutral-500">
                      {selectedLicense} pricing
                    </span>
                  )}
                </div>

                {product.liveDemoUrl && (
                  <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs">
                    <span className="text-blue-900 font-semibold flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-blue-600" />
                      Live Interactive Preview Available
                    </span>
                    <a
                      href={product.liveDemoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                    >
                      Launch Live Demo
                    </a>
                  </div>
                )}

                <p className="mt-4 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {product.description}
                </p>

                <div className="mt-6 space-y-2 pt-4 border-t border-neutral-100">
                  <span className="block text-xs font-bold uppercase tracking-wider text-neutral-500">
                    Select License Tier
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {LICENSE_TIERS.map(tier => (
                      <button
                        key={tier.name}
                        onClick={() => setSelectedLicense(tier.name)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          selectedLicense === tier.name
                            ? 'border-[#F58220] bg-orange-50/60 shadow-xs'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <div className="text-xs font-bold text-neutral-900">{tier.name}</div>
                        <div className="text-[10px] text-neutral-500 mt-0.5">
                          {tier.description}
                        </div>
                        <div className="text-[11px] font-extrabold text-neutral-800 mt-1 tabular-nums">
                          {formatPrice(priceForVariant(product.price, tier.name))}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-3">
                  <div className="flex items-center border border-neutral-300 rounded-xl overflow-hidden bg-white">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 transition-colors font-bold text-sm"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="px-3 py-2 text-xs font-extrabold text-neutral-900 min-w-8 text-center tabular-nums">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(maxQuantity, prev + 1))}
                      className="px-3 py-2 text-neutral-600 hover:bg-neutral-100 transition-colors font-bold text-sm"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#F58220]" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex-1 min-w-[140px] py-3 px-5 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    <span>Instant Checkout</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-neutral-100 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#F58220] shrink-0" />
                    <span>Instant On-Screen Delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#F58220] shrink-0" />
                    <span>100% Genuine Licenses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-[#F58220] shrink-0" />
                    <span>7 Days Replacement Policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications & Description Tabs */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-6 sm:p-8 mb-10">
          <div className="flex items-center gap-4 border-b border-neutral-200 pb-3 mb-6 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors relative ${
                activeTab === 'specs' ? 'text-[#F58220]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Digital Specifications
              {activeTab === 'specs' && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#F58220]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('desc')}
              className={`pb-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors relative ${
                activeTab === 'desc' ? 'text-[#F58220]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Key Highlights & Features
              {activeTab === 'desc' && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#F58220]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`pb-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors relative ${
                activeTab === 'warranty' ? 'text-[#F58220]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              License SLA & Guarantee
              {activeTab === 'warranty' && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#F58220]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors relative ${
                activeTab === 'reviews' ? 'text-[#F58220]' : 'text-neutral-500 hover:text-neutral-900'
              }`}
            >
              Customer Reviews
              {activeTab === 'reviews' && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-0.5 bg-[#F58220]" />
              )}
            </button>
          </div>

          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm text-left">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-neutral-50/70' : 'bg-white'}>
                      <td className="py-3 px-4 font-bold text-neutral-800 w-1/3 border-b border-neutral-100">
                        {key}
                      </td>
                      <td className="py-3 px-4 text-neutral-600 border-b border-neutral-100">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'desc' && (
            <div className="space-y-4 text-xs sm:text-sm text-neutral-700 leading-relaxed max-w-3xl">
              <p>{product.description}</p>
              {product.keyFeatures && product.keyFeatures.length > 0 && (
                <div className="pt-2">
                  <h4 className="font-bold text-neutral-900 mb-2">Key Highlights & Architecture:</h4>
                  <ul className="space-y-2 pl-4 list-disc text-neutral-600">
                    {product.keyFeatures.map((feat, i) => (
                      <li key={i}>{feat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {activeTab === 'warranty' && (
            <div className="space-y-3 text-xs sm:text-sm text-neutral-700 max-w-3xl leading-relaxed">
              <h4 className="font-bold text-neutral-900">Digital License Terms:</h4>
              <p>
                Every license is validated before dispatch. If any key fails activation, we
                guarantee immediate replacement.
              </p>
              <h4 className="font-bold text-neutral-900 pt-2">Automated Instant Dispatch:</h4>
              <p>
                Upon successful checkout, credentials and redemption instructions are rendered
                in your browser and saved to your account order history.
              </p>
              <h4 className="font-bold text-neutral-900 pt-2">License Format:</h4>
              <p className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#F58220]" />
                {product.fileFormat || 'Digital activation credentials'} ·{' '}
                {product.licenseType || 'Commercial License'}
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-neutral-50 border border-neutral-200">
                <div className="text-3xl font-black text-neutral-900">{product.rating}</div>
                <div>
                  <div className="flex text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(product.rating) ? 'fill-current' : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Based on {product.reviewCount} marketplace ratings from verified buyers
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-xs text-neutral-600 flex items-start gap-2">
                <KeyRound className="w-4 h-4 text-[#F58220] shrink-0 mt-0.5" />
                <span>
                  Reviews are collected after license delivery. Signed-in buyers can view their
                  own activation history from the account dashboard.
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-neutral-100 bg-white shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      Tanvir A. <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                    <span className="text-neutral-400">Verified Buyer · 2 days ago</span>
                  </div>
                  <div className="flex text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600">
                    Received genuine activation credentials in less than 30 seconds. Worked
                    immediately without any hassle.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-100 bg-white shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      Sabrina Y. <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                    <span className="text-neutral-400">Verified Buyer · 1 week ago</span>
                  </div>
                  <div className="flex text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600">
                    Direct genuine access, no shared logins. Clean instant checkout and fast key
                    delivery.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-neutral-100 bg-white shadow-2xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                      Fahim R. <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                    <span className="text-neutral-400">Verified Buyer · 2 weeks ago</span>
                  </div>
                  <div className="flex text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-600">
                    Full replacement guarantee and responsive support. Will purchase again for my
                    engineering team.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {related.length > 0 && (
          <div className="mb-12">
            <h3 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight mb-4">
              More {product.category}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
              {related.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

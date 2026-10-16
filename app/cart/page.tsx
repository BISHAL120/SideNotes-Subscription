'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useIsMounted } from '@/hooks/useIsMounted';
import { formatPrice } from '@/lib/format-price';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Tag,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    shipping,
    discount,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponChecking, setCouponChecking] = useState(false);
  const mounted = useIsMounted();

  const couponActive = !!appliedCoupon && subtotal >= appliedCoupon.minSpend;

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    if (!couponInput.trim()) return;
    setCouponChecking(true);
    const res = await applyCoupon(couponInput.trim());
    setCouponChecking(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  if (!mounted) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#F58220] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-500">Loading your shopping cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-20 h-20 rounded-full bg-white shadow-sm border border-neutral-200 mx-auto flex items-center justify-center text-neutral-400 mb-6">
            <ShoppingBag className="w-10 h-10 text-[#F58220]" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
            Your Shopping Cart is Empty
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mb-8 max-w-sm mx-auto">
            Looks like you haven&apos;t added any digital products yet. Explore our genuine SaaS subscriptions, developer templates, and software licenses.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold transition-transform hover:scale-105 shadow-md shadow-orange-500/20"
          >
            <span>Start Shopping Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-semibold">Shopping Cart</span>
        </nav>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Shopping Cart ({items.length} {items.length === 1 ? 'item' : 'items'})
          </h1>
          <button
            onClick={clearCart}
            className="text-xs text-neutral-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Cart</span>
          </button>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items List (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-lg border border-neutral-200/80 shadow-xs divide-y divide-neutral-100 overflow-hidden">
              {items.map((item, idx) => (
                <div
                  key={`${item.product.id}-${item.selectedVariant || ''}-${idx}`}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      className="relative w-20 h-20 rounded-xl bg-neutral-50 border border-neutral-200/60 overflow-hidden shrink-0"
                    >
                      <Image
                        src={item.product.images[0] ?? '/placeholder-product.png'}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-contain p-2"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                        {item.product.brand} · {item.product.category}
                      </span>
                      <Link
                        href={`/product/${item.product.slug}`}
                        className="text-sm font-bold text-neutral-900 hover:text-[#F58220] transition-colors truncate block"
                      >
                        {item.product.name}
                      </Link>

                      {item.selectedVariant && (
                        <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 font-medium">
                          <span>License: {item.selectedVariant}</span>
                        </div>
                      )}

                      <div className="text-xs font-bold text-neutral-900 tabular-nums mt-1">
                        {formatPrice(item.unitPrice ?? item.product.price)} each
                      </div>
                    </div>
                  </div>

                  {/* Right: Stepper, Item Total & Remove */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-neutral-100">
                    {/* Stepper */}
                    <div className="flex items-center border border-neutral-300 rounded-lg overflow-hidden bg-white">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant)
                        }
                        className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100 text-xs font-bold"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-extrabold text-neutral-900 min-w-6 text-center tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant)
                        }
                        className="px-2.5 py-1 text-neutral-600 hover:bg-neutral-100 text-xs font-bold"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Total Price for this item */}
                    <div className="text-right">
                      <span className="text-sm sm:text-base font-extrabold text-neutral-900 tabular-nums">
                        {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                      </span>
                    </div>

                    {/* Delete action */}
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-neutral-500 px-2">
              <Link
                href="/products"
                className="font-semibold text-[#F58220] hover:text-[#E66D10] flex items-center gap-1"
              >
                ← Continue Shopping
              </Link>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Secure Checkout Guarantee</span>
              </div>
            </div>
          </div>

          {/* Order Summary & Coupon (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Promo Code Card */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200/80 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-neutral-800 mb-3">
                <Tag className="w-4 h-4 text-[#F58220]" />
                <span>Have a Promo Code?</span>
              </div>

              {appliedCoupon ? (
                <div
                  className={`p-3 rounded-md border flex items-center justify-between ${
                    couponActive
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-neutral-50 border-neutral-200'
                  }`}
                >
                  <div>
                    <span className="text-xs font-bold text-orange-900 block">
                      {appliedCoupon.code} {couponActive ? 'Applied!' : 'Saved'}
                    </span>
                    <span className="text-[11px] text-orange-700">
                      {!couponActive
                        ? `Requires a minimum spend of ৳ ${appliedCoupon.minSpend.toLocaleString()}`
                        : appliedCoupon.discountPercent
                        ? `${appliedCoupon.discountPercent}% Discount applied`
                        : `Saved ৳ ${discount.toLocaleString()}`}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-xs font-bold text-orange-900 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      placeholder="Enter promo code"
                      aria-label="Promo code"
                      className="flex-1 px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-md text-neutral-900 uppercase focus:outline-none focus:border-[#F58220]"
                    />
                    <button
                      type="submit"
                      disabled={couponChecking}
                      className="px-4 py-2 bg-neutral-900 hover:bg-[#F58220] text-white text-xs font-bold rounded-md transition-colors disabled:opacity-60"
                    >
                      {couponChecking ? 'Checking...' : 'Apply'}
                    </button>
                  </div>
                  {couponError && (
                    <div role="alert" className="text-[11px] text-red-500 font-medium">
                      {couponError}
                    </div>
                  )}
                  <div className="text-[11px] text-neutral-500 leading-normal">
                    Promo codes are validated instantly against the live campaign list.
                  </div>
                </form>
              )}
            </div>

            {/* Total Breakdown Card */}
            <div className="bg-white p-6 rounded-lg border border-neutral-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-100">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Digital Delivery</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    <span className="text-emerald-600 uppercase font-extrabold text-[11px]">
                      FREE (Instant)
                    </span>
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Coupon Discount</span>
                    <span className="tabular-nums">- {formatPrice(discount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-neutral-100 flex items-baseline justify-between">
                <div>
                  <span className="text-sm font-extrabold text-neutral-900 block leading-tight">
                    Estimated Total
                  </span>
                  <span className="text-[10px] text-neutral-400">VAT & Taxes Included</span>
                </div>
                <span className="text-xl sm:text-2xl font-black text-neutral-900 tabular-nums">
                  {formatPrice(total)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-orange-500/20 block text-center"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

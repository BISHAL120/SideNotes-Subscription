'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useIsMounted } from '@/hooks/useIsMounted';
import { formatPrice } from '@/lib/format-price';
import { Order } from '@/types/product';
import {
  ShieldCheck,
  Zap,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  KeyRound,
  DownloadCloud,
  Copy,
  TicketPercent
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, discount, total, clearCart, appliedCoupon, applyCoupon } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    company: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [couponCode, setCouponCode] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const mounted = useIsMounted();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const res = await applyCoupon(couponCode.trim());
    setCouponLoading(false);
    setCouponMsg({ text: res.message, success: res.success });
    if (res.success) setCouponCode('');
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required for digital license delivery.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!/^(?:\+?880|0)1[3-9]\d{8}$/.test(formData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Please enter a valid Bangladeshi mobile number (e.g. 017XXXXXXXX).';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.fullName.trim(),
          customerEmail: formData.email.trim(),
          customerPhone: formData.phone.replace(/\s+/g, ''),
          company: formData.company.trim(),
          notes: formData.notes.trim(),
          couponCode: appliedCoupon?.code,
          paymentMethod,
          items: items.map(item => ({
            slug: item.product.slug,
            quantity: item.quantity,
            variant: item.selectedVariant
          }))
        })
      });

      const data = await res.json().catch(() => null);
      if (res.ok && data?.success && data.order) {
        setConfirmedOrder(data.order);
        clearCart();
      } else {
        setCouponMsg(null);
        setErrors(prev => ({ ...prev, submit: data?.error || 'Failed to place digital order.' }));
      }
    } catch {
      setErrors(prev => ({
        ...prev,
        submit: 'Network error while placing order. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyKey = (key: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  if (!mounted) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#F58220] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-500">Preparing secure checkout...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !confirmedOrder) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen py-16 text-center">
        <div className="max-w-md mx-auto px-4">
          <AlertCircle className="w-12 h-12 text-[#F58220] mx-auto mb-4" />
          <h1 className="text-xl font-bold text-neutral-900 mb-2">No Items in Checkout</h1>
          <p className="text-xs text-neutral-500 mb-6">
            Please add digital subscriptions or templates to your cart before proceeding to checkout.
          </p>
          <Link
            href="/products"
            className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-[#F58220] transition-colors"
          >
            Explore Digital Catalog
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
          <Link href="/cart" className="hover:text-neutral-900 transition-colors">
            Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-semibold">Digital Checkout</span>
        </nav>

        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mb-6">
          Complete Your Digital Order
        </h1>

        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer & Delivery Form (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Customer Details */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                  1. Licensee Information & Delivery Email
                </h2>
                <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Instant Key Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-name" className="block text-xs font-bold text-neutral-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'checkout-name-error' : undefined}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Asif Mahmud"
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-xl text-neutral-900 focus:outline-none ${
                      errors.fullName ? 'border-red-500' : 'border-neutral-300 focus:border-[#F58220]'
                    }`}
                  />
                  {errors.fullName && (
                    <span id="checkout-name-error" role="alert" className="text-[11px] text-red-500 mt-1 block">{errors.fullName}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="checkout-email" className="block text-xs font-bold text-neutral-700 mb-1">
                    Delivery Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? 'checkout-email-error' : undefined}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Where license keys will be dispatched"
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-xl text-neutral-900 focus:outline-none ${
                      errors.email ? 'border-red-500' : 'border-neutral-300 focus:border-[#F58220]'
                    }`}
                  />
                  {errors.email && (
                    <span id="checkout-email-error" role="alert" className="text-[11px] text-red-500 mt-1 block">{errors.email}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-phone" className="block text-xs font-bold text-neutral-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    aria-invalid={!!errors.phone}
                    aria-describedby={errors.phone ? 'checkout-phone-error' : undefined}
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="017XXXXXXXX"
                    className={`w-full px-3 py-2 text-xs bg-neutral-50 border rounded-xl text-neutral-900 focus:outline-none ${
                      errors.phone ? 'border-red-500' : 'border-neutral-300 focus:border-[#F58220]'
                    }`}
                  />
                  {errors.phone && (
                    <span id="checkout-phone-error" role="alert" className="text-[11px] text-red-500 mt-1 block">{errors.phone}</span>
                  )}
                </div>

                <div>
                  <label htmlFor="checkout-company" className="block text-xs font-bold text-neutral-700 mb-1">
                    Company / Organization (Optional)
                  </label>
                  <input
                    id="checkout-company"
                    type="text"
                    name="company"
                    autoComplete="organization"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="For commercial tax invoice"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:border-[#F58220]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-notes" className="block text-xs font-bold text-neutral-700 mb-1">
                  License Notes or Special Instructions (Optional)
                </label>
                <textarea
                  id="checkout-notes"
                  name="notes"
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="e.g. Please assign license to my corporate email domain"
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 focus:outline-none focus:border-[#F58220]"
                />
              </div>
            </div>

            {/* Payment Gateway Selector */}
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-100">
                2. Instant Digital Payment Method
              </h2>

              <div className="space-y-3">
                {/* bKash */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'bkash'
                      ? 'border-[#F58220] bg-orange-50/50 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'bkash'}
                    onChange={() => setPaymentMethod('bkash')}
                    className="mt-0.5 accent-[#F58220]"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                      <span>bKash Direct Gateway</span>
                      <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                        Fastest 60s Delivery
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Pay instantly with bKash app or USSD. Your license keys are generated immediately.
                    </p>
                  </div>
                </label>

                {/* Nagad */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'nagad'
                      ? 'border-[#F58220] bg-orange-50/50 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'nagad'}
                    onChange={() => setPaymentMethod('nagad')}
                    className="mt-0.5 accent-[#F58220]"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                      <span>Nagad Direct Gateway</span>
                      <span className="text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                        Zero Charge
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Secure Nagad automated API checkout with real-time verification.
                    </p>
                  </div>
                </label>

                {/* Credit / Debit Card & EMI */}
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#F58220] bg-orange-50/50 shadow-xs'
                      : 'border-neutral-200 bg-white hover:border-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="mt-0.5 accent-[#F58220]"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-bold text-neutral-900 flex items-center justify-between">
                      <span>Credit Card / 0% EMI (Visa, MasterCard, Amex)</span>
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Corporate Ready
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Global cards accepted. 0% EMI installments supported on 28+ leading Bangladeshi banks.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 sticky top-24">
              <h3 className="font-extrabold text-sm text-neutral-900 uppercase tracking-wider pb-3 border-b border-neutral-100">
                Order Review ({items.length} Digital Items)
              </h3>

              {/* Items scroll */}
              <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar divide-y divide-neutral-100">
                {items.map((item, idx) => (
                  <div key={`${item.product.id}-${item.selectedVariant || ''}-${idx}`} className="pt-2 first:pt-0 flex items-center gap-3">
                    <div className="w-12 h-12 relative rounded-xl bg-neutral-900 overflow-hidden shrink-0 border border-neutral-200">
                      <Image
                        src={item.product.images[0] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'}
                        alt={item.product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="font-bold text-neutral-900 truncate">{item.product.name}</div>
                      <div className="text-[10px] text-neutral-400">
                        {item.selectedVariant || item.product.digitalAssetType || 'SUBSCRIPTION'} · Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-xs font-bold text-neutral-900 tabular-nums">
                      {formatPrice((item.unitPrice ?? item.product.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Coupon Voucher Application */}
              <div className="pt-3 border-t border-neutral-100 space-y-2">
                {appliedCoupon ? (
                  <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-orange-900 block">
                        {appliedCoupon.code} applied
                      </span>
                      <span className="text-[11px] text-orange-700">
                        {subtotal >= appliedCoupon.minSpend
                          ? `Saving ${formatPrice(discount)} on this order`
                          : `Requires a minimum spend of ৳ ${appliedCoupon.minSpend.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value.toUpperCase())}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyCoupon();
                            }
                          }}
                          placeholder="Promo code (e.g. DIGITAL20)"
                          aria-label="Promo code"
                          className="w-full pl-8 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-xl font-mono uppercase focus:outline-none focus:border-[#F58220]"
                        />
                        <TicketPercent className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={couponLoading}
                        className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-[#F58220] text-white text-xs font-bold transition-colors disabled:opacity-60"
                      >
                        {couponLoading ? 'Checking...' : 'Apply'}
                      </button>
                    </div>
                    {couponMsg && (
                      <p
                        role="alert"
                        className={`text-[11px] font-semibold ${
                          couponMsg.success ? 'text-emerald-600' : 'text-red-500'
                        }`}
                      >
                        {couponMsg.text}
                      </p>
                    )}
                  </>
                )}
              </div>

              {errors.submit && (
                <div
                  role="alert"
                  className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-[11px] font-semibold flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errors.submit}</span>
                </div>
              )}

              <div className="pt-3 border-t border-neutral-100 space-y-2 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900 tabular-nums">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Digital Delivery</span>
                  <span className="text-emerald-600 font-bold">FREE (Instant)</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Discount Voucher</span>
                    <span className="tabular-nums">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="pt-3 border-t border-neutral-100 flex items-baseline justify-between">
                  <span className="text-sm font-black text-neutral-900">Total Payable</span>
                  <span className="text-xl font-black text-neutral-900 tabular-nums">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] shadow-lg shadow-orange-500/20 disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Generating Digital Licenses...' : 'Confirm & Generate Licenses'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-neutral-500 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Genuine Licenses with Official Replacement Guarantee</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Confirmation Modal with Real Delivered License Keys */}
      {confirmedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 text-center shadow-2xl border border-neutral-200 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center mb-4">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-black text-neutral-900 tracking-tight mb-1">
              Payment Confirmed & Licenses Delivered!
            </h2>
            <p className="text-xs text-neutral-500 mb-6">
              Thank you, <strong className="text-neutral-800">{confirmedOrder.customerName}</strong>. Your digital credentials have been generated for <strong className="text-neutral-800">{confirmedOrder.customerEmail}</strong> and are listed below.
            </p>

            {/* Generated License Keys Box */}
            <div className="p-4 rounded-xl bg-neutral-950 text-white text-left space-y-3 mb-6">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-300 pb-2 border-b border-neutral-800">
                <span className="flex items-center gap-1.5 text-purple-400">
                  <KeyRound className="w-4 h-4" />
                  Your Activation Keys:
                </span>
                <span className="font-mono text-[11px] text-neutral-400">{confirmedOrder.orderNumber}</span>
              </div>

              <div className="space-y-2">
                {confirmedOrder.licenseKeysDelivered?.map((key, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-900 border border-neutral-800"
                  >
                    <span className="font-mono text-xs text-emerald-400 font-bold select-all">
                      {key}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(key)}
                      className="px-2 py-1 rounded bg-neutral-800 hover:bg-[#F58220] text-white text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedKey === key ? 'Copied!' : 'Copy Key'}</span>
                    </button>
                  </div>
                ))}
              </div>

              {confirmedOrder.downloadLinks && confirmedOrder.downloadLinks.length > 0 && (
                <div className="pt-2 border-t border-neutral-800">
                  <span className="text-[11px] text-neutral-400 block mb-1.5">Direct Download Access:</span>
                  {confirmedOrder.downloadLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:underline mr-3"
                    >
                      <DownloadCloud className="w-3.5 h-3.5" />
                      <span>Download Digital Package #{idx + 1}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => router.push('/account')}
                className="w-full py-3 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold transition-colors"
              >
                View in My Account & Saved Licenses
              </button>
              <button
                onClick={() => router.push('/')}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold transition-colors"
              >
                Return to Storefront
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

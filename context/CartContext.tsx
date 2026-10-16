'use client';

import React, { createContext, useContext, useState, useSyncExternalStore, useCallback } from 'react';
import { Product, CartItem, Coupon } from '@/types/product';
import { priceForVariant } from '@/lib/license-tiers';

export interface CouponResult {
  success: boolean;
  message: string;
}

interface ToastState {
  id: number;
  message: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: string) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: string) => void;
  clearCart: () => void;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<CouponResult>;
  removeCoupon: () => void;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  totalItems: number;
  toast: ToastState | null;
  dismissToast: () => void;
}

const MAX_QUANTITY = 20;
const CartContext = createContext<CartContextType | undefined>(undefined);

const cartListeners = new Set<() => void>();

function emitCartChange() {
  cartListeners.forEach(listener => listener());
}

function subscribeCart(callback: () => void) {
  cartListeners.add(callback);
  const onStorage = (event: StorageEvent) => {
    if (event.key === 'sidenote_cart' || event.key === 'sidenote_coupon') {
      callback();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    cartListeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

const EMPTY_CART: CartItem[] = [];
const EMPTY_COUPON: Coupon | null = null;

let cachedCartRaw = '';
let cachedCartParsed: CartItem[] = EMPTY_CART;

function sanitizeCart(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return EMPTY_CART;

  const items: CartItem[] = [];
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Partial<CartItem>;
    const product = item.product as Product | undefined;
    const quantity = Number(item.quantity);

    if (!product || typeof product.id !== 'string' || typeof product.slug !== 'string') continue;
    if (!Number.isFinite(Number(product.price))) continue;
    if (!Number.isFinite(quantity) || quantity <= 0) continue;

    items.push({
      product: {
        ...product,
        price: Number(product.price),
        images: Array.isArray(product.images) ? product.images : [],
      },
      quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity))),
      unitPrice: Number.isFinite(Number(item.unitPrice))
        ? Number(item.unitPrice)
        : Number(product.price),
      selectedVariant:
        typeof item.selectedVariant === 'string' ? item.selectedVariant : undefined,
    });
  }

  return items;
}

function getCartSnapshot(): CartItem[] {
  try {
    const raw = localStorage.getItem('sidenote_cart') || '[]';
    if (raw !== cachedCartRaw) {
      cachedCartRaw = raw;
      cachedCartParsed = sanitizeCart(JSON.parse(raw));
      if (cachedCartParsed.length === 0) cachedCartParsed = EMPTY_CART;
    }
    return cachedCartParsed;
  } catch {
    cachedCartRaw = '';
    cachedCartParsed = EMPTY_CART;
    return EMPTY_CART;
  }
}

function getCartServerSnapshot(): CartItem[] {
  return EMPTY_CART;
}

let cachedCouponRaw = 'null';
let cachedCouponParsed: Coupon | null = EMPTY_COUPON;

function sanitizeCoupon(value: unknown): Coupon | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const coupon = value as Partial<Coupon>;
  if (typeof coupon.code !== 'string' || coupon.code.trim() === '') return null;
  return {
    code: coupon.code,
    discountAmount:
      coupon.discountAmount === undefined ? undefined : Number(coupon.discountAmount),
    discountPercent:
      coupon.discountPercent === undefined ? undefined : Number(coupon.discountPercent),
    minSpend: Number.isFinite(Number(coupon.minSpend)) ? Number(coupon.minSpend) : 0,
    description: typeof coupon.description === 'string' ? coupon.description : '',
  };
}

function getCouponSnapshot(): Coupon | null {
  try {
    const raw = localStorage.getItem('sidenote_coupon') || 'null';
    if (raw !== cachedCouponRaw) {
      cachedCouponRaw = raw;
      cachedCouponParsed = sanitizeCoupon(JSON.parse(raw));
    }
    return cachedCouponParsed;
  } catch {
    cachedCouponRaw = 'null';
    cachedCouponParsed = EMPTY_COUPON;
    return EMPTY_COUPON;
  }
}

function getCouponServerSnapshot(): Coupon | null {
  return EMPTY_COUPON;
}

function saveCartToStorage(items: CartItem[]): boolean {
  try {
    localStorage.setItem('sidenote_cart', JSON.stringify(items));
    emitCartChange();
    return true;
  } catch {
    return false;
  }
}

function saveCouponToStorage(coupon: Coupon | null): boolean {
  try {
    localStorage.setItem('sidenote_coupon', JSON.stringify(coupon));
    emitCartChange();
    return true;
  } catch {
    return false;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const items = useSyncExternalStore(subscribeCart, getCartSnapshot, getCartServerSnapshot);
  const appliedCoupon = useSyncExternalStore(
    subscribeCart,
    getCouponSnapshot,
    getCouponServerSnapshot
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string) => {
    setToast({ id: Date.now(), message });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const removeFromCart = useCallback(
    (productId: string, selectedVariant?: string) => {
      const current = getCartSnapshot();
      const updated = current.filter(
        item => !(item.product.id === productId && item.selectedVariant === selectedVariant)
      );
      saveCartToStorage(updated);
      showToast('Item removed from cart.');
    },
    [showToast]
  );

  const addToCart = useCallback(
    (product: Product, quantity: number = 1, selectedVariant?: string) => {
      const current = getCartSnapshot();
      const safeQuantity = Math.min(
        MAX_QUANTITY,
        Math.max(1, Math.trunc(Number(quantity)) || 1)
      );
      const unitPrice = priceForVariant(product.price, selectedVariant);
      const existingIndex = current.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedVariant === selectedVariant &&
          (item.unitPrice ?? item.product.price) === unitPrice
      );

      const updated =
        existingIndex > -1
          ? current.map((item, index) =>
              index === existingIndex
                ? { ...item, quantity: Math.min(MAX_QUANTITY, item.quantity + safeQuantity) }
                : item
            )
          : [
              ...current,
              {
                product: {
                  ...product,
                  images: Array.isArray(product.images) ? product.images : [],
                },
                quantity: safeQuantity,
                unitPrice,
                selectedVariant,
              },
            ];

      const saved = saveCartToStorage(updated);
      showToast(
        saved
          ? `Added "${product.name}" to cart!`
          : 'Could not save your cart — browser storage is unavailable.'
      );
    },
    [showToast]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number, selectedVariant?: string) => {
      if (quantity <= 0) {
        removeFromCart(productId, selectedVariant);
        return;
      }
      const current = getCartSnapshot();
      const updated = current.map(item =>
        item.product.id === productId && item.selectedVariant === selectedVariant
          ? { ...item, quantity: Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(quantity))) }
          : item
      );
      saveCartToStorage(updated);
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    saveCartToStorage([]);
    saveCouponToStorage(null);
  }, []);

  const subtotal = items.reduce(
    (sum, item) => sum + (item.unitPrice ?? item.product.price) * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const shipping = 0;

  let calculatedDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minSpend) {
    if (appliedCoupon.discountPercent) {
      calculatedDiscount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      calculatedDiscount = appliedCoupon.discountAmount;
    }
  }
  const discount = Math.min(calculatedDiscount, subtotal);
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = useCallback(
    async (code: string): Promise<CouponResult> => {
      const cleanCode = code.trim().toUpperCase();
      if (!cleanCode) return { success: false, message: 'Please enter a promo code.' };

      try {
        const res = await fetch('/api/coupons/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: cleanCode, subtotal }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.success || !data?.valid) {
          return {
            success: false,
            message: data?.message || 'Invalid or expired promo code.',
          };
        }

        const coupon = sanitizeCoupon(data.coupon) ?? {
          code: typeof data.code === 'string' ? data.code : cleanCode,
          discountAmount: Number(data.discount) || 0,
          minSpend: 0,
          description: '',
        };
        saveCouponToStorage(coupon);
        showToast(data.message || `Coupon "${coupon.code}" applied!`);
        return { success: true, message: data.message || `Coupon "${coupon.code}" applied!` };
      } catch {
        return { success: false, message: 'Could not verify the promo code. Please try again.' };
      }
    },
    [subtotal, showToast]
  );

  const removeCoupon = useCallback(() => {
    saveCouponToStorage(null);
    showToast('Promo code removed.');
  }, [showToast]);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        subtotal,
        discount,
        shipping,
        total,
        totalItems,
        toast,
        dismissToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  KeyRound,
  DownloadCloud,
  ShieldCheck,
  ChevronRight,
  Phone,
  Clock,
  CheckCircle2,
  ExternalLink,
  Copy,
  LogOut,
  LayoutDashboard,
  User,
  LogIn,
  AlertCircle
} from 'lucide-react';
import { Order } from '@/types/product';
import { authClient } from '@/lib/auth-client';
import { formatPrice } from '@/lib/format-price';

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [activeTab, setActiveTab] = useState<'licenses' | 'orders' | 'warranty'>('licenses');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    let cancelled = false;

    fetch('/api/orders')
      .then(async res => {
        const data = await res.json().catch(() => null);
        if (!res.ok || !data?.success) {
          throw new Error(data?.error || `Request failed (${res.status})`);
        }
        return data.orders as Order[];
      })
      .then(fetchedOrders => {
        if (!cancelled) setOrders(fetchedOrders);
      })
      .catch((error: Error) => {
        if (!cancelled) {
          console.error('[account] Failed to load orders:', error.message);
          setOrdersError('We could not load your licenses right now. Please try again.');
        }
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, reloadKey]);

  const handleCopyKey = (key: string) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch {}
    router.push('/login');
  };

  if (isPending) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen py-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#F58220] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-500 font-medium">Loading your digital account...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-neutral-200 mx-auto flex items-center justify-center text-neutral-400 mb-4">
            <User className="w-8 h-8 text-[#F58220]" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight mb-2">
            Sign In Required
          </h1>
          <p className="text-xs text-neutral-500 mb-6 leading-relaxed">
            Please log in with your verified account to view your purchased digital licenses, activation keys, and downloads.
          </p>
          <div className="flex flex-col gap-2.5">
            <Link
              href="/login?callbackUrl=/account"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md shadow-orange-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Account</span>
            </Link>
            <Link
              href="/register"
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-300 text-xs font-bold transition-colors"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const user = session.user as { name: string; email: string; role?: string; emailVerified?: boolean };
  const userRole = user.role || 'user';
  const memberLabel = userRole === 'admin' ? 'Administrator' : user.emailVerified ? 'Verified Member' : 'Member';

  return (
    <div className="bg-[#F7F8FA] min-h-screen py-6 sm:py-8">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-neutral-500 mb-6">
          <Link href="/" className="hover:text-neutral-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-neutral-900 font-semibold">My Account</span>
        </nav>

        {/* User Profile Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#E66D10] to-[#F58220] flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-orange-500/20">
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900">
                  {user.name}
                </h1>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase ${
                    userRole === 'admin'
                      ? 'bg-orange-100 text-[#F58220]'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {memberLabel}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {userRole === 'admin' && (
              <Link
                href="/admin"
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#F58220]" />
                <span>Admin Dashboard</span>
              </Link>
            )}


            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-neutral-200 hover:bg-neutral-100 text-neutral-600 hover:text-red-500 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar (3 Cols) */}
          <div className="lg:col-span-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
            <button
              onClick={() => setActiveTab('licenses')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'licenses'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <KeyRound className="w-4 h-4 text-[#F58220]" />
              <span>Digital Licenses & Keys</span>
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'orders'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Package className="w-4 h-4 text-[#F58220]" />
              <span>Order History & Invoices</span>
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'warranty'
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#F58220]" />
              <span>Warranty & Support SLA</span>
            </button>
          </div>

          {/* Tab Content (9 Cols) */}
          <div className="lg:col-span-9 space-y-6">
            {/* TAB 1: Digital Licenses & Direct Downloads */}
            {activeTab === 'licenses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#F58220]" />
                    <span>Active Digital Licenses & Downloads</span>
                  </h2>
                  <span className="text-xs text-neutral-500">
                    {orders.flatMap(o => o.licenseKeysDelivered).length} Total Licenses Issued
                  </span>
                </div>

                {ordersLoading ? (
                  <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-xs text-neutral-500">
                    Loading your digital licenses...
                  </div>
                ) : ordersError ? (
                  <div className="bg-white p-12 rounded-2xl border border-red-200 text-center">
                    <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
                    <p className="text-xs text-neutral-600 mb-4">{ordersError}</p>
                    <button
                      onClick={() => {
                        setOrdersError(null);
                        setOrdersLoading(true);
                        setReloadKey(key => key + 1);
                      }}
                      className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
                    >
                      Retry
                    </button>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center">
                    <KeyRound className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <h3 className="text-sm font-bold text-neutral-800">No Digital Licenses Yet</h3>
                    <p className="text-xs text-neutral-500 mt-1 mb-6">
                      Explore our digital catalog to purchase AI memberships, software keys, or codebases.
                    </p>
                    <Link
                      href="/products"
                      className="px-4 py-2 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <span>Explore Catalog</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order =>
                      order.items.map((item, idx) => {
                        const deliveredKey = order.licenseKeysDelivered[idx] || order.licenseKeysDelivered[0];
                        const downloadLink = order.downloadLinks[idx] || order.downloadLinks[0] || item.product.downloadUrl;

                        return (
                          <div
                            key={`${order.id}-${idx}`}
                            className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-4 hover:border-orange-200 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-orange-100 text-[#F58220]">
                                    {item.product.digitalAssetType || 'LICENSE'}
                                  </span>
                                  <span className="text-xs font-bold text-neutral-900">
                                    {item.product.name}
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-500 mt-1 flex items-center gap-3">
                                  <span>Order #{order.orderNumber}</span>
                                  <span>•</span>
                                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  <span className="text-emerald-600 font-bold">100% Genuine</span>
                                </div>
                              </div>

                              {downloadLink && (
                                <a
                                  href={downloadLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shrink-0"
                                >
                                  <DownloadCloud className="w-4 h-4 text-[#F58220]" />
                                  <span>Direct Download</span>
                                  <ExternalLink className="w-3 h-3 text-neutral-400" />
                                </a>
                              )}
                            </div>

                            {/* License Key Box */}
                            {deliveredKey && (
                              <div className="p-3.5 rounded-xl bg-neutral-950 text-white border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <div className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold mb-1">
                                    Serial License Activation Key
                                  </div>
                                  <code className="text-sm font-mono font-bold text-orange-400 tracking-wider">
                                    {deliveredKey}
                                  </code>
                                </div>

                                <button
                                  onClick={() => handleCopyKey(deliveredKey)}
                                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors shrink-0"
                                >
                                  {copiedKey === deliveredKey ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                                      <span>Copy Key</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            )}

                            {/* Details meta */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-neutral-600 pt-2 border-t border-neutral-100">
                              <div>
                                <span className="text-neutral-400 block">License Type:</span>
                                <span className="font-semibold text-neutral-800">
                                  {item.product.licenseType || 'Commercial'}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block">Format:</span>
                                <span className="font-semibold text-neutral-800">
                                  {item.product.fileFormat || 'Direct Access'}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block">Version:</span>
                                <span className="font-semibold text-neutral-800">
                                  {item.product.version || '2026 Production'}
                                </span>
                              </div>
                              <div>
                                <span className="text-neutral-400 block">Warranty:</span>
                                <span className="font-semibold text-emerald-600">
                                  7-Day Replacement
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Order History */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#F58220]" />
                  <span>Order History & Invoices</span>
                </h2>

                {ordersLoading ? (
                  <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-xs text-neutral-500">
                    Loading your orders...
                  </div>
                ) : ordersError ? (
                  <div className="bg-white p-12 rounded-2xl border border-red-200 text-center text-xs text-neutral-600">
                    {ordersError}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center text-xs text-neutral-500">
                    No orders placed yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map(order => (
                      <div
                        key={order.id}
                        className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                          <div>
                            <span className="text-xs font-bold text-neutral-900 block">
                              Order #{order.orderNumber}
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-700">
                              {order.orderStatus}
                            </span>
                            <span className="text-sm font-black text-neutral-900 tabular-nums">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {order.items.map((it, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <span className="text-neutral-700 font-medium">
                                {it.product.name}
                                {it.selectedVariant ? ` · ${it.selectedVariant}` : ''} × {it.quantity}
                              </span>
                              <span className="font-bold text-neutral-900">
                                {formatPrice((it.unitPrice ?? it.product.price) * it.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[11px] text-neutral-500 border-t border-neutral-100">
                          <span>Paid via: <strong className="text-neutral-800 uppercase">{order.paymentMethod}</strong></span>
                          <span>Delivered to: <strong className="text-neutral-800">{order.customerEmail}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Warranty & Support SLA */}
            {activeTab === 'warranty' && (
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-xs space-y-6">
                <div>
                  <h2 className="text-lg font-black text-neutral-900 tracking-tight flex items-center gap-2 mb-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>Official 7-Day Replacement Guarantee</span>
                  </h2>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    All digital licenses, software activation keys, and SaaS accounts sold by SideNote Subscriptions come backed by our unconditional 7-Day Replacement Policy. If an activation key fails or an account credential encounters an issue, our automated support engine dispatches a replacement within minutes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                      <Clock className="w-4 h-4 text-[#F58220]" />
                      <span>Support Hours</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Our live engineer hotline is active everyday from 9:00 AM to 10:00 PM BST. Automated digital delivery operates 24/7.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-900">
                      <Phone className="w-4 h-4 text-[#F58220]" />
                      <span>Dedicated Hotline</span>
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Need immediate help activating a key? Call <strong className="text-neutral-900">09678148148</strong> or message support@sidenote.app.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Product, Category, Order, Coupon, UserProfile } from '@/types/product';
import { SiteCmsData, HeroSlide } from '@/types/cms';
import { formatPrice } from '@/lib/format-price';
import { authClient } from '@/lib/auth-client';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  TicketPercent,
  Users,
  Settings,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Save,
  Globe,
  Shield,
  FileText,
  Phone,
  LogOut,
  RefreshCw,
  Sliders,
  DollarSign,
  TrendingUp,
  DownloadCloud,
  KeyRound
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();

  // Active navigation tab
  const [activeNav, setActiveNav] = useState<
    'overview' | 'cms' | 'products' | 'categories' | 'orders' | 'coupons' | 'users'
  >('overview');

  // CMS active sub-tab
  const [cmsTab, setCmsTab] = useState<
    'announcement' | 'hero' | 'trust' | 'banners' | 'store' | 'policies'
  >('hero');

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [cmsContent, setCmsContent] = useState<SiteCmsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modals & form state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: '',
    discountPercent: 15,
    minSpend: 3000,
    description: 'Special Promotion Discount',
    isActive: true
  });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
    iconName: 'Sparkles',
    description: ''
  });

  // Search & filter
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');

  // Notification helper
  const notify = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const { data: session, isPending: sessionPending } = authClient.useSession();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
    } catch {}
    router.push('/login');
  };

  // Initial data fetch
  const fetchData = async () => {
    try {
      const [prodRes, catRes, ordRes, coupRes, usrRes, cmsRes] = await Promise.all([
        fetch('/api/products').then(r => r.json()),
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/orders').then(r => r.json()),
        fetch('/api/coupons').then(r => r.json()),
        fetch('/api/users').then(r => r.json()),
        fetch('/api/content').then(r => r.json())
      ]);

      if (prodRes.success) setProducts(prodRes.products);
      if (catRes.success) setCategories(catRes.categories);
      if (ordRes.success) setOrders(ordRes.orders);
      if (coupRes.success) setCoupons(coupRes.coupons);
      if (usrRes.success) setUsers(usrRes.users);
      if (cmsRes.success) setCmsContent(cmsRes.content);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && (session.user as { role?: string })?.role === 'admin') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time dashboard hydration after sign-in
      fetchData();
    }
  }, [session]);

  // -------------------------------------------------------------
  // CMS Save Handler
  // -------------------------------------------------------------
  const handleSaveCms = async () => {
    if (!cmsContent) return;
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cmsContent)
      });
      const data = await res.json();
      if (data.success) {
        notify('Website content updated successfully! Changes are live on the storefront.');
      } else {
        notify('Failed to update content', 'error');
      }
    } catch {
      notify('Network error updating CMS content', 'error');
    }
  };

  // -------------------------------------------------------------
  // Product Handlers
  // -------------------------------------------------------------
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price) {
      notify('Please enter a product name and price', 'error');
      return;
    }

    try {
      const isEditing = !!editingProduct.id;
      const url = isEditing ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      const data = await res.json();

      if (data.success) {
        notify(isEditing ? 'Product updated successfully!' : 'New digital product created!');
        setProductModalOpen(false);
        setEditingProduct(null);
        fetchData();
      } else {
        notify(data.error || 'Failed to save product', 'error');
      }
    } catch {
      notify('Error saving product', 'error');
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        notify('Product deleted.');
        fetchData();
      } else {
        notify(data?.error || 'Failed to delete product', 'error');
      }
    } catch {
      notify('Error deleting product', 'error');
    }
  };

  // -------------------------------------------------------------
  // Order Status Handler
  // -------------------------------------------------------------
  const handleUpdateOrderStatus = async (orderId: string, status: Order['orderStatus']) => {
    const previousStatus = orders.find(order => order.id === orderId)?.orderStatus;
    setOrders(prev =>
      prev.map(order => (order.id === orderId ? { ...order, orderStatus: status } : order))
    );

    const rollback = () => {
      if (!previousStatus) return;
      setOrders(prev =>
        prev.map(order => (order.id === orderId ? { ...order, orderStatus: previousStatus } : order))
      );
    };

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        rollback();
        notify(data?.error || 'Failed to update order status', 'error');
        return;
      }
      notify(`Order ${data.order?.orderNumber || orderId} marked ${status}.`);
    } catch {
      rollback();
      notify('Failed to update order status', 'error');
    }
  };

  // -------------------------------------------------------------
  // User Role Handler
  // -------------------------------------------------------------
  const handleToggleUserRole = async (userId: string, currentRole: 'admin' | 'user') => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change this account role to ${newRole.toUpperCase()}?`)) return;

    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        notify(`User permissions updated to ${newRole.toUpperCase()}`);
        fetchData();
      } else {
        notify(data?.error || 'Failed to update user role', 'error');
      }
    } catch {
      notify('Failed to update user role', 'error');
    }
  };

  // -------------------------------------------------------------
  // Coupon Handlers
  // -------------------------------------------------------------
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        notify(`Coupon ${newCoupon.code} created!`);
        setCouponModalOpen(false);
        setNewCoupon({ code: '', discountPercent: 15, minSpend: 3000, description: '' });
        fetchData();
      } else {
        notify(data?.error || 'Failed to save coupon', 'error');
      }
    } catch {
      notify('Failed to save coupon', 'error');
    }
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name?.trim()) {
      notify('Please enter a category name', 'error');
      return;
    }
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        notify(`Category ${newCategory.name} created!`);
        setCategoryModalOpen(false);
        setNewCategory({ name: '', slug: '', iconName: 'Sparkles', description: '' });
        fetchData();
      } else {
        notify(data?.error || 'Failed to create category', 'error');
      }
    } catch {
      notify('Failed to create category', 'error');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Remove this coupon?')) return;
    try {
      const res = await fetch(`/api/coupons/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        notify('Coupon removed.');
        fetchData();
      } else {
        notify(data?.error || 'Failed to delete coupon', 'error');
      }
    } catch {
      notify('Failed to delete coupon', 'error');
    }
  };

  // Filtered views
  const filteredProducts = products.filter(
    p =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(
    o =>
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customerEmail.toLowerCase().includes(orderSearch.toLowerCase())
  );

  // Statistics calculations
  const totalRevenue = orders.reduce(
    (sum, o) => sum + (o.paymentStatus === 'PAID' ? o.total : 0),
    0
  );
  const totalCompletedOrders = orders.filter(o => o.orderStatus === 'COMPLETED').length;
  const totalLicenses = orders.reduce(
    (sum, o) => sum + (o.licenseKeysDelivered?.length || 0),
    0
  );

  if (sessionPending) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#F58220] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-neutral-400 font-medium">Verifying administrator authorization...</p>
        </div>
      </div>
    );
  }

  const currentRole = (session?.user as { role?: string })?.role;
  if (!session || currentRole !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#181818] border border-neutral-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-white">Access Denied</h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Administrator privileges required. You do not have permission to view or manage the administration portal.
          </p>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              href="/login?callbackUrl=/admin"
              className="w-full py-2.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold inline-flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
            >
              <span>Sign In as Admin</span>
            </Link>
            <Link
              href="/"
              className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold transition-colors"
            >
              Return to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-neutral-100 flex flex-col md:flex-row antialiased selection:bg-[#F58220] selection:text-white">
      {/* 1. Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#141414] border-r border-neutral-800 flex flex-col shrink-0">
        {/* Brand Bar */}
        <div className="p-5 border-b border-neutral-800 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#F58220] to-[#E66D10] flex items-center justify-center font-black text-white text-lg shadow-md shadow-orange-500/20">
              S
            </div>
            <div className="flex flex-col leading-none">
              <div className="flex items-center">
                <span className="text-base font-black tracking-tight text-white">Side</span>
                <span className="text-base font-black tracking-tight text-[#F58220]">Note</span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                Admin Suite
              </span>
            </div>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="p-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
            title="View Live Storefront"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
          <button
            onClick={() => setActiveNav('overview')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'overview'
                ? 'bg-[#F58220] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Overview</span>
          </button>

          <button
            onClick={() => setActiveNav('cms')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'cms'
                ? 'bg-[#F58220] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Full Site CMS Editor</span>
            </div>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/20 text-emerald-400 uppercase">
              Live
            </span>
          </button>

          <button
            onClick={() => setActiveNav('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'products'
                ? 'bg-[#F58220] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4" />
              <span>Digital Products</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono font-semibold">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('categories')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'categories'
                ? 'bg-[#F58220] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Layers className="w-4 h-4" />
              <span>Categories</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono font-semibold">
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'orders'
                ? 'bg-[#F58220] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-4 h-4" />
              <span>Orders & Deliveries</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono font-semibold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('coupons')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'coupons'
                ? 'bg-[#F58220] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <TicketPercent className="w-4 h-4" />
              <span>Promo Vouchers</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono font-semibold">
              {coupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveNav('users')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeNav === 'users'
                ? 'bg-[#F58220] text-white shadow-lg shadow-orange-500/20'
                : 'text-neutral-400 hover:bg-neutral-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4" />
              <span>Users & Roles</span>
            </div>
            <span className="text-[10px] text-neutral-400 font-mono font-semibold">
              {users.length}
            </span>
          </button>
        </nav>

        {/* Admin User Footer Card */}
        <div className="p-4 border-t border-neutral-800 bg-[#111111] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/30 text-[#F58220] flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-white">Admin Console</div>
              <div className="text-[10px] text-emerald-400 font-mono">Better Auth Role: admin</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#0E0E0E] overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-[#141414]/90 backdrop-blur-md border-b border-neutral-800 px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-black tracking-tight text-white capitalize">
              {activeNav === 'cms' ? 'Website Content Management System (CMS)' : activeNav}
            </h1>
            <p className="text-[11px] text-neutral-400">
              Manage digital licenses, SaaS deliveries, and live website components.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-neutral-700"
              title="Refresh Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="py-2 px-3.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-[#F58220] border border-orange-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Live Website</span>
            </Link>
          </div>
        </header>

        {/* Global Toast Alert */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 p-3.5 rounded-xl flex items-center gap-3 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-400'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* ============================================================= */}
          {/* VIEW: OVERVIEW                                                */}
          {/* ============================================================= */}
          {activeNav === 'overview' && (
            <div className="space-y-6">
              {/* Stat Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Gross Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums">
                    {formatPrice(totalRevenue)}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-emerald-400 font-semibold">
                    <TrendingUp className="w-3 h-3" />
                    <span>Real-time digital payment reconciliation</span>
                  </div>
                </div>

                <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Orders Completed</span>
                    <ShoppingBag className="w-4 h-4 text-[#F58220]" />
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums">
                    {totalCompletedOrders}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">
                    Out of <strong className="text-neutral-200">{orders.length} total</strong> customer orders
                  </div>
                </div>

                <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Digital Licenses Issued</span>
                    <KeyRound className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums">
                    {totalLicenses}
                  </div>
                  <div className="mt-1 text-[11px] text-purple-400 font-medium">
                    100% automated serial dispatch
                  </div>
                </div>

                <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl shadow-xs">
                  <div className="flex items-center justify-between text-neutral-400 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider">Catalog Products</span>
                    <Package className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-black text-white tabular-nums">
                    {products.length}
                  </div>
                  <div className="mt-1 text-[11px] text-neutral-400">
                    Across <strong className="text-neutral-200">{categories.length} digital categories</strong>
                  </div>
                </div>
              </div>

              {/* Quick Actions Strip */}
              <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-white">Management Shortcuts</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Instantly update website content, issue promo codes, or publish new digital assets.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setEditingProduct({
                        name: '',
                        price: 2999,
                        digitalAssetType: 'SUBSCRIPTION',
                        category: categories[0]?.name || 'SaaS & AI Subscriptions',
                        brand: 'SideNote Digital',
                        stock: 999,
                        description: 'Official digital license key with instant email dispatch.'
                      });
                      setProductModalOpen(true);
                    }}
                    className="py-2 px-3.5 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-orange-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Digital Product</span>
                  </button>

                  <button
                    onClick={() => setActiveNav('cms')}
                    className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-neutral-700"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Edit Live Website CMS</span>
                  </button>

                  <button
                    onClick={() => setCouponModalOpen(true)}
                    className="py-2 px-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold flex items-center gap-1.5 transition-colors border border-neutral-700"
                  >
                    <TicketPercent className="w-4 h-4 text-amber-400" />
                    <span>Create Voucher</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-white">Recent Digital Orders</h3>
                    <p className="text-xs text-neutral-400">Live order processing and license delivery logs</p>
                  </div>
                  <button
                    onClick={() => setActiveNav('orders')}
                    className="text-xs text-[#F58220] hover:underline font-bold"
                  >
                    View All Orders →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase font-bold text-neutral-500 border-b border-neutral-800">
                      <tr>
                        <th className="py-2.5 px-3">Order Number</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Digital Licenses Delivered</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-medium">
                      {orders.slice(0, 5).map(o => (
                        <tr key={o.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-white">{o.orderNumber}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-neutral-200">{o.customerName}</div>
                            <div className="text-[10px] text-neutral-400">{o.customerEmail}</div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="space-y-1">
                              {o.licenseKeysDelivered?.map((k, i) => (
                                <span
                                  key={i}
                                  className="inline-block px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 font-mono text-[10px] text-purple-300 mr-1"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 font-bold text-white tabular-nums">
                            {formatPrice(o.total)}
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              {o.orderStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-neutral-400 text-[11px]">
                            {new Date(o.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: FULL SITE CMS EDITOR (Every content editable!)          */}
          {/* ============================================================= */}
          {activeNav === 'cms' && cmsContent && (
            <div className="space-y-6">
              {/* CMS Navigation Tabs */}
              <div className="bg-[#141414] border border-neutral-800 p-2 rounded-2xl flex flex-wrap gap-2">
                <button
                  onClick={() => setCmsTab('hero')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsTab === 'hero'
                      ? 'bg-[#F58220] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  Hero Slider Carousel ({cmsContent.heroSlides.length})
                </button>
                <button
                  onClick={() => setCmsTab('announcement')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsTab === 'announcement'
                      ? 'bg-[#F58220] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  Announcement Top Bar
                </button>
                <button
                  onClick={() => setCmsTab('trust')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsTab === 'trust'
                      ? 'bg-[#F58220] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  Trust & Guarantees Strip
                </button>
                <button
                  onClick={() => setCmsTab('banners')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsTab === 'banners'
                      ? 'bg-[#F58220] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  Promotional Banners
                </button>
                <button
                  onClick={() => setCmsTab('store')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsTab === 'store'
                      ? 'bg-[#F58220] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  Store Contact & Footer
                </button>
                <button
                  onClick={() => setCmsTab('policies')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    cmsTab === 'policies'
                      ? 'bg-[#F58220] text-white shadow-md'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  Delivery Policy & FAQ
                </button>

                <div className="ml-auto flex items-center">
                  <button
                    onClick={handleSaveCms}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save All CMS Changes</span>
                  </button>
                </div>
              </div>

              {/* Sub-view: Hero Carousel Slides */}
              {cmsTab === 'hero' && (
                <div className="bg-[#141414] border border-neutral-800 p-6 rounded-2xl space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div>
                      <h3 className="text-base font-bold text-white">Hero Campaign Slides</h3>
                      <p className="text-xs text-neutral-400">
                        Edit, reorder, or add promotional slides displayed prominently on the homepage hero slider.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const newSlide: HeroSlide = {
                          id: `slide-${Date.now()}`,
                          title: 'New Campaign Headline',
                          subtitle: 'Comprehensive description for this promotional campaign.',
                          badge: 'LIMITED TIME OFFER',
                          imageUrl:
                            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
                          linkUrl: '/products',
                          ctaText: 'Explore Now',
                          accentColor: '#F58220',
                          active: true
                        };
                        setCmsContent(prev =>
                          prev ? { ...prev, heroSlides: [...prev.heroSlides, newSlide] } : null
                        );
                      }}
                      className="py-1.5 px-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors border border-neutral-700"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#F58220]" />
                      <span>Add Slide</span>
                    </button>
                  </div>

                  <div className="space-y-6">
                    {cmsContent.heroSlides.map((slide, idx) => (
                      <div
                        key={slide.id}
                        className="bg-[#1A1A1A] border border-neutral-800 p-5 rounded-xl space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#F58220] uppercase tracking-wider">
                            Slide #{idx + 1}
                          </span>
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-1.5 text-xs text-neutral-300 font-medium cursor-pointer">
                              <input
                                type="checkbox"
                                checked={slide.active}
                                onChange={e => {
                                  const updated = [...cmsContent.heroSlides];
                                  updated[idx].active = e.target.checked;
                                  setCmsContent({ ...cmsContent, heroSlides: updated });
                                }}
                                className="accent-[#F58220]"
                              />
                              <span>Active</span>
                            </label>
                            <button
                              onClick={() => {
                                const updated = cmsContent.heroSlides.filter((_, i) => i !== idx);
                                setCmsContent({ ...cmsContent, heroSlides: updated });
                              }}
                              className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                              title="Delete Slide"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                              Slide Title
                            </label>
                            <input
                              type="text"
                              value={slide.title}
                              onChange={e => {
                                const updated = [...cmsContent.heroSlides];
                                updated[idx].title = e.target.value;
                                setCmsContent({ ...cmsContent, heroSlides: updated });
                              }}
                              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                              Badge Text
                            </label>
                            <input
                              type="text"
                              value={slide.badge}
                              onChange={e => {
                                const updated = [...cmsContent.heroSlides];
                                updated[idx].badge = e.target.value;
                                setCmsContent({ ...cmsContent, heroSlides: updated });
                              }}
                              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                              Subtitle Description
                            </label>
                            <textarea
                              rows={2}
                              value={slide.subtitle}
                              onChange={e => {
                                const updated = [...cmsContent.heroSlides];
                                updated[idx].subtitle = e.target.value;
                                setCmsContent({ ...cmsContent, heroSlides: updated });
                              }}
                              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                              Background Image URL
                            </label>
                            <input
                              type="text"
                              value={slide.imageUrl}
                              onChange={e => {
                                const updated = [...cmsContent.heroSlides];
                                updated[idx].imageUrl = e.target.value;
                                setCmsContent({ ...cmsContent, heroSlides: updated });
                              }}
                              className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                              Action Button Text & URL
                            </label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={slide.ctaText}
                                onChange={e => {
                                  const updated = [...cmsContent.heroSlides];
                                  updated[idx].ctaText = e.target.value;
                                  setCmsContent({ ...cmsContent, heroSlides: updated });
                                }}
                                placeholder="Button Text"
                                className="w-1/3 px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                              />
                              <input
                                type="text"
                                value={slide.linkUrl}
                                onChange={e => {
                                  const updated = [...cmsContent.heroSlides];
                                  updated[idx].linkUrl = e.target.value;
                                  setCmsContent({ ...cmsContent, heroSlides: updated });
                                }}
                                placeholder="/product/slug"
                                className="w-2/3 px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-view: Announcement Bar */}
              {cmsTab === 'announcement' && (
                <div className="bg-[#141414] border border-neutral-800 p-6 rounded-2xl space-y-5">
                  <h3 className="text-base font-bold text-white pb-3 border-b border-neutral-800">
                    Announcement Bar Settings
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={cmsContent.announcementBar.enabled}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            announcementBar: {
                              ...cmsContent.announcementBar,
                              enabled: e.target.checked
                            }
                          })
                        }
                        className="w-4 h-4 accent-[#F58220]"
                        id="announcement-enable"
                      />
                      <label htmlFor="announcement-enable" className="text-xs font-bold text-white">
                        Enable Announcement Bar on top of all pages
                      </label>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Promo Announcement Text
                      </label>
                      <input
                        type="text"
                        value={cmsContent.announcementBar.text}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            announcementBar: {
                              ...cmsContent.announcementBar,
                              text: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Hotline Phone Number
                      </label>
                      <input
                        type="text"
                        value={cmsContent.announcementBar.hotline}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            announcementBar: {
                              ...cmsContent.announcementBar,
                              hotline: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Offer Link URL
                      </label>
                      <input
                        type="text"
                        value={cmsContent.announcementBar.linkUrl}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            announcementBar: {
                              ...cmsContent.announcementBar,
                              linkUrl: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view: Trust & Guarantees */}
              {cmsTab === 'trust' && (
                <div className="bg-[#141414] border border-neutral-800 p-6 rounded-2xl space-y-6">
                  <h3 className="text-base font-bold text-white pb-3 border-b border-neutral-800">
                    Trust & Service Benefits (4 Strip Items)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {cmsContent.trustBenefits.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-[#1A1A1A] border border-neutral-800 p-4 rounded-xl space-y-3"
                      >
                        <span className="text-[10px] font-bold text-[#F58220] uppercase">
                          Badge #{idx + 1} ({item.icon})
                        </span>
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                            Heading Title
                          </label>
                          <input
                            type="text"
                            value={item.title}
                            onChange={e => {
                              const updated = [...cmsContent.trustBenefits];
                              updated[idx].title = e.target.value;
                              setCmsContent({ ...cmsContent, trustBenefits: updated });
                            }}
                            className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                            Subtitle
                          </label>
                          <input
                            type="text"
                            value={item.subtitle}
                            onChange={e => {
                              const updated = [...cmsContent.trustBenefits];
                              updated[idx].subtitle = e.target.value;
                              setCmsContent({ ...cmsContent, trustBenefits: updated });
                            }}
                            className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-view: Store & Footer */}
              {cmsTab === 'store' && (
                <div className="bg-[#141414] border border-neutral-800 p-6 rounded-2xl space-y-5">
                  <h3 className="text-base font-bold text-white pb-3 border-b border-neutral-800">
                    Store Identity, Footer & Social Links
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        value={cmsContent.storeInfo.storeName}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            storeInfo: { ...cmsContent.storeInfo, storeName: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Support Email
                      </label>
                      <input
                        type="email"
                        value={cmsContent.storeInfo.supportEmail}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            storeInfo: { ...cmsContent.storeInfo, supportEmail: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Tagline / About Blurb
                      </label>
                      <textarea
                        rows={2}
                        value={cmsContent.storeInfo.tagline}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            storeInfo: { ...cmsContent.storeInfo, tagline: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Hotline Number
                      </label>
                      <input
                        type="text"
                        value={cmsContent.storeInfo.hotline}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            storeInfo: { ...cmsContent.storeInfo, hotline: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Operating Hours
                      </label>
                      <input
                        type="text"
                        value={cmsContent.storeInfo.hours}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            storeInfo: { ...cmsContent.storeInfo, hours: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        GitHub / Source URL
                      </label>
                      <input
                        type="text"
                        value={cmsContent.storeInfo.githubUrl}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            storeInfo: { ...cmsContent.storeInfo, githubUrl: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Copyright Notice
                      </label>
                      <input
                        type="text"
                        value={cmsContent.storeInfo.copyrightText}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            storeInfo: { ...cmsContent.storeInfo, copyrightText: e.target.value }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-view: Policies & FAQ */}
              {cmsTab === 'policies' && (
                <div className="bg-[#141414] border border-neutral-800 p-6 rounded-2xl space-y-5">
                  <h3 className="text-base font-bold text-white pb-3 border-b border-neutral-800">
                    Digital Delivery Policies & Customer FAQ
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Instant Delivery SLA Notice
                      </label>
                      <textarea
                        rows={2}
                        value={cmsContent.policyContent.instantDeliveryText}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            policyContent: {
                              ...cmsContent.policyContent,
                              instantDeliveryText: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        7-Day Replacement & Refund Policy
                      </label>
                      <textarea
                        rows={2}
                        value={cmsContent.policyContent.refundPolicyText}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            policyContent: {
                              ...cmsContent.policyContent,
                              refundPolicyText: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-400 mb-1">
                        Commercial License Terms
                      </label>
                      <textarea
                        rows={2}
                        value={cmsContent.policyContent.licenseTermsText}
                        onChange={e =>
                          setCmsContent({
                            ...cmsContent,
                            policyContent: {
                              ...cmsContent.policyContent,
                              licenseTermsText: e.target.value
                            }
                          })
                        }
                        className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-[#F58220]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: PRODUCTS MANAGEMENT                                     */}
          {/* ============================================================= */}
          {activeNav === 'products' && (
            <div className="space-y-6">
              <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search products by title, vendor, or category..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#F58220]"
                  />
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <button
                  onClick={() => {
                    setEditingProduct({
                      name: '',
                      price: 4999,
                      digitalAssetType: 'SUBSCRIPTION',
                      category: categories[0]?.name || 'SaaS & AI Subscriptions',
                      brand: 'SideNote Digital',
                      stock: 999,
                      description: 'Instant genuine digital delivery.',
                      images: ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80']
                    });
                    setProductModalOpen(true);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Digital Product</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[10px] uppercase font-bold text-neutral-500 bg-[#161616] border-b border-neutral-800">
                      <tr>
                        <th className="py-3 px-4">Product</th>
                        <th className="py-3 px-4">Digital Type</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price</th>
                        <th className="py-3 px-4">Stock / Keys Pool</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/60 font-medium">
                      {filteredProducts.map(p => (
                        <tr key={p.id} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden relative shrink-0">
                                <Image
                                  src={p.images[0] || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'}
                                  alt={p.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  href={`/product/${p.slug}`}
                                  target="_blank"
                                  className="font-bold text-white hover:text-[#F58220] transition-colors truncate block"
                                >
                                  {p.name}
                                </Link>
                                <div className="text-[10px] text-neutral-400">
                                  {p.brand} · {p.version || 'v1.0'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 border border-neutral-700 text-purple-300">
                              {p.digitalAssetType || 'SUBSCRIPTION'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300">{p.category}</td>
                          <td className="py-3.5 px-4 font-bold text-white tabular-nums">
                            {formatPrice(p.price)}
                            {p.originalPrice && (
                              <span className="text-[10px] text-neutral-500 line-through block font-normal">
                                {formatPrice(p.originalPrice)}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono text-emerald-400 font-bold">
                              {p.licenseKeysPool?.length || p.stock} units
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingProduct(p);
                                  setProductModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors"
                                title="Edit Product"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 rounded-lg bg-neutral-800 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors"
                                title="Delete Product"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: CATEGORIES MANAGEMENT                                   */}
          {/* ============================================================= */}
          {activeNav === 'categories' && (
            <div className="space-y-6">
              <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Digital Product Categories</h3>
                  <p className="text-xs text-neutral-400">
                    Organize digital inventory across software, SaaS, source code, and design assets.
                  </p>
                </div>
                <button
                  onClick={() => setCategoryModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-[#F58220] flex items-center justify-center font-bold">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono font-bold text-neutral-400">
                        {cat.itemCount} Items
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-white">{cat.name}</h4>
                      <p className="text-xs text-neutral-400 mt-1 line-clamp-2">
                        {cat.description || 'Digital category catalog'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80 flex flex-wrap gap-1.5">
                      {cat.subcategories?.map(sub => (
                        <span
                          key={sub.slug}
                          className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-300"
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: ORDERS & DIGITAL DELIVERIES                             */}
          {/* ============================================================= */}
          {activeNav === 'orders' && (
            <div className="space-y-6">
              <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={e => setOrderSearch(e.target.value)}
                    placeholder="Search by order number or customer email..."
                    className="w-full pl-9 pr-4 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-[#F58220]"
                  />
                  <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <div className="text-xs text-neutral-400">
                  Showing <strong className="text-white">{filteredOrders.length}</strong> customer orders
                </div>
              </div>

              <div className="space-y-4">
                {filteredOrders.map(order => (
                  <div
                    key={order.id}
                    className="bg-[#141414] border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-white">
                            {order.orderNumber}
                          </span>
                          <span className="text-neutral-500">·</span>
                          <span className="text-xs text-neutral-400">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-neutral-300 mt-1">
                          {order.customerName} ({order.customerEmail}) · Phone: {order.customerPhone}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <select
                          value={order.orderStatus}
                          onChange={e =>
                            handleUpdateOrderStatus(order.id, e.target.value as Order['orderStatus'])
                          }
                          className="bg-neutral-900 border border-neutral-700 text-xs font-bold text-neutral-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#F58220]"
                        >
                          <option value="COMPLETED">Completed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="REFUNDED">Refunded</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>

                        <span className="text-sm font-black text-white tabular-nums">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* License Keys Delivery Box */}
                    <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-purple-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <KeyRound className="w-3.5 h-3.5" />
                          Delivered Digital License Keys
                        </span>
                        <span className="text-emerald-400 font-mono text-[10px]">
                          Payment: {order.paymentMethod.toUpperCase()} (VERIFIED)
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.licenseKeysDelivered?.map((key, kIdx) => (
                          <div
                            key={kIdx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-950 border border-purple-500/30 text-purple-200 font-mono text-xs"
                          >
                            <span>{key}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(key);
                                notify(`Copied key: ${key}`);
                              }}
                              className="text-neutral-500 hover:text-white"
                              title="Copy License Key"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {order.downloadLinks && order.downloadLinks.length > 0 && (
                        <div className="pt-2 border-t border-neutral-800 text-xs flex flex-wrap gap-2 items-center text-neutral-400">
                          <DownloadCloud className="w-3.5 h-3.5 text-blue-400" />
                          <span>Direct Download URLs:</span>
                          {order.downloadLinks.map((link, lIdx) => (
                            <a
                              key={lIdx}
                              href={link}
                              target="_blank"
                              className="text-blue-400 hover:underline font-mono text-[11px]"
                            >
                              [Link #{lIdx + 1}]
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: PROMO VOUCHERS / COUPONS                                */}
          {/* ============================================================= */}
          {activeNav === 'coupons' && (
            <div className="space-y-6">
              <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">Promotional Discount Vouchers</h3>
                  <p className="text-xs text-neutral-400">
                    Create percentage discounts or flat fee vouchers redeemable at checkout.
                  </p>
                </div>
                <button
                  onClick={() => setCouponModalOpen(true)}
                  className="py-2.5 px-4 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Voucher</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map(c => (
                  <div
                    key={c.id || c.code}
                    className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl space-y-3 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-black text-[#F58220] tracking-wider">
                        {c.code}
                      </span>
                      <button
                        onClick={() => handleDeleteCoupon(c.id || c.code)}
                        className="p-1 text-neutral-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-neutral-300 font-medium">{c.description}</p>

                    <div className="pt-2 border-t border-neutral-800 text-xs flex justify-between text-neutral-400">
                      <span>Discount:</span>
                      <strong className="text-white">
                        {c.discountPercent ? `${c.discountPercent}% OFF` : `৳ ${c.discountAmount} OFF`}
                      </strong>
                    </div>

                    <div className="text-xs flex justify-between text-neutral-400">
                      <span>Minimum Spend:</span>
                      <strong className="text-white tabular-nums">{formatPrice(c.minSpend)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================= */}
          {/* VIEW: USERS & ROLES                                           */}
          {/* ============================================================= */}
          {activeNav === 'users' && (
            <div className="space-y-6">
              <div className="bg-[#141414] border border-neutral-800 p-5 rounded-2xl">
                <h3 className="text-sm font-bold text-white">Better Auth Role Management</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Promote registered accounts to Administrator or revert to standard Customer access.
                </p>
              </div>

              <div className="bg-[#141414] border border-neutral-800 rounded-2xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] uppercase font-bold text-neutral-500 bg-[#161616] border-b border-neutral-800">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Role Authorization</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4">Toggle Permission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/60 font-medium">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{u.name}</div>
                          <div className="text-[10px] text-neutral-400 font-mono">{u.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.role === 'admin'
                                ? 'bg-orange-500/10 text-[#F58220] border border-orange-500/30'
                                : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                            }`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-neutral-400">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => handleToggleUserRole(u.id, u.role)}
                            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-200 transition-colors border border-neutral-700"
                          >
                            Switch to {u.role === 'admin' ? 'Customer' : 'Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============================================================= */}
      {/* MODAL: ADD / EDIT DIGITAL PRODUCT                             */}
      {/* ============================================================= */}
      {productModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-neutral-700 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">
                {editingProduct.id ? 'Edit Digital Product' : 'Create New Digital Product'}
              </h3>
              <button
                onClick={() => setProductModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="e.g. OpenAI ChatGPT Plus 1-Year Subscription"
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Publisher / Vendor
                  </label>
                  <input
                    type="text"
                    value={editingProduct.brand || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    placeholder="e.g. OpenAI, JetBrains, Microsoft"
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Category</label>
                  <select
                    value={editingProduct.category || categories[0]?.name}
                    onChange={e => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Price (৳)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Original Price (৳ strike-through)
                  </label>
                  <input
                    type="number"
                    value={editingProduct.originalPrice || ''}
                    onChange={e =>
                      setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Digital Asset Type
                  </label>
                  <select
                    value={editingProduct.digitalAssetType || 'SUBSCRIPTION'}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        digitalAssetType: e.target.value as Product['digitalAssetType']
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  >
                    <option value="SUBSCRIPTION">SaaS Subscription Account</option>
                    <option value="LICENSE_KEY">Retail License Key</option>
                    <option value="SOURCE_CODE">Source Code & Boilerplate</option>
                    <option value="UI_KIT">Figma & Design Kit</option>
                    <option value="EBOOK">E-Book & Video Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    File Format / License Format
                  </label>
                  <input
                    type="text"
                    value={editingProduct.fileFormat || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, fileFormat: e.target.value })}
                    placeholder="e.g. 25-Digit Key, ZIP, Figma Community"
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Direct Download URL or Activation Link
                  </label>
                  <input
                    type="text"
                    value={editingProduct.downloadUrl || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, downloadUrl: e.target.value })}
                    placeholder="https://downloads.sidenote.app/..."
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    License Keys Pool (comma separated)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.licenseKeysPool?.join(', ') || ''}
                    onChange={e =>
                      setEditingProduct({
                        ...editingProduct,
                        licenseKeysPool: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                      })
                    }
                    placeholder="KEY-1234, KEY-5678, KEY-9012"
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Description & Highlights
                  </label>
                  <textarea
                    rows={3}
                    value={editingProduct.description || ''}
                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs font-bold transition-colors shadow-lg shadow-orange-500/20"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE COUPON                                          */}
      {/* ============================================================= */}
      {couponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-neutral-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Create Promotional Voucher</h3>
              <button
                onClick={() => setCouponModalOpen(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={newCoupon.code || ''}
                  onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. FLASH30"
                  className="w-full px-3 py-2 text-xs font-mono font-bold bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Discount Percent (%)
                  </label>
                  <input
                    type="number"
                    value={newCoupon.discountPercent || ''}
                    onChange={e =>
                      setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Min Spend (৳)
                  </label>
                  <input
                    type="number"
                    value={newCoupon.minSpend || ''}
                    onChange={e =>
                      setNewCoupon({ ...newCoupon, minSpend: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newCoupon.description || ''}
                  onChange={e => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  placeholder="30% discount on software licenses"
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F58220] text-white text-xs font-bold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* MODAL: CREATE CATEGORY                                        */}
      {/* ============================================================= */}
      {categoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#181818] border border-neutral-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">Create Category</h3>
              <button
                onClick={() => setCategoryModalOpen(false)}
                className="text-neutral-500 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCategory.name || ''}
                  onChange={e => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="e.g. Design Assets"
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Slug (optional)</label>
                  <input
                    type="text"
                    value={newCategory.slug || ''}
                    onChange={e => setNewCategory({ ...newCategory, slug: e.target.value })}
                    placeholder="design-assets"
                    className="w-full px-3 py-2 text-xs font-mono bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">Icon</label>
                  <input
                    type="text"
                    value={newCategory.iconName || ''}
                    onChange={e => setNewCategory({ ...newCategory, iconName: e.target.value })}
                    placeholder="Sparkles"
                    className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">Description</label>
                <input
                  type="text"
                  value={newCategory.description || ''}
                  onChange={e => setNewCategory({ ...newCategory, description: e.target.value })}
                  placeholder="Figma systems, icon packs and UI kits"
                  className="w-full px-3 py-2 text-xs bg-neutral-900 border border-neutral-700 rounded-xl text-white focus:outline-none focus:border-[#F58220]"
                />
              </div>

              <div className="pt-3 border-t border-neutral-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-700 text-xs font-bold text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#F58220] text-white text-xs font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

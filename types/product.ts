export interface Product {
  id: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  subcategory?: string;
  images: string[];
  stock: number;
  isHotDeal?: boolean;
  isAppleExclusive?: boolean;
  isTopSelling?: boolean;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  discountBadge?: string;
  warranty?: string;
  emiMonths?: number;
  description: string;
  specifications: Record<string, string>;
  keyFeatures?: string[];
  tags?: string[];

  // Digital product delivery & license metadata
  digitalAssetType?: 'SUBSCRIPTION' | 'LICENSE_KEY' | 'SOURCE_CODE' | 'UI_KIT' | 'EBOOK';
  downloadUrl?: string;
  fileFormat?: string;
  fileSize?: string;
  version?: string;
  liveDemoUrl?: string;
  licenseType?: string;
  licenseKeysPool?: string[];
  availableKeys?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice?: number;
  selectedVariant?: string;
  selectedColor?: string;
  selectedStorage?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  itemCount: number;
  description?: string;
  subcategories: { name: string; slug: string }[];
}

export interface Brand {
  id: string;
  name: string;
  logoText: string;
  category: string;
}

export interface Coupon {
  id?: string;
  code: string;
  discountAmount?: number;
  discountPercent?: number;
  minSpend: number;
  description: string;
  isActive?: boolean;
  usageCount?: number;
  validUntil?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  notes?: string;
  couponCode?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING' | 'FAILED';
  orderStatus: 'COMPLETED' | 'PROCESSING' | 'REFUNDED' | 'CANCELLED';
  licenseKeysDelivered: string[];
  downloadLinks: string[];
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  image?: string;
  createdAt?: string;
}

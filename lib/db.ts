import { prisma } from './prisma';
import { randomBytes } from 'node:crypto';
import type {
  Product as DbProduct,
  Order as DbOrder,
  Category as DbCategory,
  Coupon as DbCoupon,
  Prisma,
} from '@prisma/client';
import { Product, Category, Order, Coupon, UserProfile, CartItem } from '@/types/product';
import { SiteCmsData } from '@/types/cms';
import { digitalProducts } from '@/data/digital-products';
import { digitalCategories } from '@/data/digital-categories';
import { defaultCmsContent } from '@/data/cms-default';

const OBJECT_ID_PATTERN = /^[0-9a-fA-F]{24}$/;
const isObjectId = (value: unknown): boolean =>
  typeof value === 'string' && OBJECT_ID_PATTERN.test(value);

const URL_KEY_PATTERN = /(url|link|href)$/i;
const IMAGE_KEY_PATTERN = /imageurl$/i;
const ALLOWED_IMAGE_HOSTS = new Set(['images.unsplash.com', 'picsum.photos']);

function safeJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return (parsed ?? fallback) as T;
  } catch (error) {
    console.error('[DB] Ignoring malformed JSON payload:', (error as Error).message);
    return fallback;
  }
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeSlug(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function isSafeUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '') return true;
  if (trimmed.startsWith('/')) return !trimmed.startsWith('//');
  try {
    const url = new URL(trimmed);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function isAllowedImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed.startsWith('/')) return true;
  try {
    const url = new URL(trimmed);
    return url.protocol === 'https:' && ALLOWED_IMAGE_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function sanitizeCmsValue(value: unknown, key: string): unknown {
  if (typeof value === 'string') {
    if (IMAGE_KEY_PATTERN.test(key)) return isAllowedImageUrl(value) ? value : '';
    if (URL_KEY_PATTERN.test(key)) return isSafeUrl(value) ? value : '';
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(entry => sanitizeCmsValue(entry, key));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([childKey, childValue]) => [
        childKey,
        sanitizeCmsValue(childValue, childKey),
      ])
    );
  }
  return value;
}

const KEY_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomBlock(length: number): string {
  const bytes = randomBytes(length);
  let output = '';
  for (let index = 0; index < length; index += 1) {
    output += KEY_ALPHABET[bytes[index] % KEY_ALPHABET.length];
  }
  return output;
}

function generateLicenseKey(brand: string, fallbackName: string): string {
  const prefix =
    brand.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) ||
    fallbackName.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 4) ||
    'SN';
  return `${prefix}-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}`;
}

function generateOrderNumber(): string {
  return `SN-${randomBlock(4)}-${randomBlock(4)}`;
}

const VALID_ORDER_STATUSES: Order['orderStatus'][] = [
  'COMPLETED',
  'PROCESSING',
  'REFUNDED',
  'CANCELLED',
];

export function isValidOrderStatus(value: unknown): value is Order['orderStatus'] {
  return typeof value === 'string' && (VALID_ORDER_STATUSES as string[]).includes(value);
}

export function isValidRole(value: unknown): value is UserProfile['role'] {
  return value === 'admin' || value === 'user';
}

export function isDuplicateKeyError(error: unknown): boolean {
  return (error as { code?: string })?.code === 'P2002';
}

export class ValidationError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'ValidationError';
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// In-memory fallback stores (used only while the database is unreachable)
// ---------------------------------------------------------------------------

let memoryProducts: Product[] = [...digitalProducts];
let memoryCategories: Category[] = [...digitalCategories];
let memoryCmsContent: SiteCmsData = JSON.parse(JSON.stringify(defaultCmsContent));
let memoryOrders: Order[] = [];
let memoryCoupons: Coupon[] = [
  {
    id: 'coup-1',
    code: 'DIGITAL20',
    discountPercent: 20,
    minSpend: 5000,
    description: '20% discount on all digital subscriptions & boilerplates',
    isActive: true,
    usageCount: 142,
  },
  {
    id: 'coup-2',
    code: 'WELCOME10',
    discountAmount: 1000,
    minSpend: 4000,
    description: 'Flat ৳ 1,000 off on first digital purchase',
    isActive: true,
    usageCount: 88,
  },
  {
    id: 'coup-3',
    code: 'SAVE500',
    discountAmount: 500,
    minSpend: 3000,
    description: 'Flat ৳ 500 off on orders over ৳ 3,000',
    isActive: true,
    usageCount: 52,
  },
];
let memoryUsers: UserProfile[] = [];

// ---------------------------------------------------------------------------
// Database availability
// ---------------------------------------------------------------------------

let cachedAvailability: { status: boolean; timestamp: number } | null = null;
let pingInFlight: Promise<boolean> | null = null;
let isSeeding = false;
let isSeeded = false;

function isSeedingEnabled(): boolean {
  return process.env.NODE_ENV !== 'production' || process.env.SEED_DEMO_DATA === 'true';
}

async function pingDatabase(): Promise<boolean> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Prisma ping timeout')), 1500);
    });
    await Promise.race([prisma.$runCommandRaw({ ping: 1 }), timeout]);
    return true;
  } catch {
    return false;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function isPrismaAvailable(): Promise<boolean> {
  const ttl = cachedAvailability?.status ? 30_000 : 3_000;
  if (cachedAvailability && Date.now() - cachedAvailability.timestamp < ttl) {
    return cachedAvailability.status;
  }

  if (!pingInFlight) {
    pingInFlight = pingDatabase()
      .then(status => {
        cachedAvailability = { status, timestamp: Date.now() };
        if (status && isSeedingEnabled() && !isSeeded && !isSeeding) {
          void ensureDatabaseSeeded();
        }
        return status;
      })
      .finally(() => {
        pingInFlight = null;
      });
  }

  return pingInFlight;
}

async function ensureDatabaseSeeded(): Promise<void> {
  if (isSeeding || isSeeded) return;
  isSeeding = true;

  try {
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      for (const product of digitalProducts) {
        try {
          await prisma.product.create({ data: toProductRow(product) });
        } catch (error) {
          if (!isDuplicateKeyError(error)) throw error;
        }
      }
    }

    const categoryCount = await prisma.category.count();
    if (categoryCount === 0) {
      for (const category of digitalCategories) {
        try {
          await prisma.category.create({
            data: {
              name: category.name,
              slug: category.slug,
              iconName: category.iconName,
              itemCount: category.itemCount,
              description: category.description,
              subcategories: JSON.stringify(category.subcategories || []),
            },
          });
        } catch (error) {
          if (!isDuplicateKeyError(error)) throw error;
        }
      }
    }

    const couponCount = await prisma.coupon.count();
    if (couponCount === 0) {
      for (const coupon of memoryCoupons) {
        try {
          await prisma.coupon.create({
            data: {
              code: coupon.code,
              discountAmount: coupon.discountAmount,
              discountPercent: coupon.discountPercent,
              minSpend: coupon.minSpend,
              description: coupon.description,
              isActive: coupon.isActive !== false,
              usageCount: coupon.usageCount || 0,
            },
          });
        } catch (error) {
          if (!isDuplicateKeyError(error)) throw error;
        }
      }
    }

    const cmsRecord = await prisma.siteContent.findUnique({ where: { key: 'cms_all' } });
    if (!cmsRecord) {
      await prisma.siteContent.create({
        data: { key: 'cms_all', data: JSON.stringify(defaultCmsContent) },
      });
    }

    isSeeded = true;
  } catch (error) {
    console.error('[DB Seed] Failed:', (error as Error).message);
  } finally {
    isSeeding = false;
  }
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

function mapProductRow(row: DbProduct): Product {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    brand: row.brand,
    price: row.price,
    originalPrice: row.originalPrice ?? undefined,
    rating: row.rating,
    reviewCount: row.reviewCount,
    category: row.category,
    subcategory: row.subcategory ?? undefined,
    images: row.images ?? [],
    stock: row.stock,
    isHotDeal: row.isHotDeal,
    isFeatured: row.isFeatured,
    isTopSelling: row.isTopSelling,
    isNewArrival: row.isNewArrival,
    discountBadge: row.discountBadge ?? undefined,
    digitalAssetType: (row.digitalAssetType as Product['digitalAssetType']) ?? 'SUBSCRIPTION',
    downloadUrl: row.downloadUrl ?? undefined,
    fileFormat: row.fileFormat ?? undefined,
    fileSize: row.fileSize ?? undefined,
    version: row.version ?? undefined,
    liveDemoUrl: row.liveDemoUrl ?? undefined,
    licenseType: row.licenseType ?? undefined,
    licenseKeysPool: row.licenseKeysPool ?? [],
    description: row.description,
    specifications: safeJson<Record<string, string>>(row.specifications, {}),
    keyFeatures: row.keyFeatures ?? [],
    tags: row.tags ?? [],
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toPublicProduct(product: Product): Product {
  const publicProduct: Product = { ...product };
  delete publicProduct.licenseKeysPool;
  delete publicProduct.downloadUrl;
  publicProduct.availableKeys = product.licenseKeysPool?.length ?? 0;
  return publicProduct;
}

function toProductRow(product: Product): Prisma.ProductCreateInput {
  return {
    name: product.name,
    slug: product.slug,
    brand: product.brand,
    price: product.price,
    originalPrice: product.originalPrice,
    rating: product.rating,
    reviewCount: product.reviewCount,
    category: product.category,
    subcategory: product.subcategory,
    images: product.images,
    stock: product.stock,
    isHotDeal: !!product.isHotDeal,
    isFeatured: !!product.isFeatured,
    isTopSelling: !!product.isTopSelling,
    isNewArrival: !!product.isNewArrival,
    discountBadge: product.discountBadge,
    digitalAssetType: product.digitalAssetType || 'SUBSCRIPTION',
    downloadUrl: product.downloadUrl,
    fileFormat: product.fileFormat,
    fileSize: product.fileSize,
    version: product.version,
    liveDemoUrl: product.liveDemoUrl,
    licenseType: product.licenseType,
    licenseKeysPool: product.licenseKeysPool ?? [],
    description: product.description,
    specifications: JSON.stringify(product.specifications ?? {}),
    keyFeatures: product.keyFeatures ?? [],
    tags: product.tags ?? [],
    active: product.active !== false,
  };
}

function buildProductDefaults(data: Partial<Product>): Product {
  const name = (data.name || '').trim() || 'Untitled Digital Product';
  const price = data.price === undefined ? 999 : toFiniteNumber(data.price, NaN);
  if (!Number.isFinite(price) || price < 0) {
    throw new ValidationError('Product price must be a non-negative number.');
  }
  const stock = data.stock === undefined ? 999 : toFiniteNumber(data.stock, NaN);
  if (!Number.isFinite(stock) || stock < 0) {
    throw new ValidationError('Product stock must be a non-negative number.');
  }
  const images = Array.isArray(data.images)
    ? data.images.filter(image => typeof image === 'string')
    : [];

  return {
    id: data.id || `prod-${randomBlock(8)}`,
    name,
    slug: normalizeSlug(data.slug || name),
    brand: (data.brand || 'SideNote Digital').trim(),
    price,
    originalPrice: data.originalPrice === undefined ? undefined : toFiniteNumber(data.originalPrice, 0),
    rating: data.rating === undefined ? 5 : toFiniteNumber(data.rating, 5),
    reviewCount: data.reviewCount === undefined ? 0 : Math.trunc(toFiniteNumber(data.reviewCount, 0)),
    category: data.category || 'Templates & Source Code',
    subcategory: data.subcategory,
    images:
      images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'],
    stock: Math.trunc(stock),
    isFeatured: !!data.isFeatured,
    isHotDeal: !!data.isHotDeal,
    isTopSelling: !!data.isTopSelling,
    isNewArrival: !!data.isNewArrival,
    discountBadge: data.discountBadge,
    digitalAssetType: data.digitalAssetType || 'SOURCE_CODE',
    downloadUrl: data.downloadUrl,
    fileFormat: data.fileFormat || 'ZIP Source Archive',
    fileSize: data.fileSize || 'Digital Asset',
    version: data.version || 'v1.0.0',
    liveDemoUrl: data.liveDemoUrl,
    licenseType: data.licenseType || 'Commercial License',
    licenseKeysPool: Array.isArray(data.licenseKeysPool)
      ? data.licenseKeysPool.filter(key => typeof key === 'string')
      : [],
    description: data.description || 'Digital product for instant download.',
    specifications: data.specifications || {},
    keyFeatures: data.keyFeatures || [],
    tags: data.tags || [],
    active: data.active !== false,
  };
}

function buildProductPatch(patch: Partial<Product>): Prisma.ProductUpdateInput {
  const update: Prisma.ProductUpdateInput = {};

  if (patch.name !== undefined) {
    const name = String(patch.name).trim();
    if (!name) throw new ValidationError('Product name cannot be empty.');
    update.name = name;
  }
  if (patch.slug !== undefined) update.slug = normalizeSlug(String(patch.slug));
  if (patch.brand !== undefined) update.brand = String(patch.brand).trim();
  if (patch.price !== undefined) {
    const price = toFiniteNumber(patch.price, NaN);
    if (!Number.isFinite(price) || price < 0) {
      throw new ValidationError('Product price must be a non-negative number.');
    }
    update.price = price;
  }
  if (patch.originalPrice !== undefined) {
    const originalPrice = toFiniteNumber(patch.originalPrice, NaN);
    if (!Number.isFinite(originalPrice) || originalPrice < 0) {
      throw new ValidationError('Original price must be a non-negative number.');
    }
    update.originalPrice = originalPrice;
  }
  if (patch.stock !== undefined) {
    const stock = toFiniteNumber(patch.stock, NaN);
    if (!Number.isFinite(stock) || stock < 0) throw new ValidationError('Stock must be a non-negative number.');
    update.stock = Math.trunc(stock);
  }
  if (patch.rating !== undefined) update.rating = toFiniteNumber(patch.rating, 5);
  if (patch.reviewCount !== undefined) {
    update.reviewCount = Math.trunc(toFiniteNumber(patch.reviewCount, 0));
  }
  if (patch.category !== undefined) update.category = String(patch.category);
  if (patch.subcategory !== undefined) update.subcategory = String(patch.subcategory);
  if (patch.images !== undefined) {
    update.images = Array.isArray(patch.images)
      ? patch.images.filter(image => typeof image === 'string')
      : [];
  }
  if (patch.isFeatured !== undefined) update.isFeatured = !!patch.isFeatured;
  if (patch.isHotDeal !== undefined) update.isHotDeal = !!patch.isHotDeal;
  if (patch.isTopSelling !== undefined) update.isTopSelling = !!patch.isTopSelling;
  if (patch.isNewArrival !== undefined) update.isNewArrival = !!patch.isNewArrival;
  if (patch.discountBadge !== undefined) update.discountBadge = String(patch.discountBadge);
  if (patch.digitalAssetType !== undefined) update.digitalAssetType = String(patch.digitalAssetType);
  if (patch.downloadUrl !== undefined) update.downloadUrl = String(patch.downloadUrl);
  if (patch.fileFormat !== undefined) update.fileFormat = String(patch.fileFormat);
  if (patch.fileSize !== undefined) update.fileSize = String(patch.fileSize);
  if (patch.version !== undefined) update.version = String(patch.version);
  if (patch.liveDemoUrl !== undefined) update.liveDemoUrl = String(patch.liveDemoUrl);
  if (patch.licenseType !== undefined) update.licenseType = String(patch.licenseType);
  if (patch.licenseKeysPool !== undefined) {
    update.licenseKeysPool = Array.isArray(patch.licenseKeysPool)
      ? patch.licenseKeysPool.filter(key => typeof key === 'string')
      : [];
  }
  if (patch.description !== undefined) update.description = String(patch.description);
  if (patch.specifications !== undefined) {
    update.specifications = JSON.stringify(patch.specifications ?? {});
  }
  if (patch.keyFeatures !== undefined) {
    update.keyFeatures = Array.isArray(patch.keyFeatures)
      ? patch.keyFeatures.filter(feature => typeof feature === 'string')
      : [];
  }
  if (patch.tags !== undefined) {
    update.tags = Array.isArray(patch.tags) ? patch.tags.filter(tag => typeof tag === 'string') : [];
  }
  if (patch.active !== undefined) update.active = !!patch.active;

  return update;
}

export async function getAllProducts(
  options: { includeInactive?: boolean } = {}
): Promise<Product[]> {
  if (await isPrismaAvailable()) {
    try {
      const rows = await prisma.product.findMany({
        where: options.includeInactive ? undefined : { active: true },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapProductRow);
    } catch (error) {
      console.error('[DB] getAllProducts failed:', (error as Error).message);
    }
  }
  return memoryProducts.filter(product => options.includeInactive || product.active !== false);
}

export async function getProductBySlug(
  slug: string,
  options: { includeInactive?: boolean } = {}
): Promise<Product | null> {
  if (typeof slug !== 'string' || slug.trim() === '') return null;

  if (await isPrismaAvailable()) {
    try {
      const row = await prisma.product.findFirst({
        where: options.includeInactive ? { slug } : { slug, active: true },
      });
      return row ? mapProductRow(row) : null;
    } catch (error) {
      console.error('[DB] getProductBySlug failed:', (error as Error).message);
    }
  }
  return (
    memoryProducts.find(
      product => product.slug === slug && (options.includeInactive || product.active !== false)
    ) ?? null
  );
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const product = buildProductDefaults(data);

  if (await isPrismaAvailable()) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (existing) throw new ValidationError('A product with this slug already exists.', 409);
    const created = await prisma.product.create({ data: toProductRow(product) });
    return mapProductRow(created);
  }

  memoryProducts.unshift(product);
  return product;
}

export async function updateProduct(
  idOrSlug: string,
  patch: Partial<Product>
): Promise<Product | null> {
  const update = buildProductPatch(patch);

  if (await isPrismaAvailable()) {
    const where = isObjectId(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
    const existing = await prisma.product.findFirst({ where });
    if (!existing) return null;
    const updated = await prisma.product.update({ where: { id: existing.id }, data: update });
    return mapProductRow(updated);
  }

  const index = memoryProducts.findIndex(
    product => product.id === idOrSlug || product.slug === idOrSlug
  );
  if (index === -1) return null;
  memoryProducts[index] = { ...memoryProducts[index], ...patch };
  return memoryProducts[index];
}

export async function deleteProduct(idOrSlug: string): Promise<boolean> {
  if (await isPrismaAvailable()) {
    const where = isObjectId(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
    const existing = await prisma.product.findFirst({ where });
    if (!existing) return false;
    await prisma.product.delete({ where: { id: existing.id } });
    return true;
  }

  const before = memoryProducts.length;
  memoryProducts = memoryProducts.filter(
    product => product.id !== idOrSlug && product.slug !== idOrSlug
  );
  return memoryProducts.length !== before;
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

function mapCategoryRow(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    iconName: row.iconName,
    itemCount: row.itemCount,
    description: row.description ?? undefined,
    subcategories: safeJson<Category['subcategories']>(row.subcategories, []),
  };
}

function buildCategoryDefaults(data: Partial<Category>): Category {
  const name = (data.name || '').trim() || 'New Category';
  return {
    id: data.id || `cat-${randomBlock(8)}`,
    name,
    slug: normalizeSlug(data.slug || name),
    iconName: data.iconName || 'Sparkles',
    itemCount: data.itemCount === undefined ? 0 : Math.trunc(toFiniteNumber(data.itemCount, 0)),
    description: data.description,
    subcategories: Array.isArray(data.subcategories) ? data.subcategories : [],
  };
}

export async function getAllCategories(): Promise<Category[]> {
  if (await isPrismaAvailable()) {
    try {
      const rows = await prisma.category.findMany({ orderBy: { name: 'asc' } });
      return rows.map(mapCategoryRow);
    } catch (error) {
      console.error('[DB] getAllCategories failed:', (error as Error).message);
    }
  }
  return [...memoryCategories];
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const category = buildCategoryDefaults(data);

  if (await isPrismaAvailable()) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug } });
    if (existing) throw new ValidationError('A category with this slug already exists.', 409);
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        iconName: category.iconName,
        itemCount: category.itemCount,
        description: category.description,
        subcategories: JSON.stringify(category.subcategories),
      },
    });
    return mapCategoryRow(created);
  }

  memoryCategories.push(category);
  return category;
}

export async function updateCategory(
  idOrSlug: string,
  patch: Partial<Category>
): Promise<Category | null> {
  const update: Prisma.CategoryUpdateInput = {};
  if (patch.name !== undefined) update.name = String(patch.name).trim();
  if (patch.slug !== undefined) update.slug = normalizeSlug(String(patch.slug));
  if (patch.iconName !== undefined) update.iconName = String(patch.iconName);
  if (patch.itemCount !== undefined) {
    update.itemCount = Math.trunc(toFiniteNumber(patch.itemCount, 0));
  }
  if (patch.description !== undefined) update.description = String(patch.description);
  if (patch.subcategories !== undefined) {
    update.subcategories = JSON.stringify(
      Array.isArray(patch.subcategories) ? patch.subcategories : []
    );
  }

  if (await isPrismaAvailable()) {
    const where = isObjectId(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
    const existing = await prisma.category.findFirst({ where });
    if (!existing) return null;
    const updated = await prisma.category.update({ where: { id: existing.id }, data: update });
    return mapCategoryRow(updated);
  }

  const index = memoryCategories.findIndex(
    category => category.id === idOrSlug || category.slug === idOrSlug
  );
  if (index === -1) return null;
  memoryCategories[index] = { ...memoryCategories[index], ...patch };
  return memoryCategories[index];
}

export async function deleteCategory(idOrSlug: string): Promise<boolean> {
  if (await isPrismaAvailable()) {
    const where = isObjectId(idOrSlug) ? { id: idOrSlug } : { slug: idOrSlug };
    const existing = await prisma.category.findFirst({ where });
    if (!existing) return false;
    await prisma.category.delete({ where: { id: existing.id } });
    return true;
  }

  const before = memoryCategories.length;
  memoryCategories = memoryCategories.filter(
    category => category.id !== idOrSlug && category.slug !== idOrSlug
  );
  return memoryCategories.length !== before;
}

// ---------------------------------------------------------------------------
// Orders & digital delivery
// ---------------------------------------------------------------------------

function mapOrderRow(row: DbOrder): Order {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    userId: row.userId ?? undefined,
    customerName: row.customerName,
    customerEmail: row.customerEmail,
    customerPhone: row.customerPhone,
    company: row.company ?? undefined,
    notes: row.notes ?? undefined,
    couponCode: row.couponCode ?? undefined,
    items: safeJson<CartItem[]>(row.items, []),
    subtotal: row.subtotal,
    discount: row.discount,
    total: row.total,
    paymentMethod: row.paymentMethod,
    paymentStatus: row.paymentStatus as Order['paymentStatus'],
    orderStatus: row.orderStatus as Order['orderStatus'],
    licenseKeysDelivered: row.licenseKeysDelivered ?? [],
    downloadLinks: row.downloadLinks ?? [],
    createdAt: row.createdAt.toISOString(),
  };
}

export interface OrderFilter {
  userId?: string;
}

export async function getAllOrders(filter?: OrderFilter): Promise<Order[]> {
  if (await isPrismaAvailable()) {
    try {
      const rows = await prisma.order.findMany({
        where: filter?.userId ? { userId: filter.userId } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapOrderRow);
    } catch (error) {
      console.error('[DB] getAllOrders failed:', (error as Error).message);
    }
  }

  if (!filter?.userId) return [...memoryOrders];
  return memoryOrders.filter(order => order.userId === filter.userId);
}

export interface CreateOrderInput {
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  company?: string;
  notes?: string;
  couponCode?: string;
  paymentMethod: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
}

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new ValidationError('Order must contain at least one digital product.');
  }

  const licenseKeys: string[] = [];
  const downloadLinks: string[] = [];
  const isAvailable = await isPrismaAvailable();
  let orderNumber = generateOrderNumber();

  for (const item of input.items) {
    const quantity = Math.max(1, Math.trunc(toFiniteNumber(item.quantity, 1)));
    const row =
      isAvailable && item.product.slug
        ? await prisma.product.findUnique({ where: { slug: item.product.slug } })
        : null;

    const pool = row?.licenseKeysPool ?? [];
    const fromPool = pool.slice(0, quantity);
    const generated = Array.from({ length: Math.max(0, quantity - fromPool.length) }, () =>
      generateLicenseKey(row?.brand ?? item.product.brand ?? '', row?.name ?? item.product.name ?? '')
    );
    licenseKeys.push(...fromPool, ...generated);

    const downloadUrl = row?.downloadUrl ?? item.product.downloadUrl;
    downloadLinks.push(
      downloadUrl ||
        `https://downloads.sidenote.app/licenses/${item.product.slug || row?.id || 'digital'}`
    );

    if (row) {
      await prisma.product.update({
        where: { id: row.id },
        data: {
          licenseKeysPool: pool.slice(quantity),
          stock: Math.max(0, row.stock - quantity),
        },
      });
    }
  }

  const order: Order = {
    id: `ord-${randomBlock(10)}`,
    orderNumber,
    userId: input.userId,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    company: input.company,
    notes: input.notes,
    couponCode: input.couponCode,
    items: input.items,
    subtotal: input.subtotal,
    discount: input.discount,
    total: input.total,
    paymentMethod: input.paymentMethod,
    paymentStatus: 'PAID',
    orderStatus: 'COMPLETED',
    licenseKeysDelivered: licenseKeys,
    downloadLinks,
    createdAt: new Date().toISOString(),
  };

  if (isAvailable) {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        const created = await prisma.order.create({
          data: {
            orderNumber: order.orderNumber,
            userId: order.userId,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            company: order.company,
            notes: order.notes,
            couponCode: order.couponCode,
            items: JSON.stringify(order.items),
            subtotal: order.subtotal,
            discount: order.discount,
            total: order.total,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus,
            licenseKeysDelivered: order.licenseKeysDelivered,
            downloadLinks: order.downloadLinks,
          },
        });
        return mapOrderRow(created);
      } catch (error) {
        if (isDuplicateKeyError(error) && attempt < 2) {
          orderNumber = generateOrderNumber();
          order.orderNumber = orderNumber;
          continue;
        }
        throw error;
      }
    }
  }

  memoryOrders.unshift(order);
  return order;
}

export async function updateOrderStatus(
  idOrSlug: string,
  status: Order['orderStatus']
): Promise<Order | null> {
  if (!isValidOrderStatus(status)) {
    throw new ValidationError('Invalid order status.');
  }

  if (await isPrismaAvailable()) {
    const where = isObjectId(idOrSlug) ? { id: idOrSlug } : { orderNumber: idOrSlug };
    const existing = await prisma.order.findFirst({ where });
    if (!existing) return null;
    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: { orderStatus: status },
    });
    return mapOrderRow(updated);
  }

  const order = memoryOrders.find(entry => entry.id === idOrSlug || entry.orderNumber === idOrSlug);
  if (!order) return null;
  order.orderStatus = status;
  return order;
}

// ---------------------------------------------------------------------------
// CMS
// ---------------------------------------------------------------------------

export async function getCmsContent(): Promise<SiteCmsData> {
  if (await isPrismaAvailable()) {
    try {
      const record = await prisma.siteContent.findUnique({ where: { key: 'cms_all' } });
      if (record) {
        const parsed = safeJson<SiteCmsData | null>(record.data, null);
        if (parsed) {
          memoryCmsContent = parsed;
          return parsed;
        }
      }
    } catch (error) {
      console.error('[DB] getCmsContent failed:', (error as Error).message);
    }
  }
  return memoryCmsContent;
}

export async function updateCmsContent(patch: Partial<SiteCmsData>): Promise<SiteCmsData> {
  const allowedSections = new Set(Object.keys(defaultCmsContent));
  const accepted: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(patch ?? {})) {
    if (!allowedSections.has(key)) continue;
    accepted[key] = sanitizeCmsValue(value, key);
  }

  const current = await getCmsContent();
  const merged = { ...current, ...accepted } as SiteCmsData;

  if (await isPrismaAvailable()) {
    const existing = await prisma.siteContent.findUnique({ where: { key: 'cms_all' } });
    if (existing) {
      await prisma.siteContent.update({
        where: { key: 'cms_all' },
        data: { data: JSON.stringify(merged) },
      });
    } else {
      await prisma.siteContent.create({
        data: { key: 'cms_all', data: JSON.stringify(merged) },
      });
    }
  }

  memoryCmsContent = merged;
  return merged;
}

// ---------------------------------------------------------------------------
// Coupons
// ---------------------------------------------------------------------------

function mapCouponRow(row: DbCoupon): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountAmount: row.discountAmount ?? undefined,
    discountPercent: row.discountPercent ?? undefined,
    minSpend: row.minSpend,
    description: row.description,
    isActive: row.isActive,
    usageCount: row.usageCount,
    validUntil: row.validUntil ? row.validUntil.toISOString() : undefined,
  };
}

export async function getAllCoupons(options: { activeOnly?: boolean } = {}): Promise<Coupon[]> {
  if (await isPrismaAvailable()) {
    try {
      const rows = await prisma.coupon.findMany({
        where: options.activeOnly ? { isActive: true } : undefined,
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(mapCouponRow);
    } catch (error) {
      console.error('[DB] getAllCoupons failed:', (error as Error).message);
    }
  }
  return options.activeOnly
    ? memoryCoupons.filter(coupon => coupon.isActive !== false)
    : [...memoryCoupons];
}

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<{ valid: boolean; discount: number; code?: string; coupon?: Coupon; message: string }> {
  if (typeof code !== 'string' || code.trim() === '') {
    return { valid: false, discount: 0, message: 'Coupon code is required.' };
  }

  const normalizedCode = code.trim().toUpperCase();
  const coupons = await getAllCoupons({ activeOnly: true });
  const coupon = coupons.find(entry => entry.code.toUpperCase() === normalizedCode);

  if (!coupon) {
    return { valid: false, discount: 0, message: 'Invalid or expired coupon code.' };
  }
  if (coupon.validUntil && new Date(coupon.validUntil).getTime() < Date.now()) {
    return { valid: false, discount: 0, message: 'This coupon has expired.' };
  }
  if (!Number.isFinite(subtotal) || subtotal < coupon.minSpend) {
    return {
      valid: false,
      discount: 0,
      message: `Minimum order amount of ৳ ${coupon.minSpend.toLocaleString()} required for this coupon.`,
    };
  }

  let discount = 0;
  if (coupon.discountPercent) {
    discount = Math.round((subtotal * coupon.discountPercent) / 100);
  } else if (coupon.discountAmount) {
    discount = coupon.discountAmount;
  }
  discount = Math.min(discount, subtotal);

  return {
    valid: true,
    discount,
    code: coupon.code,
    coupon,
    message: `Coupon "${coupon.code}" applied! You save ৳ ${discount.toLocaleString()}`,
  };
}

export async function redeemCoupon(code: string): Promise<void> {
  const normalizedCode = code.trim().toUpperCase();
  if (await isPrismaAvailable()) {
    try {
      await prisma.coupon.updateMany({
        where: { code: normalizedCode },
        data: { usageCount: { increment: 1 } },
      });
      return;
    } catch (error) {
      console.error('[DB] redeemCoupon failed:', (error as Error).message);
    }
  }
  const coupon = memoryCoupons.find(entry => entry.code.toUpperCase() === normalizedCode);
  if (coupon) coupon.usageCount = (coupon.usageCount || 0) + 1;
}

function buildCouponDefaults(data: Partial<Coupon>): Coupon {
  const code = (data.code || '').trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,32}$/.test(code)) {
    throw new ValidationError('Coupon code must be 3-32 characters (letters, numbers, hyphens).');
  }
  const discountPercent =
    data.discountPercent === undefined || data.discountPercent === null
      ? undefined
      : toFiniteNumber(data.discountPercent, 0);
  const discountAmount =
    data.discountAmount === undefined || data.discountAmount === null
      ? undefined
      : toFiniteNumber(data.discountAmount, 0);

  if (discountPercent !== undefined && (discountPercent <= 0 || discountPercent > 100)) {
    throw new ValidationError('Discount percent must be between 1 and 100.');
  }
  if (discountAmount !== undefined && discountAmount <= 0) {
    throw new ValidationError('Discount amount must be greater than zero.');
  }
  if (discountPercent === undefined && discountAmount === undefined) {
    throw new ValidationError('A coupon requires either a discount percent or a discount amount.');
  }

  const minSpend = data.minSpend === undefined ? 0 : toFiniteNumber(data.minSpend, 0);
  if (minSpend < 0) throw new ValidationError('Minimum spend must be a non-negative number.');

  return {
    id: data.id || `coup-${randomBlock(8)}`,
    code,
    discountAmount,
    discountPercent,
    minSpend,
    description: data.description || 'Promotional Discount Voucher',
    isActive: data.isActive !== false,
    usageCount: data.usageCount || 0,
    validUntil: data.validUntil,
  };
}

export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  const coupon = buildCouponDefaults(data);

  if (await isPrismaAvailable()) {
    const existing = await prisma.coupon.findUnique({ where: { code: coupon.code } });
    if (existing) throw new ValidationError('A coupon with this code already exists.', 409);
    const created = await prisma.coupon.create({
      data: {
        code: coupon.code,
        discountAmount: coupon.discountAmount,
        discountPercent: coupon.discountPercent,
        minSpend: coupon.minSpend,
        description: coupon.description,
        isActive: coupon.isActive !== false,
        usageCount: coupon.usageCount || 0,
        validUntil: coupon.validUntil ? new Date(coupon.validUntil) : undefined,
      },
    });
    return mapCouponRow(created);
  }

  memoryCoupons.push(coupon);
  return coupon;
}

export async function updateCoupon(
  idOrCode: string,
  patch: Partial<Coupon>
): Promise<Coupon | null> {
  const update: Prisma.CouponUpdateInput = {};
  if (patch.discountAmount !== undefined) {
    const amount = toFiniteNumber(patch.discountAmount, NaN);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new ValidationError('Discount amount must be greater than zero.');
    }
    update.discountAmount = amount;
  }
  if (patch.discountPercent !== undefined) {
    const percent = toFiniteNumber(patch.discountPercent, NaN);
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) {
      throw new ValidationError('Discount percent must be between 1 and 100.');
    }
    update.discountPercent = percent;
  }
  if (patch.minSpend !== undefined) update.minSpend = toFiniteNumber(patch.minSpend, 0);
  if (patch.description !== undefined) update.description = String(patch.description);
  if (patch.isActive !== undefined) update.isActive = !!patch.isActive;
  if (patch.validUntil !== undefined) {
    update.validUntil = patch.validUntil ? new Date(patch.validUntil) : null;
  }

  if (await isPrismaAvailable()) {
    const where = isObjectId(idOrCode) ? { id: idOrCode } : { code: idOrCode.trim().toUpperCase() };
    const existing = await prisma.coupon.findFirst({ where });
    if (!existing) return null;
    const updated = await prisma.coupon.update({ where: { id: existing.id }, data: update });
    return mapCouponRow(updated);
  }

  const index = memoryCoupons.findIndex(
    coupon => coupon.id === idOrCode || coupon.code.toUpperCase() === idOrCode.trim().toUpperCase()
  );
  if (index === -1) return null;
  memoryCoupons[index] = { ...memoryCoupons[index], ...patch };
  return memoryCoupons[index];
}

export async function deleteCoupon(idOrCode: string): Promise<boolean> {
  if (await isPrismaAvailable()) {
    const where = isObjectId(idOrCode) ? { id: idOrCode } : { code: idOrCode.trim().toUpperCase() };
    const existing = await prisma.coupon.findFirst({ where });
    if (!existing) return false;
    await prisma.coupon.delete({ where: { id: existing.id } });
    return true;
  }

  const before = memoryCoupons.length;
  memoryCoupons = memoryCoupons.filter(
    coupon => coupon.id !== idOrCode && coupon.code.toUpperCase() !== idOrCode.trim().toUpperCase()
  );
  return memoryCoupons.length !== before;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function getAllUsers(): Promise<UserProfile[]> {
  if (await isPrismaAvailable()) {
    try {
      const rows = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, image: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      return rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: (user.role === 'admin' ? 'admin' : 'user') as UserProfile['role'],
        image: user.image ?? undefined,
        createdAt: user.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error('[DB] getAllUsers failed:', (error as Error).message);
    }
  }
  return [...memoryUsers];
}

export async function updateUserRole(userId: string, role: UserProfile['role']): Promise<boolean> {
  if (!isValidRole(role)) throw new ValidationError('Role must be "admin" or "user".');

  if (await isPrismaAvailable()) {
    const where = isObjectId(userId) ? { id: userId } : { email: userId.trim().toLowerCase() };
    const existing = await prisma.user.findFirst({ where });
    if (!existing) return false;
    await prisma.user.update({ where: { id: existing.id }, data: { role } });
    return true;
  }

  const user = memoryUsers.find(entry => entry.id === userId || entry.email === userId);
  if (!user) return false;
  user.role = role;
  return true;
}

export async function countAdmins(): Promise<number> {
  if (await isPrismaAvailable()) {
    try {
      return await prisma.user.count({ where: { role: 'admin' } });
    } catch (error) {
      console.error('[DB] countAdmins failed:', (error as Error).message);
    }
  }
  return memoryUsers.filter(user => user.role === 'admin').length;
}

// ---------------------------------------------------------------------------
// Dashboard analytics
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  if (await isPrismaAvailable()) {
    try {
      const [revenue, completedOrders, totalProducts, totalUsers, licenseRows, recentRows] =
        await Promise.all([
          prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: 'PAID' } }),
          prisma.order.count({ where: { orderStatus: 'COMPLETED' } }),
          prisma.product.count({ where: { active: true } }),
          prisma.user.count(),
          prisma.order.findMany({ select: { licenseKeysDelivered: true } }),
          prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
        ]);

      return {
        totalRevenue: revenue._sum.total ?? 0,
        totalCompletedOrders: completedOrders,
        totalProducts,
        totalCustomers: totalUsers,
        totalDigitalLicensesIssued: licenseRows.reduce(
          (sum, order) => sum + (order.licenseKeysDelivered?.length ?? 0),
          0
        ),
        recentOrders: recentRows.map(mapOrderRow),
      };
    } catch (error) {
      console.error('[DB] getDashboardStats failed:', (error as Error).message);
    }
  }

  const orders = [...memoryOrders];
  return {
    totalRevenue: orders.reduce(
      (sum, order) => sum + (order.paymentStatus === 'PAID' ? order.total : 0),
      0
    ),
    totalCompletedOrders: orders.filter(order => order.orderStatus === 'COMPLETED').length,
    totalProducts: memoryProducts.filter(product => product.active !== false).length,
    totalCustomers: memoryUsers.length,
    totalDigitalLicensesIssued: orders.reduce(
      (sum, order) => sum + (order.licenseKeysDelivered?.length ?? 0),
      0
    ),
    recentOrders: orders.slice(0, 6),
  };
}

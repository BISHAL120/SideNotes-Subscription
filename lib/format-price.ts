export function formatPrice(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '৳ 0';
  }
  // Format with commas in South Asian / Bangladesh numbering or standard thousand separators
  const formatted = new Intl.NumberFormat('en-IN').format(Math.round(amount));
  return `৳ ${formatted}`;
}

export function calculateDiscount(currentPrice: number, originalPrice?: number): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

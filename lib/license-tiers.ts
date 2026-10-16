export interface LicenseTier {
  name: string;
  priceMultiplier: number;
  description: string;
  badge?: string;
}

export const LICENSE_TIERS: LicenseTier[] = [
  {
    name: 'Standard Commercial',
    priceMultiplier: 1,
    description: 'Single commercial project. Lifetime access to all updates.',
    badge: 'Most Popular',
  },
  {
    name: 'Extended Agency',
    priceMultiplier: 1.5,
    description: 'Unlimited client projects with resale-ready deployment rights.',
    badge: 'Best Value',
  },
  {
    name: 'Enterprise Lifetime',
    priceMultiplier: 2.2,
    description: 'Unlimited seats, priority support SLA, and lifetime upgrades.',
    badge: 'Ultimate',
  },
];

export function getLicenseTier(name?: string): LicenseTier | undefined {
  if (!name) return undefined;
  return LICENSE_TIERS.find(tier => tier.name === name);
}

export function priceForVariant(basePrice: number, variant?: string): number {
  const tier = getLicenseTier(variant);
  const multiplier = tier?.priceMultiplier ?? 1;
  const base = Number.isFinite(basePrice) && basePrice > 0 ? basePrice : 0;
  return Math.round(base * multiplier);
}

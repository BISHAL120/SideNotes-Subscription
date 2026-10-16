'use client';

import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, CreditCard, Headphones, KeyRound, LucideIcon } from 'lucide-react';
import { defaultCmsContent } from '@/data/cms-default';
import { TrustBenefitItem } from '@/types/cms';

const iconMap: Record<string, LucideIcon> = {
  Zap,
  ShieldCheck,
  CreditCard,
  Headphones,
  KeyRound
};

export const TrustBenefits: React.FC = () => {
  const [benefits, setBenefits] = useState<TrustBenefitItem[]>(defaultCmsContent.trustBenefits);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content?.trustBenefits?.length > 0) {
          setBenefits(data.content.trustBenefits);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="bg-white py-6 border-b border-neutral-100">
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {benefits.map((b, idx) => {
            const IconComponent = iconMap[b.icon] || ShieldCheck;
            return (
              <div
                key={b.id || idx}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-neutral-50/80 border border-neutral-200/80 hover:border-[#F58220]/40 transition-colors group"
              >
                <div className="w-11 h-11 rounded-xl bg-white shadow-xs border border-neutral-200/60 flex items-center justify-center shrink-0 text-[#F58220] group-hover:scale-105 transition-transform">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-neutral-900 truncate">{b.title}</h4>
                  <p className="text-[11px] text-neutral-500 truncate mt-0.5">{b.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

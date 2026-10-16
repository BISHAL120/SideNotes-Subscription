'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Sparkles, Tag } from 'lucide-react';
import { defaultCmsContent } from '@/data/cms-default';
import { AnnouncementBarContent } from '@/types/cms';

export const AnnouncementBar: React.FC = () => {
  const [announcement, setAnnouncement] = useState<AnnouncementBarContent>(
    defaultCmsContent.announcementBar
  );

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content?.announcementBar) {
          setAnnouncement(data.content.announcementBar);
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement.enabled) return null;

  return (
    <div className="bg-[#0A0A0A] text-neutral-300 text-[11px] py-1.5 px-4 border-b border-neutral-800">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 truncate">
          <span className="px-2 py-0.5 rounded bg-orange-500/10 text-[#F58220] font-black text-[9px] uppercase tracking-wider border border-orange-500/20">
            {announcement.badgeText || 'Instant Delivery'}
          </span>
          <span className="font-semibold text-neutral-200 truncate">
            {announcement.text}
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] shrink-0 font-medium">
          {announcement.hotline && (
            <a
              href={`tel:${announcement.hotline}`}
              className="flex items-center gap-1.5 text-white hover:text-[#F58220] transition-colors"
            >
              <Phone className="w-3 h-3 text-[#F58220]" />
              <span>Hotline: <strong className="font-bold">{announcement.hotline}</strong></span>
            </a>
          )}
          <span className="hidden sm:inline text-neutral-700">|</span>
          <Link
            href={announcement.linkUrl || '/offers'}
            className="flex items-center gap-1 text-[#F58220] hover:text-[#E66D10] font-bold"
          >
            <Tag className="w-3 h-3" />
            <span>Promo Deals</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

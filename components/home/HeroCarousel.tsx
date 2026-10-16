'use client';

import React, { useState, useEffect, useSyncExternalStore } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { defaultCmsContent } from '@/data/cms-default';
import { HeroSlide, PromoBanner } from '@/types/cms';

function subscribeReducedMotion(callback: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', callback);
  return () => query.removeEventListener('change', callback);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const HeroCarousel: React.FC = () => {
  const [slides, setSlides] = useState<HeroSlide[]>(defaultCmsContent.heroSlides);
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>(defaultCmsContent.promoBanners);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false
  );

  const safeHref = (url: string | undefined, fallback: string) => {
    if (!url) return fallback;
    const trimmed = url.trim();
    if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? trimmed : fallback;
    } catch {
      return fallback;
    }
  };

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.content) {
          if (data.content.heroSlides?.length > 0) {
            setSlides(data.content.heroSlides.filter((s: HeroSlide) => s.active !== false));
          }
          if (data.content.promoBanners?.length > 0) {
            setPromoBanners(data.content.promoBanners);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || paused || reducedMotion) return;
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, paused, reducedMotion]);

  const slide = slides[currentSlide] || defaultCmsContent.heroSlides[0];

  return (
    <section className="bg-neutral-900 py-4 sm:py-6 border-b border-neutral-800">
      <div className="max-w-[1440px] mx-auto px-4">
        <h1 className="sr-only">
          SideNote Subscriptions — digital products, SaaS accounts and software licenses in
          Bangladesh
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Hero Slider (8 Cols) */}
          <div
            className="lg:col-span-8 relative rounded-2xl overflow-hidden bg-neutral-950 text-white flex items-center shadow-2xl border border-neutral-800 group min-h-[340px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            {/* Background Image / Overlay */}
            {slide.imageUrl && (
              <div className="absolute inset-0 z-0">
                <Image
                  src={slide.imageUrl}
                  alt={slide.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover opacity-25 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/85 to-transparent" />
              </div>
            )}

            {/* Slide Content */}
            <div className="relative z-10 px-6 sm:px-12 py-8 max-w-xl space-y-3">
              {slide.badge && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-[#F58220] border border-orange-500/30">
                  <Sparkles className="w-3 h-3" />
                  <span>{slide.badge}</span>
                </div>
              )}

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {slide.title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-lg">
                {slide.subtitle}
              </p>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href={safeHref(slide.linkUrl, '/products')}
                  className="px-6 py-3 rounded-xl bg-[#F58220] hover:bg-[#E66D10] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-transform hover:scale-[1.02] shadow-lg shadow-orange-500/20"
                >
                  <span>{slide.ctaText || 'Get Instant Access'}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/products"
                  className="px-4 py-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-colors border border-neutral-700"
                >
                  View Catalog
                </Link>
              </div>
            </div>

            {/* Navigation Controls */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setCurrentSlide(prev => (prev === 0 ? slides.length - 1 : prev - 1))
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-lg bg-black/60 hover:bg-[#F58220] text-white backdrop-blur-xs flex items-center justify-center transition-all shadow-md"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-lg bg-black/60 hover:bg-[#F58220] text-white backdrop-blur-xs flex items-center justify-center transition-all shadow-md"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {slides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentSlide === idx
                          ? 'w-6 bg-[#F58220]'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                      aria-current={currentSlide === idx}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right Side Promo Banners (4 Cols) */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {promoBanners.slice(0, 2).map((promo, idx) => (
              <div
                key={promo.id || idx}
                className={`p-5 rounded-2xl bg-gradient-to-br ${promo.bgGradient || 'from-neutral-900 to-neutral-950'} text-white flex flex-col justify-between border border-neutral-800 shadow-xl relative overflow-hidden group`}
              >
                <div className="relative z-10">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F58220] block mb-1">
                    {promo.badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                    {promo.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1 line-clamp-2">
                    {promo.subtitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 relative z-10 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-neutral-300">Instant Delivery</span>
                  <Link
                    href={safeHref(promo.buttonUrl, '/products')}
                    className="text-xs font-bold text-[#F58220] hover:text-[#E66D10] flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    <span>{promo.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

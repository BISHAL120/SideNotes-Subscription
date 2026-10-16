import { HeroCarousel } from '@/components/home/HeroCarousel';
import { TrustBenefits } from '@/components/home/TrustBenefits';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { AppleExclusiveSection } from '@/components/home/AppleExclusiveSection';
import { ExclusiveDealsSection } from '@/components/home/ExclusiveDealsSection';
import { ExchangeBanner } from '@/components/home/ExchangeBanner';
import { ComputersSection } from '@/components/home/ComputersSection';
import { FeaturedTabsSection } from '@/components/home/FeaturedTabsSection';
import { NewArrivalsSection } from '@/components/home/NewArrivalsSection';
import { HomeAppliancesSection } from '@/components/home/HomeAppliancesSection';
import { TopBrandsSection } from '@/components/home/TopBrandsSection';
import { TechArticlesSection } from '@/components/home/TechArticlesSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Campaign Slider at the top */}
      <HeroCarousel />

      {/* 2. Trust & Service Benefits Strip */}
      <TrustBenefits />

      {/* 3. Featured Categories Grid */}
      <CategoryGrid />

      {/* 4. Apple Exclusive 2026 Showcase */}
      <AppleExclusiveSection />

      {/* 5. Hot Deals with Live Countdown */}
      <ExclusiveDealsSection />

      {/* 6. Phone Trade-In & Exchange Banner */}
      <ExchangeBanner />

      {/* 7. AG Computers (GPU, Keyboards, PC Parts) */}
      <ComputersSection />

      {/* 8. Featured Tabs (Best Deals & Top Selling) */}
      <FeaturedTabsSection />

      {/* 9. New Arrivals Showcase */}
      <NewArrivalsSection />

      {/* 10. Home Appliances & Living */}
      <HomeAppliancesSection />

      {/* 11. Top Brands Filter Section */}
      <TopBrandsSection />

      {/* 12. Tech Editorial & Power Backup Articles */}
      <TechArticlesSection />

      {/* 13. Newsletter Subscription */}
      <NewsletterSection />
    </main>
  );
}

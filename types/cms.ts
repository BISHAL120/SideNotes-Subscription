export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  imageUrl: string;
  linkUrl: string;
  ctaText: string;
  accentColor: string;
  active: boolean;
}

export interface TrustBenefitItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
}

export interface AnnouncementBarContent {
  enabled: boolean;
  text: string;
  hotline: string;
  badgeText: string;
  linkUrl: string;
  showEmi: boolean;
  showExchange: boolean;
}

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  buttonText: string;
  buttonUrl: string;
  bgGradient: string;
}

export interface StoreInfo {
  storeName: string;
  tagline: string;
  supportEmail: string;
  hotline: string;
  hours: string;
  locationNote: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  githubUrl: string;
  copyrightText: string;
}

export interface PolicyContent {
  instantDeliveryText: string;
  refundPolicyText: string;
  licenseTermsText: string;
  faqList: { question: string; answer: string }[];
}

export interface SiteCmsData {
  announcementBar: AnnouncementBarContent;
  heroSlides: HeroSlide[];
  trustBenefits: TrustBenefitItem[];
  promoBanners: PromoBanner[];
  storeInfo: StoreInfo;
  policyContent: PolicyContent;
}

import { SiteCmsData } from '@/types/cms';

export const defaultCmsContent: SiteCmsData = {
  announcementBar: {
    enabled: true,
    text: 'Flash Sale: 20% OFF on all 1-Year AI & Developer Subscriptions with code "DIGITAL20"',
    hotline: '09678148148',
    badgeText: 'Instant Delivery',
    linkUrl: '/offers',
    showEmi: true,
    showExchange: false
  },
  heroSlides: [
    {
      id: 'slide-1',
      title: 'Official OpenAI ChatGPT Plus & AI Memberships',
      subtitle:
        'Direct genuine 1-year private subscriptions with unlimited GPT-4o, Canvas, and DALL-E 3. Instant credentials dispatch within 60 seconds.',
      badge: '2026 OFFICIAL PARTNER',
      imageUrl:
        'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/product/chatgpt-plus-1-year-subscription',
      ctaText: 'Get Instant Access',
      accentColor: '#F58220',
      active: true
    },
    {
      id: 'slide-2',
      title: 'Production Next.js 15 Enterprise SaaS Boilerplate',
      subtitle:
        'Launch your startup in days with Better Auth, Prisma ORM, MongoDB, Stripe Billing, and modern Tailwind v4 components.',
      badge: 'BESTSELLER TEMPLATE',
      imageUrl:
        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/product/nextjs-15-enterprise-saas-boilerplate',
      ctaText: 'Explore Codebase',
      accentColor: '#10B981',
      active: true
    },
    {
      id: 'slide-3',
      title: 'Windows 11 Pro Genuine Retail Activation Keys',
      subtitle:
        'Lifetime retail keys with BitLocker, Sandbox, and direct Microsoft account binding. 100% money-back guarantee.',
      badge: 'INSTANT SERIAL KEY',
      imageUrl:
        'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1200&q=80',
      linkUrl: '/product/windows-11-pro-retail-digital-license',
      ctaText: 'Claim 55% Off',
      accentColor: '#3B82F6',
      active: true
    }
  ],
  trustBenefits: [
    {
      id: 'tb-1',
      icon: 'Zap',
      title: 'Instant Automated Delivery',
      subtitle: 'Serial keys and download links sent via email in 60s'
    },
    {
      id: 'tb-2',
      icon: 'ShieldCheck',
      title: '100% Genuine Licenses',
      subtitle: 'Official publisher accounts with replacement warranty'
    },
    {
      id: 'tb-3',
      icon: 'CreditCard',
      title: 'Secure Local & Card Payments',
      subtitle: 'bKash, Nagad, Visa, MasterCard, and instant verification'
    },
    {
      id: 'tb-4',
      icon: 'Headphones',
      title: 'Dedicated Priority Support',
      subtitle: 'Live engineer chat & hotline 9:00 AM – 10:00 PM'
    }
  ],
  promoBanners: [
    {
      id: 'promo-1',
      title: 'Supercharge Your AI Workflow',
      subtitle: 'Get Midjourney Pro & ChatGPT Plus bundled with dedicated 1-year seats.',
      badge: 'POPULAR BUNDLE',
      buttonText: 'View AI Tools',
      buttonUrl: '/category/saas-subscriptions',
      bgGradient: 'from-orange-600 via-amber-600 to-orange-700'
    },
    {
      id: 'promo-2',
      title: 'Developer Starter Collection',
      subtitle: 'Full-stack templates, Figma design systems, and JetBrains IDE suites.',
      badge: 'DEV BUNDLE',
      buttonText: 'Browse Templates',
      buttonUrl: '/category/developer-templates',
      bgGradient: 'from-blue-600 via-indigo-600 to-purple-700'
    }
  ],
  storeInfo: {
    storeName: 'SideNote Subscriptions',
    tagline: 'Bangladesh\'s Premier Digital Store for Software Licenses, SaaS Accounts & Dev Kits',
    supportEmail: 'support@sidenote.app',
    hotline: '09678148148',
    hours: 'Everyday 9:00 AM – 10:00 PM (Instant 24/7 Digital Delivery)',
    locationNote: 'Digital Headquarters: Level 12, Banani Commercial Tower, Dhaka - 1213',
    facebookUrl: 'https://facebook.com/sidenotesubscriptions',
    youtubeUrl: 'https://youtube.com/@sidenotedigital',
    instagramUrl: 'https://instagram.com/sidenotedigital',
    githubUrl: 'https://github.com/sidenote-digital',
    copyrightText: '© 2026 SideNote Subscriptions & Digital Products. All rights reserved.'
  },
  policyContent: {
    instantDeliveryText:
      'All digital products, license keys, and account credentials are automatically delivered to your registered email address and visible under your account dashboard immediately after checkout verification.',
    refundPolicyText:
      'We offer an unconditional 7-day replacement or refund policy if an activation key fails verification or an account experience credential issues.',
    licenseTermsText:
      'Commercial templates and source code licenses grant unlimited use in personal and commercial client projects with white-label rights.',
    faqList: [
      {
        question: 'How fast do I receive my digital product?',
        answer:
          'Delivery is instantaneous. As soon as your payment is processed, your activation serial key and download URL are rendered on screen, sent to your email, and stored in your My Account dashboard.'
      },
      {
        question: 'Are these official software licenses and subscriptions?',
        answer:
          'Yes, 100%. We source software retail certificates directly from authorized enterprise distributors and partners. Each license comes with serial verification.'
      },
      {
        question: 'Can I pay with bKash or Nagad?',
        answer:
          'Yes, we support bKash, Nagad, Visa, MasterCard, and American Express with immediate automatic verification.'
      }
    ]
  }
};

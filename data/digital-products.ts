import { Product } from '@/types/product';

export const digitalProducts: Product[] = [
  {
    id: 'prod-chatgpt-plus-annual',
    name: 'OpenAI ChatGPT Plus 1-Year Private Account Subscription',
    slug: 'chatgpt-plus-1-year-subscription',
    brand: 'OpenAI',
    price: 24999,
    originalPrice: 29999,
    discountBadge: 'Save 17%',
    rating: 4.95,
    reviewCount: 342,
    category: 'SaaS & AI Subscriptions',
    subcategory: 'ChatGPT Plus & Claude',
    images: [
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 45,
    isFeatured: true,
    isHotDeal: true,
    isTopSelling: true,
    isNewArrival: false,
    warranty: '12 Months Replacement Guarantee',
    digitalAssetType: 'SUBSCRIPTION',
    downloadUrl: 'https://chat.openai.com/auth/login',
    fileFormat: 'Direct Account Credentials + 2FA Secret Key',
    fileSize: 'Cloud Access',
    version: 'GPT-4o & o1 Reasoning Engine Access',
    liveDemoUrl: 'https://chat.openai.com',
    licenseType: '1-Year Dedicated Commercial Seat',
    licenseKeysPool: [
      'OPENAI-PLUS-9481-8201-YEAR',
      'OPENAI-PLUS-3109-7721-YEAR',
      'OPENAI-PLUS-5512-4091-YEAR'
    ],
    description:
      'Official 12-month private ChatGPT Plus subscription with dedicated email access, unlimited GPT-4o, OpenAI Canvas, DALL-E 3 image generation, Advanced Voice Mode, and Custom GPTs.',
    specifications: {
      'AI Models': 'GPT-4o, GPT-4, OpenAI o1-preview, DALL-E 3',
      'Subscription Term': '12 Months (365 Days)',
      'Account Type': 'Dedicated Private Account (Full Ownership)',
      'Delivery Time': 'Instant Dispatch via Email & Account Portal',
      'Voice Mode': 'Advanced Realtime Voice Mode Supported',
      'Browsing & Code': 'Web Search, Python Code Interpreter, Vision'
    },
    keyFeatures: [
      'Dedicated private email and custom password change access',
      'Zero cooldown limits on advanced GPT-4o reasoning models',
      'Instant access to Canvas and Code Interpreter data tools',
      'Official 1-year replacement warranty if account has issues',
      'Priority 24/7 dedicated support'
    ],
    tags: ['openai', 'chatgpt', 'ai', 'gpt4', 'subscription', 'prompt']
  },
  {
    id: 'prod-nextjs-saas-enterprise',
    name: 'Next.js 15 Enterprise SaaS Boilerplate (Better Auth + Prisma + Stripe)',
    slug: 'nextjs-15-enterprise-saas-boilerplate',
    brand: 'SideNote Dev',
    price: 7999,
    originalPrice: 11999,
    discountBadge: 'Save ৳ 4,000',
    rating: 4.98,
    reviewCount: 189,
    category: 'Templates & Source Code',
    subcategory: 'Next.js 15 & React 19',
    images: [
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 999,
    isFeatured: true,
    isHotDeal: false,
    isTopSelling: true,
    isNewArrival: true,
    warranty: 'Lifetime Updates & Discord Dev Support',
    digitalAssetType: 'SOURCE_CODE',
    downloadUrl: 'https://github.com/sidenote-digital/nextjs15-saas-pro.git',
    fileFormat: 'ZIP Archive + Private GitHub Invitation',
    fileSize: '48.5 MB',
    version: 'v15.2.4 (2026 Production Ready)',
    liveDemoUrl: 'https://demo.sidenotedev.com',
    licenseType: 'Commercial Unlimited Projects License',
    licenseKeysPool: [
      'NEXTSAAS-8819-2041-DEV',
      'NEXTSAAS-7412-9011-DEV',
      'NEXTSAAS-3301-1876-DEV'
    ],
    description:
      'The modern production-ready SaaS starter kit built on Next.js 15 App Router, React 19, Better Auth authentication, Prisma ORM, MongoDB/PostgreSQL, Stripe billing, Tailwind v4, and role-based admin dashboard.',
    specifications: {
      'Framework': 'Next.js 15 (Turbopack) & React 19',
      'Auth Engine': 'Better Auth (Session, Social, Email, 2FA, Roles)',
      'Database ORM': 'Prisma ORM with MongoDB & PostgreSQL drivers',
      'Payment Gateway': 'Stripe Subscriptions & Webhook Listeners',
      'UI & Styling': 'Tailwind CSS v4 & Framer Motion',
      'Email Integration': 'Resend + React Email templates'
    },
    keyFeatures: [
      'Complete authentication, session management, and role-based permissions',
      'Pre-built customer billing portal with tiered subscription plans',
      'Full administrative CMS dashboard with analytics and user moderation',
      'TypeScript strict mode with zero lint errors and comprehensive unit tests',
      'Lifetime code repository updates and private Discord community'
    ],
    tags: ['nextjs', 'react', 'prisma', 'better-auth', 'stripe', 'saas', 'typescript']
  },
  {
    id: 'prod-midjourney-pro-annual',
    name: 'Midjourney Pro Annual Commercial Plan (Fast GPU Hours + Stealth Mode)',
    slug: 'midjourney-pro-annual-plan',
    brand: 'Midjourney',
    price: 32500,
    originalPrice: 38000,
    discountBadge: 'Hot Deal',
    rating: 4.92,
    reviewCount: 147,
    category: 'SaaS & AI Subscriptions',
    subcategory: 'Design & Midjourney',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 22,
    isFeatured: true,
    isHotDeal: true,
    isTopSelling: false,
    isNewArrival: false,
    warranty: '12 Months Official Guarantee',
    digitalAssetType: 'SUBSCRIPTION',
    downloadUrl: 'https://www.midjourney.com/account',
    fileFormat: 'Private Discord Account / Invitation Link',
    fileSize: 'Cloud Access',
    version: 'Midjourney v6.1 & Niji v6',
    liveDemoUrl: 'https://www.midjourney.com',
    licenseType: 'Pro Commercial License (Stealth Mode)',
    licenseKeysPool: [
      'MIDJOURNEY-PRO-7819-2026-KEY',
      'MIDJOURNEY-PRO-4412-2026-KEY'
    ],
    description:
      'Official 1-Year Midjourney Pro membership with 30 Fast GPU hours per month, unlimited Relax GPU hours, Stealth generation mode to keep commercial assets private, and concurrent job queues.',
    specifications: {
      'Fast GPU Time': '30 Hours / month (Instant generation)',
      'Relax GPU Time': 'Unlimited Generations',
      'Stealth Mode': 'Included (Images hidden from community gallery)',
      'Concurrent Jobs': '12 Concurrent Fast Jobs + 3 Relax Jobs',
      'Commercial Usage': '100% Full Commercial Rights'
    },
    keyFeatures: [
      'Complete privacy mode for enterprise client work and trademarks',
      'Ultra high-resolution upscaling and v6.1 hyper-photorealism',
      'Direct message bot interaction without noisy public server clutter',
      'Instant digital credentials dispatch with automated warranty'
    ],
    tags: ['midjourney', 'ai-art', 'generative-ai', 'graphics', 'subscription']
  },
  {
    id: 'prod-windows-11-pro-retail',
    name: 'Windows 11 Professional Retail Digital License Key (Instant Delivery)',
    slug: 'windows-11-pro-retail-digital-license',
    brand: 'Microsoft',
    price: 2499,
    originalPrice: 5500,
    discountBadge: 'Save 55%',
    rating: 4.99,
    reviewCount: 820,
    category: 'Software & OS Licenses',
    subcategory: 'Windows 11 Pro Keys',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 120,
    isFeatured: true,
    isHotDeal: false,
    isTopSelling: true,
    isNewArrival: false,
    warranty: 'Lifetime Retail Activation Guarantee',
    digitalAssetType: 'LICENSE_KEY',
    downloadUrl: 'https://www.microsoft.com/software-download/windows11',
    fileFormat: '25-Digit Alpha-Numeric Product Key + ISO Link',
    fileSize: 'Digital Code',
    version: 'Windows 11 Pro 24H2 / 2026 Edition',
    liveDemoUrl: 'https://www.microsoft.com/windows',
    licenseType: 'Lifetime 1-PC Retail Key (Re-installable)',
    licenseKeysPool: [
      'W11PR-99412-BB812-CC712-AA901',
      'W11PR-88231-KK712-MM901-ZZ441',
      'W11PR-55102-LL881-QQ221-VV334'
    ],
    description:
      'Genuine 100% authentic Microsoft Windows 11 Pro Retail 25-digit activation key with BitLocker drive encryption, Windows Sandbox, Hyper-V virtualization, and official Windows Update support.',
    specifications: {
      'License Format': 'Retail Key (Binds to Microsoft Account / Motherboard)',
      'Bit Architecture': '64-Bit / ARM64 Compatible',
      'Language': 'Multi-Language Global Worldwide Activation',
      'Reinstallation': 'Unlimited Reinstalls on the Same PC',
      'Activation Method': 'Online Microsoft Server Activation'
    },
    keyFeatures: [
      'Full BitLocker enterprise grade disk and file encryption',
      'Remote Desktop hosting support and Windows Sandbox testing',
      'Direct official updates directly through Microsoft Servers',
      'Automatic instant dispatch via customer email within 60 seconds'
    ],
    tags: ['windows', 'microsoft', 'license-key', 'os', 'windows11']
  },
  {
    id: 'prod-figma-ultimate-system',
    name: 'Antigravity Ultra: Comprehensive Figma Design System (25,000+ Components)',
    slug: 'figma-ultimate-design-system-tokens',
    brand: 'Apex Design',
    price: 4999,
    originalPrice: 8500,
    discountBadge: 'Save ৳ 3,500',
    rating: 4.96,
    reviewCount: 215,
    category: 'Design Systems & 3D Kits',
    subcategory: 'Figma UI Kits',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 999,
    isFeatured: true,
    isHotDeal: false,
    isTopSelling: false,
    isNewArrival: true,
    warranty: 'Lifetime Token Updates (Figma Community)',
    digitalAssetType: 'UI_KIT',
    downloadUrl: 'https://figma.com/@sidenote/antigravity-ultra',
    fileFormat: 'Figma .FIG File + Community Duplicate Link',
    fileSize: '320 MB (Asset Library)',
    version: 'Figma Variables 2.0 (2026 Update)',
    liveDemoUrl: 'https://preview.figma.com/antigravity-ultra',
    licenseType: 'Commercial Unlimited Client License',
    licenseKeysPool: [
      'FIGMA-ULTRA-8819-2041-KEY',
      'FIGMA-ULTRA-1102-3341-KEY'
    ],
    description:
      'The definitive Figma UI kit for product designers and agencies. Featuring 25,000+ auto-layout components, WCAG AAA accessible color palettes, dark mode tokens, typography scales, and responsive templates.',
    specifications: {
      'Components': '25,000+ Auto-Layout 5.0 Components',
      'Variables': 'Color, Spacing, Typography, Radius & Shadows',
      'Themes': 'Light Mode, Dark Mode & High Contrast',
      'Icons Included': '2,400+ Vector Feather & Lucide SVGs',
      'Templates': '45+ Pre-designed SaaS & eCommerce Screen Flows'
    },
    keyFeatures: [
      'Interactive prototyping variants with hover and click micro-states',
      'Design tokens mapped directly to Tailwind CSS class names',
      'Mobile, Tablet, and Desktop responsive layout frames',
      'Ready for immediate client delivery and white-label branding'
    ],
    tags: ['figma', 'design-system', 'ui-kit', 'tokens', 'ux']
  },
  {
    id: 'prod-jetbrains-all-products',
    name: 'JetBrains All Products Pack 1-Year Commercial License',
    slug: 'jetbrains-all-products-pack-license',
    brand: 'JetBrains',
    price: 18999,
    originalPrice: 24000,
    discountBadge: 'Save 21%',
    rating: 5.0,
    reviewCount: 94,
    category: 'Software & OS Licenses',
    subcategory: 'JetBrains IDE Licenses',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 18,
    isFeatured: true,
    isHotDeal: false,
    isTopSelling: true,
    isNewArrival: false,
    warranty: '1 Year Official JetBrains Account Key',
    digitalAssetType: 'LICENSE_KEY',
    downloadUrl: 'https://account.jetbrains.com/licenses',
    fileFormat: 'JetBrains License Certificate / Activation Code',
    fileSize: 'Official License Token',
    version: '2026.1 All IDE Suites',
    liveDemoUrl: 'https://www.jetbrains.com',
    licenseType: '1-Year Commercial All-Pack (WebStorm, IntelliJ, PyCharm, CLion, GoLand)',
    licenseKeysPool: [
      'JETBRAINS-ALL-9912-8821-CERT',
      'JETBRAINS-ALL-4412-9011-CERT'
    ],
    description:
      'Access every JetBrains IDE including IntelliJ IDEA Ultimate, WebStorm, PyCharm Pro, GoLand, CLion, DataGrip, PhpStorm, Rider, and ReSharper with full AI Assistant integration.',
    specifications: {
      'Included IDEs': 'IntelliJ, WebStorm, PyCharm, GoLand, CLion, Rider, DataGrip',
      'License Duration': '1 Year Full Subscription',
      'AI Assistant': 'Official JetBrains AI Assistant Enabled',
      'Platforms': 'macOS (Apple Silicon & Intel), Windows, Linux'
    },
    keyFeatures: [
      'Direct account assignment with your personal/company email',
      'Seamless multi-platform installation across all your computers',
      'Automatic fallback perpetual license upon subscription completion',
      'Instant key activation and dedicated serial certificate'
    ],
    tags: ['jetbrains', 'intellij', 'webstorm', 'developer', 'ide']
  },
  {
    id: 'prod-fullstack-mastery-guide',
    name: 'The Ultimate Full-Stack System Design & Microservices Handbook (2026)',
    slug: 'fullstack-system-design-microservices-handbook',
    brand: 'SideNote Academy',
    price: 1999,
    originalPrice: 3500,
    discountBadge: 'Save 43%',
    rating: 4.97,
    reviewCount: 312,
    category: 'E-Books & Video Guides',
    subcategory: 'System Design Books',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 999,
    isFeatured: false,
    isHotDeal: false,
    isTopSelling: false,
    isNewArrival: true,
    warranty: 'Lifetime Digital Updates',
    digitalAssetType: 'EBOOK',
    downloadUrl: 'https://downloads.sidenote.app/books/fullstack-system-design-2026.pdf',
    fileFormat: 'PDF + ePub + Notion Architecture Workspace',
    fileSize: '85 MB High-Res',
    version: '4th Edition (Updated Oct 2026)',
    liveDemoUrl: 'https://preview.sidenote.app/sample-chapter.pdf',
    licenseType: 'Personal Reader License',
    licenseKeysPool: [
      'BOOK-SYSTEM-9921-READER',
      'BOOK-SYSTEM-8812-READER'
    ],
    description:
      '480+ pages of high-yield architectural patterns, real-world case studies (Netflix, Uber, Stripe), distributed caching with Redis, Kafka event streaming, database sharding, and interview frameworks.',
    specifications: {
      'Pages': '482 Full Color Illustrated Pages',
      'Formats': 'Interactive PDF (Searchable), ePub, and Notion Hub',
      'Code Examples': 'TypeScript, Go, Python, and SQL snippets',
      'Diagrams': '200+ High-definition architecture schematics'
    },
    keyFeatures: [
      'Step-by-step blueprints for designing systems handling 100k+ RPS',
      'In-depth database performance tuning and read-replica strategies',
      'Notion template with flashcards and mock interview scenarios',
      'Instant direct download link delivered immediately after checkout'
    ],
    tags: ['system-design', 'microservices', 'ebook', 'architecture', 'fullstack']
  },
  {
    id: 'prod-tailwind-ui-pro-components',
    name: 'Tailwind CSS v4 & React 19 Premium UI Component Suite (250+ Components)',
    slug: 'tailwind-css-v4-react-19-premium-ui-suite',
    brand: 'PixelForge',
    price: 5999,
    originalPrice: 8999,
    discountBadge: 'Save 33%',
    rating: 4.93,
    reviewCount: 164,
    category: 'Templates & Source Code',
    subcategory: 'Tailwind CSS UI Kits',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80'
    ],
    stock: 999,
    isFeatured: true,
    isHotDeal: false,
    isTopSelling: false,
    isNewArrival: false,
    warranty: 'Lifetime Code Updates',
    digitalAssetType: 'SOURCE_CODE',
    downloadUrl: 'https://downloads.sidenote.app/templates/tailwind-v4-ui-suite.zip',
    fileFormat: 'NPM Registry Package + Full React Source Code',
    fileSize: '34 MB',
    version: 'Tailwind v4.1 & React 19',
    liveDemoUrl: 'https://tailwind-suite-demo.sidenote.app',
    licenseType: 'Unlimited Commercial Projects',
    licenseKeysPool: [
      'TWPRO-9921-REACT19-KEY',
      'TWPRO-4412-REACT19-KEY'
    ],
    description:
      'Over 250 handcrafted, responsive, and fully animated components designed with Tailwind CSS v4, Radix primitives, Lucide icons, and Framer Motion transitions.',
    specifications: {
      'CSS Framework': 'Tailwind CSS v4.1 (Zero config CSS engine)',
      'React Support': 'React 19 Server & Client Components',
      'Accessibility': '100% WCAG 2.1 Compliant with ARIA landmarks',
      'Animations': 'Motion & Tw-Animate-CSS keyframes'
    },
    keyFeatures: [
      'Copy-paste ready components or clean NPM private package import',
      'E-Commerce, SaaS, Analytics Dashboards, and Landing page sections',
      'Custom theme toggle with smooth CSS view transitions',
      'Clean modular TypeScript code without bloated external dependencies'
    ],
    tags: ['tailwind', 'react', 'ui-kit', 'components', 'frontend']
  }
];

export const getDigitalProductBySlug = (slug: string): Product | undefined => {
  return digitalProducts.find(p => p.slug === slug);
};

export const getDigitalProductById = (id: string): Product | undefined => {
  return digitalProducts.find(p => p.id === id);
};

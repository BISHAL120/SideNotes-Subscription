import { Category } from '@/types/product';

export const digitalCategories: Category[] = [
  {
    id: 'saas-subscriptions',
    name: 'SaaS & AI Subscriptions',
    slug: 'saas-subscriptions',
    iconName: 'Sparkles',
    itemCount: 2,
    description: 'Instant genuine subscription accounts and official memberships for premier AI, developer and productivity platforms.',
    subcategories: [
      { name: 'ChatGPT Plus & Claude', slug: 'ai-subscriptions' },
      { name: 'Developer Cloud & Copilot', slug: 'developer-subscriptions' },
      { name: 'Design & Midjourney', slug: 'creative-subscriptions' },
      { name: 'Streaming & Music', slug: 'media-subscriptions' }
    ]
  },
  {
    id: 'developer-templates',
    name: 'Templates & Source Code',
    slug: 'developer-templates',
    iconName: 'Code',
    itemCount: 2,
    description: 'Production-ready starter kits, SaaS boilerplates, and full-stack application source codes built with modern frameworks.',
    subcategories: [
      { name: 'Next.js 15 & React 19', slug: 'nextjs' },
      { name: 'Flutter & Mobile Apps', slug: 'flutter' },
      { name: 'Tailwind CSS UI Kits', slug: 'tailwind' },
      { name: 'Go & Node Microservices', slug: 'backend' }
    ]
  },
  {
    id: 'design-assets',
    name: 'Design Systems & 3D Kits',
    slug: 'design-assets',
    iconName: 'Layers',
    itemCount: 1,
    description: 'World-class Figma design systems, 3D asset libraries, Blender packs, and brand presentation mockups.',
    subcategories: [
      { name: 'Figma UI Kits', slug: 'figma' },
      { name: '3D Icons & Illustrations', slug: '3d-assets' },
      { name: 'Mockup Studio Packs', slug: 'mockups' }
    ]
  },
  {
    id: 'software-licenses',
    name: 'Software & OS Licenses',
    slug: 'software-licenses',
    iconName: 'Key',
    itemCount: 2,
    description: '100% genuine lifetime retail activation keys and official software credentials with instant email dispatch.',
    subcategories: [
      { name: 'Windows 11 Pro Keys', slug: 'windows' },
      { name: 'Microsoft 365 Suites', slug: 'office' },
      { name: 'JetBrains IDE Licenses', slug: 'jetbrains' },
      { name: 'Mac Utilities & Productivity', slug: 'mac-apps' }
    ]
  },
  {
    id: 'ebooks-guides',
    name: 'E-Books & Video Guides',
    slug: 'ebooks-guides',
    iconName: 'BookOpen',
    itemCount: 1,
    description: 'Comprehensive technical handbooks, architecture roadmaps, and prompt engineering compendiums.',
    subcategories: [
      { name: 'System Design Books', slug: 'system-design' },
      { name: 'Prompt Engineering Packs', slug: 'ai-prompts' },
      { name: 'Cloud Architecture PDFs', slug: 'cloud-guides' }
    ]
  }
];

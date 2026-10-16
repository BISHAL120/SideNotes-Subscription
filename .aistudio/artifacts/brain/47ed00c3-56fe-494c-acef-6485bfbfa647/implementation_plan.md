# SideNote — Modern Electronics & Gadgets E-Commerce Store

SideNote is an authentic, modern electronics and gadgets e-commerce web platform inspired by the clean product discovery and catalog architecture of Apple Gadgets BD. It combines a multi-brand ecosystem (Apple, Samsung, Google, Sony, Anker, Xiaomi, PC components, and smart lifestyle gear) with a refined aesthetic featuring dark charcoal foundations, crisp neutral product canvases, and focused warm-orange action accents.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed during Phase 1 clarification:
> - **Brand Identity**: **SideNote** (SideNote Gadgets) — Clean, modern tech brandmark.
> - **Catalog Emphasis**: **Full Apple & Multi-Brand Ecosystem** — iPhone 18 Pro/17 Pro series, MacBooks, iPads, Galaxy devices, flagship audio, PC components, smartwatches, and home tech.
> - **Accent Palette**: **Authentic Warm Orange (`#F58220`) & Dark Charcoal (`#171717`)** — High-visibility CTA contrast with clean white/parchment product backgrounds.

- **Confirmed Decision 1**: Storefront currency is Bangladeshi Taka (`৳` BDT) formatted with international standard number formatting (e.g., `৳ 186,499`).
- **Confirmed Decision 2**: Interactive state management uses React Context + `localStorage` for Cart, Wishlist, and Recent Views persistence across sessions without requiring external backend servers.

---

## 1. Overview & Core Concept

- **What It Does**: A complete multi-page e-commerce storefront for tech enthusiasts and gadget buyers. Users can browse by category or brand, search with instant suggestions, explore curated deal showcases, view rich product pages with spec breakdowns and image galleries, configure variants, manage cart and coupons, and test an end-to-end mock checkout with cash on delivery and mobile banking options.
- **Target Audience / Persona**: Tech shoppers, Apple enthusiasts, gamers, and modern gadget seekers in Bangladesh looking for authentic electronics, transparent BDT pricing, and clean specs.
- **Key Value**: Delivers the high-density catalog power of an established electronics retailer with the crisp typography, responsive layout, and zero-clutter UX of a modern design system.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Discovery & Exploration**: Users land on the storefront greeted by an announcement banner, top-tier global header with live predictive search, and a mega-menu category navigation. The homepage delivers a hero campaign carousel, trust badges (36 Months EMI, Nationwide Delivery, Exchange Facility, Best Price Deals), featured category grid, Apple Exclusive collection, Flash Deals with discount chips, AG Computers/PC components, and Tabbed Featured Products.
2. **Product Filtering & Category Browsing**: Users filter by brand chips (Apple, Samsung, Xiaomi, Sony, Anker, Google), price ranges, availability, and sort criteria (Featured, Price: Low to High, Price: High to Low, Highest Rated, Newest) on responsive 2-column to 5-column grids.
3. **Product Inspection (PDP)**: Contiguous purchase module on `/product/[slug]` with an interactive multi-angle image gallery, color/storage variant switches, stock indicator, EMI breakdown calculator, full tech spec table, and related gear recommendations.
4. **Cart, Wishlist & Checkout**: Seamless Add-to-Cart with visual toast notifications, persistent slide-out / dedicated `/cart` with coupon redemption (`SAVE500`), and a 2-column `/checkout` flow with form validation and instant mock order generation.

### Visual Identity & Theme
- **Aesthetic Direction**: Contemporary tech retail. High-contrast, clean typography, photography-first product cards with consistent aspect ratios, subtle borders, and zero AI-slop decorative fluff.
- **Color Palette**:
  - Dominant Canvas: `#FFFFFF` (Pure White) and `#F7F8FA` (Soft neutral section tone)
  - Dark Structural Header: `#171717` (Deep Charcoal Black) with `#262626` hover states
  - Brand Accent: `#F58220` (Authentic Gadget Orange) and `#E66D10` (Hover State)
  - Sale & Discount Badge: `#FFF1E6` with `#C2410C` text
  - Text: Primary `#171717`, Secondary `#737373`, Hairline Borders `#E5E7EB`
- **Typography**: Clean sans-serif hierarchy (`Plus Jakarta Sans` / modern system sans), balancing bold 28–36px hero titles, 14–16px product headings, and tabular numerals (`tabular-nums`) for clean price alignment.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side Catalog Architecture with Centralized Mock Data**
  - *Chosen Approach*: Comprehensive TypeScript catalog (`src/data/products.ts`) containing 45+ realistic products across 12 categories, with full specs, variants, ratings, and BDT prices.
  - *Why*: Eliminates latency, guarantees instant search/filtering responses, and ensures 100% offline-resilient evaluation without fragile external API dependencies.
  - *Alternatives Considered*: Remote mock API — rejected due to risk of sandbox network blocks and slower cold-starts.
- **Decision 2: Dual Navigation (Desktop Mega Menu & Mobile Drawer)**
  - *Chosen Approach*: Full-featured hover-stabilized mega menu on desktop (`>= 1024px`) with category breakdowns and featured products; accessible slide-out drawer with accordion subcategories on mobile.
  - *Why*: Satisfies power-shoppers on desktop while keeping mobile navigation thumb-accessible within the 15% sticky height budget.
- **Decision 3: LocalStorage State Sync**
  - *Chosen Approach*: React Context providers (`CartContext`, `WishlistContext`) backed by `localStorage` with window storage event listeners.
  - *Why*: Guarantees that items added anywhere on the site reflect instantly in the header badge count, cart page, and checkout summary across tabs and page transitions.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App Router (/app)                               │
│  ┌────────────┬─────────────┬──────────────┬──────────────┬──────────┐ │
│  │  Home (/)  │ Products &  │ Product PDP  │ Cart & Order │ Wishlist │ │
│  │            │ Category    │ /[slug]      │ /checkout    │ /account │ │
│  └──────┬─────┴──────┬──────┴───────┬──────┴───────┬──────┴────┬─────┘ │
└─────────┼────────────┼──────────────┼──────────────┼───────────┼───────┘
          │            │              │              │           │
┌─────────▼────────────▼──────────────▼──────────────▼───────────▼───────┐
│                    Global Layout & Shared UI                           │
│  ┌────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │ AnnouncementBar        │  │ Header (Search, Badges, MegaMenu)     │ │
│  ├────────────────────────┤  ├───────────────────────────────────────┤ │
│  │ MobileBottomNav        │  │ Multi-Column Footer & Store Info      │ │
│  └────────────────────────┘  └───────────────────────────────────────┘ │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
┌────────────────────────────────────▼───────────────────────────────────┐
│                    State & Business Logic Layer                        │
│  ┌────────────────────────┐  ┌───────────────────────────────────────┐ │
│  │ CartContext            │  │ WishlistContext                       │ │
│  │ (Items, Quantities,    │  │ (Saved IDs, Sync, Toggle)             │ │
│  │ Coupons, Subtotals)    │  │                                       │ │
│  └───────────┬────────────┘  └──────────────────┬────────────────────┘ │
│              └─────────────────┬────────────────┘                      │
│                                │ Persists via                          │
│                                ▼                                       │
│                       [ LocalStorage API ]                             │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ Reads Catalog
┌────────────────────────────────────▼───────────────────────────────────┐
│                  Centralized Mock Data Store                           │
│  - 45+ Products (Phones, Laptops, Audio, Watches, PC, Appliances)     │
│  - 12 Categories with hierarchical subcategories                       │
│  - 12 Top Brands (Apple, Samsung, Xiaomi, Sony, Anker, etc.)          │
│  - Promotional Banners, Trust Badges, Coupons, and Store Outlets       │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Interactive Components & State Handlers
1. **Header Live Search**: Debounced query matching product title, brand, category, and tags with thumbnail suggestions dropdown and full-page `/products?q=...` routing.
2. **ProductCard**: Standardized price rendering with strikethrough original prices, discount chip (`% OFF`), direct one-click Add to Cart, and wishlist heart toggle with micro-animations.
3. **Product Gallery & Buy Module**: Interactive thumbnail switching, variant selection (Storage/Color) dynamically updating price, stock state enforcement, and instant Buy Now redirection.
4. **Checkout Form**: Comprehensive input validation (name, phone number, delivery address, shipping method), discount coupon calculations, and celebratory confirmation dialog.

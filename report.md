# SideNote Subscriptions — Full Application Test Report

**Date:** 2026-10-16
**App:** SideNote Subscriptions & Digital (Next.js 15.5.28 e-commerce, Better Auth, Prisma + MongoDB)
**Tested URL:** http://localhost:3100 (ports 3000/3001 were occupied by other projects, so the app was run on 3100 with matching `BETTER_AUTH_URL`)
**Method:** Real-browser testing via Playwright MCP (Chromium) against a live dev server, plus direct API (`curl`) and MongoDB inspection. Screenshots/snapshots saved under `.playwright-mcp/`.
**Database used:** No local `mongod` was installed and Docker wasn't running, so a throwaway single-node MongoDB replica set (`mongodb-memory-server`, port 27017) was used to exercise the real DB paths. All QA test data was cleaned up afterwards.

---

## 1. Executive Summary

The storefront is visually polished and most browsing/commerce flows work: homepage, catalog with filters/search/sort, product pages, cart with coupons, checkout with license-key generation, wishlist, offers, and the admin dashboard all render and respond correctly in a real browser.

However, **the authentication and authorization layer is effectively non-functional and insecure**:

- Registration **always fails** (HTTP 422 from Better Auth) and the UI silently fakes success by writing a fake user to `localStorage`.
- Login **never verifies credentials** — any email/password "logs in", and any email containing the word `admin` gets a **fake admin session**.
- There is **no route or API protection anywhere** (no middleware, no auth checks in any API route): `/admin`, `/api/users`, `/api/orders`, etc. are fully public.
- The `/account` page shows a **hardcoded demo user** to guests and lists **every customer's orders** (names, emails, phones) to anyone.

Additionally, most admin-created data (products, coupons) is **memory-only and lost on restart**, orders created while the DB is unreachable are lost, and a MongoDB **replica set is required** for order persistence.

---

## 2. Feature Status

### ✅ Working features (browser-verified)

| Feature | Status | Notes |
|---|---|---|
| Homepage render | ✅ | All 13 sections, hero carousel with prev/next/dots (3 slides) |
| Hero carousel navigation | ✅ | Slides advance, dots update |
| Featured Products tabs (BEST DEALS / TOP SELLING) | ✅ | Content switches correctly |
| Trust-benefits strip, promo banners, brand section | ✅ | Render correctly |
| Newsletter subscribe (UI) | ✅ | Shows "Thank you for subscribing!", clears input (no backend exists) |
| Add to cart (homepage, catalog, PDP) | ✅ | Badge + subtotal update, persisted in `localStorage` (`sidenote_cart`) |
| Wishlist toggle + badge | ✅ | Persisted (`sidenote_wishlist`), badge count updates |
| Wishlist page | ✅ | Renders saved items (after hydration) |
| Cart page | ✅ | Line items, qty +/−, remove, clear, totals, free delivery |
| Coupon `DIGITAL20` in cart | ✅ | 20% off applied (৳24,999 → ৳19,999), persisted |
| Checkout form | ✅ | Required-field validation works (3 errors on empty submit) |
| Checkout order placement | ✅ | Confirmation modal, order number `SN-DIGITAL-xxxxxx`, generated license key + download link, copy button, cart cleared |
| Order persistence to MongoDB | ✅ | Verified row written to `orders` collection **when Mongo runs as a replica set** |
| Catalog page `/products` | ✅ | 8 products, type/category/publisher filters, keyword search, 4 sort options |
| Header global search | ✅ | Navigates to `/products?q=...`, query honored and mirrored in sidebar filter |
| Category pages | ✅ | e.g. `/category/saas-subscriptions`: 2 items, subcategory chips, sort |
| Product detail page | ✅ | Gallery, license-tier selector, qty stepper, Add to Cart with variant, reviews tab, related products |
| Offers page | ✅ | Hero, 16 product links, coupon callouts |
| Admin dashboard (overview) | ✅ | Revenue/orders/licenses/product stats, recent orders table |
| Admin — Create product | ✅ | Saved and immediately visible in catalog API/UI |
| Admin — Delete product | ✅ | `DELETE /api/products/[id]` works |
| Admin — Create coupon | ✅ | Appears in `/api/coupons` (memory-only — see bugs) |
| Admin — Users & Roles toggle | ✅ | Role flip reflected in `/api/users` (memory-only users) |
| Admin — CMS editor | ✅ | Hero slides/banners/footer editors, `PUT /api/content` 200 on save |
| Admin — Order status change | ⚠️ | Works only for memory-fallback orders; **silently fails for DB orders** |
| Auth pages render | ✅ | `/login`, `/register` render with demo quick-login buttons |
| 404 handling | ⚠️ | Unknown routes → proper 404 page; unknown slugs/categories → soft 200 pages |
| All API endpoints respond | ✅ | `/api/products`, `/categories`, `/coupons`, `/orders`, `/users`, `/stats`, `/content` all 200 |

### ❌ Broken / non-functional features

| Feature | Status | Notes |
|---|---|---|
| User registration | ❌ | Better Auth returns **422 FAILED_TO_CREATE_USER** every time; UI fakes success via `localStorage` |
| Login / session | ❌ | No credential verification; fake client-side "session" only |
| Admin authorization | ❌ | Any email containing `admin` + any password → admin console |
| Route/API protection | ❌ | `/admin` and all `/api/*` accessible with no session |
| Per-user account data | ❌ | `/account` shows hardcoded "Tanvir Ahmed" demo profile; shows **all** orders to guests |
| Order status update (DB orders) | ❌ | PATCH returns "Order not found"; dropdown silently reverts |
| Admin-created coupon persistence | ❌ | Not written to DB; vanishes after server restart |
| Admin-created product persistence | ❌ | New products are memory-only (no DB write path for new items) |
| Instant Checkout | ❌ | Duplicates the item in the cart (see BUG-09) |
| `?filter=new` (New Arrivals link) | ❌ | Query param ignored — shows unfiltered catalog |

---

## 3. Bugs & Issues

### CRITICAL — Security / Access Control

**BUG-01 · Registration is completely broken (and lies about it)**
- Repro: `/register` → any name/email/password → "Register Account".
- Result: `POST /api/auth/sign-up/email` → **HTTP 422** `{"message":"Failed to create user","code":"FAILED_TO_CREATE_USER"}`. Server log: `Malformed ObjectID: invalid character 'N' was found at index 0 in the provided hex string ... for the field 'id'`.
- Root cause: Better Auth generates a random string ID, but `prisma/schema.prisma` declares `id String @id @default(auto()) @map("_id") @db.ObjectId` (Mongo `_id` must be a 24-hex ObjectId). No `advanced.database.generateId` / ObjectId conversion is configured in `lib/auth.ts`.
- Impact: **No user can ever register.** Worse, `app/register/page.tsx` catches the failure and writes a fake `sidenote_demo_user` to `localStorage`, then redirects to `/account` as if it worked — the user is misled and can never log in later.

**BUG-02 · Login accepts anything (no real authentication)**
- Repro: `/login` → `totally-fake-admin@attacker.com` / `wrongpassword` → redirected to **`/admin`**.
- Root cause: `app/login/page.tsx` falls back to `localStorage` "demo" users whenever `authClient.signIn.email()` returns an error, and routes by `email.includes('admin')`. Also note the post-login role check is `if (email.toLowerCase().includes('admin')) router.push('/admin')`.
- Impact: Full authentication bypass; privilege escalation by typing "admin" in the email field.

**BUG-03 · No route or API protection at all**
- `app/admin/page.tsx` is a client component with no session check; `/admin` renders for anonymous visitors.
- Every API route lacks auth: `grep` for `auth.`/`getSession` in `app/api/**` returns nothing, and there is no `middleware.ts`.
- Exposed unauthenticated: `GET /api/users` (email addresses + roles), `GET /api/orders` (customer names, emails, phones, order contents), plus write routes `POST/PUT/DELETE /api/products`, `/api/coupons`, `PATCH /api/orders/[id]`, `PUT /api/content`.
- Verified: anonymous `curl` to `/api/users` and `/api/orders` returned full customer data.

**BUG-04 · Account page leaks other customers' data**
- Repro: visit `/account` with no session → shows hardcoded profile **"Tanvir Ahmed — tanvir@example.com"**, "Verified Member", a Sign Out button, and the Order History tab lists **all orders in the system** (`SN-948102` Tanvir Ahmed, `SN-831049` Nafis Chowdhury — different customers' names/emails/phones).
- Root cause: `app/account/page.tsx` never reads the Better Auth session; it defaults `userProfile` state to demo values and displays `data.orders` from `/api/orders` unfiltered.

### HIGH — Data Integrity / Persistence

**BUG-05 · MongoDB must be a replica set, and standalone MongoDB silently degrades to memory**
- With a standalone `mongod`, `prisma.order.create()` fails: *"Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set."* The API still returns 201 because of the in-memory fallback, so **orders are silently not persisted**. `.env.local` (`mongodb://localhost:27017/...`) gives no hint that a replica set is required.

**BUG-06 · When MongoDB is unreachable, every DB-backed API blocks ~30 seconds**
- Observed: `GET /api/orders` → **200 in 29,986 ms** while Mongo was down, before falling back to memory (Prisma server-selection timeout; `lib/db.ts` calls `$runCommandRaw({ping:1})` with default timeout). Any page hitting these APIs hangs accordingly.

**BUG-07 · Data-source flip-flop hides data**
- `lib/db.ts` returns DB rows **only if non-empty**, otherwise memory data — never a merge. Observed: creating 1 DB order made the admin's order count drop 2 → 1 (memory orders hidden), and admin-created products/coupons disappear from listings once DB collections are non-empty. Orders/products in memory vanish entirely on restart.

**BUG-08 · Order status updates do not persist for DB orders (silent failure)**
- Repro: Admin → Orders → change status of a DB-stored order → dropdown immediately reverts to the old value, **no error shown**. API evidence: `PATCH /api/orders/6ad20c...` → `{"success":false,"error":"Order not found"}`.
- Root cause: `updateOrderStatus()` only searches `memoryOrders`; it never touches Prisma, so DB orders can't be updated and memory updates are never persisted.

**BUG-09 · "Instant Checkout" duplicates the item in the cart**
- Repro: PDP → "Add to Cart" → "Instant Checkout" → checkout shows **Qty 2 / ৳4,998** for a single ৳2,499 item.
- Root cause: `handleInstantCheckout` calls `addToCart(...)` (which increments quantity if the product is already present) and then routes to `/checkout` (`app/product/[slug]/page.tsx:77-78`).

### MEDIUM — UX / Correctness

**BUG-10 · Admin-created coupons/products are never written to the database**
- Created voucher `QATEST25` via admin → present in `/api/coupons` → a few minutes later gone (dev server module reload), and the DB had **zero collections**. `saveCoupon()`/`saveCategory()` in `lib/db.ts` only mutate in-memory arrays; `saveProduct()` skips the DB for new items (writes only when a 24-hex id is supplied).
- Impact: configure the store in admin, restart the server, lose everything.

**BUG-11 · Coupon system is inconsistent across the app**
- The cart validates against a hardcoded client list (`DIGITAL20`, `WELCOME10`, `SAVE500`); checkout validates against the server (`DIGITAL20`, `WELCOME10` only).
- The cart page advertises *"Available codes: SAVE500 (৳500 off), APPLE2026 (৳2,000 off)"* — **APPLE2026 does not exist** (typing it returns "Invalid promo code"), and SAVE500 is **rejected by the checkout API** (`curl` verified).

**BUG-12 · Dead hero/product images → repeated 404s on every page**
- Two Unsplash URLs are dead upstream (404 from Unsplash itself): `photo-1677442136019-21780efad99a` (hero slide 1, ChatGPT product, cart thumbnails) and `photo-1532012164546-f432f2e3777a` (products). Server log recorded **33 upstream-image failures** in one session; browsers logged the same `/_next/image?... 404` repeatedly (auto-rotating hero re-requests it).
- The URLs live in `data/cms-default.ts` and `data/digital-products.ts`. The first slide renders as an empty/broken tile.

**BUG-13 · Mobile: horizontal overflow on every page (56 px)**
- At 390×844: `document.scrollWidth = 446` vs viewport 390 on `/` and `/products`.
- Causes: the header action group (`Dashboard/Wishlist/Bag/Account/hamburger`) does not fully collapse — its container overflows to x=446 and the trailing control is **clipped off-screen**; decorative absolutely-positioned blobs (`-right-20`) also overflow without `overflow-hidden`.

**BUG-14 · "Empty" flash before hydration on cart/wishlist pages**
- Fresh load of `/cart` with items: first paint (and the header badge) shows **"Your Shopping Cart is Empty / ৳0"** (SSR snapshot is always empty), then populates after hydration. Same on `/wishlist`. Confirmed by DOM reads before/after hydration.

**BUG-15 · Toasts never auto-dismiss**
- `components/ui/Toast.tsx` has no timer — the message only disappears via the ✕ button, and because `toastMessage` lives in the root `CartProvider`, a coupon toast from the cart page was still visible minutes later on checkout. Observed in a screenshot: *"Coupon 'DIGITAL20' applied successfully!"* still on screen during order confirmation.

**BUG-16 · Query params other than `q` are ignored**
- Homepage "View All New" links to `/products?filter=new`; the page shows all 8 products with no filter applied.

**BUG-17 · Soft 404s return HTTP 200 and fabricated pages**
- `/product/this-product-does-not-exist` → renders "Digital Product Not Found" but **HTTP 200**.
- `/category/nonexistent-cat` → renders a category page titled **"Nonexistent-cat"** (auto-capitalized slug) with an empty list, HTTP 200 — instead of a 404/not-found state.

**BUG-18 · Category/publisher counts contradict the catalog**
- Category tiles advertise 18 / 24 / 16 / 14 / 12 items (90 total) and product cards show "820 verified reviews"; the actual catalog contains **8 products** and each PDP shows a single demo review. Category sidebar counts in `/products` are also 18/24/16/14/12 while filtering yields 2-3 items.

**BUG-19 · Checkout email-format validation is dead code**
- `validate()` has a regex branch producing *"Please enter a valid email address."*, but the input is `type="email"`, so the browser blocks submission natively before React runs; the custom message can never render (`not-an-email` produced no app error, no request).

**BUG-20 · Copy is left over from an electronics-store template**
- Site `<title>`/meta: *"SideNote Electronics | Authentic Gadgets & Tech in Bangladesh"* (a digital-subscriptions store; `metadata.json` even claims "150+ verified AI models").
- Header search placeholder: *"Search for phones, laptops, gadgets..."*.
- Cart empty state: *"…Explore our genuine Apple lineup, smartphones, or accessories."*
- Homepage "New Arrival": *"Freshly landed audio gear, wearables & lifestyle smart devices"* (shows digital products).
- Footer/sections advertise *"0% EMI on 28+ banks"*, *"Delivery Fee FREE"*, *"iPhone releases"*, *"exclusive gadget offers"* — irrelevant for digital goods.

**BUG-21 · favicon.ico missing (404 on every page load).**

### LOW — Observations

- `Next.js` warning: `scroll-behavior: smooth` on `<html>` without `data-scroll-behavior="smooth"`.
- Next.js LCP warning for the dead hero image ("Please add the priority property").
- Header "Dashboard" link is visible to anonymous visitors on every page.
- Admin order/user/coupon data shown in admin derives from demo seed memory (e.g. users `admin@sidenote.app`, `tanvir@example.com`) that does not exist in the database.
- `/api/orders` response shape is `{success, orders}` while `/api/orders` GET is also consumed by `/account` which expects that shape — consistent, but the same endpoint exposes everyone's data (see BUG-04).
- Numbers rendering: admin "Gross Revenue ৳32,498" includes demo memory orders only.

---

## 4. Console & Server Error Summary (one test session, 137 requests)

| Error | Count | Source |
|---|---|---|
| `/_next/image ... 404` (dead Unsplash URLs) | repeated on every page (33 upstream failures in server log) | BUG-12 |
| `favicon.ico 404` | every load | BUG-21 |
| `POST /api/auth/sign-up/email → 422` | 4 | BUG-01 |
| `prisma:error` (replica-set requirement / connection refused) | 4 | BUG-05/06 |
| Better Auth `[ERROR] Failed to create user` (Malformed ObjectID) | 4 | BUG-01 |
| Next.js smooth-scroll + LCP warnings | 2-3 | LOW |

No hydration-error crashes or unhandled runtime exceptions were observed during normal browsing.

---

## 5. What Was Tested (coverage)

Homepage and all sections · hero carousel · product tabs · brand/section links · newsletter · header search · catalog filters (type/category/publisher) · catalog search + sort · category page + sort · product detail (variants, qty, reviews, related) · add to cart (homepage + PDP) · instant checkout · cart (qty, coupon apply/remove, invalid coupon, totals) · checkout (validation, coupon, order placement, confirmation, license keys) · orders API/persistence · wishlist (toggle, badge, page) · register (validation + real attempt) · login (fake credentials, admin escalation) · account page (licenses, orders tabs, guest view) · admin: overview, products (list/create/delete), categories (list), orders (list, status change), coupons (list/create), users (list, role toggle), CMS editor (load, save) · offers page · invalid product/category/route handling · mobile viewport (390×844) · all 8 API endpoints · direct MongoDB inspection.

**Not covered:** real payment gateways (none integrated — payments are simulated), email delivery (none implemented despite "keys sent via email" copy), file downloads (license keys/links are generated strings), admin category CRUD, CMS inner section editing beyond save, browsers other than Chromium, load/performance testing.

---

## 6. Recommended Fix Order

1. **Fix the ObjectId mismatch** so Better Auth can create users (configure `generateId` to emit 24-hex ObjectIds, or change the schema), then **remove the localStorage demo fallbacks** in login/register and surface real errors. *(BUG-01/02)*
2. **Add real authorization**: `middleware.ts` protecting `/admin` and `/account`; session checks in every mutating API route; filter orders by session user. *(BUG-02/03/04)*
3. **Stop faking success**: replace demo-user writes with proper error states. *(BUG-01/02)*
4. **Fix persistence**: write products/coupons/categories/users to Prisma; make `updateOrderStatus` update the DB; document/handle the replica-set requirement. *(BUG-05/06/07/08/10)*
5. **Fix checkout correctness**: don't duplicate on Instant Checkout; unify coupon sources; drop the dead email-validation branch or set `noValidate`. *(BUG-09/11/19)*
6. **Fix media**: replace dead image URLs (also editable in admin CMS), add a favicon. *(BUG-12/21)*
7. **Polish**: mobile header overflow, hydration empty-flash (render skeleton until mounted), toast auto-dismiss, `?filter=` support, true 404s, copy sweep. *(BUG-13–18/20)*

---

*Artifacts:* screenshots and accessibility snapshots from this session are in `.playwright-mcp/` (homepage, checkout confirmation, admin dashboard, catalog, PDP, mobile). QA test data (test product, test coupon, test order, localStorage keys) was removed; the test dev server was run on port 3100 and stopped after testing.

# SideNote Subscriptions

Digital-products storefront for Bangladesh: AI/SaaS subscriptions, software licenses, developer
templates and e-books. Built with Next.js 15 (App Router), React 19, Prisma + MongoDB and
Better Auth.

## Run Locally

**Prerequisites:** Node.js 20+, MongoDB (a single-node replica set is recommended so Prisma
transactions are available).

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start a local MongoDB. With Docker:

   ```bash
   docker run -d -p 27017:27017 --name sidenote-mongo mongo:7 --replSet rs0
   docker exec -it sidenote-mongo mongosh --eval "rs.initiate()"
   ```

3. Create `.env.local` from `.env.example` and fill in:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `DATABASE_URL` | yes | MongoDB connection string. |
   | `BETTER_AUTH_SECRET` | yes | Random string, min 32 chars (`openssl rand -base64 48`). The app refuses to start without it. |
   | `BETTER_AUTH_URL` | production | Public origin, e.g. `https://store.example.com`. Required in production. |
   | `NEXT_PUBLIC_APP_URL` | no | Client-side app URL. |
   | `SEED_DEMO_DATA` | no | Set to `true` to allow auto-seeding the demo catalog on an empty production database. Development seeds automatically. |

4. Run the app:

   ```bash
   npm run dev
   ```

## Useful Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Type check |
| `npx prisma generate` | Regenerate the Prisma client after schema edits |

## Store Operations

- **First administrator:** register a normal account through `/register`, then set that user's
  `role` to `admin` (e.g. in MongoDB or with `prisma studio`). No admin account is created
  automatically.
- **Catalog:** products, categories, coupons and site content are managed from `/admin` and
  stored in MongoDB. The storefront, search, product pages and order fulfilment all read from the
  database; license keys and download URLs are never exposed to public API responses.
- **Orders:** order totals, discounts and stock are computed server-side from the database.
  Guest checkout is supported; signed-in customers see their own orders under `/account`.

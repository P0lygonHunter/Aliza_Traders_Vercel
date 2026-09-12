# Aliza Traders — Online Ethnic Wear Boutique

## Project Overview
- **Name**: Aliza Traders
- **Goal**: A full-stack online store for **Party Wear**, **Function Wear**, **Mehndi Wear** and **Bridal Luxe** lehengas, with a self-service **Admin Panel** so the owner can add/edit/delete products and upload real product photos anytime — no coding or developer help needed for routine catalog changes.
- **Design**: Editorial full-bleed layout inspired by Rastah.co's browsing flow — but with a fully original maroon/antique-gold brand identity, not a visual clone.

## URLs
- **Storefront**: https://3000-ib4zgdw2pplemcew39d0f-5185f4aa.sandbox.novita.ai
- **Admin Panel**: https://3000-ib4zgdw2pplemcew39d0f-5185f4aa.sandbox.novita.ai/admin
  - Default local login — **Username**: `admin` / **Password**: `AlizaTraders@2026` (change before going live — see Security note below)
- **Production**: _Not yet deployed to Cloudflare Pages_

## ⭐ Admin Panel — Manage Your Own Catalog
This is the answer to "I want to add my own products/images anytime, not have them hardcoded."

Go to **`/admin`**, log in, and you get:
- **Dashboard** — total products, orders, pending orders, revenue at a glance
- **Products** — Add / Edit / Delete any product:
  - Upload a real photo (JPG/PNG/WEBP, up to 5MB) — stored in Cloudflare R2, served via `/api/images/...`
  - Set name, category, price, sale price, fabric, description, stock, badge (New/Sale/Bestseller)
  - Add colors & sizes as tags (type + Enter)
  - If no photo is uploaded yet, a nice gradient placeholder tile is shown automatically — nothing ever breaks
- **Orders** — view every order placed on the storefront, see customer + items, update status (pending → confirmed → shipped → delivered / cancelled)
- **Messages** — see newsletter subscribers and contact-form messages

Every change here reflects on the live storefront **immediately** (data comes from Cloudflare D1 + R2 — nothing is hardcoded in the frontend code).

### 🔐 Security Note (IMPORTANT before going live)
The admin credentials currently live in `.dev.vars` for local testing only (this file is git-ignored and never pushed to GitHub). **Before/at production deploy**, set real production secrets with:
```bash
npx wrangler pages secret put ADMIN_USERNAME
npx wrangler pages secret put ADMIN_PASSWORD
npx wrangler pages secret put JWT_SECRET
```
Choose a strong password and a long random JWT secret — do not reuse the local dev values.

## API Endpoints (Public Storefront)
| Method | Path | Description |
|---|---|---|
| GET | `/api/categories` | List all categories |
| GET | `/api/products?category=&search=&sort=&featured=` | List/filter/search products |
| GET | `/api/products/:slug` | Get single product detail |
| GET | `/api/images/:key` | Serve an uploaded product image from R2 |
| POST | `/api/orders` | Place an order |
| GET | `/api/orders/:orderNumber` | Fetch order + items |
| POST | `/api/newsletter` | Subscribe email |
| POST | `/api/contact` | Send contact message |

## API Endpoints (Admin — cookie-authenticated)
| Method | Path | Description |
|---|---|---|
| POST | `/api/admin/login` | Login, sets HttpOnly session cookie |
| POST | `/api/admin/logout` | Clear session |
| GET | `/api/admin/session` | Check if logged in |
| GET | `/api/admin/stats` | Dashboard stats |
| GET/POST/PUT/DELETE | `/api/admin/products[/:id]` | Full product CRUD |
| POST | `/api/admin/upload-image` | Upload a product photo to R2 (multipart/form-data, field `file`) |
| GET | `/api/admin/orders[/:id]` | List / view orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| GET | `/api/admin/newsletter` | View subscribers |
| GET | `/api/admin/contact-messages` | View contact messages |

## Data Architecture
- **Database**: Cloudflare D1 (SQLite) — binding `DB`
  - `categories`, `products` (colors/sizes as JSON, `image_primary` holds either a gradient class like `grad-maroon` OR a real `/api/images/...` URL once uploaded), `orders` / `order_items`, `newsletter_subscribers`, `contact_messages`
- **Image Storage**: Cloudflare R2 — binding `IMAGES` (bucket `aliza-traders-images`). Product photos uploaded via Admin Panel live here, served through `/api/images/:key` with long-lived cache headers.
- **Admin Auth**: JWT stored in an HttpOnly, SameSite cookie (7-day expiry). Credentials come from Worker environment secrets (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`), never hardcoded.
- **Cart**: Client-side only (`localStorage`), re-validated server-side (price + stock) at checkout — a customer can never manipulate the price by editing the browser.

## User Guide (Store Owner)
1. Go to `/admin` and log in.
2. Click **Add New Product** → fill in details → click the upload box to pick a photo from your device → **Save Product**. It appears on the storefront instantly.
3. To update a product (new photo, new price, sold out, etc.), click the pencil icon next to it in the Products table.
4. To remove a product permanently, click the trash icon (confirmation required).
5. Check **Orders** daily to see new Cash-on-Delivery / Bank Transfer orders and mark them Confirmed → Shipped → Delivered.
6. Check **Messages** for newsletter signups and contact form questions from customers.

## User Guide (Customer)
1. Browse categories from the navigation or scroll the homepage.
2. Click a product photo to open Quick View — pick size & color, then Add to Bag.
3. Open the bag (top-right icon) to review/adjust items.
4. Proceed to Checkout, fill delivery details, choose COD or Bank Transfer, place order.
5. Receive an on-screen order number confirming the order was saved.

## Tech Stack
- **Backend**: Hono (TypeScript) on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **File Storage**: Cloudflare R2 (product images)
- **Auth**: `hono/jwt` + HttpOnly cookies
- **Frontend**: Vanilla JS + custom CSS (storefront + separate admin SPA), Google Fonts, Font Awesome
- **Hosting**: Cloudflare Pages

## Currently Completed Features
- ✅ Full storefront: catalog browsing, search, quick view, cart, checkout with server-side price validation
- ✅ **Self-service Admin Panel**: login, dashboard stats, product CRUD with real image upload to R2, order management with status updates, newsletter/contact message viewing
- ✅ Newsletter + contact form persisted to D1
- ✅ Fully responsive layout, custom maroon/gold brand design
- ✅ Local D1 dev database migrated & seeded with 18 sample products (safe to delete/replace via Admin Panel)

## Features Not Yet Implemented
- ❌ Multiple admin user accounts / roles (currently one shared admin login)
- ❌ Payment gateway integration (currently COD / Bank Transfer only)
- ❌ Customer accounts / order history / login
- ❌ Email/SMS order notifications
- ❌ Live deployment to Cloudflare Pages (pending — ask to deploy when ready)

## Recommended Next Steps
1. Log into `/admin`, delete/replace the sample products with your real catalog and photos.
2. Set strong production secrets (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`) before deploying live.
3. Deploy to Cloudflare Pages (production D1 + R2 bindings).
4. Add a WhatsApp click-to-chat button for order confirmations.
5. Consider JazzCash/EasyPaisa integration for online payments later.

## Deployment
- **Platform**: Cloudflare Pages (Hono + D1 + R2)
- **Status**: ⚠️ Running locally in sandbox — not yet deployed to production
- **Local Dev**: `npm run build && pm2 start ecosystem.config.cjs`
- **Migrations**: `npx wrangler d1 migrations apply aliza-traders-production --local`
- **Seed data**: `npx wrangler d1 execute aliza-traders-production --local --file=./seed.sql`
- **Last Updated**: 2026-09-08

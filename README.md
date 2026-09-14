# Aliza Traders — Vercel Edition

Next.js 15 storefront + admin panel. Database: **Neon Postgres** (free). Hosting: **Vercel** (free).

## Stack
- Next.js 15 (App Router)
- Neon Serverless Postgres
- Vanilla JS storefront + admin (same design as before)
- JWT admin auth (HttpOnly cookie)

## Setup (one time)

### 1. Free Neon database
1. Go to https://neon.tech → Sign up (free)
2. Create a project
3. Copy the connection string (`DATABASE_URL`)

### 2. Run schema
In Neon SQL Editor, paste and run the full contents of:
`scripts/schema.sql`

(Optional) Add sample products later from Admin panel.

### 3. Vercel deploy
1. Push this repo to GitHub
2. https://vercel.com → New Project → Import this repo
3. Add Environment Variables:

| Name | Value |
|------|--------|
| `DATABASE_URL` | Neon connection string |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | strong password |
| `JWT_SECRET` | long random string |

4. Deploy

### 4. Open site
- Storefront: `https://your-project.vercel.app`
- Admin: `https://your-project.vercel.app/admin`

## Image notes
Product images: paste a full image URL in Admin (ImgBB, Cloudinary, Google Drive public link, etc.), or use gradient placeholders (`grad-maroon`, `grad-emerald`, …).

## Local dev
```bash
npm install
cp .env.example .env.local
# fill DATABASE_URL and secrets
npm run dev
```

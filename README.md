# Micky's

Website and backend for **Micky's by CP Foods** (mickys.in).

| Folder | What | Deploys to |
|---|---|---|
| `web/` | Website: Next.js 16, TypeScript, Tailwind, GSAP, Lenis. Shop, product pages, cart, Razorpay checkout, recipes, B2B, about, contact, and its own API routes. | **Vercel** (Root Directory `web`) |
| `backend/` | Express + MongoDB API (orders, payments, Shiprocket, admin). The website does not call it yet. | **Render** (`render.yaml`) |

## Run locally
```bash
cd web
cp .env.example .env.local   # fill in test values; never commit real keys
npm install
npm run dev                  # http://localhost:3000
```

## Docker
```bash
docker compose up --build    # website :3000, API :5000/api/health, MongoDB
```
Secrets are read at run time from `web/.env.local` and `backend/.env` (git-ignored). Only `NEXT_PUBLIC_*`
values are build arguments, and those must never be secrets.

## Deploy
See [`web/DEPLOYMENT.md`](web/DEPLOYMENT.md) for the Vercel and Render settings and environment variables.

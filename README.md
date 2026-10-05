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

## Docker (website + backend in one image)
The root `Dockerfile` builds **both** into one container: the website on `$PORT`, the backend inside the
same container on port 5000, reachable through the website at `/backend/*` (e.g. `/backend/health`).
```bash
docker build -t mickys .
docker run -p 3000:3000 -e PORT=3000 mickys      # http://localhost:3000, /api/health, /backend/health
```
Secrets are passed as environment variables at run time (never baked in). Only `NEXT_PUBLIC_*` values are
build arguments, and those must never be secrets. (`web/Dockerfile`, `backend/Dockerfile` and
`docker-compose.yml` remain for running the two separately.)

### Railway
One service from the repository root: leave **Root Directory empty**; Railway reads `railway.json`
(Dockerfile build, health check `/api/health`). Add variables in the service, e.g. `NEXT_PUBLIC_SITE_URL`,
Razorpay test keys, and `MONGODB_URI` if the backend should use a database.

## Deploy
See [`web/DEPLOYMENT.md`](web/DEPLOYMENT.md) for the Vercel and Render settings and environment variables.

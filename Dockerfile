# Micky's: website (Next.js) + backend API (Express) in ONE image, built from the repository root.
#   docker build -t mickys .
#   docker run -p 3000:3000 -e PORT=3000 mickys
# Public port ($PORT, set by Railway): the website. The backend runs inside the same container on
# 127.0.0.1:5000 and is reachable from outside through the website at /backend/* (e.g. /backend/health).

# ---------- website: install + build ----------
FROM node:22-slim AS web-build
WORKDIR /app/web
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* are compiled into the browser bundle: browser-safe values only, never a secret.
ARG NEXT_PUBLIC_SITE_URL=https://mickys.in
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    BACKEND_INTERNAL_URL=http://127.0.0.1:5000
COPY web/package.json web/package-lock.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# ---------- backend: production dependencies ----------
FROM node:22-slim AS backend-deps
WORKDIR /app/backend
COPY backend/package.json backend/package-lock.json ./
RUN npm ci --omit=dev

# ---------- runtime ----------
FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 BACKEND_PORT=5000
# website: standalone server + static assets + public files
COPY --from=web-build --chown=node:node /app/web/.next/standalone ./web/
COPY --from=web-build --chown=node:node /app/web/.next/static ./web/.next/static
COPY --from=web-build --chown=node:node /app/web/public ./web/public
# backend: code + production node_modules
COPY --chown=node:node backend/ ./backend/
COPY --from=backend-deps --chown=node:node /app/backend/node_modules ./backend/node_modules
COPY --chown=node:node start.js ./start.js
USER node
EXPOSE 3000
# start.js runs both servers; if either stops, the container exits and the platform restarts it
CMD ["node", "start.js"]

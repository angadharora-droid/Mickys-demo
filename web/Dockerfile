# Micky's website (Next.js). Multi-stage: deps -> build -> small runtime image.
#   docker build -t mickys-web ./web
#   docker run -p 3000:3000 --env-file web/.env.local mickys-web
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
# NEXT_PUBLIC_* values are compiled into the browser bundle, so they are build arguments.
# Only browser-safe values here: never a secret.
ARG NEXT_PUBLIC_SITE_URL=https://mickys.in
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
# standalone server + its traced node_modules, then static assets and public files
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
# server-only secrets (Razorpay secret, webhook URLs) are passed at run time, never baked in.
# The platform overrides HOSTNAME with the container name at run time, so bind to "::" here:
# every interface, IPv4 and IPv6 (Railway's health check and private network both reach it). PORT comes from the platform.
CMD ["sh", "-c", "HOSTNAME=:: exec node server.js"]

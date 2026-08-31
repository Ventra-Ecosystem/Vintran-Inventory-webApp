# ─── Vintran Inventory Web App — Dockerfile ──────────────────────────────────
# Multi-stage build for the Next.js web app.
#
# Stage 1 (deps):    installs production + dev dependencies
# Stage 2 (builder): builds the Next.js production bundle
# Stage 3 (runner):  minimal runtime image — only the built output & prod deps
# ─────────────────────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ────────────────────────────────────────────
FROM node:22-alpine AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ── Stage 2: Build ────────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Copy installed node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time environment variables
# NEXT_PUBLIC_* are baked into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL=http://89.168.123.9:5100
ARG NEXT_SERVER_API_URL=http://89.168.123.9:5100
ARG NODE_ENV=production

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_SERVER_API_URL=${NEXT_SERVER_API_URL}
ENV NODE_ENV=${NODE_ENV}

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Production runner ────────────────────────────────────────────────
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy only what Next.js needs to run
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8081

ENV PORT=8081
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]

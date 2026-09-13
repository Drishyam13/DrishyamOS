# Multi-Stage Production Dockerfile for Drishyam API Backend

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace & dependency manifests
COPY package.json package-lock.json ./
COPY packages/shared ./packages/shared
COPY services/api ./services/api

# Install dependencies and build shared package + api
RUN npm install
RUN cd services/api && npx prisma generate
RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=services/api

# Stage 2: Production Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

# Security: Create non-root node user
RUN addgroup -g 1001 -S nodejs && adduser -S drishyam -u 1001

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/packages/shared ./packages/shared
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/services/api/package.json ./services/api/package.json
COPY --from=builder /app/services/api/prisma ./services/api/prisma
COPY --from=builder /app/node_modules ./node_modules

USER drishyam

EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["sh", "-c", "cd services/api && npx prisma db push && node dist/index.js"]

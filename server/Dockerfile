# Multi-stage production Dockerfile for QueueSmart Backend
# Stage 1: Build & Prune
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules (bcrypt)
RUN apk add --no-cache python3 make g++

# Copy root package files for monorepo resolution
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci

# Copy shared source and build it
COPY packages/shared ./packages/shared

# Copy server source and prisma schema
COPY server ./server

# Generate Prisma Client
WORKDIR /app/server
RUN npx prisma generate

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production Runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install security updates & dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

ENV NODE_ENV=production
ENV PORT=5000

# Create app directory and set non-root user
USER node

# Copy dependencies and built code from builder
COPY --chown=node:node --from=builder /app/package*.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/packages/shared ./packages/shared
COPY --chown=node:node --from=builder /app/server/package*.json ./server/
COPY --chown=node:node --from=builder /app/server/node_modules ./server/node_modules
COPY --chown=node:node --from=builder /app/server/dist ./server/dist
COPY --chown=node:node --from=builder /app/server/prisma ./server/prisma

WORKDIR /app/server

EXPOSE 5000

# Health check probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/server.js"]

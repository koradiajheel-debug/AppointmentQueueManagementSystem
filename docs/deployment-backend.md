# QueueSmart - Backend Deployment & Infrastructure Runbook

This guide contains exact deployment configurations, database provisioning steps, Redis clustering setup, Docker specifications, and health probe configurations for `/server`.

---

## 1. Hosting Architecture Overview
- **Runtime:** Node.js 20+ with TypeScript
- **Database:** PostgreSQL on Neon or Supabase (Connection pooling enabled via PgBouncer/Supavisor + direct URL for Prisma migrations)
- **Cache & Real-time Adapter:** Redis on Upstash (`REDIS_URL` with SSL `rediss://`) or self-hosted Redis
- **Containerization:** Multi-stage non-root Docker image (`Dockerfile`)
- **Hosting Platforms:** Render (`render.yaml`), Railway (`railway.json`), or AWS ECS/Fly.io

---

## 2. Database Provisioning (Neon / Supabase)

### A. Neon Setup:
1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Copy the **Pooled Connection String** (port 5432 or 6543) and set as `DATABASE_URL`:
   ```text
   DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
   ```
3. Copy the **Direct Connection String** and set as `DIRECT_URL` (used for `prisma migrate`):
   ```text
   DIRECT_URL="postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

### B. Supabase Setup:
1. In Supabase Dashboard > Project Settings > Database.
2. Under **Connection string**:
   - Mode **Transaction (port 6543)** -> `DATABASE_URL`
   - Mode **Session (port 5432)** -> `DIRECT_URL`

---

## 3. Redis Setup (Upstash)

1. Create a serverless Redis database at [console.upstash.com](https://console.upstash.com).
2. Copy the `rediss://default:password@endpoint:port` connection URI.
3. Set as `REDIS_URL`.
4. *In-Memory Fallback:* When `REDIS_URL` is omitted, `/server/src/lib/redis.ts` automatically activates an in-memory Redis simulator, allowing zero-dependency local testing.

---

## 4. Deploying via Docker

Build and run locally:
```bash
docker build -t queuesmart-server -f server/Dockerfile .
docker run -p 5000:5000 --env-file server/.env queuesmart-server
```

---

## 5. Deploying on Render (`render.yaml`)

1. Connect your repository to Render.
2. Select **Blueprint** and point to `render.yaml`.
3. Fill in secret environment variables:
   - `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
4. The build pipeline automatically executes:
   - `npm run build --workspace=@queuesmart/server`
   - `npx prisma migrate deploy`
   - `node dist/server.js`

---

## 6. Probes & Health Checks
- **Liveness Probe:** `GET /health` -> Returns `200 OK` `{ status: "ok", timestamp }`
- **Readiness Probe:** `GET /ready` -> Checks active PostgreSQL connection ping & Redis connectivity. Returns `503 Service Unavailable` if core infrastructure is unreachable.

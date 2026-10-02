# QueueSmart Environment Setup & Credential Guide

This guide walks you through provisioning all required credentials and setting up environment variables for the QueueSmart platform.

---

## 1. Quick Local Start (Zero External Services Needed)

QueueSmart includes automatic in-memory fallbacks:
- **Redis:** If `REDIS_URL` is omitted, an in-memory event bus and cache simulator takes over automatically.
- **Portals:** Both the Customer Portal and Admin Portal can operate either connected to the live `/server` backend or in standalone mock mode (`VITE_USE_MOCKS="true"`).

For local backend development with SQLite or local PostgreSQL:
```bash
cp .env.example .env
```

---

## 2. Supabase PostgreSQL Setup

QueueSmart uses **Prisma ORM** with PostgreSQL. We recommend [Supabase](https://supabase.com) (free tier includes 500MB DB).

1. Log in to [Supabase Console](https://supabase.com/dashboard) and click **New Project**.
2. Set your Database Password and choose a region close to your users (e.g. Mumbai `ap-south-1` or Singapore `ap-southeast-1`).
3. Once provisioned, go to **Project Settings** -> **Database**.
4. In the **Connection string** section:
   - Select **Transaction** mode (Port `6543`) -> Copy this string to `DATABASE_URL`.
   - Select **Session** or **Direct** mode (Port `5432`) -> Copy this string to `DIRECT_URL`.
5. Run migrations:
   ```bash
   npm run prisma:deploy --workspace=@queuesmart/server
   ```
6. Seed sample branches, services, and demo accounts:
   ```bash
   npm run prisma:seed --workspace=@queuesmart/server
   ```

---

## 3. Upstash Redis Setup (Distributed Cache & Socket.IO Adapter)

1. Sign up at [Upstash Console](https://console.upstash.com).
2. Click **Create Database**.
3. Choose **Serverless**, name it `queuesmart-redis`, and select the same region as your backend.
4. In the database dashboard, scroll to **Node.js (ioredis)** connection format.
5. Copy the connection string (format: `rediss://default:YOUR_KEY@...upstash.io:6379`) and paste it as `REDIS_URL` in your environment.

---

## 4. JWT Secret Key Generation

For cryptographic security, use 256-bit random secrets:

```bash
# Generate access token secret
openssl rand -base64 32

# Generate refresh token secret
openssl rand -base64 32
```

Paste these into `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

---

## 5. Web Push Notification Keys (Optional VAPID)

To enable browser background push notifications:
```bash
npx web-push generate-vapid-keys
```
Place the public key in `VITE_FIREBASE_VAPID_KEY`.

---

## 6. Sentry Exception Monitoring (Optional)

1. Create a project at [Sentry.io](https://sentry.io).
2. Copy the client DSN to `VITE_SENTRY_DSN`.

---

## Summary Environment Table

| Variable | Description | Where to Obtain | Default |
|:---|:---|:---|:---|
| `DATABASE_URL` | Pooled Postgres connection | Supabase / Neon / Render Postgres | Required for prod |
| `DIRECT_URL` | Direct connection for migrations | Supabase / Neon | Required for prod |
| `REDIS_URL` | Redis URL for cache & Socket.IO adapter | Upstash Redis | Optional (fallback to memory) |
| `JWT_ACCESS_SECRET` | 32+ char secret for access tokens | `openssl rand -base64 32` | Required |
| `JWT_REFRESH_SECRET` | 32+ char secret for refresh tokens | `openssl rand -base64 32` | Required |
| `CUSTOMER_URL` | Allowed origin for citizen portal | Deploy URL | `http://localhost:3000` |
| `ADMIN_URL` | Allowed origin for staff portal | Deploy URL | `http://localhost:3001` |
| `VITE_API_URL` | Backend API base URL for portals | Backend deploy URL | `http://localhost:5000/api/v1` |
| `VITE_SOCKET_URL` | Backend Socket.IO server URL | Backend deploy URL | `http://localhost:5000` |
| `VITE_USE_MOCKS` | Enable mock data in frontend | Toggle for standalone demo | `"false"` |

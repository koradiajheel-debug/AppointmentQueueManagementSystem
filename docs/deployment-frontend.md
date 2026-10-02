# QueueSmart - Frontend Deployment Guide

This document outlines deployment configurations, SPA rewrites, security headers, PWA setup, and Sentry error tracking for both portals.

---

## 1. Hosting Architecture
Each portal can be independently built and deployed to Vercel, Netlify, Cloudflare Pages, or AWS S3 + CloudFront.

| App | Root Directory | Framework Preset | Output Directory | Default Port |
| :--- | :--- | :--- | :--- | :--- |
| **Customer Portal** | `apps/customer-portal` | Vite | `dist` | 3000 |
| **Admin Portal** | `apps/admin-portal` | Vite | `dist` | 3001 |

---

## 2. Deploying on Vercel

Both portals include production-ready `vercel.json` files with:
- Catch-all single page application (SPA) rewrites (`/(.*) -> /index.html`)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
- `Permissions-Policy: geolocation=(self)`
- Dedicated `Cache-Control: no-cache` for `/sw.js` (PWA service worker)

### Deployment Steps:
1. Connect your Git repository to Vercel.
2. For the **Customer Portal**:
   - Root Directory: `apps/customer-portal`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. For the **Admin Portal**:
   - Create a second Vercel project pointing to the same Git repository.
   - Root Directory: `apps/admin-portal`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Configure Environment Variables in the Vercel dashboard:
   - `VITE_API_URL`
   - `VITE_SOCKET_URL`
   - `VITE_USE_MOCKS` (`false` in production)
   - `VITE_SENTRY_DSN`
   - `VITE_FIREBASE_VAPID_KEY`

---

## 3. Deploying on Netlify (Alternative)

Both portals also contain a `netlify.toml` file with:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 4. Environment Variables & Typed Validation
Environment variables are validated on app initialization via `@queuesmart/shared/utils/env.ts` using **Zod**. If an invalid value or missing required property is detected, a structured diagnostic warning is logged to the console while falling back to graceful defaults:

```typescript
import { env } from '@queuesmart/shared';

console.log(env.VITE_API_URL);
```

---

## 5. Sentry Crash Logging & Privacy Policy
QueueSmart enforces a **zero-PII logging standard** for Sentry:
- `ErrorBoundary` catches unexpected runtime errors and displays a recovery screen.
- User context is strictly **ID-only** (`sentry.setUserContext(user.id)`). Names, emails, and phone numbers are never forwarded to Sentry.
- Enable Sentry in production by supplying `VITE_SENTRY_DSN`.

---

## 6. PWA & Web Push Requirements
- The PWA manifest is served at `/manifest.json`.
- The service worker is registered at `/sw.js`.
- HTTPS is mandatory for service worker registration, Web Speech synthesis, and Push Notifications.
- For production Web Push, generate a VAPID key pair in your Firebase console and assign `VITE_FIREBASE_VAPID_KEY`.

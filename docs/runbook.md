# QueueSmart - Operations Runbook & Manual Steps Checklist

## 1. Architecture Summary
QueueSmart is an enterprise-grade appointment and queue management monorepo:
- **`apps/customer-portal`**: Mobile-first PWA for citizens with crowd heatmaps, virtual walk-in tokens, GPS leave-now timers, Leaflet route maps, QR check-in, and Web Speech turn alerts.
- **`apps/admin-portal`**: Desktop-first console for staff & administrators with live counter controls (Call Next, Skip, Recall, Transfer, Priority Override), drag-and-drop queue board with audit reasons, printable thermal slips, scheduling calendar, Recharts analytics, What-If Simulator with sliders, full-screen lobby display (`/display`), and self-serve kiosk (`/kiosk`).
- **`packages/shared`**: Reusable design tokens, accessible UI library, multi-lingual i18n (English, Hindi, Gujarati), typed API client with Zod validations, and in-memory reactive mock engine.

---

## 2. Checklist of Manual Steps for the User

Here is the exact step-by-step checklist of actions you should perform to configure external cloud services, credentials, and hardware:

### A. Firebase Web Push Credentials (for PWA Push Notifications)
- [ ] Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
- [ ] Navigate to **Project Settings** > **Cloud Messaging** tab.
- [ ] Under **Web configuration**, generate a **Web Push certificate (VAPID key)**.
- [ ] Copy the Public Key and paste it into `apps/customer-portal/.env` as `VITE_FIREBASE_VAPID_KEY=your_key_here`.
- [ ] Download `firebase-messaging-sw.js` or configure your project sender ID if integrating direct Firebase push SDK instead of native service worker push.

### B. Sentry Error Tracking Setup (Optional for Crash Monitoring)
- [ ] Create a project in [sentry.io](https://sentry.io) under the **React** framework.
- [ ] Copy the client DSN (e.g. `https://xxxx@o1234.ingest.sentry.io/5678`).
- [ ] Add `VITE_SENTRY_DSN=your_dsn` to `.env` in both portals.
- [ ] *Note:* QueueSmart's Sentry helper automatically sanitizes user context to anonymized ID-only, ensuring HIPAA/GDPR compliance.

### C. Domain & SSL/TLS Configuration (Required for PWA & Audio API)
- [ ] Deploy both portals over **HTTPS** (e.g. `https://app.queuesmart.dev` for citizens and `https://admin.queuesmart.dev` for staff).
- [ ] Note: Web Speech API, Geolocation, and Service Workers require HTTPS in modern browsers (except `localhost`).

### D. Physical Hardware Configuration (Lobby TV & Thermal Printers)
- [ ] **Lobby TV Displays**: Connect an HDMI-enabled Smart TV or Android TV box to the lobby monitor, open Chrome in kiosk mode (`google-chrome --kiosk https://admin.queuesmart.dev/display`), and click anywhere on the screen once to allow browser audio autoplay for vocal token calls.
- [ ] **Thermal POS Printers**: Connect your 80mm or 58mm ESC/POS USB or network receipt printer. In Chrome's print dialog, choose your thermal printer and enable **"Headers and Footers: Off"** and **"Margins: None"** for seamless token slip cut.
- [ ] **Touch Kiosks**: Lock browser to full screen on tablet or kiosk PC at `https://admin.queuesmart.dev/kiosk`.

### E. Team Handoff & Backend Pairing
- [ ] Provide `/docs/contract.md` to your backend engineer. Both frontend portals strictly follow the `/api/v1` routes and Socket.IO event names documented there.
- [ ] When your backend `/server` is deployed, simply toggle `VITE_USE_MOCKS=false` in `.env`.

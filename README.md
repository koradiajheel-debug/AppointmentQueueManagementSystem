# QueueSmart - Smart Appointment & Queue Management System

QueueSmart is a monorepo web application designed for modern hospitals, banks, citizen facilitation centers, and educational campuses.

## Project Structure
```text
SDM_miniproj/
├── apps/
│   ├── customer-portal/       # Mobile-first PWA for Citizens (React + Vite + TS + Tailwind)
│   └── admin-portal/          # Desktop-first Console for Staff & Admins (React + Vite + TS)
├── packages/
│   └── shared/                # Types, Zod Schemas, Tokens, API Client, Mock Store, UI Library
├── docs/
│   ├── contract.md            # Complete REST & Socket.IO Contract
│   ├── env-setup.md           # Local development setup & credentials
│   ├── deployment-frontend.md # Vercel, Netlify, PWA & Sentry guide
│   └── runbook.md             # Operations runbook & manual checklist
├── package.json               # Monorepo workspaces config
└── README.md
```

## Quick Start
```bash
# 1. Install dependencies across all workspaces
npm install

# 2. Run both portals concurrently in development mode (with in-memory mock engine)
npm run dev

# Or run individually:
npm run dev:customer   # http://localhost:3000 (Citizen PWA)
npm run dev:admin      # http://localhost:3001 (Staff & Admin Console)
```

## Credentials for Evaluation
- **Citizen Portal**: `citizen@queuesmart.dev` / `password123` (or 1-click Demo Citizen button)
- **Admin Console**: `admin@queuesmart.dev` / `password123` (Role: ADMIN)
- **Staff Console**: `staff@queuesmart.dev` / `password123` (Role: STAFF)

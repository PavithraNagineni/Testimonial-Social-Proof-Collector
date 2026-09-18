# Testimonial & Social Proof Collector

A MERN-stack customer review platform: business owners create branded "Spaces,"
collect testimonials through a public form (no login required for reviewers),
moderate submissions from an inbox, and publish an embeddable "Wall of Love."

Built for the MERN Stack Evaluation — Project Brief 05 (Senja / Testimonial.to alternative).

## Table of contents

- [Tech stack](#tech-stack)
- [Features](#features)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Database setup](#database-setup)
- [Running the app](#running-the-app)
- [API overview](#api-overview)
- [Third-party libraries](#third-party-libraries--why)
- [Assumptions & limitations](#assumptions--limitations)

## Tech stack

- **Frontend:** React 18 + Vite, React Router, Tailwind CSS, a small in-house
  component kit (Button, Input, Card, Modal, Tabs, Badge, Toast, StarRating,
  Skeletons/EmptyState) built to stand in for the brief's `coss.com/ui`
  primitives, which are not a real published package.
- **Backend:** Node.js + Express, Mongoose (MongoDB)
- **Auth:** Dual JWT (short-lived access token + long-lived refresh token)
  stored in `httpOnly` cookies, with refresh-token rotation
- **File uploads:** Multer (local disk storage, served statically)

## Features

**Space management**
- Authenticated owners create "Spaces" with a unique slug, logo, custom prompt,
  and per-space settings (mandatory rating, mandatory avatar, up to 5 custom
  questions).

**Public collection form** (`/collect/:slug`, no login required)
- Captures name, email, role, 1–5 star rating, review text, avatar upload,
  and answers to any custom questions. Full client + server-side validation.

**Moderation inbox** (owner dashboard)
- Tabs for All / Pending / Approved / Archived, keyword search, star-rating
  filter, one-click Approve / Archive / Restore / Feature / Delete actions.

**Wall of Love** (`/wall/:slug`, public)
- Responsive masonry grid of approved testimonials, sorted featured-first.
- **Embed Generator** modal: pick a layout (Grid / Carousel / Badge) and theme
  (Minimal Light / Dark Slate / Gradient), then copy a ready-to-paste
  `<iframe>` snippet.

**Stats**
- Average rating, total review count, and a star-rating distribution,
  computed with a MongoDB aggregation pipeline.

**Security & auth**
- Signup with simulated email verification, login, refresh-token rotation,
  forgot/reset password, rate limiting on auth and public submission routes.

## Project structure

```
testimonial-collector/
├── server/                  # Express API
│   ├── src/
│   │   ├── config/db.js
│   │   ├── models/          # User, Space, Testimonial (Mongoose schemas)
│   │   ├── middleware/      # auth, upload (multer), error handling
│   │   ├── controllers/     # auth, space, testimonial business logic
│   │   ├── routes/
│   │   ├── utils/           # tokens, simulated email, seed script
│   │   └── index.js         # app entry point
│   ├── uploads/avatars/     # uploaded review photos (served at /uploads/...)
│   └── .env.example
└── client/                  # React + Vite frontend
    └── src/
        ├── api/axios.js     # axios instance + silent refresh-token interceptor
        ├── context/         # AuthContext, ToastContext
        ├── components/      # UI primitives + shared widgets
        └── pages/           # route-level pages
```

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB instance — either local (`mongod`) or a free
  [MongoDB Atlas](https://www.mongodb.com/atlas) cluster

### 1. Clone and install dependencies

```bash
git clone <your-repo-url>
cd testimonial-collector

cd server && npm install
cd ../client && npm install
```

### 2. Configure environment variables

```bash
cd server
cp .env.example .env
# then edit .env with your own values (see below)
```

The client needs no `.env` file — it talks to the API through Vite's dev
proxy (`/api` → `http://localhost:5000`) in development, and you can point
`vite.config.js`'s proxy target (or your production reverse proxy) at your
deployed API URL.

## Environment variables

All backend configuration lives in `server/.env` (see `server/.env.example`):

| Variable | Description |
|---|---|
| `PORT` | Port the API listens on (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `CLIENT_URL` | Frontend origin, used for CORS and links in emails |
| `MONGO_URI` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing short-lived access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing long-lived refresh tokens |
| `JWT_ACCESS_EXPIRES` | Access token lifetime (default `15m`) |
| `JWT_REFRESH_EXPIRES` | Refresh token lifetime (default `7d`) |
| `EMAIL_FROM` | "From" address shown in simulated emails |
| `SMTP_*` | Optional — wire up `nodemailer` in `src/utils/email.js` to send real email |

**No secrets are committed.** `.env` is git-ignored; only `.env.example` (with
placeholder values) is tracked.

## Database setup

No manual schema setup is required — Mongoose creates collections and indexes
automatically on first write. Just point `MONGO_URI` at any reachable MongoDB
instance (local or Atlas).

To try the app with realistic data immediately:

```bash
cd server
npm run seed
```

This creates a demo owner (`demo@example.com` / `password123`), a Space at
`/collect/acme-corp`, and eight sample testimonials in different states.

## Running the app

In two terminals:

```bash
# Terminal 1 — API (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

Open `http://localhost:5173`.

- Sign up for a new account, or log in with the seeded demo account.
- Because no real SMTP is configured out of the box, verification and
  password-reset emails are **printed to the server console**, and in
  development the API also returns the raw token so the frontend can show a
  direct link — no real inbox needed to test the full auth flow.

### Production build

```bash
cd client && npm run build   # outputs client/dist
cd server && npm start       # serve the API (add your own static hosting for client/dist, or deploy separately)
```

## API overview

All routes are prefixed with `/api/v1`.

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup` | — | Create account, sends verification email |
| GET | `/auth/verify-email?token=` | — | Verify email |
| POST | `/auth/login` | — | Log in, sets access + refresh cookies |
| POST | `/auth/refresh` | cookie | Rotate tokens |
| POST | `/auth/logout` | cookie | Clear session |
| GET | `/auth/me` | required | Current user |
| POST | `/auth/forgot-password` | — | Request reset link |
| POST | `/auth/reset-password` | — | Reset password with token |
| POST | `/spaces` | required | Create a space |
| GET | `/spaces` | required | List owner's spaces with stats |
| GET/PATCH/DELETE | `/spaces/:id` | required | Manage a space |
| GET | `/spaces/public/:slug` | — | Public space info (for the collect form) |
| POST | `/testimonials/collect/:slug` | — | Submit a testimonial (multipart, optional avatar) |
| GET | `/testimonials/wall/:slug` | — | Approved testimonials for the public wall |
| GET | `/testimonials/space/:spaceId` | required | Moderation inbox (filters: status, rating, q, page, limit) |
| GET | `/testimonials/space/:spaceId/stats` | required | Aggregated rating stats |
| PATCH | `/testimonials/:id/moderate` | required | Approve / archive / feature |
| DELETE | `/testimonials/:id` | required | Delete a testimonial |

## Third-party libraries & why

- **jsonwebtoken / bcryptjs** — industry-standard JWT signing and password hashing.
- **multer** — de facto standard for multipart file uploads in Express; used
  for avatar photos, stored to local disk and served statically for simplicity.
- **express-rate-limit** — brute-force / abuse protection on auth and the
  open public submission endpoint, as called out in the brief.
- **slugify** — reliable, well-tested slug generation with collision handling.
- **express-async-handler** — removes repetitive try/catch boilerplate around
  async route handlers.
- **Tailwind CSS** — utility-first styling used to implement the required UI
  primitives quickly and consistently. `coss.com/ui` does not resolve to a
  real, installable component library, so an equivalent hand-built primitive
  kit (`client/src/components/*`) was implemented in its place, matching the
  same primitives the brief lists (buttons, inputs, cards, modals, tabs,
  badges, toasts, star ratings, skeletons/empty states).

## Assumptions & limitations

- **Email is simulated**, not sent via a real provider, per the brief's
  "Email Verification simulation" requirement. Swapping in `nodemailer` (or
  a provider like Postmark/SES) in `src/utils/email.js` would enable real
  delivery without touching any other code.
- **Avatar storage is local disk**, not S3/Cloudinary — appropriate for an
  assessment/demo; a production deployment should move to object storage.
- **`coss.com/ui`** does not resolve to a published package at the time of
  writing, so its primitives were re-implemented directly in
  `client/src/components/` rather than installed as a dependency.
- **Rate limiting** is in-memory (via `express-rate-limit`'s default store),
  which is fine for a single-instance deployment but would need a shared
  store (e.g. Redis) behind a load balancer.
- **IP hashing** for click/submission telemetry uses a simple SHA-256 hash of
  `req.ip` — sufficient to deduplicate/rate-limit without storing raw IPs,
  but not a substitute for a dedicated fraud-detection system.
- With more time, next steps would include: automated tests (API + component),
  image optimization/resizing on upload, and moving uploads to cloud storage.

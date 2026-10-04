<div align="center">

# AI Political Poster Maker

**Create print-ready Bangla political posters in minutes, with AI-assisted design.**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Gemini](https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=googlegemini&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

[Live Demo](https://poster-maker-web-pi.vercel.app) · [API](https://poster-maker-api-xi.vercel.app/api/health) · [Source Code](https://github.com/Niloy-Uthso/poster-maker)

</div>

---

## Live Demo

| | |
|---|---|
| **Live site** | https://poster-maker-web-pi.vercel.app |
| **API** | https://poster-maker-api-xi.vercel.app |
| **Repository** | https://github.com/Niloy-Uthso/poster-maker |

### Demo Admin Login (for evaluation)

| Field | Value |
|---|---|
| **Email** | `niloyuthso16@gmail.com` |
| **Password** | `asdfgH` |

Log in with this account to see the **Admin** link in the navbar: usage stats, template manager and moderation. Any visitor can also register and make posters from **Make Poster**.

> **Note:** the first poster after a quiet period can take 15 to 30 seconds, because the serverless function has to start Chromium. Later posters take about 5 to 15 seconds.

---

## Table of Contents

- [Overview](#overview)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Limitations and Roadmap](#limitations-and-roadmap)
- [Responsible Use](#responsible-use)
- [Author](#author)

---

## Overview

A web platform where local political workers, committee members and publicity agents generate **ready-to-print political posters** (victory day, tribute and campaign posters) by filling in a simple form. Users enter a Bangla headline, their name, designation, party and up to three photos, and the system composes a poster in the style of typical Bangladeshi political posters.

### Why the poster is rendered from HTML, not drawn by the AI

Bangla text inside AI-generated images is often misspelled. In this project, **Gemini is used only for creative choices** (colour scheme, decoration, headline size and photo crop). The poster itself is rendered by a headless Chromium from an HTML template, so the user's Bangla text is always placed exactly as typed. This is **Option B** from the assignment specification.

---

## How It Works

1. **Choose a template** by occasion: বিজয় দিবস, শোক/স্মরণ, নির্বাচনী প্রচার.
2. **Fill in the form:** Bangla headline, name, designation, party, union/thana, district, and up to 3 photos.
3. **AI + render:** Gemini suggests the look for the occasion, then Chromium renders the poster at 2400×3200.
4. **Preview and regenerate:** describe a change (for example *"dark blue background, use doves, bigger headline"*), up to 3 times per poster.
5. **Download** the PNG and find every past poster in **My Posters**.

---

## Features

**For users**
- Email and password accounts with JWT authentication
- Template library grouped by occasion
- Photo upload (JPG, PNG, WebP, up to 4 MB each) stored on Cloudinary
- Layout with a main arch-shaped photo, a circular photo and a small rounded-square photo
- Regenerate with free-text instructions in English or Bangla
- 2400×3200 PNG export (print-ready)
- Poster history per user, newest first
- Responsive UI built with Tailwind CSS

**For admins**
- Usage stats: users, posters, completed and failed, average generation time
- Template manager: create, edit, activate or deactivate, delete
- Moderation: block, unblock or delete any poster
- Blocked posters are hidden from their owner and cannot be regenerated

**Engineering**
- Gemini retries with a fallback model, a timeout, and a cache to reduce cost
- Rate limiting on poster generation
- Optional word filter through the `BLOCKED_TERMS` variable
- Per-request database reconnect and a `/api/health` check for serverless hosting

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS |
| Backend | Express.js, TypeScript |
| Database | MongoDB Atlas with Mongoose |
| AI | Google Gemini API |
| Rendering | Puppeteer (local), `puppeteer-core` + `@sparticuz/chromium` (Vercel) |
| File storage | Cloudinary |
| Authentication | JWT |
| Hosting | Vercel (two projects from one repository) |

---

## Architecture

```mermaid
flowchart LR
  U[User] --> F[Next.js frontend]
  F -->|REST + JWT| B[Express API]
  B --> M[(MongoDB Atlas)]
  B --> G[Gemini API]
  B --> R[Chromium renderer]
  R --> C[Cloudinary]
  B --> C
```

**Poster generation flow**

```
Form data + photos
      │
      ▼
Gemini → colour scheme, decoration, headline size, photo focus
      │
      ▼
HTML template + exact Bangla text
      │
      ▼
Headless Chromium → 2400×3200 PNG → Cloudinary → URL saved in MongoDB
```

---

## Project Structure

```
poster-maker/
├── backend/
│   ├── api/
│   │   └── index.ts          # Vercel entry point
│   ├── src/
│   │   ├── index.ts          # Express app and routes
│   │   ├── models.ts         # User, Template, Poster, GenerationLog
│   │   ├── gemini.ts         # AI scheme suggestion (retry, fallback, cache)
│   │   ├── render.ts         # HTML poster template + Chromium screenshot
│   │   └── seed.ts           # starter templates
│   └── vercel.json
└── frontend/
    ├── app/
    │   ├── (auth)/           # login, register (no navbar or footer)
    │   └── (main)/           # home, make-poster, my-posters, admin
    ├── components/           # Navbar, Footer, home sections
    └── context/
        └── AuthContext.tsx
```

---

## Getting Started

### Prerequisites

- Node.js (current LTS)
- A MongoDB database (Atlas or local)
- A Gemini API key
- A Cloudinary account (optional locally)

### 1. Backend

Create `backend/.env`:

```env
PORT=4000
MONGO_URI=mongodb+srv://USER:PASSWORD@CLUSTER.mongodb.net/posterMaker?retryWrites=true&w=majority
JWT_SECRET=a-long-random-string
GEMINI_API_KEY=your_gemini_key
GEMINI_MODEL=gemini-3.8-flash
FRONTEND_URL=http://localhost:3000
PUBLIC_URL=http://localhost:4000
MAX_RETRIES=3

# optional
GEMINI_FALLBACK_MODEL=
CLOUDINARY_URL=cloudinary://KEY:SECRET@CLOUD_NAME
BLOCKED_TERMS=
```

```bash
cd backend
npm install
npm run seed      # insert the starter templates
npm run dev       # http://localhost:4000
```

### 2. Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API=http://localhost:4000
```

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000
```

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string, including the database name |
| `JWT_SECRET` | Yes | Secret used to sign login tokens |
| `GEMINI_API_KEY` | No | Without it, template default colours are used |
| `GEMINI_MODEL` | No | Primary Gemini model |
| `GEMINI_FALLBACK_MODEL` | No | Used if the primary model is busy |
| `CLOUDINARY_URL` | Yes on Vercel | Without it, files are saved to `backend/storage` (local use only) |
| `FRONTEND_URL` | Yes in production | Allowed CORS origin(s), comma separated |
| `MAX_RETRIES` | No | Regenerations allowed per poster (default 3) |
| `BLOCKED_TERMS` | No | Comma-separated words to reject |

### Creating an admin

Set `role` to `"admin"` on a user document in MongoDB, then log in again.

---

## Deployment

Both apps are deployed from this one repository as **two separate Vercel projects**.

| | Backend | Frontend |
|---|---|---|
| Root Directory | `backend` | `frontend` |
| Preset | Express | Next.js |
| Environment variables | `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `CLOUDINARY_URL`, `FRONTEND_URL`, `MAX_RETRIES`, `PUPPETEER_SKIP_DOWNLOAD=1` | `NEXT_PUBLIC_API` |

**Serverless notes**

- Chromium comes from `@sparticuz/chromium` with `puppeteer-core`. Both are ES modules, so `render.ts` loads them with a real dynamic `import()`.
- A poster request waits for generation to finish before responding, because a serverless function cannot keep working after it has responded.
- Uploads and generated posters are stored on Cloudinary, since the function's disk is temporary.
- MongoDB Atlas must allow connections from `0.0.0.0/0`, and the backend reconnects on each request if a previous attempt failed.
- `GET /api/health` reports the database connection status.

---

## API Reference

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create an account |
| POST | `/api/auth/login` | Public | Log in, returns a JWT |
| GET | `/api/templates` | Public | List active templates |
| GET | `/api/templates/:id` | Public | Get one template |
| POST | `/api/upload` | User | Upload a photo, returns a URL |
| POST | `/api/posters` | User | Create and generate a poster |
| GET | `/api/posters/:id` | Owner / Admin | Get a poster |
| GET | `/api/posters/user/:userId` | Owner / Admin | Poster history |
| POST | `/api/posters/:id/regenerate` | Owner / Admin | Regenerate with `formData` and `instructions` |
| DELETE | `/api/posters/:id` | Owner / Admin | Delete a poster |
| GET | `/api/admin/stats` | Admin | Usage statistics |
| GET | `/api/admin/posters` | Admin | All posters (moderation) |
| PATCH | `/api/admin/posters/:id/block` | Admin | Block or unblock a poster |
| GET / POST | `/api/admin/templates` | Admin | List or create templates |
| PATCH / DELETE | `/api/admin/templates/:id` | Admin | Edit or delete a template |
| GET | `/api/health` | Public | Database connection check |

---

## Limitations and Roadmap

**Current limitations**

- The AI controls colours, decoration, headline size and photo crop. It does not move elements or edit photos, so a request like "put the photo on the left" has no effect.
- All templates currently share one poster layout and differ in colours and decoration.
- Photos are limited to 4 MB each because of Vercel's request-size limit.

**Roadmap**

- [x] Authentication, template library, poster form and AI generation
- [x] Preview, regenerate with instructions, poster history
- [x] Admin panel: stats, template manager, moderation
- [x] Production deployment on Vercel
- [ ] PDF export
- [ ] Bulk generation from a CSV file
- [ ] Bangla font selection for the headline
- [ ] Multiple layouts per template, with preview thumbnails and an occasion filter
- [ ] Delete the Cloudinary file when a poster is deleted
- [ ] Payment gateway (bKash / Nagad) for premium templates

---

## Responsible Use

Political poster tools can be misused. Only use photos and symbols you have permission to use, and do not create defamatory or misleading content. Admins can block or delete posters from the moderation tab.

---

## Author

**Niloy Sarkar Uthso**
GitHub: [@Niloy-Uthso](https://github.com/Niloy-Uthso)
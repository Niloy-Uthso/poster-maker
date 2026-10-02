# AI Political Poster Maker (MVP)
Next.js + Express (TS) + MongoDB + Gemini. Option B: Gemini picks palette/decoration, Puppeteer renders the exact Bangla text -> 2400x3200 PNG.

## Run
```
cd backend && cp .env.example .env   # set MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm i && npm run seed && npm run dev
cd ../frontend && cp .env.example .env.local && npm i && npm run dev   # http://localhost:3000
```
- No GEMINI_API_KEY -> template default palette is used. CLOUDINARY_URL -> photos go to Cloudinary (else backend/storage).
- Admin: set role "admin" on a user in MongoDB; admin endpoints are API-only.
- Deploy: frontend on Vercel; backend on Render (needs Chromium, so use Docker/Render, not Vercel serverless) + MongoDB Atlas.

## Not built yet
PDF export, admin UI, moderation queue (only BLOCKED_TERMS env hook), analytics, bulk CSV, bKash/Nagad.

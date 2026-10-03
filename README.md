# AI Poster Maker (MVP)
> Next.js + Express (TS) + MongoDB + Gemini.  
> **Option B:** Gemini picks the palette and decoration, while Puppeteer renders the exact Bangla text into a **2400×3200 PNG**.
## Demo Admin Login
- **Email:** `niloyuthso16@gmail.com`
- **Password:** `asdfgH`
## Live Demo

- **Frontend:** https://poster-maker-web-pi.vercel.app
- **Backend API:** https://poster-maker-api-xi.vercel.app
---

## 🚀 Run

### Backend

```bash
cd backend
cp .env.example .env
```

Set the following environment variables:

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Then install dependencies, seed the database, and start the development server:

```bash
npm i
npm run seed
npm run dev
```

### Frontend

Open a new terminal:

```bash
cd ../frontend
cp .env.example .env.local
npm i
npm run dev
```

The frontend will be available at:

**http://localhost:3000**

---

## ⚙️ Configuration

- If `GEMINI_API_KEY` is not provided, the template's **default palette** is used.
- If `CLOUDINARY_URL` is provided, uploaded photos are stored on **Cloudinary**.
- Without `CLOUDINARY_URL`, photos are stored locally in:

```text
backend/storage
```

---

## 👨‍💼 Admin

To make a user an admin, set their `role` to `"admin"` in MongoDB.

```json
{
  "role": "admin"
}
```

> Admin endpoints are currently **API-only**.

---

## 🌐 Deployment

### Frontend

Deploy the frontend on:

- **Vercel**

### Backend

Deploy the backend on:

- **Render**

The backend requires **Chromium** for Puppeteer, so use **Docker/Render** rather than Vercel serverless for the backend.

### Database

- **MongoDB Atlas**

### Deployment Architecture

```text
                ┌─────────────────┐
                │     Vercel      │
                │    Frontend     │
                │    Next.js      │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │     Render      │
                │     Backend     │
                │ Express +       │
                │ Puppeteer       │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │  MongoDB Atlas  │
                │    Database     │
                └─────────────────┘
```

---

## 🤖 AI Poster Generation

The project uses **Google Gemini** to select:

- 🎨 Colour palette
- ✨ Decorative elements

**Puppeteer** is then used to render the exact Bangla text and generate the final:

```text
2400 × 3200 PNG
```

This approach keeps the Bangla text accurate while still using AI for the visual design decisions.

---

## 🚧 Not Built Yet

The following features are not currently implemented:

- 📄 PDF export
- 🛠️ Admin UI
- 🛡️ Moderation queue
  - Currently only the `BLOCKED_TERMS` environment hook exists
- 📊 Analytics
- 📑 Bulk CSV generation
- 💳 bKash payments
- 💳 Nagad payments

---

## 📝 Project Status

**MVP — Minimum Viable Product**

The core poster-generation workflow is implemented, while the features listed under **Not Built Yet** are planned for future development.
import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors"; import mongoose from "mongoose"; import multer from "multer";
import bcrypt from "bcryptjs"; import jwt from "jsonwebtoken"; import rateLimit from "express-rate-limit";
import path from "path"; import fs from "fs"; import os from "os";
import { User, Template, Poster, GenerationLog } from "./models";
import { suggestScheme } from "./gemini"; import { posterHtml, renderPng } from "./render";

const app = express();
app.set("trust proxy", 1); // behind Vercel's proxy

// Vercel rewrite passes the real path as ?__path=... ; restore it so Express routes match
app.use((req, _res, next) => {
  const u = new URL(req.url, "http://localhost");
  const p = u.searchParams.get("__path");
  if (p !== null) {
    u.searchParams.delete("__path");
    req.url = "/" + p + u.search;
  }
  next();
});

const SECRET = process.env.JWT_SECRET || "dev";
const PUBLIC = process.env.PUBLIC_URL || "http://localhost:4000";

// Vercel's disk is read-only except the temp folder
const OUT = process.env.VERCEL ? path.join(os.tmpdir(), "storage") : path.join(__dirname, "..", "storage");
fs.mkdirSync(path.join(OUT, "uploads"), { recursive: true });

const origins = (process.env.FRONTEND_URL || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: origins.length ? origins : "*" }));
app.use(express.json());
app.use("/files", express.static(OUT));

// ---------- Database connection (retries on every request if it failed before) ----------
let connecting: Promise<typeof mongoose> | null = null;
function connectDb() {
  if (mongoose.connection.readyState === 1) return Promise.resolve(mongoose);
  if (!connecting) {
    connecting = mongoose.connect(process.env.MONGO_URI!, { serverSelectionTimeoutMS: 8000, maxPoolSize: 5 })
      .catch(e => { connecting = null; throw e; });
  }
  return connecting;
}

app.get("/", (_r, res) => { res.json({ ok: true, name: "AI Poster Maker API" }); });

// open /api/health in the browser to see the real database error, if any
app.get("/api/health", async (_r, res) => {
  try { await connectDb(); res.json({ db: "connected" }); }
  catch (e: any) { res.status(500).json({ db: "failed", error: e.message }); }
});

app.use(async (_req, _res, next) => {
  try { await connectDb(); next(); } catch (e) { next(e); }
});

type Req = Request & { user?: { id: string; role: string } };
const auth = (req: Req, res: Response, next: NextFunction) => {
  try { req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), SECRET) as any; next(); }
  catch { res.status(401).json({ error: "Unauthorized" }); }
};
const admin = (req: Req, res: Response, next: NextFunction) => req.user?.role === "admin" ? next() : res.status(403).json({ error: "Forbidden" });
const wrap = (fn: (req: Req, res: Response) => any) => (req: Req, res: Response, next: NextFunction) => Promise.resolve(fn(req, res)).catch(next);
const token = (u: any) => jwt.sign({ id: u.id, role: u.role }, SECRET, { expiresIn: "7d" });

// ---------- Auth ----------
app.post("/api/auth/register", wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || password.length < 6) return res.status(400).json({ error: "Email and 6+ char password required" });
  if (await User.findOne({ email })) return res.status(409).json({ error: "Email already registered" });
  const u = await User.create({ name, email, passwordHash: await bcrypt.hash(password, 10) });
  res.json({ token: token(u), user: { id: u.id, name, email } });
}));
app.post("/api/auth/login", wrap(async (req, res) => {
  const u = await User.findOne({ email: req.body.email });
  if (!u || !(await bcrypt.compare(req.body.password || "", u.passwordHash || ""))) return res.status(401).json({ error: "Invalid credentials" });
  res.json({ token: token(u), user: { id: u.id, name: u.name, email: u.email, role: u.role } });
}));

// ---------- Templates ----------
app.get("/api/templates", wrap(async (req, res) => {
  const q: any = { isActive: true };
  if (req.query.occasion) q.occasionType = req.query.occasion;
  res.json(await Template.find(q));
}));
app.get("/api/templates/:id", wrap(async (req, res) => res.json(await Template.findById(req.params.id))));

// ---------- Upload (Cloudinary if configured, else local disk) ----------
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // Vercel request bodies are limited to ~4.5MB
  fileFilter: (_r, f, cb) => cb(null, /^image\/(png|jpe?g|webp)$/.test(f.mimetype)),
});
app.post("/api/upload", auth, upload.single("photo"), wrap(async (req, res) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: "Image (png/jpg/webp, <4MB) required" });
  if (process.env.CLOUDINARY_URL) {
    const { v2: cloud } = await import("cloudinary");
    const url = await new Promise<string>((ok, no) =>
      cloud.uploader.upload_stream({ folder: "posters" }, (e, r) => e ? no(e) : ok(r!.secure_url)).end(file.buffer));
    return res.json({ url });
  }
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname) || ".jpg"}`;
  fs.writeFileSync(path.join(OUT, "uploads", name), file.buffer);
  res.json({ url: `${PUBLIC}/files/uploads/${name}` });
}));

// ---------- Generation: Gemini scheme -> HTML -> Chromium PNG ----------
async function generate(id: string, instructions = "") {
  const p: any = await Poster.findById(id);
  const t: any = await Template.findById(p.templateId);
  const t0 = Date.now();
  let prompt = ""; let ok = false;
  try {
    p.status = "generating"; p.error = undefined;
    await p.save();
    const cfg = t.layoutConfig || {};

    const { scheme, prompt: pr, ai } = await suggestScheme(
      p.formData.occasion || t.occasionType, p.formData.party || "", cfg.palette,
      { instructions, attempt: p.retries, previous: p.scheme });
    prompt = pr; p.scheme = scheme;
    if (instructions && !ai) p.error = "AI couldn't apply your instructions this time. Please try again.";

    const file = `posters/${id}-${p.retries}.png`;
    const localPath = path.join(OUT, file);
    await renderPng(posterHtml(p.formData, p.uploadedPhotoUrls, scheme, cfg.photoSlots), localPath);

    if (process.env.CLOUDINARY_URL) {
      const { v2: cloud } = await import("cloudinary");
      const r = await cloud.uploader.upload(localPath, {
        folder: "posters/generated",
        public_id: `${id}-${p.retries}`,
        resource_type: "image",
      });
      p.generatedImageUrl = r.secure_url;
      fs.unlink(localPath, () => {});
    } else {
      p.generatedImageUrl = `${PUBLIC}/files/${file}`;
    }
    p.status = "completed"; ok = true;
  } catch (e: any) { console.error("generate failed:", e); p.status = "failed"; p.error = e.message; }
  await p.save();
  await GenerationLog.create({ posterId: p._id, geminiPromptUsed: prompt, latencyMs: Date.now() - t0, success: ok });
}

const genLimit = rateLimit({ windowMs: 60_000, max: 6, message: { error: "Too many generations, slow down" } });
const BLOCKED = (process.env.BLOCKED_TERMS || "").split(",").filter(Boolean);

// ---------- Posters ----------
const own = async (req: Req) => {
  const p: any = await Poster.findById(req.params.id);
  return p && (String(p.userId) === req.user!.id || req.user!.role === "admin") ? p : null;
};
const hide = (p: any) => {
  const o = p.toObject ? p.toObject() : p;
  if (o.blocked) { o.generatedImageUrl = undefined; o.error = "This poster was blocked by an admin."; }
  return o;
};

app.post("/api/posters", auth, genLimit, wrap(async (req, res) => {
  const { templateId, formData = {}, photos = [] } = req.body;
  if (!formData.name || !formData.headline) return res.status(400).json({ error: "name and headline required" });
  if (BLOCKED.some(b => JSON.stringify(formData).includes(b))) return res.status(422).json({ error: "Content not allowed" });
  const p = await Poster.create({
    userId: req.user!.id, templateId, formData, uploadedPhotoUrls: photos.slice(0, 3), status: "generating",
  });
  await generate(p.id); // wait: serverless functions can't keep working after responding
  res.status(201).json(await Poster.findById(p.id));
}));

app.get("/api/posters/user/:userId", auth, wrap(async (req, res) => {
  if (req.params.userId !== req.user!.id && req.user!.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  res.json((await Poster.find({ userId: req.params.userId }).sort({ createdAt: -1 })).map(hide));
}));

app.get("/api/posters/:id", auth, wrap(async (req, res) => {
  const p = await own(req);
  p ? res.json(hide(p)) : res.status(404).json({ error: "Not found" });
}));

app.post("/api/posters/:id/regenerate", auth, genLimit, wrap(async (req, res) => {
  const p = await own(req);
  if (!p) return res.status(404).json({ error: "Not found" });
  if (p.blocked) return res.status(403).json({ error: "This poster was blocked by an admin" });
  if (p.retries >= Number(process.env.MAX_RETRIES || 3)) return res.status(429).json({ error: "Regeneration limit reached" });
  const instructions = String(req.body.instructions || "").slice(0, 300);
  if (BLOCKED.some(b => instructions.includes(b))) return res.status(422).json({ error: "Content not allowed" });
  if (req.body.formData) p.formData = { ...p.formData, ...req.body.formData };
  p.retries += 1; p.status = "generating"; await p.save();
  await generate(p.id, instructions);
  res.json(await Poster.findById(p.id));
}));

app.delete("/api/posters/:id", auth, wrap(async (req, res) => {
  const p = await own(req);
  if (!p) return res.status(404).json({ error: "Not found" });
  await p.deleteOne();
  res.json({ ok: true });
}));

// ---------- Admin ----------
app.post("/api/admin/templates", auth, admin, wrap(async (req, res) => res.json(await Template.create(req.body))));
app.patch("/api/admin/templates/:id", auth, admin, wrap(async (req, res) => res.json(await Template.findByIdAndUpdate(req.params.id, req.body, { new: true }))));
app.delete("/api/admin/templates/:id", auth, admin, wrap(async (req, res) => res.json(await Template.findByIdAndDelete(req.params.id))));
app.get("/api/admin/templates", auth, admin, wrap(async (_r, res) => res.json(await Template.find())));
app.get("/api/admin/posters", auth, admin, wrap(async (_r, res) =>
  res.json(await Poster.find().sort({ createdAt: -1 }).limit(100).populate("userId", "name email"))));
app.patch("/api/admin/posters/:id/block", auth, admin, wrap(async (req, res) =>
  res.json(await Poster.findByIdAndUpdate(req.params.id, { blocked: !!req.body.blocked }, { new: true }))));
app.get("/api/admin/stats", auth, admin, wrap(async (_r, res) => {
  const [users, posters, completed, failed, blocked, lat] = await Promise.all([
    User.countDocuments(), Poster.countDocuments(), Poster.countDocuments({ status: "completed" }),
    Poster.countDocuments({ status: "failed" }), Poster.countDocuments({ blocked: true }),
    GenerationLog.aggregate([{ $group: { _id: null, avg: { $avg: "$latencyMs" } } }]),
  ]);
  res.json({ users, posters, completed, failed, blocked, avgLatencyMs: Math.round(lat[0]?.avg || 0) });
}));

app.use((e: Error, _q: Request, res: Response, _n: NextFunction) => { console.error(e); res.status(500).json({ error: e.message }); });

if (!process.env.VERCEL) {
  connectDb().catch(e => console.error("Mongo connect failed:", e.message));
  app.listen(process.env.PORT || 4000, () => console.log("API on", PUBLIC));
}

export default app;
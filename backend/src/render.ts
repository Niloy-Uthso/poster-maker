import { pathToFileURL } from "url";
import fs from "fs"; import path from "path";
import { Scheme } from "./gemini";

const esc = (s = "") => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const DECOR: Record<string, string> = { flag: "🇧🇩", paddy: "🌾", doves: "🕊️", floral: "🌸", candles: "🕯️" };

export function posterHtml(f: any, photos: string[], s: Scheme, _slots?: number) {
  // photo 1 = main arch, photo 2 = circle (top-left), photo 3 = small square (right, under headline)
  const ph = photos.slice(0, 3)
    .map((u, i) => `<div class="ph p${i + 1}"><img src="${esc(u)}"/></div>`).join("");
  const d = DECOR[s.decoration] || "🌾";
  const headlineSize = Math.round(((f.headline || "").length > 18 ? 110 : 140) * (s.headlineScale || 1));

  return `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;700&family=Noto+Serif+Bengali:wght@700;900&family=Noto+Color+Emoji&display=swap');
*{box-sizing:border-box;margin:0}
body{width:1200px;height:1600px;font-family:'Hind Siliguri',sans-serif;color:${esc(s.text)};
background:linear-gradient(160deg,${esc(s.bg1)},${esc(s.bg2)});position:relative;overflow:hidden}
.border{position:absolute;inset:24px;border:8px double ${esc(s.accent)};border-radius:24px}
.deco{position:absolute;font-size:150px;opacity:.18;font-family:'Noto Color Emoji',sans-serif}

.photos{position:absolute;inset:0}
.ph{position:absolute;border:6px solid ${esc(s.accent)};overflow:hidden;background:#0003;box-shadow:0 10px 30px #0005}
.ph img{width:100%;height:100%;object-fit:cover;object-position:center ${s.photoFocus === "top" ? "15%" : "40%"}}
.p1{width:470px;height:620px;left:50%;transform:translateX(-50%);top:90px;border-radius:235px 235px 16px 16px}
.p2{width:260px;height:260px;left:70px;top:70px;border-radius:50%}
.p3{width:170px;height:170px;right:90px;top:945px;border-radius:32px}

h1{position:absolute;top:760px;width:100%;text-align:center;font-family:'Noto Serif Bengali',serif;font-weight:900;font-size:${headlineSize}px;
line-height:1.2;padding:0 70px;text-shadow:0 4px 0 #0004}
.sub{position:absolute;top:1140px;width:100%;text-align:center;font-size:48px;font-weight:700;color:${esc(s.accent)}}
.foot{position:absolute;bottom:60px;left:60px;right:60px;background:#0007;border-radius:16px;padding:26px 40px;text-align:center;color:#fff}
.foot b{font-size:50px;display:block}.foot span{font-size:34px}.credit{font-size:30px;margin-top:8px;color:${esc(s.accent)}}
</style></head><body>
<div class="border"></div>
<div class="deco" style="left:50px;bottom:420px">${d}</div>
<div class="deco" style="right:50px;top:40px">${d}</div>
<div class="photos">${ph}</div>
<h1>${esc(f.headline)}</h1>
<div class="sub">${esc([f.party, f.union, f.district].filter(Boolean).join(" • "))}</div>
<div class="foot"><b>${esc(f.name)}</b><span>${esc(f.designation)}${f.party ? " — " + esc(f.party) : ""}</span><div class="credit">প্রচারে: ${esc(f.name)}</div></div>
</body></html>`;
}

// On Vercel: slim serverless Chromium. On your PC: normal puppeteer.
// TypeScript compiles import() to require() in CommonJS, which fails for ESM-only packages.
// Building the import() inside a Function keeps it a real dynamic import.
const esmImport = new Function("m", "return import(m)") as (m: string) => Promise<any>;

async function importChromium(): Promise<any> {
  const file = path.join(__dirname, "..", "node_modules", "@sparticuz", "chromium", "build", "index.js");
  try { return await esmImport(pathToFileURL(file).href); }
  catch { return await esmImport("@sparticuz/chromium"); }
}

async function launchBrowser(): Promise<any> {
  if (process.env.VERCEL) {
    const c: any = await importChromium();
    const chromium = c.default ?? c;
    const pc: any = await import("puppeteer-core");
    const puppeteerCore = pc.default ?? pc;
    return puppeteerCore.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }
  const p: any = await import("puppeteer");
  const puppeteer = p.default ?? p;
  return puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
}

export async function renderPng(html: string, outPath: string) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 }); // 2400x3200 print-res
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(() => (document as any).fonts.ready);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath, type: "png" });
  } finally { await browser.close(); }
}
import puppeteer from "puppeteer";
import fs from "fs"; import path from "path";
import { Scheme } from "./gemini";

const esc = (s = "") => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const DECOR: Record<string, string> = { flag: "🇧🇩", paddy: "🌾", doves: "🕊️", floral: "🌸", candles: "🕯️" };

export function posterHtml(f: any, photos: string[], s: Scheme, slots: number) {
  const ph = photos.slice(0, slots || 3).map(u => `<div class="ph"><img src="${esc(u)}"/></div>`).join("");
  const d = DECOR[s.decoration] || "🌾";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@500;700&family=Noto+Serif+Bengali:wght@700;900&display=swap');
*{box-sizing:border-box;margin:0}body{width:1200px;height:1600px;font-family:'Hind Siliguri',sans-serif;color:${esc(s.text)};
background:linear-gradient(160deg,${esc(s.bg1)},${esc(s.bg2)});position:relative;overflow:hidden}
.border{position:absolute;inset:24px;border:8px double ${esc(s.accent)};border-radius:24px}
.deco{position:absolute;font-size:150px;opacity:.18}.photos{position:absolute;top:90px;left:80px;right:80px;display:flex;gap:30px;justify-content:center;
align-items:flex-end;height:620px}.ph{flex:1;max-width:340px;height:100%;border:6px solid ${esc(s.accent)};border-radius:200px 200px 16px 16px;overflow:hidden;background:#0003}
.ph img{width:100%;height:100%;object-fit:cover;object-position:center ${s.photoFocus === "top" ? "15%" : "40%"}}
h1{position:absolute;top:760px;width:100%;text-align:center;font-family:'Noto Serif Bengali',serif;font-weight:900;font-size:${Math.round(((f.headline || "").length > 18 ? 110 : 140) * (s.headlineScale || 1))}px;
line-height:1.2;padding:0 70px;text-shadow:0 4px 0 #0004}.sub{position:absolute;top:1130px;width:100%;text-align:center;font-size:48px;font-weight:700;color:${esc(s.accent)}}
.foot{position:absolute;bottom:60px;left:60px;right:60px;background:#0007;border-radius:16px;padding:26px 40px;text-align:center;color:#fff}
.foot b{font-size:50px;display:block}.foot span{font-size:34px}.credit{font-size:30px;margin-top:8px;color:${esc(s.accent)}}</style></head><body>
<div class="border"></div><div class="deco" style="left:50px;bottom:420px">${d}</div><div class="deco" style="right:50px;top:40px">${d}</div>
<div class="photos">${ph}</div><h1>${esc(f.headline)}</h1>
<div class="sub">${esc([f.party, f.union, f.district].filter(Boolean).join(" • "))}</div>
<div class="foot"><b>${esc(f.name)}</b><span>${esc(f.designation)}${f.party ? " — " + esc(f.party) : ""}</span><div class="credit">প্রচারে: ${esc(f.name)}</div></div>
</body></html>`;
}

export async function renderPng(html: string, outPath: string) {
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 }); // 2400x3200 print-res
await page.setContent(html, { waitUntil: "load", timeout: 30000 });
    await page.evaluate(() => (document as any).fonts.ready);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    await page.screenshot({ path: outPath as `${string}.png`, type: "png" });
  } finally { await browser.close(); }
}

export interface Scheme { bg1: string; bg2: string; accent: string; text: string; decoration: string; photoFocus: string; headlineScale?: number }
interface Opts { instructions?: string; attempt?: number; previous?: Scheme }

const cache = new Map<string, Scheme>();
const HEX = /^#[0-9a-f]{3,8}$/i;
const DECOS = ["flag", "paddy", "doves", "floral", "candles"];

function clean(raw: any, fb: Scheme): Scheme {
  const hex = (v: any, d: string) => (typeof v === "string" && HEX.test(v) ? v : d);
  return {
    bg1: hex(raw.bg1, fb.bg1), bg2: hex(raw.bg2, fb.bg2), accent: hex(raw.accent, fb.accent), text: hex(raw.text, fb.text),
    
    decoration: DECOS.includes(raw.decoration) ? raw.decoration : fb.decoration,

    photoFocus: raw.photoFocus === "center" ? "center" : "top",

    headlineScale: Math.min(1.3, Math.max(0.7, Number(raw.headlineScale) || 1)),
  };
}

export async function suggestScheme(occasion: string, party: string, defaults: Scheme, opts: Opts = {}) {
  const { instructions = "", attempt = 0, previous } = opts;
  const useCache = attempt === 0 && !instructions;
  const ck = `${occasion}|${party}`;

  if (useCache && cache.has(ck)) 
    
    return { 
      scheme: cache.get(ck)!, 
      prompt: "(cached)", ai: true
     };

  const change = instructions
    ? `The user wants this change (Bangla or English): "${instructions}". Apply it to the current design and keep everything else the same.`
    : attempt > 0 ? `Make a clearly different variation of the current design (attempt ${attempt}).` : "";
  const prompt = `You design Bangladeshi political posters. Occasion: "${occasion}", party/org: "${party}".
${previous ? `Current design: ${JSON.stringify(previous)}` : ""}
${change}
Return ONLY JSON: {"bg1":"#hex","bg2":"#hex","accent":"#hex","text":"#hex","decoration":"flag|paddy|doves|floral|candles","photoFocus":"top|center","headlineScale":0.7-1.3}
Keep text high-contrast against the background. Condolence = muted/dark; victory = red/green; greetings = bright.`;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
     return { 
    scheme: previous || defaults, prompt, ai: false 
  };
  try 
  {
    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(25000),
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }], 
        generationConfig: { responseMimeType: "application/json", temperature: 1 } 
      }),
    });

    // const j: any = await r.json();
    // const s = clean(JSON.parse(j.candidates[0].content.parts[0].text), previous || defaults);
    
const j: any = await r.json();
const parts = j.candidates?.[0]?.content?.parts || [];
const text = parts.filter((p: any) => p.text && !p.thought).map((p: any) => p.text).join("");
if (!text) console.warn("Gemini response:", JSON.stringify(j).slice(0, 300));
const s = clean(JSON.parse(text.replace(/```json|```/g, "").trim()), previous || defaults);

    if (useCache)
       cache.set(ck, s);
    return { scheme: s, prompt, ai: true };
  } catch (e) {
    console.warn("Gemini failed:", (e as Error).message);
    return { scheme: previous || defaults, prompt, ai: false };
  }
}
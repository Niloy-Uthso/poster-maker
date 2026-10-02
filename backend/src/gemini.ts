// Option B: Gemini only suggests palette/decoration/photo focus. Text is rendered by HTML (accurate Bangla).
export interface Scheme { bg1: string; bg2: string; accent: string; text: string; decoration: string; photoFocus: string }
const cache = new Map<string, Scheme>(); // cost control: reuse per occasion+party

export async function suggestScheme(occasion: string, party: string, defaults: Scheme) {
  const ck = `${occasion}|${party}`;
  if (cache.has(ck)) return { scheme: cache.get(ck)!, prompt: "(cached)" };
  const prompt = `You design Bangladeshi political posters. Occasion: "${occasion}", party/org: "${party}".
Return ONLY JSON: {"bg1":"#hex","bg2":"#hex","accent":"#hex","text":"#hex","decoration":"one of: flag|paddy|doves|floral|candles","photoFocus":"top|center"}.
Keep text high-contrast against bg. Condolence = muted/dark; victory = red/green; greetings = bright.`;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { scheme: defaults, prompt };
  try {
    const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }),
    });
    const j: any = await r.json();
    const s = { ...defaults, ...JSON.parse(j.candidates[0].content.parts[0].text) } as Scheme;
    cache.set(ck, s);
    return { scheme: s, prompt };
  } catch { return { scheme: defaults, prompt }; } // graceful fallback
}

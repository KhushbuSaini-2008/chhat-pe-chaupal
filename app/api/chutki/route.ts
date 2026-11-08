import { NextResponse } from "next/server";

const MODEL = "gemini-3.5-flash";

const SYSTEM = `Tum Chutki ho, ek pyaari, shararati chhoti bachchi jo "Chhat Pe Chaupal" game ki host hai.
Sirf 1 ya 2 chhote vakya bolo. Garm, dramatic aur mazaakiya, par kisi ka mazaak mat udao.
Jawab sirf JSON mein do: {"show": "Hinglish (Roman) mein line", "say": "wahi line Devanagari Hindi mein"}.
Koi emoji, explanation ya extra text nahi.`;

const EVENTS: Record<string, string> = {
  playerJoined: "{name} abhi chaupal mein aaya/aayi hai. Pyaar se welcome karo.",
  correct: "{name} ne sahi jawab diya. Dil se taarif karo.",
  wrong: "{name} ka jawab galat tha. Pyaar se hausla badhao.",
  winner: "{name} game jeet gaya/gayi. Zordar celebration karo.",
  roundStart: "Nayi paheli shuru ho rahi hai. Sabko taiyaar karo.",
};

const FALLBACK = {
  show: "Wahhh! Mazaa aa raha hai!",
  say: "वाह! मज़ा आ रहा है!",
};

export async function POST(req: Request) {
  try {
    const { event, name } = await req.json();
    const template = EVENTS[event];
    if (!template) return NextResponse.json(FALLBACK);

    const cleanName = String(name ?? "dost").slice(0, 20);
    const prompt = template.replace("{name}", cleanName);

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
        signal: AbortSignal.timeout(8000),
      }
    );

    if (!res.ok) return NextResponse.json(FALLBACK);

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = JSON.parse(text);

    if (typeof parsed.show !== "string" || typeof parsed.say !== "string") {
      return NextResponse.json(FALLBACK);
    }
    return NextResponse.json({
      show: parsed.show.slice(0, 160),
      say: parsed.say.slice(0, 160),
    });
  } catch {
    return NextResponse.json(FALLBACK);
  }
}
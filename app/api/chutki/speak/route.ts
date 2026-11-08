const TTS_MODEL = "gemini-3.1-flash-tts-preview";
const VOICE = "Leda"; // youthful voice; try "Aoede" or "Zephyr" later

function wavFromPcm(pcm: Buffer, sampleRate = 24000) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + pcm.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(1, 22);
  h.writeUInt32LE(sampleRate, 24);
  h.writeUInt32LE(sampleRate * 2, 28);
  h.writeUInt16LE(2, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    const clean = String(text ?? "").slice(0, 200);
    if (!clean) return new Response("no text", { status: 400 });

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": process.env.GEMINI_API_KEY!,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Say in a sweet, cheerful, childlike little girl's voice, playful and warm: ${clean}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } },
            },
          },
        }),
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) return new Response("tts failed", { status: 502 });

    const data = await res.json();
    const b64 = data?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!b64) return new Response("no audio", { status: 502 });

    const wav = wavFromPcm(Buffer.from(b64, "base64"));
    return new Response(new Uint8Array(wav), {
      headers: { "Content-Type": "audio/wav" },
    });
  } catch {
    return new Response("error", { status: 500 });
  }
}
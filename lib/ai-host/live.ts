import { speakQueue, speakClip } from "./speak";

type Ev = "playerJoined" | "correct" | "wrong" | "winner" | "roundStart";

const FALLBACK_CLIP: Record<Ev, string> = {
  playerJoined: "/chutki/roomStart_1.mp3",
  correct: "/chutki/correct_0.mp3",
  wrong: "/chutki/wrong_0.mp3",
  winner: "/chutki/winner_0.mp3",
  roundStart: "/chutki/nextRound_0.mp3",
};

export async function chutkiLive(event: Ev, name?: string) {
  console.log("[Chutki] event:", event, name);

  let line = { show: "", say: "" };
  try {
    const r = await fetch("/api/chutki", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, name }),
    });
    line = await r.json();
    console.log("[Chutki] line:", line);
  } catch (e) {
    console.error("[Chutki] line fetch failed", e);
    return;
  }

  window.dispatchEvent(new CustomEvent("chutki-say", { detail: line.show }));

  try {
    const t = await fetch("/api/chutki/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: line.say }),
    });
    console.log("[Chutki] tts status:", t.status);
    if (!t.ok) throw new Error("tts failed " + t.status);
    const blob = await t.blob();
    console.log("[Chutki] audio bytes:", blob.size);
    speakQueue([URL.createObjectURL(blob)]);
  } catch (e) {
    console.warn("[Chutki] using fallback clip", e);
    speakClip(FALLBACK_CLIP[event]);
  }
}
import { pickLine, DIALOGUES } from "./dialogues";
import { speakClip, speakQueue } from "./speak";

export function chutkiSay(key: keyof typeof DIALOGUES) {
  const line = pickLine(key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chutki-say", { detail: line.show }));
  }
  speakClip(line.src);
}

// New riddle: short intro, then Chutki reads the riddle aloud
export function chutkiAsk(questionId: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("chutki-say", { detail: "Chalo, ab agli paheli!" })
    );
  }
  speakQueue(["/chutki/nextRound_0.mp3", `/chutki/q/${questionId}.mp3`]);
}
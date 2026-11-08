import { pickLine, DIALOGUES } from "./dialogues";
import { speakClip, speakQueue } from "./speak";

export function chutkiSay(key: keyof typeof DIALOGUES) {
  const line = pickLine(key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chutki-say", { detail: line.show }));
  }
  speakClip(line.src);
}

// New round: short intro line, then reads the riddle
export function chutkiAsk(questionId: string) {
  const line = pickLine("nextRound");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chutki-say", { detail: line.show }));
  }
  speakQueue([line.src, `/chutki/q/${questionId}.mp3`]);
}
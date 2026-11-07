import { pickLine, DIALOGUES } from "./dialogues";
import { speakClip } from "./speak";

export function chutkiSay(key: keyof typeof DIALOGUES) {
  const line = pickLine(key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chutki-say", { detail: line.show }));
  }
  speakClip(line.src);
}
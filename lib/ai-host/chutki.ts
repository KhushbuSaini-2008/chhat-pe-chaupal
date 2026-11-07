import { pickLine, DIALOGUES } from "./dialogues";
import { speak } from "./speak";

export function chutkiSay(key: keyof typeof DIALOGUES) {
  const line = pickLine(key);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("chutki-say", { detail: line.show }));
  }
  speak(line.say);
}
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
  if (typeof window !== "undefined" && value) window.speechSynthesis?.cancel();
}

export function isMuted() {
  return muted;
}

export function speak(text: string) {
  if (typeof window === "undefined" || muted) return;
  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "hi-IN";
  u.pitch = 1.6;
  u.rate = 1.0;

  const voices = synth.getVoices();
  const hindi = voices.find((v) => v.lang.toLowerCase().startsWith("hi"));
  if (hindi) u.voice = hindi;

  synth.speak(u);
}
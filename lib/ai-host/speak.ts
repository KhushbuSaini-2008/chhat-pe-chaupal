let music: HTMLAudioElement | null = null;
let voice: HTMLAudioElement | null = null;
let unlocked = false;

export function unlockAudio() {
  if (typeof window === "undefined" || unlocked) return;
  unlocked = true;

  voice = new Audio("/chutki/nextRound_0.mp3");
  voice.muted = true;
  voice
    .play()
    .then(() => {
      voice!.pause();
      voice!.currentTime = 0;
      voice!.muted = false;
    })
    .catch(() => {
      if (voice) voice.muted = false;
    });

  music = new Audio("/sounds/bg.mp3");
  music.loop = true;
  music.volume = 0.3;
  music.play().catch(() => {});
}

export function speakQueue(srcs: string[]) {
  if (typeof window === "undefined" || !voice) return;
  const v = voice;
  music?.pause();

  let i = 0;
  const next = () => {
    if (i >= srcs.length) {
      music?.play().catch(() => {});
      return;
    }
    v.src = srcs[i++];
    v.muted = false;
    v.play().catch(next);
  };
  v.onended = next;
  v.onerror = next;
  next();
}

export function speakClip(src: string) {
  speakQueue([src]);
}
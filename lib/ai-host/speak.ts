let music: HTMLAudioElement | null = null;
let voice: HTMLAudioElement | null = null;
let unlocked = false;

export function unlockAudio() {
  if (typeof window === "undefined" || unlocked) return;
  unlocked = true;

  // Voice element: unlock it inside the tap (muted), then reuse it later
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

export function speakClip(src: string) {
  if (typeof window === "undefined" || !voice) return;
  const v = voice;

  music?.pause();
  const resume = () => {
    music?.play().catch(() => {});
  };

  v.onended = resume;
  v.onerror = resume;
  v.src = src;
  v.muted = false;
  v.play().catch(resume);
}
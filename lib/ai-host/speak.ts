const MUSIC_NORMAL = 0.22;
const MUSIC_LOW = 0.06;

let music: HTMLAudioElement | null = null;
let current: HTMLAudioElement | null = null;

export function startMusic() {
  if (typeof window === "undefined") return;
  if (!music) {
    music = new Audio("/sounds/bg.mp3");
    music.loop = true;
    music.volume = MUSIC_NORMAL;
  }
  music.play().catch(() => {});
}

export function speakClip(src: string) {
  if (typeof window === "undefined") return;
  current?.pause();
  const a = new Audio(src);
  current = a;
  if (music) music.volume = MUSIC_LOW;
  const restore = () => {
    if (music && current === a) music.volume = MUSIC_NORMAL;
  };
  a.onended = restore;
  a.onerror = restore;
  a.play().catch(restore);
}
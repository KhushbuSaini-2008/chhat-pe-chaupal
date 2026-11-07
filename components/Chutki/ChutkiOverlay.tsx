"use client";

import { useEffect, useRef, useState } from "react";
import { setMuted } from "@/lib/ai-host/speak";

export default function ChutkiOverlay() {
  const [bubble, setBubble] = useState("");
  const [voiceOn, setVoiceOn] = useState(true);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    function onSay(e: Event) {
      setBubble((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setBubble(""), 4000);
    }
    window.addEventListener("chutki-say", onSay);
    return () => {
      window.removeEventListener("chutki-say", onSay);
      clearTimeout(timer);
    };
  }, []);

  function toggleMusic() {
    if (!audioRef.current) {
      const a = new Audio("/sounds/bg.mp3");
      a.loop = true;
      a.volume = 0.25;
      audioRef.current = a;
    }
    const a = audioRef.current;
    if (musicOn) {
      a.pause();
      setMusicOn(false);
    } else {
      a.play().then(() => setMusicOn(true)).catch(() => setMusicOn(false));
    }
  }

  function toggleVoice() {
    setMuted(voiceOn);
    setVoiceOn(!voiceOn);
  }

  return (
    <>
      <div className="fixed right-3 top-3 z-50 flex gap-2">
        <button
          onClick={toggleMusic}
          className="h-10 w-10 rounded-full bg-marigold text-xl"
          aria-label="Music"
        >
          {musicOn ? "🎵" : "🔇"}
        </button>
        <button
          onClick={toggleVoice}
          className="h-10 w-10 rounded-full bg-marigold text-xl"
          aria-label="Chutki voice"
        >
          {voiceOn ? "🗣️" : "🤐"}
        </button>
      </div>

      {bubble && (
        <div className="pointer-events-none fixed left-1/2 top-16 z-50 flex w-[90%] max-w-sm -translate-x-1/2 items-center gap-2 rounded-3xl bg-cream px-4 py-2 text-midnight shadow-lg">
          <span className="text-3xl">👧</span>
          <p className="text-left text-base font-semibold">{bubble}</p>
        </div>
      )}
    </>
  );
}
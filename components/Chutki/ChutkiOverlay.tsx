"use client";

import { useEffect, useState } from "react";
import { unlockAudio } from "@/lib/ai-host/speak";

export default function ChutkiOverlay() {
  const [started, setStarted] = useState(false);
  const [bubble, setBubble] = useState("");

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

  function start() {
    unlockAudio();
    setStarted(true);
  }

  if (!started) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-midnight/95 px-6 text-center">
        <div className="text-7xl">👧</div>
        <p className="mt-4 text-xl font-semibold text-cream">
          Chutki aapka intezaar kar rahi hai!
        </p>
        <button
          onClick={start}
          className="mt-6 rounded-full bg-marigold px-8 py-4 text-xl font-bold text-midnight shadow-lg"
        >
          🔊 Awaaz ke saath shuru karo
        </button>
      </div>
    );
  }

  if (!bubble) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 flex w-[90%] max-w-sm -translate-x-1/2 items-center gap-2 rounded-3xl bg-cream px-4 py-2 text-midnight shadow-lg">
      <span className="text-3xl">👧</span>
      <p className="text-left text-base font-semibold">{bubble}</p>
    </div>
  );
}
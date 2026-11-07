"use client";

import { useEffect, useState } from "react";
import { startMusic } from "@/lib/ai-host/speak";

export default function ChutkiOverlay() {
  const [bubble, setBubble] = useState("");

  useEffect(() => {
    function first() {
      startMusic();
      window.removeEventListener("pointerdown", first);
    }
    window.addEventListener("pointerdown", first);

    let timer: ReturnType<typeof setTimeout>;
    function onSay(e: Event) {
      setBubble((e as CustomEvent<string>).detail);
      clearTimeout(timer);
      timer = setTimeout(() => setBubble(""), 4000);
    }
    window.addEventListener("chutki-say", onSay);

    return () => {
      window.removeEventListener("pointerdown", first);
      window.removeEventListener("chutki-say", onSay);
      clearTimeout(timer);
    };
  }, []);

  if (!bubble) return null;

  return (
    <div className="pointer-events-none fixed left-1/2 top-4 z-50 flex w-[90%] max-w-sm -translate-x-1/2 items-center gap-2 rounded-3xl bg-cream px-4 py-2 text-midnight shadow-lg">
      <span className="text-3xl">👧</span>
      <p className="text-left text-base font-semibold">{bubble}</p>
    </div>
  );
}
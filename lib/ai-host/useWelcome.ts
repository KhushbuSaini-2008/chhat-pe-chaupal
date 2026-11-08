"use client";

import { useEffect, useRef } from "react";
import { chutkiLive } from "./live";

type P = { id: string; nickname: string };

export function useWelcome(players: P[], meId: string | null) {
  const known = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!meId || players.length === 0) return;

    if (known.current === null) {
      known.current = new Set(players.map((p) => p.id));
      return;
    }

    const fresh = players.filter((p) => !known.current!.has(p.id));
    fresh.forEach((p) => known.current!.add(p.id));

    const target = fresh.find((p) => p.id !== meId);
    if (target) chutkiLive("playerJoined", target.nickname);
  }, [players, meId]);
}
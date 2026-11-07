"use client";

import { useEffect, useRef } from "react";
import { chutkiSay } from "./chutki";

type Args = {
  roundId?: string;
  timeUp: boolean;
  myResult: { correct: boolean } | null;
  roomStatus: string;
};

export function useChutkiVoice({ roundId, timeUp, myResult, roomStatus }: Args) {
  const lastRound = useRef<string | null>(null);
  const lastResult = useRef<string | null>(null);
  const lastTimeUp = useRef<string | null>(null);
  const finished = useRef(false);

  useEffect(() => {
    if (!roundId || lastRound.current === roundId) return;
    lastRound.current = roundId;
    chutkiSay("nextRound");
  }, [roundId]);

  useEffect(() => {
    if (!roundId || !myResult) return;
    const key = `${roundId}-${myResult.correct}`;
    if (lastResult.current === key) return;
    lastResult.current = key;
    chutkiSay(myResult.correct ? "correct" : "wrong");
  }, [roundId, myResult]);

  useEffect(() => {
    if (!roundId || !timeUp || lastTimeUp.current === roundId) return;
    lastTimeUp.current = roundId;
    chutkiSay("timeUp");
  }, [roundId, timeUp]);

  useEffect(() => {
    if (roomStatus === "finished" && !finished.current) {
      finished.current = true;
      chutkiSay("winner");
    }
  }, [roomStatus]);
}
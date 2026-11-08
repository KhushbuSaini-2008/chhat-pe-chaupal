"use client";

import { useEffect, useRef } from "react";
import { chutkiSay, chutkiAsk } from "./chutki";
import { chutkiLive } from "./live";

type Args = {
  roundId?: string;
  questionId?: string;
  timeUp: boolean;
  secondsLeft: number;
  myResult: { correct: boolean } | null;
  roomStatus: string;
  winnerName?: string;
};

export function useChutkiVoice({
  roundId,
  questionId,
  timeUp,
  secondsLeft,
  myResult,
  roomStatus,
  winnerName,
}: Args) {
  const lastRound = useRef<string | null>(null);
  const lastResult = useRef<string | null>(null);
  const lastNudge = useRef<string | null>(null);
  const lastTimeUp = useRef<string | null>(null);
  const finished = useRef(false);

  // New riddle: Chutki reads it aloud
  useEffect(() => {
    if (!roundId || !questionId || lastRound.current === roundId) return;
    lastRound.current = roundId;
    chutkiAsk(questionId);
  }, [roundId, questionId]);

  // My answer result
  useEffect(() => {
    if (!roundId || !myResult) return;
    const key = `${roundId}-${myResult.correct}`;
    if (lastResult.current === key) return;
    lastResult.current = key;
    chutkiSay(myResult.correct ? "correct" : "wrong");
  }, [roundId, myResult]);

  // Nudge: 8 seconds left and I haven't answered
  useEffect(() => {
    if (!roundId || myResult || timeUp) return;
    if (secondsLeft > 8 || secondsLeft <= 0) return;
    if (lastNudge.current === roundId) return;
    lastNudge.current = roundId;
    chutkiSay("nobodyCorrect");
  }, [roundId, myResult, timeUp, secondsLeft]);

  // Time up
  useEffect(() => {
    if (!roundId || !timeUp || lastTimeUp.current === roundId) return;
    lastTimeUp.current = roundId;
    chutkiSay("timeUp");
  }, [roundId, timeUp]);

  // Game over: live winner announcement with the winner's name
  useEffect(() => {
    if (roomStatus === "finished" && !finished.current) {
      finished.current = true;
      chutkiLive("winner", winnerName);
    }
  }, [roomStatus, winnerName]);
}
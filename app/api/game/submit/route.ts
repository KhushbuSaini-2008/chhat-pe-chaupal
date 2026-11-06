import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { isCorrectAnswer } from "@/lib/scoring/check";

export async function POST(req: Request) {
  const { roundId, playerId, answer } = await req.json();
  if (!roundId || !playerId || typeof answer !== "string" || !answer.trim()) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const db = getAdminClient();

  const { data: round } = await db
    .from("game_rounds")
    .select("*")
    .eq("id", roundId)
    .maybeSingle();
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  const { data: player } = await db
    .from("players")
    .select("id, room_id, score")
    .eq("id", playerId)
    .maybeSingle();
  if (!player || player.room_id !== round.room_id) {
    return NextResponse.json({ error: "Not in this room" }, { status: 403 });
  }

  // The SERVER clock decides if time is up
  if (Date.now() > new Date(round.ends_at).getTime()) {
    return NextResponse.json({ error: "Time up" }, { status: 400 });
  }

  const { data: q } = await db
    .from("questions")
    .select("answer, accepted_answers")
    .eq("id", round.question_id)
    .single();
  if (!q) {
    return NextResponse.json({ error: "Question missing" }, { status: 500 });
  }

  const cleanAnswer = answer.trim().slice(0, 100);
  const correct = isCorrectAnswer(cleanAnswer, q.answer, q.accepted_answers ?? []);
  const points = correct ? round.points : 0;

  // The unique rule (round + player) blocks double submissions
  const { error: insertErr } = await db.from("answers").insert({
    round_id: round.id,
    player_id: player.id,
    answer_text: cleanAnswer,
    is_correct: correct,
    points_awarded: points,
  });
  if (insertErr) {
    return NextResponse.json({ error: "Already answered" }, { status: 409 });
  }

  if (correct) {
    await db
      .from("players")
      .update({ score: player.score + points })
      .eq("id", player.id);
  }

  return NextResponse.json({ correct, points });
}
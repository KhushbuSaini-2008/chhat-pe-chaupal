import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(req: Request) {
  const { roundId, playerId } = await req.json();
  if (!roundId || !playerId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const db = getAdminClient();

  // Load round
  const { data: round } = await db
    .from("game_rounds")
    .select("*")
    .eq("id", roundId)
    .maybeSingle();
  if (!round) {
    return NextResponse.json({ error: "Round not found" }, { status: 404 });
  }

  // Load player and verify room membership
  const { data: player } = await db
    .from("players")
    .select("id, room_id")
    .eq("id", playerId)
    .maybeSingle();
  if (!player || player.room_id !== round.room_id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  // Verify round has finished
  if (Date.now() < new Date(round.ends_at).getTime()) {
    return NextResponse.json({ error: "Round not finished" }, { status: 400 });
  }

  // Load correct answer
  const { data: q } = await db
    .from("questions")
    .select("answer")
    .eq("id", round.question_id)
    .single();
  if (!q) {
    return NextResponse.json({ error: "Question not found" }, { status: 500 });
  }

  // Load winners for this round
  const { data: answers } = await db
    .from("answers")
    .select("points_awarded, players(nickname, avatar)")
    .eq("round_id", roundId)
    .eq("is_correct", true);

  const winners = (answers ?? []).map((a: any) => ({
    nickname: a.players.nickname,
    avatar: a.players.avatar,
    points: a.points_awarded,
  }));

  return NextResponse.json({
    answer: q.answer,
    winners,
  });
}

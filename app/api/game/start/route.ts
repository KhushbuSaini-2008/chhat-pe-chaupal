import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { THEMES, RIDDLES_PER_ROUND } from "@/lib/game-engine/rounds";

export async function POST(req: Request) {
  const { roomCode, playerId } = await req.json();
  if (!roomCode || !playerId) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  const db = getAdminClient();

  const { data: room } = await db
    .from("rooms")
    .select("*")
    .eq("room_code", String(roomCode).toUpperCase())
    .maybeSingle();
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }

  // Only the host of THIS room can start rounds
  const { data: player } = await db
    .from("players")
    .select("id, room_id, is_host")
    .eq("id", playerId)
    .maybeSingle();
  if (!player || player.room_id !== room.id || !player.is_host) {
    return NextResponse.json({ error: "Only the host can start" }, { status: 403 });
  }

  const { data: rounds } = await db
    .from("game_rounds")
    .select("question_id, round_number, ends_at")
    .eq("room_id", room.id)
    .order("round_number", { ascending: false });
  const list = rounds ?? [];

  // Don't start the next riddle while the previous one is still running
  if (list.length > 0 && new Date(list[0].ends_at).getTime() > Date.now() + 2000) {
    return NextResponse.json({ error: "Pichla round abhi chal raha hai" }, { status: 400 });
  }

  const used = list.map((r) => r.question_id);
  const nextNumber = list.length + 1;

  // The slider on the create page now means "how many themed rounds" (max 5)
  const themeCount = Math.min(Math.max(Number(room.total_rounds) || 5, 1), THEMES.length);
  const totalRiddles = themeCount * RIDDLES_PER_ROUND;

  async function finish() {
    await db.from("rooms").update({ status: "finished" }).eq("id", room.id);
    return NextResponse.json({ finished: true });
  }

  if (nextNumber > totalRiddles) return finish();

  const theme = THEMES[Math.floor((nextNumber - 1) / RIDDLES_PER_ROUND)];
  const pool = theme.ids.filter((id) => !used.includes(id));
  if (pool.length === 0) return finish();

  const questionId = pool[Math.floor(Math.random() * pool.length)];
  const { data: q } = await db
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .maybeSingle();
  if (!q) {
    return NextResponse.json({ error: "Riddle nahi mili" }, { status: 500 });
  }

  // +10 seconds so Chutki has time to read the riddle aloud
  const endsAt = new Date(Date.now() + (q.time_limit + 10) * 1000).toISOString();

  const { data: round, error } = await db
    .from("game_rounds")
    .insert({
      room_id: room.id,
      round_number: nextNumber,
      question_id: q.id,
      question_text: q.question_hinglish,
      hint: q.hint,
      points: q.points,
      ends_at: endsAt,
    })
    .select()
    .single();

  if (error || !round) {
    return NextResponse.json({ error: "Could not start round" }, { status: 500 });
  }

  await db.from("rooms").update({ status: "playing" }).eq("id", room.id);
  return NextResponse.json({ round });
}
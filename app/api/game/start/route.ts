import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";

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
    .select("question_id, ends_at")
    .eq("room_id", room.id)
    .order("round_number", { ascending: false });

  const latest = rounds?.[0];
  if (latest && new Date(latest.ends_at).getTime() > Date.now()) {
    return NextResponse.json({ error: "Pichla round abhi chal raha hai" }, { status: 400 });
  }

  const used = (rounds ?? []).map((r) => r.question_id);
  const nextNumber = used.length + 1;

  if (nextNumber > room.total_rounds) {
    await db.from("rooms").update({ status: "finished" }).eq("id", room.id);
    return NextResponse.json({ finished: true });
  }

  const { data: questions } = await db.from("questions").select("*");
  const available = (questions ?? []).filter((q) => !used.includes(q.id));
  if (available.length === 0) {
    await db.from("rooms").update({ status: "finished" }).eq("id", room.id);
    return NextResponse.json({ finished: true });
  }

  const q = available[Math.floor(Math.random() * available.length)];
  const endsAt = new Date(Date.now() + q.time_limit * 1000).toISOString();

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
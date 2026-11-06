"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { AVATARS, generateRoomCode } from "@/lib/room";

export default function CreatePage() {
  const router = useRouter();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [rounds, setRounds] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!nickname.trim()) {
      setError("Pehle apna naam likho!");
      return;
    }
    setLoading(true);
    setError("");

    // Try a few times in case a room code is already taken
    let room = null;
    for (let i = 0; i < 5 && !room; i++) {
      const { data, error: err } = await supabase
        .from("rooms")
        .insert({ room_code: generateRoomCode(), total_rounds: rounds })
        .select()
        .single();
      if (!err) room = data;
    }
    if (!room) {
      setError("Chaupal nahi ban paayi. Dobara try karo.");
      setLoading(false);
      return;
    }

    const { data: player, error: pErr } = await supabase
      .from("players")
      .insert({
        room_id: room.id,
        nickname: nickname.trim(),
        avatar,
        is_host: true,
      })
      .select()
      .single();

    if (pErr || !player) {
      setError("Host add nahi ho paya. Dobara try karo.");
      setLoading(false);
      return;
    }

    localStorage.setItem(`cpc_player_${room.room_code}`, player.id);
    router.push(`/room/${room.room_code}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight px-6 py-10">
      <div className="w-full max-w-sm rounded-3xl bg-midnight-light p-6 shadow-xl">
        <h1 className="text-center text-3xl font-extrabold text-marigold">
          🏡 Create a Chaupal
        </h1>

        <label className="mt-6 block text-sm text-cream/80">Tumhara naam</label>
        <input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={15}
          placeholder="e.g. Khushbu"
          className="mt-1 w-full rounded-2xl bg-cream px-4 py-3 text-lg text-midnight outline-none"
        />

        <label className="mt-5 block text-sm text-cream/80">Avatar chuno</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              className={`h-12 w-12 rounded-full text-2xl ${
                avatar === a ? "bg-marigold" : "bg-midnight"
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        <label className="mt-5 block text-sm text-cream/80">
          Kitne rounds? ({rounds})
        </label>
        <input
          type="range"
          min={3}
          max={10}
          value={rounds}
          onChange={(e) => setRounds(Number(e.target.value))}
          className="mt-2 w-full accent-marigold"
        />

        {error && <p className="mt-4 text-sm text-red-300">{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          className="mt-6 w-full rounded-full bg-marigold py-3 text-xl font-bold text-midnight disabled:opacity-60"
        >
          {loading ? "Chaupal saj rahi hai..." : "Chaupal banao!"}
        </button>
      </div>
    </main>
  );
}